import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../Api/Api";
import { Loader2 } from "lucide-react";

const DetailleIntervention = () => {
  const { id } = useParams();
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
    return new Date(dateString).toLocaleString('fr-FR');
  };

  const getStatusBadgeClass = (statut) => {
    const classes = {
      'annulee': 'bg-red-100 text-red-800',
      'en_cours': 'bg-blue-100 text-blue-800',
      'en_attente': 'bg-yellow-100 text-yellow-800',
      'terminee': 'bg-green-100 text-green-800'
    };
    return classes[statut] || 'bg-gray-100 text-gray-800';
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
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold text-gray-800">
        Détail de l'intervention {intervention.id}
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
                <span className="font-semibold">Nom :</span> {' '}
                {`${intervention.technicien_details.first_name || ''} ${intervention.technicien_details.last_name || ''}`.trim() || 'Non spécifié'}
              </p>
              <p>
                <span className="font-semibold">Email :</span> {' '}
                {intervention.technicien_details.email || 'Non spécifié'}
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

      {/* Statistiques */}
      <div className="bg-white rounded-lg p-6 shadow-lg">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Statistiques</h2>
        <div className="grid grid-cols-3 gap-6 text-gray-700 text-left">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-600">Interventions précédentes</p>
            <p className="text-xl font-bold text-blue-800">
              {intervention.statistiques?.nombre_interventions_precedentes || 0}
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-600">Temps depuis dernière</p>
            <p className="text-xl font-bold text-green-800">
              {intervention.statistiques?.temps_depuis_derniere ?? 'N/A'}
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-purple-600">Temps moyen entre</p>
            <p className="text-xl font-bold text-purple-800">
              {intervention.statistiques?.temps_moyen_entre ?? 'N/A'}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

  );
};

export default DetailleIntervention;
