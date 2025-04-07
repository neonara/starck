from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import Alarme
from .serializers import AlarmeSerializer
from django.db.models import Count

class AjouterAlarmeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = AlarmeSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Alarme ajoutée avec succès."}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ModifierAlarmeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, alarme_id):
        try:
            alarme = Alarme.objects.get(id=alarme_id)
        except Alarme.DoesNotExist:
            return Response({"error": "Alarme non trouvée."}, status=404)

        serializer = AlarmeSerializer(alarme, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=200)
        return Response(serializer.errors, status=400)

class SupprimerAlarmeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, alarme_id):
        try:
            alarme = Alarme.objects.get(id=alarme_id)
            alarme.delete()
            return Response(status=204)
        except Alarme.DoesNotExist:
            return Response({"error": "Alarme non trouvée."}, status=404)

class DetailAlarmeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, alarme_id):
        try:
            alarme = Alarme.objects.get(id=alarme_id)
            serializer = AlarmeSerializer(alarme)
            return Response(serializer.data, status=200)
        except Alarme.DoesNotExist:
            return Response({"error": "Alarme non trouvée."}, status=404)

class ListeAlarmesView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        queryset = Alarme.objects.all()

        code_alarme = request.query_params.get('code_alarme', None)
        if code_alarme:
            queryset = queryset.filter(code_alarme__icontains=code_alarme)

        titre = request.query_params.get('titre', None)
        if titre:
            queryset = queryset.filter(titre__icontains=titre)

        gravite = request.query_params.get('gravite', None)
        if gravite:
            queryset = queryset.filter(gravite=gravite)

        serializer = AlarmeSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class StatistiquesAlarmesView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        stats = Alarme.objects.values('gravite').annotate(count=Count('id'))
        statistiques = {item['gravite']: item['count'] for item in stats}
        total_alarmes = Alarme.objects.count()

        statistiques['total'] = total_alarmes
        
        return Response(statistiques, status=200)

