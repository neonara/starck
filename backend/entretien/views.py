from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import Entretien
from .serializers import EntretienSerializer
from installations.models import Installation
from django.contrib.auth import get_user_model

User = get_user_model()

class EntretienListCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Filtrage des entretiens
        entretiens = Entretien.objects.select_related('installation', 'technicien', 'cree_par').all()
        
        # Filtres de base
        installation_id = request.query_params.get('installation_id')
        technicien_id = request.query_params.get('technicien_id')
        statut = request.query_params.get('statut')
        
        if installation_id:
            entretiens = entretiens.filter(installation_id=installation_id)
        if technicien_id:
            entretiens = entretiens.filter(technicien_id=technicien_id)
        if statut:
            entretiens = entretiens.filter(statut=statut)
        

        serializer = EntretienSerializer(entretiens, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = EntretienSerializer(data=request.data)
        if serializer.is_valid():
            # Assigner l'utilisateur courant comme créateur
            serializer.save(cree_par=request.user)
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