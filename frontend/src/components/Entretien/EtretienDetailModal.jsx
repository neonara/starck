import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ApiService from "../../Api/Api";
import { FaArrowLeft } from "react-icons/fa";
import toast from "react-hot-toast";
 
const EntretienDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [entretien, setEntretien] = useState(null);
 
 useEffect(() => {
  const fetchEntretien = async () => {
    try {
      const res = await ApiService.getEntretien(id);
      console.log("Détail reçu :", res.data); // 👈 debug
      setEntretien(res.data);
    } catch (err) {
      toast.error("Erreur lors du chargement de l'entretien ❌");
      console.error(err);
    }
  };
 
  fetchEntretien();
}, [id]);
 
  if (!entretien) return <div className="p-6">Chargement...</div>;
 
  return (
<div className="p-6 max-w-3xl mx-auto bg-white rounded-xl shadow space-y-4">
<button
    onClick={() => navigate("/liste-entretiens")}
    className="flex items-center text-sm text-gray-600 hover:text-gray-800 mb-4"
>
<FaArrowLeft className="mr-2" /> Retour à la liste
</button>
 
  <h2 className="text-2xl font-bold text-gray-800 mb-4">
    Détails de l'entretien #{entretien.id}
</h2>
 
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
<p><strong>Installation :</strong> {entretien.installation_details?.nom}</p>
<p><strong>Type :</strong> {entretien.type_entretien}</p>
<p><strong>Début :</strong> {new Date(entretien.date_debut).toLocaleString()}</p>
<p><strong>Fin :</strong> {new Date(entretien.date_fin).toLocaleString()}</p>
<p><strong>Durée :</strong> {entretien.duree_estimee} min</p>
<p><strong>Statut :</strong> {entretien.statut}</p>
<p><strong>Priorité :</strong> {entretien.priorite}</p>
<p><strong>Technicien :</strong> {entretien.technicien_details ? `${entretien.technicien_details.first_name} ${entretien.technicien_details.last_name}` : "—"}</p>
<p><strong>Créé par :</strong> {entretien.createur_details ? `${entretien.createur_details.first_name} ${entretien.createur_details.last_name}` : "—"}</p>
<p className="col-span-2"><strong>Notes :</strong> {entretien.notes || "Aucune"}</p>
    {entretien.rapport && (
<p className="col-span-2">
<strong>Rapport :</strong>{" "}
<a href={entretien.rapport} className="text-blue-600 hover:underline" target="_blank" rel="noreferrer">
          Télécharger
</a>
</p>
    )}
<p><strong>Créé le :</strong> {new Date(entretien.cree_le).toLocaleString()}</p>
<p><strong>Modifié le :</strong> {new Date(entretien.modifie_le).toLocaleString()}</p>
</div>
</div>
  );
};
 
export default EntretienDetailPage;