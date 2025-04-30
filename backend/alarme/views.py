from rest_framework import viewsets, filters
from rest_framework import generics
from django_filters.rest_framework import DjangoFilterBackend
from .models import AlarmeCode, AlarmeDeclenchee
from .serializers import AlarmeCodeSerializer, AlarmeDeclencheeSerializer
from django.db.models import Count
from rest_framework.response import Response
from users.permissions import IsAdminOrInstallateur
from rest_framework.permissions import IsAuthenticated
from installations.models import Installation
from rest_framework.views import APIView
from users.permissions import IsInstallateur


#alarme code (marbouta bel admin)
class AjouterAlarmeCodeView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated, IsAdminOrInstallateur]

    queryset = AlarmeCode.objects.all()
    serializer_class = AlarmeCodeSerializer


class ListeAlarmeCodesView(generics.ListAPIView):
    permission_classes = [IsAuthenticated, IsAdminOrInstallateur]
    queryset = AlarmeCode.objects.all().order_by('marque')
    serializer_class = AlarmeCodeSerializer
    filterset_fields = ['marque', 'type_alarme', 'gravite']
    search_fields = ['description', 'code_constructeur']


class DetailAlarmeCodeView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated, IsAdminOrInstallateur]
    queryset = AlarmeCode.objects.all()
    serializer_class = AlarmeCodeSerializer


class ModifierAlarmeCodeView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated, IsAdminOrInstallateur]
    queryset = AlarmeCode.objects.all()
    serializer_class = AlarmeCodeSerializer


class SupprimerAlarmeCodeView(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated, IsAdminOrInstallateur]
    queryset = AlarmeCode.objects.all()
    serializer_class = AlarmeCodeSerializer


class StatistiquesAlarmeCodesView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated, IsAdminOrInstallateur]
    def get(self, request, *args, **kwargs):
        stats = AlarmeCode.objects.values('marque', 'type_alarme').annotate(total=Count('id'))
        return Response(stats)
    











#Alarme declenche (marbouta bel installation)
class AjouterAlarmeView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated, IsAdminOrInstallateur]
    queryset = AlarmeDeclenchee.objects.all()
    serializer_class = AlarmeDeclencheeSerializer


class ListeAlarmesView(generics.ListAPIView):
    permission_classes = [IsAuthenticated, IsAdminOrInstallateur]
    queryset = AlarmeDeclenchee.objects.select_related('installation', 'code_alarme').all().order_by('-date_declenchement')
    serializer_class = AlarmeDeclencheeSerializer
    filterset_fields = ['installation', 'est_resolue', 'code_alarme__gravite', 'code_alarme__type_alarme']
    search_fields = ['code_alarme__description', 'installation__nom']


class DetailAlarmeView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated, IsAdminOrInstallateur]
    queryset = AlarmeDeclenchee.objects.all()
    serializer_class = AlarmeDeclencheeSerializer


class ModifierAlarmeView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated, IsAdminOrInstallateur]
    queryset = AlarmeDeclenchee.objects.all()
    serializer_class = AlarmeDeclencheeSerializer


class SupprimerAlarmeView(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated, IsAdminOrInstallateur]
    queryset = AlarmeDeclenchee.objects.all()
    serializer_class = AlarmeDeclencheeSerializer



class StatistiquesAlarmesView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated, IsAdminOrInstallateur]

    def get(self, request, *args, **kwargs):
        stats = AlarmeDeclenchee.objects.filter(est_resolue=False) \
            .values('code_alarme__gravite') \
            .annotate(total=Count('id'))
        return Response(stats)
    
class StatistiquesAlarmesClientView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        installation = Installation.objects.filter(client=request.user).first()
        if not installation:
            return Response({"mineures": 0, "majeures": 0, "critiques": 0})

        alertes = AlarmeDeclenchee.objects.filter(installation=installation, est_resolue=False)

        stats = {
            "mineures": alertes.filter(code_alarme__gravite="mineure").count(),
            "majeures": alertes.filter(code_alarme__gravite="majeure").count(),
            "critiques": alertes.filter(code_alarme__gravite="critique").count(),
        }

        return Response(stats)



class StatistiquesAlarmesInstallationView(APIView):
    permission_classes = [IsAuthenticated, IsAdminOrInstallateur]

    def get(self, request, installation_id):
        alarmes = AlarmeDeclenchee.objects.filter(
            installation_id=installation_id,
            est_resolue=False
        )

        counts = {"critique": 0, "majeure": 0, "mineure": 0}

        for alarme in alarmes:
            gravite = alarme.code_alarme.gravite
            if gravite in counts:
                counts[gravite] += 1

        total = sum(counts.values())

        return Response({
            "total": total,
            "critique": counts["critique"],
            "majeure": counts["majeure"],
            "mineure": counts["mineure"]
        })
    


#partie alarme installateur
class ListeAlarmesInstallateurView(APIView):
    """
    Liste des alarmes déclenchées associées à un installateur (via ses installations).
    """
    permission_classes = [IsAuthenticated, IsInstallateur]

    def get(self, request):
        user = request.user

        alarmes = AlarmeDeclenchee.objects.select_related("installation", "code_alarme") \
            .filter(installation__installateur=user) \
            .order_by("-date_declenchement")

        serializer = AlarmeDeclencheeSerializer(alarmes, many=True)
        return Response(serializer.data)




class StatistiquesAlarmesInstallateurView(APIView):
    """
    Statistiques globales des alarmes pour l'installateur connecté.
    """
    permission_classes = [IsAuthenticated, IsInstallateur]

    def get(self, request):
        user = request.user

        alarmes = AlarmeDeclenchee.objects.filter(
            installation__installateur=user,
            est_resolue=False
        )

        counts = {
            "critique": alarmes.filter(code_alarme__gravite="critique").count(),
            "majeure": alarmes.filter(code_alarme__gravite="majeure").count(),
            "mineure": alarmes.filter(code_alarme__gravite="mineure").count(),
        }

        total = sum(counts.values())

        return Response({
            "total": total,
            "critique": counts["critique"],
            "majeure": counts["majeure"],
            "mineure": counts["mineure"]
        })
