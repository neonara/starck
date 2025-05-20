import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../Api/Api";
import { Loader2 } from "lucide-react";
import { FaArrowLeft } from "react-icons/fa"; // ✅ Ajout
const DetailleIntervention = () => {
  const { id } = useParams();
  const navigate = useNavigate(); // ✅ Ajout
  const [intervention, setIntervention] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getInterventionDetail(id)
      .then((res) => {
        console.log("Données reçues:", res.data);
        setIntervention(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erreur détaillée:", err.response?.data || err);
        setLoading(false);
      });
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return "Non spécifiée";
    return new Date(dateString).toLocaleString("fr-FR");
  };

  const getStatusBadgeClass = (statut) => {
    const classes = {
      annulee: "bg-red-100 text-red-800",
      en_cours: "bg-blue-100 text-blue-800",
      en_attente: "bg-yellow-100 text-yellow-800",
      terminee: "bg-green-100 text-green-800",
    };
    return classes[statut] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen pt-24">
        <Loader2 className="animate-spin w-8 h-8 text-blue-500" />
      </div>
    );
  }

  if (!intervention) {
    return (
      <div className="flex justify-center items-center min-h-screen pt-24">
        <div className="text-center text-red-500">Intervention non trouvée.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24">
      <div className="max-w-4xl mx-auto px-4 py-6">
        
        <button
          onClick={() => navigate("/liste-interventions")}
          className="flex items-center text-sm text-gray-600 hover:text-gray-800 mb-4"
        >
          <FaArrowLeft className="mr-2" /> Retour à la liste
        </button>

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Détail de l'intervention 
          </h1>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(intervention.statut)}`}
          >
            {intervention.statut_display}
          </span>
        </div>

        <div className="grid gap-6">
          {/* Informations générales */}
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Informations générales</h2>
            <div className="space-y-4 text-gray-700 text-left">
              <p><span className="font-semibold">Description :</span> {intervention.description}</p>
              <p><span className="font-semibold">Date prévue :</span> {formatDate(intervention.date_prevue)}</p>
              <p><span className="font-semibold">Type d’intervention :</span> {intervention.type_intervention_display || intervention.type_intervention}</p>
              <p><span className="font-semibold">Date de création :</span> {formatDate(intervention.date_creation)}</p>
              <p><span className="font-semibold">Dernière modification :</span> {formatDate(intervention.date_modification)}</p>
              <p><span className="font-semibold">Commentaire :</span> {intervention.commentaire || "Aucun"}</p>
            </div>
          </div>

          {/* Technicien assigné */}
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Technicien assigné</h2>
            <div className="space-y-4 text-gray-700 text-left">
              {intervention.technicien_details && (
                <>
                  <p>
                    <span className="font-semibold">Nom :</span>{" "}
                    {`${intervention.technicien_details.first_name || ""} ${intervention.technicien_details.last_name || ""}`.trim() || "Non spécifié"}
                  </p>
                  <p>
                    <span className="font-semibold">Email :</span>{" "}
                    {intervention.technicien_details.email || "Non spécifié"}
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Installation */}
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Installation</h2>
            <div className="space-y-4 text-gray-700 text-left">
              {intervention.installation_details && (
                <>
                  <p><span className="font-semibold">Nom :</span> {intervention.installation_details.nom}</p>
                  <p><span className="font-semibold">Type :</span> {intervention.installation_details.type_installation}</p>
                  <p><span className="font-semibold">Statut :</span> {intervention.installation_details.statut}</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailleIntervention;
