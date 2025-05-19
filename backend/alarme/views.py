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
from django.core.cache import cache


#alarme code (marbouta bel admin)
class AjouterAlarmeCodeView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated, IsAdminOrInstallateur]

    queryset = AlarmeCode.objects.all()
    serializer_class = AlarmeCodeSerializer


class ListeAlarmeCodesView(generics.ListAPIView):
    permission_classes = [IsAuthenticated, IsAdminOrInstallateur]
    queryset = AlarmeCode.objects.all().order_by('marque')
    serializer_class = AlarmeCodeSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
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
       cache_key = "stats:alarme_codes"
       stats = cache.get(cache_key)

       if not stats:
        stats = list(AlarmeCode.objects.values('marque', 'type_alarme').annotate(total=Count('id')))
        cache.set(cache_key, stats, timeout=600)  # 10 minutes

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
      cache_key = "stats:alarmes_global"
      stats = cache.get(cache_key)
  
      if not stats:
        stats = list(
            AlarmeDeclenchee.objects.filter(est_resolue=False)
            .values('code_alarme__gravite')
            .annotate(total=Count('id'))
        )
        cache.set(cache_key, stats, timeout=600)

      return Response(stats)

        
    
class StatistiquesAlarmesClientView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        cache_key = f"stats:alarmes_client:{request.user.id}"
        stats = cache.get(cache_key)

        if not stats:
            alarmes = AlarmeDeclenchee.objects.filter(
                installation__client=request.user,
                est_resolue=False
            )
            stats = {
                "critiques": alarmes.filter(code_alarme__gravite="critique").count(),
                "majeures": alarmes.filter(code_alarme__gravite="majeure").count(),
                "mineures": alarmes.filter(code_alarme__gravite="mineure").count(),
            }
            cache.set(cache_key, stats, timeout=600)

        return Response(stats)



class StatistiquesAlarmesInstallationView(APIView):
    permission_classes = [IsAuthenticated, IsAdminOrInstallateur]

    def get(self, request, installation_id):
        cache_key = f"stats:alarmes_installation:{installation_id}"
        result = cache.get(cache_key)

        if result:
            return Response(result)

        alarmes = AlarmeDeclenchee.objects.filter(installation_id=installation_id, est_resolue=False)
        counts = {"critique": 0, "majeure": 0, "mineure": 0}

        for alarme in alarmes:
            gravite = alarme.code_alarme.gravite
            if gravite in counts:
                counts[gravite] += 1

        total = sum(counts.values())
        result = {"total": total, **counts}
        cache.set(cache_key, result, timeout=600)

        return Response(result)

        


#partie alarme installateur
class ListeAlarmesInstallateurView(APIView):
    permission_classes = [IsAuthenticated, IsInstallateur]

    def get(self, request):
        cache_key = f"liste:alarmes_installateur:{request.user.id}"
        data = cache.get(cache_key)

        if data:
            return Response(data)

        alarmes = AlarmeDeclenchee.objects.select_related("installation", "code_alarme") \
            .filter(installation__installateur=request.user) \
            .order_by("-date_declenchement")

        serializer = AlarmeDeclencheeSerializer(alarmes, many=True)
        cache.set(cache_key, serializer.data, timeout=300)

        return Response(serializer.data)

       



class StatistiquesAlarmesInstallateurView(APIView):
    permission_classes = [IsAuthenticated, IsInstallateur]

    def get(self, request):
        cache_key = f"stats:alarmes_installateur:{request.user.id}"
        stats = cache.get(cache_key)

        if stats:
            return Response(stats)

        alarmes = AlarmeDeclenchee.objects.filter(installation__installateur=request.user, est_resolue=False)

        counts = {
            "critique": alarmes.filter(code_alarme__gravite="critique").count(),
            "majeure": alarmes.filter(code_alarme__gravite="majeure").count(),
            "mineure": alarmes.filter(code_alarme__gravite="mineure").count(),
        }

        total = sum(counts.values())
        stats = {"total": total, **counts}
        cache.set(cache_key, stats, timeout=600)

        return Response(stats)
