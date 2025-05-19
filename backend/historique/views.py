from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.generics import ListAPIView, DestroyAPIView
from rest_framework import status
from django.utils.timezone import now
from .models import Exportation
from .serializers import ExportationSerializer
from django.core.files.base import ContentFile
from users.permissions import IsAdminOrInstallateur
from rest_framework.permissions import IsAuthenticated
from installations.models import Installation
from datetime import datetime
from alarme.models import AlarmeCode, AlarmeDeclenchee
from django.contrib.auth import get_user_model
import pandas as pd
from io import StringIO, BytesIO
from intervention.models import FicheIntervention
from entretien.models import Entretien
from reclamation.models import Reclamation
from equipements.models import Equipement
# ReportLab  PDF
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors

User = get_user_model()


def df_to_pdf_content(df):
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    data = [df.columns.tolist()] + df.values.tolist()
    if df.empty or df.columns.empty:
        df = pd.DataFrame([{"Aucune donnée disponible": ""}])

    if len(data) <= 1:
        data.append(["Pas de données disponibles" for _ in df.columns])

    table = Table(data)
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.lightgrey),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 6),
    ]))

    doc.build([table])
    buffer.seek(0)
    return ContentFile(buffer.read())

def save_export_file(df, filename, format_export):
    if format_export == "xlsx":
        buffer = BytesIO()
        df.to_excel(buffer, index=False)
        buffer.seek(0)
        return ContentFile(buffer.read())
    elif format_export == "csv":
        buffer = StringIO()
        df.to_csv(buffer, index=False)
        buffer.seek(0)
        return ContentFile(buffer.read().encode("utf-8"))
    elif format_export == "pdf":
        return df_to_pdf_content(df)
    else:
        raise ValueError("Format d'export non pris en charge.")

def cleanup_exports():
    anciens = Exportation.objects.order_by('-date_creation')[10:]
    for e in anciens:
        e.fichier.delete()
        e.delete()


class ExportGenericView(APIView):
    permission_classes = [IsAuthenticated, IsAdminOrInstallateur]

    def export_df(self, queryset, fields, filename_prefix, format_export):
        df = pd.DataFrame(list(queryset.values(*fields)))
        now_str = now().strftime('%Y-%m-%d_%H%M%S')
        filename = f"{filename_prefix}-{now_str}.{format_export}"
        contenu = save_export_file(df, filename, format_export)

        export = Exportation(nom=filename)
        export.fichier.save(filename, contenu)
        export.save()
        cleanup_exports()
        return Response({"message": f"Export {format_export.upper()} réussi ✅"}, status=201)


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
        contenu = save_export_file(df, filename, format_export)

        export = Exportation(nom=filename)
        export.fichier.save(filename, contenu)
        export.save()
        cleanup_exports()

        return Response({"message": f"Export {format_export.upper()} de l'installation réussi ✅"}, status=201)


class ExportGlobalInstallationsView(ExportGenericView):
    def post(self, request):
        format_export = request.data.get("format", "csv").lower()
        filtres = {}

        for key in ["statut", "type_installation"]:
            val = request.data.get(key)
            if val:
                filtres[key] = val

        date_debut = request.data.get("date_debut")
        date_fin = request.data.get("date_fin")
        if date_debut and date_fin:
            filtres["date_installation__range"] = (
                datetime.strptime(date_debut, "%Y-%m-%d"),
                datetime.strptime(date_fin, "%Y-%m-%d")
            )

        queryset = Installation.objects.filter(**filtres)
        fields = ['nom', 'type_installation', 'statut', 'capacite_kw', 'ville', 'date_installation']
        return self.export_df(queryset, fields, "export-global", format_export)


class ExportGlobalUtilisateursView(APIView):
    permission_classes = [IsAuthenticated, IsAdminOrInstallateur]

    def post(self, request):
        format_export = request.data.get("format", "csv").lower()
        queryset = User.objects.filter(groups__name="Clients")

        data = []
        for user in queryset:
            data.append({
                "Prénom": user.first_name,
                "Nom": user.last_name,
                "Email": user.email,
                "Téléphone": getattr(user, "phone_number", "—"),
                "Rôle": getattr(user, "role", "—"),  
                "Dernière connexion": user.last_login.strftime("%Y-%m-%d %H:%M") if user.last_login else "—",
            })

        df = pd.DataFrame(data)
        if df.empty or df.columns.empty:
            df = pd.DataFrame([{"Message": "Aucune donnée à exporter"}])

        now_str = now().strftime('%Y-%m-%d_%H%M%S')
        filename = f"export-utilisateurs-{now_str}.{format_export}"
        contenu = save_export_file(df, filename, format_export)

        export = Exportation(nom=filename)
        export.fichier.save(filename, contenu)
        export.save()
        cleanup_exports()

        return Response({"message": f"Export {format_export.upper()} réussi ✅"}, status=201)


class ExportAlarmeCodesView(ExportGenericView):
    def post(self, request):
        format_export = request.data.get("format", "csv").lower()
        queryset = AlarmeCode.objects.all()
        fields = ["code_constructeur", "marque", "type_alarme", "gravite", "description"]
        return self.export_df(queryset, fields, "export-codes-alarme", format_export)


