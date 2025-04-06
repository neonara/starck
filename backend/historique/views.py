from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.generics import ListAPIView, DestroyAPIView
from rest_framework import status
from django.utils.timezone import now
from .models import Exportation
from .serializers import ExportationSerializer
import pandas as pd
from io import StringIO, BytesIO
from django.core.files.base import ContentFile
from users.permissions import  IsAdminOrInstallateur
from rest_framework.permissions import IsAuthenticated
from installations.models import Installation  
from datetime import datetime


#  Simule des données 
from django.contrib.auth import get_user_model

User = get_user_model()
class ExportInstallationsView(APIView):
    permission_classes = [IsAuthenticated, IsAdminOrInstallateur]

    def post(self, request):
        format_export = request.data.get("format", "csv").lower()
        installation_id = request.data.get("installation_id")

        if not installation_id:
            return Response({"error": "installation_id requis"}, status=400)

        try:
            installation = Installation.objects.get(id=installation_id)
        except Installation.DoesNotExist:
            return Response({"error": "Installation introuvable"}, status=404)

        # Préparation des données
        data = {
            "Nom": installation.nom,
            "Type": installation.type_installation,
            "Statut": installation.statut,
            "Capacité (kW)": installation.capacite_kw,
            "Ville": installation.ville,
            "Date d'installation": installation.date_installation,
            "Client": f"{installation.client.first_name} {installation.client.last_name}",
            "Installateur": installation.installateur.get_full_name() if installation.installateur else "—",
        }

        df = pd.DataFrame([data])
        now_str = now().strftime('%Y-%m-%d_%H%M%S')
        filename = f"export-installation-{installation_id}-{now_str}.{format_export}"

        if format_export == "xlsx":
            buffer = BytesIO()
            df.to_excel(buffer, index=False)
            buffer.seek(0)
            contenu = ContentFile(buffer.read())
        else:
            buffer = StringIO()
            df.to_csv(buffer, index=False)
            buffer.seek(0)
            contenu = ContentFile(buffer.read().encode("utf-8"))

        export = Exportation(nom=filename)
        export.fichier.save(filename, contenu)
        export.save()
        anciens = Exportation.objects.order_by('-date_creation')[10:]
        for e in anciens:
            e.fichier.delete()
            e.delete()

        return Response({"message": f"Export {format_export.upper()} de l'installation réussi ✅"}, status=201)

class ListeExportsView(ListAPIView):
    permission_classes = [IsAuthenticated, IsAdminOrInstallateur]

    queryset = Exportation.objects.all().order_by('-date_creation')
    serializer_class = ExportationSerializer

class SupprimerExportView(DestroyAPIView):
    permission_classes = [IsAuthenticated, IsAdminOrInstallateur]
    queryset = Exportation.objects.all()
    serializer_class = ExportationSerializer


class ExportGlobalInstallationsView(APIView):
    permission_classes = [IsAuthenticated, IsAdminOrInstallateur]

    def post(self, request):
      print("🔐 Utilisateur connecté :", request.user)
      print("🎭 Rôle :", request.user.role)


    def post(self, request):
        format_export = request.data.get("format", "csv").lower()
        statut = request.data.get("statut")
        type_installation = request.data.get("type_installation")
        date_debut = request.data.get("date_debut")
        date_fin = request.data.get("date_fin")

        filtres = {}

        if statut:
            filtres["statut"] = statut
        if type_installation:
            filtres["type_installation"] = type_installation
        if date_debut and date_fin:
            try:
                date_debut = datetime.strptime(date_debut, "%Y-%m-%d")
                date_fin = datetime.strptime(date_fin, "%Y-%m-%d")
                filtres["date_installation__range"] = (date_debut, date_fin)
            except ValueError:
                return Response({"error": "Format de date invalide. Utilisez YYYY-MM-DD."}, status=400)

        # Appliquer les filtres
        installations = Installation.objects.filter(**filtres).values(
            'nom',
            'type_installation',
            'statut',
            'capacite_kw',
            'ville',
            'date_installation',
        )

        df = pd.DataFrame(list(installations))
        now_str = now().strftime('%Y-%m-%d_%H%M%S')
        filename = f"export-global-{now_str}.{format_export}"

        if format_export == "xlsx":
            buffer = BytesIO()
            df.to_excel(buffer, index=False)
            buffer.seek(0)
            contenu = ContentFile(buffer.read())
        else:
            buffer = StringIO()
            df.to_csv(buffer, index=False)
            buffer.seek(0)
            contenu = ContentFile(buffer.read().encode("utf-8"))

        export = Exportation(nom=filename)
        export.fichier.save(filename, contenu)
        export.save()

        anciens = Exportation.objects.order_by('-date_creation')[10:]
        for e in anciens:
            e.fichier.delete()
            e.delete()

        return Response({"message": f"Export global {format_export.upper()} généré ✅"}, status=201)



class ExportGlobalUtilisateursView(APIView):
    permission_classes = [IsAuthenticated, IsAdminOrInstallateur]

    def post(self, request):
        format_export = request.data.get("format", "csv").lower()

        utilisateurs = User.objects.filter(groups__name="Clients").values(
            "first_name", "last_name", "email", "phone_number", "role"
        )

        df = pd.DataFrame(list(utilisateurs))
        now_str = now().strftime('%Y-%m-%d_%H%M%S')
        filename = f"export-utilisateurs-{now_str}.{format_export}"

        if format_export == "xlsx":
            buffer = BytesIO()
            df.to_excel(buffer, index=False)
            buffer.seek(0)
            contenu = ContentFile(buffer.read())
        else:
            buffer = StringIO()
            df.to_csv(buffer, index=False)
            buffer.seek(0)
            contenu = ContentFile(buffer.read().encode("utf-8"))

        export = Exportation(nom=filename)
        export.fichier.save(filename, contenu)
        export.save()

        anciens = Exportation.objects.order_by('-date_creation')[10:]
        for e in anciens:
            e.fichier.delete()
            e.delete()

        return Response({"message": f"Export {format_export.upper()} généré ✅"}, status=201)
