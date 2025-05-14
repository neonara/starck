import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import ApiService from "../../Api/Api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
 
const FormulaireEntretien = ({ onSuccess }) => {
  const { register, handleSubmit, reset } = useForm();
  const [installations, setInstallations] = useState([]);
  const [techniciens, setTechniciens] = useState([]);
  const navigate = useNavigate([]);
 
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [instRes, techRes] = await Promise.all([
          ApiService.getInstallations(),
          ApiService.getTechnicien()
        ]);
        setInstallations(Array.isArray(instRes.data) ? instRes.data : instRes.data.results || []);
        setTechniciens(Array.isArray(techRes.data) ? techRes.data : techRes.data.results || []);
      } catch (err) {
        toast.error("Erreur chargement des données ❌");
        console.error(err);
      }
    };
    fetchData();
  }, []);
 
  const onSubmit = async (data) => {
    try {
      await ApiService.createEntretien(data);
      toast.success("Entretien planifié ✅");
      reset();
      onSuccess?.();
      navigate("/liste-entretiens");
    } catch (err) {
      toast.error("Erreur lors de la planification ❌");
      console.error(err);
    }
  };
 
  return (
<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
<div>
<label className="block text-sm font-semibold text-gray-700 mb-1">Installation</label>
<select {...register("installation", { required: true })} className="w-full border border-gray-300 text-gray-700  rounded px-3 py-2 text-sm">
<option value="">Sélectionner...</option>
          {installations.map((inst) => (
<option key={inst.id} value={inst.id}>{inst.nom}</option>
          ))}
</select>
</div>
<div>
  <label className="block text-sm font-semibold text-gray-700 mb-1">
    Répéter tous les :
  </label>
  <select
    {...register("periode_recurrence")}
    className="w-full border border-gray-300 text-gray-700 rounded px-3 py-2 text-sm"
  >
    <option value="">Aucune</option>
    <option value="1">1 mois</option>
    <option value="3">3 mois</option>
    <option value="6">6 mois</option>
    <option value="12">12 mois</option>
  </select>
</div>

 
      <div>
<label className="block text-sm font-semibold text-gray-700 mb-1">Type d'entretien</label>
<select {...register("type_entretien", { required: true })} className="w-full border border-gray-300 text-gray-700 rounded px-3 py-2 text-sm">
<option value="preventif">Préventif</option>
<option value="correctif">Correctif</option>
<option value="annuel">Contrôle annuel</option>
<option value="trimestriel">Contrôle trimestriel</option>
</select>
</div>
 
      <div className="grid grid-cols-2 gap-4">
<div>
<label className="block text-sm font-semibold text-gray-700 mb-1">Date début</label>
<input type="datetime-local" {...register("date_debut", { required: true })} className="w-full border border-gray-300 text-gray-700 rounded px-3 py-2 text-sm" />
</div>
<div>
<label className="block text-sm font-semibold text-gray-700 mb-1">Durée estimée (min)</label>
<input type="number" {...register("duree_estimee", { required: true })} defaultValue={60} className="w-full border border-gray-300 text-gray-700 rounded px-3 py-2 text-sm" />
</div>
</div>
 
      <div>
<label className="block text-sm font-semibold text-gray-700 mb-1">Statut</label>
<select {...register("statut", { required: true })} className="w-full border border-gray-300 text-gray-700 rounded px-3 py-2 text-sm">
<option value="planifie">Planifié</option>
<option value="en_cours">En cours</option>
<option value="termine">Terminé</option>
<option value="annule">Annulé</option>
</select>
</div>
 
      <div>
<label className="block text-sm font-semibold text-gray-700 mb-1">Priorité</label>
<select {...register("priorite", { required: true })} className="w-full border border-gray-300 text-gray-700 rounded px-3 py-2 text-sm">
<option value="basse">Basse</option>
<option value="normale">Normale</option>
<option value="elevee">Élevée</option>
<option value="urgent">Urgent</option>
</select>
</div>
 
      <div>
<label className="block text-sm font-semibold text-gray-700 mb-1">Technicien</label>
<select {...register("technicien")} className="w-full border border-gray-300 text-gray-700 rounded px-3 py-2 text-sm">
<option value="">Aucun</option>
          {techniciens.map((tech) => (
<option key={tech.id} value={tech.id}>{tech.first_name} {tech.last_name}</option>
          ))}
</select>
</div>
 
      <div>
<label className="block text-sm font-semibold text-gray-700 mb-1">Notes</label>
<textarea {...register("notes")} rows={3} className="w-full border text-gray-700 border-gray-300 rounded px-3 py-2 text-sm"></textarea>
</div>
 
      <div className="text-right">
<button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm">
          Enregistrer
</button>
</div>
</form>
  );
};
 
export default FormulaireEntretien;