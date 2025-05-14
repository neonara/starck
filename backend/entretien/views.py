from datetime import timedelta
from rest_framework.views import APIView
from rest_framework import generics, filters
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from users.permissions import IsTechnicien

from django.shortcuts import get_object_or_404
from .models import Entretien, RappelEntretien
from .serializers import EntretienSerializer
from django.utils.dateparse import parse_datetime

from installations.models import Installation
from django.contrib.auth import get_user_model
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Count
from django.db.models.functions import TruncMonth
from django.utils.timezone import now, make_aware

from django.db.models import Q
from .tasks import rappel_mail_entretien_task
from dateutil.relativedelta import relativedelta  

from django.utils.dateparse import parse_datetime
from .utils import notifier_technicien_entretien 
from users.permissions import IsAdminOrInstallateur,IsInstallateur
from utils.google_calendar_service import ajouter_entretien_google_calendar
from utils.google_calendar_service import supprimer_evenement_google_calendar
from utils.google_calendar_service import modifier_evenement_google_calendar
from entretien.tasks import generer_suivant_entretien
User = get_user_model()



class EntretienListCreateAPIView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Entretien.objects.select_related('installation', 'technicien', 'cree_par').all()
    serializer_class = EntretienSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['installation', 'technicien', 'statut']
    search_fields = ['notes', 'installation__nom', 'type_entretien', 'statut', 'technicien__first_name', 'technicien__last_name']
    def get(self, request):
        entretiens = Entretien.objects.select_related('installation', 'technicien', 'cree_par').all()
 
        installation_id = request.query_params.get('installation_id')
        technicien_id = request.query_params.get('technicien_id')
        statut = request.query_params.get('statut')
        search = request.query_params.get('search')
 
        if installation_id:
            entretiens = entretiens.filter(installation_id=installation_id)
        if technicien_id:
            entretiens = entretiens.filter(technicien_id=technicien_id)
        if statut:
            entretiens = entretiens.filter(statut=statut)
 
        if search:
            entretiens = entretiens.filter(
                Q(notes__icontains=search) |
                Q(type_entretien__icontains=search) |
                Q(statut__icontains=search) |
                Q(installation__nom__icontains=search) |
                Q(technicien__first_name__icontains=search) |
                Q(technicien__last_name__icontains=search)
            )
 
        serializer = EntretienSerializer(entretiens, many=True)
        return Response(serializer.data)
    def post(self, request):
        serializer = EntretienSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(cree_par=request.user)
            entretien = serializer.instance

            print("📌 Appel ajout Google Calendar pour ID :", entretien.id)
            ajouter_entretien_google_calendar(entretien)  # ✅ Principal

            periode = serializer.validated_data.get("periode_recurrence")
            if periode and entretien.date_debut:
                try:
                    prochaine_date = entretien.date_debut + relativedelta(months=periode)
                    prochain_entretien = Entretien.objects.create(
                        installation=entretien.installation,
                        type_entretien=entretien.type_entretien,
                        date_debut=prochaine_date,
                        duree_estimee=entretien.duree_estimee,
                        statut='planifie',
                        priorite=entretien.priorite,
                        technicien=entretien.technicien,
                        cree_par=request.user,
                        notes=f"[Généré automatiquement après {periode} mois] {entretien.notes or ''}",
                        entretien_parent=entretien,
                        periode_recurrence=entretien.periode_recurrence

                    )

                    print("📌 Appel ajout Google Calendar pour le prochain entretien :", prochain_entretien.id)
                    ajouter_entretien_google_calendar(prochain_entretien)  # ✅ Manquait ici

                except Exception as e:
                    print(f"⚠️ Erreur de création du prochain entretien : {e}")

            notifier_technicien_entretien(entretien)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class EntretienDetailAPIView(APIView):
    permission_classes = [IsAuthenticated,IsAdminOrInstallateur]

    def get_object(self, pk):
        return get_object_or_404(Entretien.objects.select_related('installation', 'technicien', 'cree_par'), pk=pk)

    def get(self, request, pk):
        entretien = self.get_object(pk)
        serializer = EntretienSerializer(entretien)
        return Response(serializer.data)
    
    def put(self, request, pk):
        entretien = self.get_object(pk)
        serializer = EntretienSerializer(entretien, data=request.data)

        if serializer.is_valid():
            serializer.save()
            entretien.refresh_from_db()

            modifier_evenement_google_calendar(entretien)
            generer_suivant_entretien(entretien, request.user)

            

            return Response(serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


    def patch(self, request, pk):
        entretien = self.get_object(pk)
        serializer = EntretienSerializer(entretien, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            entretien.refresh_from_db()

            modifier_evenement_google_calendar(entretien)
            generer_suivant_entretien(entretien, request.user)

            return Response(serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        entretien = self.get_object(pk)
        print("🔍 Suppression entretien", entretien.id)
        print("📎 event_id_google =", entretien.event_id_google)
        # 🔁 Supprimer dans Google Calendar
        supprimer_evenement_google_calendar(entretien)
        entretien.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class EntretienCalendarAPIView(APIView):
    """Vue spéciale pour les calendriers"""
    permission_classes = [IsAuthenticated,IsAdminOrInstallateur]

    def get(self, request):
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        entretiens = Entretien.objects.all()

        if start_date and end_date:
            entretiens = entretiens.filter(
                date_debut__gte=start_date,
                date_debut__lte=end_date
            )

        entretiens = entretiens.select_related('installation', 'technicien')

        
        data = [{
            'id': e.id,
            'title': f"{e.installation.nom} - {e.get_type_entretien_display()}",
            'start': e.date_debut,
            'end': e.date_fin if e.date_fin else e.date_debut + timedelta(minutes=e.duree_estimee),
            'status': e.statut,
            'priority': e.priorite,
            'technicien': e.technicien.get_full_name() if e.technicien else None,
            'installation_id': e.installation_id
        } for e in entretiens]
        
        return Response(data)

    
class EntretienStatistiquesView(APIView):
    permission_classes = [IsAuthenticated]
 
    def get(self, request):
        par_type = Entretien.objects.values('type_entretien').annotate(count=Count('id'))
        dict_type = {item['type_entretien']: item['count'] for item in par_type}
 
        par_statut = Entretien.objects.values('statut').annotate(count=Count('id'))
        dict_statut = {item['statut']: item['count'] for item in par_statut}
 
        par_mois = Entretien.objects.annotate(mois=TruncMonth('date_debut')).values('mois').annotate(count=Count('id')).order_by('mois')
        dict_mois = {item['mois'].strftime('%Y-%m'): item['count'] for item in par_mois if item['mois']}
 
        par_tech = Entretien.objects.values('technicien__first_name', 'technicien__last_name').annotate(count=Count('id'))
        dict_technicien = {}
        for item in par_tech:
            nom = f"{item['technicien__first_name'] or ''} {item['technicien__last_name'] or ''}".strip() or "—"
            dict_technicien[nom] = item['count']
 
        return Response({
            "par_type": dict_type,
            "par_statut": dict_statut,
            "par_mois": dict_mois,
            "par_technicien": dict_technicien
        })
    
#entretient partie technicien
class MesEntretiensAPIView(APIView):
    permission_classes = [IsAuthenticated,IsTechnicien]
 
    def get(self, request):
        entretiens = Entretien.objects.filter(technicien=request.user)
        serializer = EntretienSerializer(entretiens, many=True)
        return Response(serializer.data)


class RappelEntretienAPIView(APIView):
    permission_classes = [IsAuthenticated,IsTechnicien]

    def post(self, request, entretien_id):
        entretien = get_object_or_404(Entretien, pk=entretien_id)

        if entretien.technicien != request.user:
            return Response(
                {"error": "Vous n'êtes pas autorisé à définir un rappel pour cet entretien."},
                status=403
            )

        rappel_datetime_str = request.data.get("rappel_datetime")
        if not rappel_datetime_str:
            return Response({"error": "Le champ 'rappel_datetime' est requis"}, status=400)

        rappel_datetime = parse_datetime(rappel_datetime_str)
        if not rappel_datetime:
            return Response({
                "error": "Format de date invalide. Utilise le format ISO ex: 2025-05-01T08:00"
            }, status=400)

        if rappel_datetime.tzinfo is None:
            rappel_datetime = make_aware(rappel_datetime)

        if rappel_datetime <= now():
            return Response({"error": "La date de rappel doit être dans le futur"}, status=400)
        print("⏱️ NOW:", now())
        if entretien.date_debut and rappel_datetime >= entretien.date_debut:
            return Response({"error": "Le rappel doit être avant la date de l’entretien"}, status=400)
        print("📨 RAPPEL DATETIME:", rappel_datetime)
        if hasattr(entretien, "rappel"):
            entretien.rappel.delete()

        RappelEntretien.objects.create(
            entretien=entretien,
            technicien=request.user,
            rappel_datetime=rappel_datetime
        )

        rappel_mail_entretien_task.apply_async(
    (
        entretien.technicien.email,
        entretien.technicien.get_full_name(),
        entretien.installation.nom,
        entretien.get_type_entretien_display(),
        entretien.date_debut.strftime('%d/%m/%Y à %Hh%M'),
        entretien.id,
    ),
    eta=rappel_datetime
)


        return Response({"message": "📬 Rappel enregistré avec succès ✅"}, status=201)
    





class MesEntretiensAPIView(APIView):
    permission_classes = [IsAuthenticated, IsTechnicien]

    def get(self, request):
        entretiens = Entretien.objects.filter(
            technicien=request.user
        ).select_related('installation')  

        serializer = EntretienSerializer(entretiens, many=True)
        return Response(serializer.data)



#entretient partie installateur
class MesEntretiensInstallateurAPIView(APIView):
    permission_classes = [IsAuthenticated, IsInstallateur]

    def get(self, request):
        user = request.user
        
        entretiens = Entretien.objects.filter(
            installation__installateur=user
        ).select_related('installation', 'technicien')

        serializer = EntretienSerializer(entretiens, many=True)
        return Response(serializer.data)
    

class EntretienCalendarInstallateurAPIView(APIView):
    """Vue calendrier pour l'installateur connecté"""
    permission_classes = [IsAuthenticated, IsInstallateur]

    def get(self, request):
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')

        if not start_date or not end_date:
            return Response(
                {"error": "Les paramètres start_date et end_date sont requis"},
                status=status.HTTP_400_BAD_REQUEST
            )

        entretiens = Entretien.objects.filter(
            installation__installateur=request.user,
            date_debut__gte=start_date,
            date_debut__lte=end_date
        ).select_related('installation', 'technicien')

        data = [
            {
                'id': e.id,
                'title': f"{e.installation.nom} - {e.get_type_entretien_display()}",
                'start': e.date_debut,
                'end': e.date_fin if e.date_fin else e.date_debut + timedelta(minutes=e.duree_estimee),
                'status': e.statut,
                'priority': e.priorite,
                'technicien': e.technicien.get_full_name() if e.technicien else None,
                'installation_id': e.installation_id,
            }
            for e in entretiens
        ]

        return Response(data)


    
class EntretiensClientAPIView(generics.ListAPIView):
    """Liste des entretiens liés aux installations du client connecté"""
    serializer_class = EntretienSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Entretien.objects.filter(installation__client=user).select_related('installation', 'technicien').order_by('-date_debut')

from rest_framework import generics, permissions

class EntretienClientDetailView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = EntretienSerializer

    def get_queryset(self):
        return Entretien.objects.filter(installation__client=self.request.user).select_related('installation', 'technicien')
