import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ApiService from "../../Api/Api";
import { FaArrowLeft } from "react-icons/fa";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const EntretienDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [entretien, setEntretien] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEntretien = async () => {
      try {
        const res = await ApiService.getEntretien(id);
        console.log("Détail reçu :", res.data);
        setEntretien(res.data);
        setLoading(false);
      } catch (err) {
        toast.error("Erreur lors du chargement de l'entretien ❌");
        console.error(err);
        setLoading(false);
      }
    };
    fetchEntretien();
  }, [id]);

  const formatDate = (date) =>
    date ? new Date(date).toLocaleString("fr-FR") : "—";

  const getStatusBadgeClass = (statut) => {
    const classes = {
      annulee: "bg-red-100 text-red-800",
      en_cours: "bg-blue-100 text-blue-800",
      en_attente: "bg-yellow-100 text-yellow-800",
      terminee: "bg-green-100 text-green-800",
      planifie: "bg-yellow-100 text-yellow-800",
    };
    return classes[statut?.toLowerCase()] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen pt-24">
        <Loader2 className="animate-spin w-8 h-8 text-blue-500" />
      </div>
    );
  }

  if (!entretien) {
    return (
      <div className="flex justify-center items-center min-h-screen pt-24">
        <div className="text-center text-red-500">Entretien non trouvé.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24">
      <div className="max-w-4xl mx-auto px-4 py-6">

        <button
          onClick={() => navigate("/liste-entretiens")}
          className="flex items-center text-sm text-gray-600 hover:text-gray-800 mb-4"
        >
          <FaArrowLeft className="mr-2" /> Retour à la liste
        </button>

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Détail de l'entretien
          </h1>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(entretien.statut)}`}
          >
            {entretien.statut_display || entretien.statut}
          </span>
        </div>

        <div className="grid gap-6">

          {/* Bloc Informations générales */}
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Informations générales
            </h2>
            <div className="space-y-3 text-gray-700 text-left">
              <p><span className="font-semibold">Type :</span> {entretien.type_entretien}</p>
              <p><span className="font-semibold">Date début :</span> {formatDate(entretien.date_debut)}</p>
              <p><span className="font-semibold">Date fin :</span> {formatDate(entretien.date_fin)}</p>
              <p><span className="font-semibold">Durée estimée :</span> {entretien.duree_estimee} min</p>
              <p><span className="font-semibold">Priorité :</span> {entretien.priorite}</p>
              <p><span className="font-semibold">Créé le :</span> {formatDate(entretien.cree_le)}</p>
              <p><span className="font-semibold">Modifié le :</span> {formatDate(entretien.modifie_le)}</p>
              <p><span className="font-semibold">Notes :</span> {entretien.notes || "Aucune"}</p>
              {entretien.rapport && (
                <p>
                  <span className="font-semibold">Rapport :</span>{" "}
                  <a href={entretien.rapport} className="text-blue-600 hover:underline" target="_blank" rel="noreferrer">
                    Télécharger
                  </a>
                </p>
              )}
            </div>
          </div>

          {/* Bloc Technicien */}
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Technicien assigné</h2>
            <div className="space-y-3 text-gray-700 text-left">
              {entretien.technicien_details ? (
                <>
                  <p><span className="font-semibold">Nom :</span> {`${entretien.technicien_details.first_name} ${entretien.technicien_details.last_name}`}</p>
                  <p><span className="font-semibold">Email :</span> {entretien.technicien_details.email}</p>
                </>
              ) : (
                <p className="italic text-gray-500">Aucun technicien assigné</p>
              )}
            </div>
          </div>

          {/* Bloc Installation */}
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Installation</h2>
            <div className="space-y-3 text-gray-700 text-left">
              <p><span className="font-semibold">Nom :</span> {entretien.installation_details?.nom || "—"}</p>
            </div>
          </div>

          {/* Prochain entretien */}
          {entretien.entretien_suivant && (
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                📆 Prochain entretien généré automatiquement
              </h2>
              <div className="space-y-3 text-gray-700 text-left">
                <p><span className="font-semibold">Type :</span> {entretien.entretien_suivant.type_entretien}</p>
                <p><span className="font-semibold">Date prévue :</span> {formatDate(entretien.entretien_suivant.date_debut)}</p>
                <p><span className="font-semibold">Technicien :</span> {entretien.entretien_suivant.technicien_details
                  ? `${entretien.entretien_suivant.technicien_details.first_name} ${entretien.entretien_suivant.technicien_details.last_name}`
                  : "—"}</p>
                <p><span className="font-semibold">Notes :</span> {entretien.entretien_suivant.notes || "—"}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EntretienDetailPage;
