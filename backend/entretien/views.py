from rest_framework.views import APIView
from rest_framework import generics, filters
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import Entretien
from .serializers import EntretienSerializer
from installations.models import Installation
from django.contrib.auth import get_user_model
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Count
from django.db.models.functions import TruncMonth
from django.db.models import Q
from .utils import notifier_technicien_entretien 

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
 
        # Filtres classiques
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
 
        # 🔍 Recherche globale
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
            # Assigner l'utilisateur courant comme créateur
            serializer.save(cree_par=request.user)
            # 🔔 Notification technicien
            entretien = serializer.instance
            notifier_technicien_entretien(entretien)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class EntretienDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]

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
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk):
        entretien = self.get_object(pk)
        serializer = EntretienSerializer(entretien, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        entretien = self.get_object(pk)
        entretien.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class EntretienCalendarAPIView(APIView):
    """Vue spéciale pour les calendriers"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        if not start_date or not end_date:
            return Response(
                {"error": "Les paramètres start_date et end_date sont requis"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        entretiens = Entretien.objects.filter(
            date_debut__gte=start_date,
            date_debut__lte=end_date
        ).select_related('installation', 'technicien')
        
        # Format spécial pour les calendriers
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
class MesEntretiensAPIView(APIView):
    permission_classes = [IsAuthenticated]
 
    def get(self, request):
        entretiens = Entretien.objects.filter(technicien=request.user)
        serializer = EntretienSerializer(entretiens, many=True)
        return Response(serializer.data)
    
class EntretienStatistiquesView(APIView):
    permission_classes = [IsAuthenticated]
 
    def get(self, request):
        # Répartition par type d'entretien
        par_type = Entretien.objects.values('type_entretien').annotate(count=Count('id'))
        dict_type = {item['type_entretien']: item['count'] for item in par_type}
 
        # Répartition par statut
        par_statut = Entretien.objects.values('statut').annotate(count=Count('id'))
        dict_statut = {item['statut']: item['count'] for item in par_statut}
 
        # Répartition par mois
        par_mois = Entretien.objects.annotate(mois=TruncMonth('date_debut')).values('mois').annotate(count=Count('id')).order_by('mois')
        dict_mois = {item['mois'].strftime('%Y-%m'): item['count'] for item in par_mois if item['mois']}
 
        # Répartition par technicien
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