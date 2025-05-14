import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ApiService from "../../Api/Api";
import toast from "react-hot-toast";
import { ArrowUpRight } from "lucide-react";
 
const inputStyle = "input border border-gray-300 px-3 py-2 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500";
 
const ModifierEntretienPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    installation: "",
    type_entretien: "",
    date_debut: "",
    duree_estimee: 60,
    statut: "planifie",
    priorite: "normale",
    technicien: "",
    notes: ""
  });
  const [installations, setInstallations] = useState([]);
  const [techniciens, setTechniciens] = useState([]);
 
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [entretienRes, instRes, techRes] = await Promise.all([
          ApiService.getEntretien(id),
          ApiService.getInstallations(),
          ApiService.getTechnicien()
        ]);
 
        const data = entretienRes.data;
 
        setForm({
          installation: data.installation || "",
          type_entretien: data.type_entretien || "",
          date_debut: data.date_debut?.slice(0, 16) || "",
          duree_estimee: data.duree_estimee || 60,
          statut: data.statut || "planifie",
          priorite: data.priorite || "normale",
          technicien: data.technicien || "",
          notes: data.notes || ""
        });
 
        setInstallations(instRes.data.results || instRes.data);
        setTechniciens(techRes.data.results || techRes.data);
      } catch (err) {
        console.error("Erreur chargement entretien :", err);
        toast.error("❌ Erreur chargement des données");
      }
    };
    fetchData();
  }, [id]);
 
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    const dateDebut = new Date(form.date_debut);
    const duree = parseInt(form.duree_estimee);
    const dateFin = new Date(dateDebut.getTime() + duree * 60000); 
    const cleaned = {
      installation: parseInt(form.installation),
      type_entretien: form.type_entretien,
      date_debut: form.date_debut,
      date_fin: dateFin.toISOString(), 
      duree_estimee: duree,
      statut: form.statut,
      priorite: form.priorite,
      technicien: form.technicien ? parseInt(form.technicien) : null,
      notes: form.notes,
    };


    console.log("🧾 Payload envoyé :", cleaned);

    try {
      await ApiService.updateEntretien(id, cleaned);
      toast.success("✅ Entretien mis à jour");
      navigate("/liste-entretiens");
    } catch (err) {
      if (err.response) {
        console.error("🛑 Erreur backend :", err.response.data);
        toast.error("❌ Erreur : " + JSON.stringify(err.response.data));
      } else {
        console.error("❌ Erreur inconnue :", err);
        toast.error("❌ Erreur inconnue");
      }
    }

  };
 
  if (!installations.length || !techniciens.length) return <p className="p-6">Chargement...</p>;
 
  return (
<div className="min-h-screen bg-blue-50 p-8">
<div className="max-w-4xl mx-auto bg-white rounded-xl shadow-xl p-8">
<div className="flex justify-between items-center mb-4">
<h2 className="text-3xl font-bold text-gray-800">Modifier l'entretien</h2>
<button
            onClick={() => navigate(`/liste-entretiens/`)}
            className="text-sm text-blue-600 hover:underline flex items-center gap-1"
>
<ArrowUpRight size={16} /> Retour
</button>
</div>
 
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6">
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
<select name="installation" value={form.installation} onChange={handleChange} className={inputStyle} required>
<option value="">Sélectionner une installation</option>
              {installations.map((inst) => (
<option key={inst.id} value={inst.id}>{inst.nom}</option>
              ))}
</select>
 
            <select name="type_entretien" value={form.type_entretien} onChange={handleChange} className={inputStyle} required>
<option value="preventif">Préventif</option>
<option value="correctif">Correctif</option>
<option value="annuel">Contrôle annuel</option>
<option value="trimestriel">Contrôle trimestriel</option>
</select>
 
            <input type="datetime-local" name="date_debut" value={form.date_debut} onChange={handleChange} className={inputStyle} required />
<input type="number" name="duree_estimee" value={form.duree_estimee} onChange={handleChange} placeholder="Durée (min)" className={inputStyle} />
 
            <select name="statut" value={form.statut} onChange={handleChange} className={inputStyle} required>
<option value="planifie">Planifié</option>
<option value="en_cours">En cours</option>
<option value="termine">Terminé</option>
<option value="annule">Annulé</option>
</select>
 
            <select name="priorite" value={form.priorite} onChange={handleChange} className={inputStyle} required>
<option value="basse">Basse</option>
<option value="normale">Normale</option>
<option value="elevee">Élevée</option>
<option value="urgent">Urgent</option>
</select>
 
            <select name="technicien" value={form.technicien || ""} onChange={handleChange} className={inputStyle}>
<option value="">Aucun technicien</option>
              {techniciens.map((tech) => (
<option key={tech.id} value={tech.id}>{tech.first_name} {tech.last_name}</option>
              ))}
</select>
</div>
 
          <textarea name="notes" value={form.notes} onChange={handleChange} placeholder="Notes" className={inputStyle} rows={3} />
 
          <div className="flex justify-end gap-4 mt-6">
<button type="button" onClick={() => navigate(-1)} className="px-4 py-2 border rounded text-gray-700">
              Annuler
</button>
<button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Enregistrer les modifications
</button>
</div>
</form>
</div>
</div>
  );
};
 
export default ModifierEntretienPage;