from rest_framework import viewsets, filters
from rest_framework import generics
from django_filters.rest_framework import DjangoFilterBackend
from .models import AlarmeCode, AlarmeDeclenchee
from .serializers import AlarmeCodeSerializer, AlarmeDeclencheeSerializer
from django.db.models import Count
from rest_framework.response import Response
from users.permissions import IsAdminOrInstallateur
from rest_framework.permissions import IsAuthenticated


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






#Alarme declenche (marbouta be installation)
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