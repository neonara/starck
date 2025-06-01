import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ApiService from "../../Api/Api";
import { Loader2 } from "lucide-react";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";

const DetailleInterventionClient = () => {
  const { id } = useParams();
  const [intervention, setIntervention] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();


  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await ApiService.getInterventionDetailClient(id); // ⚠️ À implémenter
        setIntervention(res.data);
      } catch (err) {
        console.error("Erreur détail intervention :", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  const formatDate = (dateStr) => dateStr ? dayjs(dateStr).format("DD/MM/YYYY") : "Non spécifiée";

  const getStatusColor = (statut) => {
    switch (statut) {
      case "en_attente": return "bg-yellow-100 text-yellow-800";
      case "en_cours": return "bg-blue-100 text-blue-800";
      case "terminee": return "bg-green-100 text-green-800";
      case "annulee": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="animate-spin w-8 h-8 text-blue-500" />
      </div>
    );
  }

  if (!intervention) {
    return (
      <div className="text-center text-red-500 pt-20">Intervention introuvable.</div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mt-24 p-6 bg-white rounded-lg shadow">
        <button
  onClick={() => navigate("/client-mes-interventions")}
  className="text-blue-600 hover:underline text-sm mb-4"
>
  ⬅ Retour à la liste des interventions
</button>

      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Détails de l’intervention</h1>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(intervention.statut)}`}>
          {intervention.statut_display}
        </span>
      </div>

      <div className="space-y-4 text-gray-700">
        <p><strong>Description :</strong> {intervention.description}</p>
        <p><strong>Date prévue :</strong> {formatDate(intervention.date_prevue)}</p>
        <p><strong>Date de création :</strong> {formatDate(intervention.date_creation)}</p>
        <p><strong>Commentaire :</strong> {intervention.commentaire || "Aucun"}</p>

        {intervention.installation_details && (
          <>
            <hr className="my-4" />
            <p className="font-semibold text-gray-800">Installation concernée :</p>
            <p>🏠 <strong>Nom :</strong> {intervention.installation_details.nom}</p>
            <p>⚙️ <strong>Type :</strong> {intervention.installation_details.type_installation}</p>
            <p>📊 <strong>Statut :</strong> {intervention.installation_details.statut}</p>
          </>
        )}

        {intervention.technicien_details && (
          <>
            <hr className="my-4" />
            <p className="font-semibold text-gray-800">Technicien assigné :</p>
            <p>👨‍🔧 <strong>Nom :</strong> {intervention.technicien_details.first_name} {intervention.technicien_details.last_name}</p>
            <p>📧 <strong>Email :</strong> {intervention.technicien_details.email}</p>
          </>
        )}
      </div>
    </div>
  );
};

export default DetailleInterventionClient;
