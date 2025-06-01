import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ApiService from "../../Api/Api";
import dayjs from "dayjs";
import { Loader2 } from "lucide-react";

const DetailleEntretienClient = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [entretien, setEntretien] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEntretien = async () => {
      try {
        const res = await ApiService.getEntretienDetail(id); 
        setEntretien(res.data);
      } catch (error) {
        console.error("Erreur chargement détail entretien :", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEntretien();
  }, [id]);

  const formatDate = (d) => (d ? dayjs(d).format("DD/MM/YYYY HH:mm") : "Non spécifiée");

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen"><Loader2 className="animate-spin w-8 h-8 text-blue-600" /></div>;
  }

  if (!entretien) {
    return <div className="text-center text-red-500 pt-20">Entretien non trouvé.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto mt-24 p-6 bg-white rounded-lg shadow">
      <button onClick={() => navigate("/client/mes-entretien")} className="text-blue-600 hover:underline text-sm mb-4">
        ⬅ Retour à la liste
      </button>

      <h1 className="text-2xl font-bold text-gray-800 mb-4">Détails de l'entretien</h1>

      <div className="space-y-2 text-gray-700">
        <p><strong>Titre :</strong> {entretien.titre || "Sans titre"}</p>
        <p><strong>Type :</strong> {entretien.type_entretien}</p>
        <p><strong>Statut :</strong> {entretien.statut}</p>
        <p><strong>Début :</strong> {formatDate(entretien.date_debut)}</p>
        <p><strong>Fin :</strong> {formatDate(entretien.date_fin)}</p>
        <p><strong>Durée estimée :</strong> {entretien.duree_estimee} min</p>
        <p><strong>Installation :</strong> {entretien.installation_details?.nom || "Non spécifiée"}</p>
        <p><strong>Technicien :</strong> {entretien.technicien_details?.first_name} {entretien.technicien_details?.last_name}</p>
        <p><strong>Notes :</strong> {entretien.notes || "Aucune"}</p>
      </div>
    </div>
  );
};

export default DetailleEntretienClient;
