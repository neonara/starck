from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import FicheIntervention
from intervention.serializers import (
    FicheInterventionCreateSerializer,
    FicheInterventionDetailSerializer,
    FicheInterventionUpdateSerializer
)
from django.contrib.auth import get_user_model

User = get_user_model()

class ListeFicheInterventionView(generics.ListAPIView):
    """Liste toutes les fiches d'intervention"""
    serializer_class = FicheInterventionDetailSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = FicheIntervention.objects.all()
        
        # Suppression du filtre client
        technicien_id = self.request.query_params.get('technicien')
        if technicien_id:
            queryset = queryset.filter(technicien_id=technicien_id)
            
        installation_id = self.request.query_params.get('installation')
        if installation_id:
            queryset = queryset.filter(installation_id=installation_id)
            
        statut = self.request.query_params.get('statut')
        if statut:
            queryset = queryset.filter(statut=statut)
            
        return queryset


class CreerFicheInterventionView(generics.CreateAPIView):
    serializer_class = FicheInterventionCreateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data)
            if not serializer.is_valid():
                return Response(
                    serializer.errors,
                    status=status.HTTP_400_BAD_REQUEST
                )
            self.perform_create(serializer)
            instance = FicheIntervention.objects.get(pk=serializer.instance.pk)
            detail_serializer = FicheInterventionDetailSerializer(instance)
            return Response(
                detail_serializer.data,
                status=status.HTTP_201_CREATED
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
            
class DetailFicheInterventionView(generics.RetrieveAPIView):
    """Récupérer les détails d'une fiche d'intervention"""
    queryset = FicheIntervention.objects.all()
    serializer_class = FicheInterventionDetailSerializer 
    permission_classes = [permissions.IsAuthenticated]

class ModifierFicheInterventionView(generics.UpdateAPIView):
    """Modifier une fiche d'intervention existante"""
    queryset = FicheIntervention.objects.all()
    serializer_class = FicheInterventionUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        instance = self.get_object()
        detail_serializer = FicheInterventionDetailSerializer(instance)
        return Response(detail_serializer.data)

class SupprimerFicheInterventionView(generics.DestroyAPIView):
    """Supprimer une fiche d'intervention"""
    queryset = FicheIntervention.objects.all()
    permission_classes = [permissions.IsAuthenticated]

class ChangerStatutFicheInterventionView(APIView):
    """Changer le statut d'une fiche d'intervention"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        fiche = get_object_or_404(FicheIntervention, pk=pk)
        nouveau_statut = request.data.get('statut')
        
        if nouveau_statut not in dict(FicheIntervention.STATUT_CHOICES):
            return Response(
                {'error': 'Statut invalide'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        fiche.statut = nouveau_statut
        fiche.save()
        
        serializer = FicheInterventionDetailSerializer(fiche) 
        return Response(serializer.data)

class AssignerTechnicienView(APIView):
    """Assigner un technicien à une fiche d'intervention"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        fiche = get_object_or_404(FicheIntervention, pk=pk)
        technicien_id = request.data.get('technicien_id')
        
        try:
            technicien = User.objects.get(
                id=technicien_id,
                groups__name='Techniciens'
            )
        except User.DoesNotExist:
            return Response(
                {'error': 'Technicien non trouvé'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        fiche.technicien = technicien
        fiche.save()
        
        serializer = FicheInterventionDetailSerializer(fiche) 
        return Response(serializer.data)

class TechniciensListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        techniciens = User.objects.filter(groups__name='Techniciens')
        serializer = UserSerializer(techniciens, many=True)
        return Response({"results": serializer.data})