import React, { useEffect, useState } from "react";

import { useParams, useNavigate } from "react-router-dom";

import ApiService from "../../Api/Api";

import { toast, Toaster } from "react-hot-toast";
 
const ModifierReclamationPage = () => {

  const { id } = useParams();

  const navigate = useNavigate();
 
  const [reclamation, setReclamation] = useState(null);

  const [statut, setStatut] = useState("");

  const [loading, setLoading] = useState(true);
 
  useEffect(() => {

    const fetchReclamation = async () => {
        try {
          const res = await ApiService.getReclamations();
          const list = Array.isArray(res.data) ? res.data : res.data.results || [];
          const found = list.find((item) => item.id === parseInt(id));
       
          if (found) {
            setReclamation(found);
            setStatut(found.statut);
          } else {
            toast.error("Réclamation introuvable");
            navigate("/list_reclamations");
          }
        } catch (err) {
          console.error(err);
          toast.error("Erreur lors du chargement");
        } finally {
          setLoading(false);
        }
      };

    fetchReclamation();

  }, [id, navigate]);
 
  const handleUpdate = async () => {

    try {

      await ApiService.updateReclamation(id, { ...reclamation, statut });

      toast.success("Statut mis à jour ✅");

      navigate("/list_reclamations");

    } catch (err) {

      console.error(err);

      toast.error("Erreur lors de la mise à jour ❌");

    }

  };
 
  if (loading || !reclamation) return <div className="p-6">Chargement...</div>;
 
  return (
<div className="p-6 max-w-xl mx-auto mt-24 bg-white shadow rounded">
<Toaster />
<h2 className="text-xl font-semibold mb-4">Modifier la réclamation</h2>
 
      <div className="mb-4">
<label className="block text-sm font-medium text-gray-700">Sujet</label>
<input

          type="text"

          value={reclamation.sujet}

          disabled

          className="mt-1 block w-full rounded border-gray-300 shadow-sm text-sm bg-gray-100"

        />
</div>
 
      <div className="mb-4">
<label className="block text-sm font-medium text-gray-700">Message</label>
<textarea

          value={reclamation.message}

          disabled

          className="mt-1 block w-full rounded border-gray-300 shadow-sm text-sm bg-gray-100"
></textarea>
</div>
 
      <div className="mb-4">
<label className="block text-sm font-medium text-gray-700">Statut</label>
<select

          value={statut}

          onChange={(e) => setStatut(e.target.value)}

          className="mt-1 block w-full rounded border-gray-300 shadow-sm text-sm"
>
<option value="en_attente">En attente</option>
<option value="en_cours">En cours</option>
<option value="resolu">Résolu</option>
</select>
</div>
 
      <div className="flex justify-end">
<button

          onClick={handleUpdate}

          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
>

          Enregistrer
</button>
</div>
</div>

  );

};
 
export default ModifierReclamationPage;

 