class ExportAlarmesDeclencheesView(APIView):
    permission_classes = [IsAuthenticated, IsAdminOrInstallateur]

    def post(self, request):
        format_export = request.data.get("format", "csv").lower()
        queryset = AlarmeDeclenchee.objects.select_related("installation", "code_alarme")
        values = queryset.values(
            "installation__nom",
            "code_alarme__code_constructeur",
            "code_alarme__marque",
            "code_alarme__type_alarme",
            "code_alarme__gravite",
            "date_declenchement",
            "est_resolue"
        )

        df = pd.DataFrame(list(values))
        now_str = now().strftime('%Y-%m-%d_%H%M%S')
        filename = f"alarmes-declenchees-{now_str}.{format_export}"
        contenu = save_export_file(df, filename, format_export)

        export = Exportation(nom=filename)
        export.fichier.save(filename, contenu)
        export.save()
        cleanup_exports()

        return Response({"message": "✅ Export réussi"}, status=201)


class ListeExportsView(ListAPIView):
    permission_classes = [IsAuthenticated, IsAdminOrInstallateur]
    queryset = Exportation.objects.all().order_by('-date_creation')
    serializer_class = ExportationSerializer


class SupprimerExportView(DestroyAPIView):
    permission_classes = [IsAuthenticated, IsAdminOrInstallateur]
    queryset = Exportation.objects.all()
    serializer_class = ExportationSerializer




class ExportInterventionsView(APIView):
    permission_classes = [IsAuthenticated, IsAdminOrInstallateur]

    def post(self, request):
        format_export = request.data.get("format", "csv").lower()

        queryset = FicheIntervention.objects.select_related("installation", "technicien")
        data = []
        for i in queryset:
            data.append({
                "Installation": i.installation.nom,
                "Technicien": f"{i.technicien.first_name} {i.technicien.last_name}" if i.technicien else "—",
                "Type": i.get_type_intervention_display(),
                "Statut": i.get_statut_display(),
                "Date prévue": i.date_prevue.strftime("%Y-%m-%d %H:%M"),
                "Créée le": i.date_creation.strftime("%Y-%m-%d %H:%M"),
            })

        df = pd.DataFrame(data)
        now_str = now().strftime('%Y-%m-%d_%H%M%S')
        filename = f"interventions-{now_str}.{format_export}"
        contenu = save_export_file(df, filename, format_export)

        export = Exportation(nom=filename)
        export.fichier.save(filename, contenu)
        export.save()
        cleanup_exports()

        return Response({"message": "✅ Export réussi"}, status=201)


class ExportEntretiensView(APIView):
    permission_classes = [IsAuthenticated, IsAdminOrInstallateur]

    def post(self, request):
        format_export = request.data.get("format", "csv").lower()
        queryset = Entretien.objects.select_related("installation", "technicien")
        data = [
            {
                "Installation": e.installation.nom,
                "Technicien": f"{e.technicien.first_name} {e.technicien.last_name}" if e.technicien else "—",
                "Type": e.type_entretien,
                "Statut": e.statut,
                "Début": e.date_debut.strftime("%Y-%m-%d %H:%M"),
                "Fin": e.date_fin.strftime("%Y-%m-%d %H:%M"),
            }
            for e in queryset
        ]
        df = pd.DataFrame(data)
        now_str = now().strftime('%Y-%m-%d_%H%M%S')
        filename = f"entretiens-{now_str}.{format_export}"
        contenu = save_export_file(df, filename, format_export)
        export = Exportation(nom=filename)
        export.fichier.save(filename, contenu)
        export.save()
        cleanup_exports()
        return Response({"message": "✅ Export réussi"}, status=201)


class ExportReclamationsView(APIView):
    permission_classes = [IsAuthenticated, IsAdminOrInstallateur]

    def post(self, request):
        format_export = request.data.get("format", "csv").lower()
        queryset = Reclamation.objects.select_related("client", "installation")

        data = [
            {
                "Client": r.client.email,
                "Installation": r.installation.nom if r.installation else "—",
                "Sujet": r.sujet,
                "Message": r.message,
                "Statut": r.statut,
                "Date d’envoi": r.date_envoi.strftime("%Y-%m-%d %H:%M"),
                "Nombre d’images": len(r.images.all()) if hasattr(r, 'images') else 0,
            }
            for r in queryset
        ]

        df = pd.DataFrame(data)
        now_str = now().strftime('%Y-%m-%d_%H%M%S')
        filename = f"reclamations-{now_str}.{format_export}"
        contenu = save_export_file(df, filename, format_export)

        export = Exportation(nom=filename)
        export.fichier.save(filename, contenu)
        export.save()
        cleanup_exports()

        return Response({"message": "✅ Export des réclamations réussi"}, status=201)




class ExportEquipementsView(APIView):
    permission_classes = [IsAuthenticated, IsAdminOrInstallateur]

    def post(self, request):
        format_export = request.data.get("format", "csv").lower()

        queryset = Equipement.objects.select_related("installation")

        data = []
        for eq in queryset:
            data.append({
                "Nom de l'appareil": eq.nom,
                "Type d'appareil": eq.get_type_appareil_display() if hasattr(eq, "get_type_appareil_display") else eq.type_appareil,
                "Nom de la centrale": eq.installation.nom if eq.installation else "Non défini",
                "Etat": eq.etat,
            })

        df = pd.DataFrame(data)
        if df.empty or df.columns.empty:
            df = pd.DataFrame([{"Message": "Aucune donnée à exporter"}])

        now_str = now().strftime('%Y-%m-%d_%H%M%S')
        filename = f"equipements-{now_str}.{format_export}"
        contenu = save_export_file(df, filename, format_export)

        export = Exportation(nom=filename)
        export.fichier.save(filename, contenu)
        export.save()
        cleanup_exports()

        return Response({"message": f"Export {format_export.upper()} des équipements réussi ✅"}, status=201)
