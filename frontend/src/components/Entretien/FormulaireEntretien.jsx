import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import ApiService from "../../Api/Api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { CalendarCheck, Wrench } from "lucide-react";

const FormulaireEntretien = ({ onSuccess }) => {
  const { register, handleSubmit, reset } = useForm();
  const [installations, setInstallations] = useState([]);
  const [techniciens, setTechniciens] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [instRes, techRes] = await Promise.all([
          ApiService.getInstallations(),
          ApiService.getTechnicien(),
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
    <div className="pt-24 px-4 md:px-10">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8 border">
        <h1 className="text-3xl font-bold text-blue-600 mb-8 flex items-center gap-2">
          <Wrench className="w-7 h-7" /> Planifier un entretien
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          {/* Liste des champs */}
          {[
            {
              label: "Installation",
              name: "installation",
              type: "select",
              options: installations.map(inst => ({ value: inst.id, label: inst.nom })),
              required: true,
            },
            {
              label: "Type d'entretien",
              name: "type_entretien",
              type: "select",
              options: [
                { value: "preventif", label: "Préventif" },
                { value: "correctif", label: "Correctif" },
                { value: "annuel", label: "Contrôle annuel" },
                { value: "trimestriel", label: "Contrôle trimestriel" },
              ],
              required: true,
            },
            {
              label: "Date début",
              name: "date_debut",
              type: "datetime-local",
              required: true,
            },
            {
              label: "Durée estimée (min)",
              name: "duree_estimee",
              type: "number",
              defaultValue: 60,
              required: true,
            },
            {
              label: "Statut",
              name: "statut",
              type: "select",
              options: [
                { value: "planifie", label: "Planifié" },
                { value: "en_cours", label: "En cours" },
                { value: "termine", label: "Terminé" },
                { value: "annule", label: "Annulé" },
              ],
              required: true,
            },
            {
              label: "Priorité",
              name: "priorite",
              type: "select",
              options: [
                { value: "basse", label: "Basse" },
                { value: "normale", label: "Normale" },
                { value: "elevee", label: "Élevée" },
                { value: "urgent", label: "Urgent" },
              ],
              required: true,
            },
            {
              label: "Technicien",
              name: "technicien",
              type: "select",
              options: [{ value: "", label: "Aucun" }].concat(
                techniciens.map(t => ({
                  value: t.id,
                  label: `${t.first_name} ${t.last_name}`.trim() || t.email,
                }))
              ),
            },
            {
              label: "Répéter tous les",
              name: "periode_recurrence",
              type: "select",
              options: [
                { value: "", label: "Aucune" },
                { value: "1", label: "1 mois" },
                { value: "3", label: "3 mois" },
                { value: "6", label: "6 mois" },
                { value: "12", label: "12 mois" },
              ],
            },
            {
              label: "Notes",
              name: "notes",
              type: "textarea",
            },
          ].map((field, index) => (
            <div key={index} className="grid grid-cols-3 items-center gap-4">
              <label className="text-sm font-medium text-gray-700">
                {field.label}
              </label>
              {field.type === "select" ? (
                <select
                  {...register(field.name, field.required && { required: true })}
                  defaultValue={field.defaultValue || ""}
                  className="col-span-2 w-full rounded-md border border-gray-300 p-2 text-sm text-gray-700"
                >
                  {field.options.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : field.type === "textarea" ? (
                <textarea
                  {...register(field.name)}
                  rows="3"
                  placeholder={`Entrer ${field.label.toLowerCase()}`}
                  className="col-span-2 w-full rounded-md border border-gray-300 p-2 text-sm text-gray-700"
                />
              ) : (
                <input
                  type={field.type}
                  {...register(field.name, field.required && { required: true })}
                  defaultValue={field.defaultValue}
                  className="col-span-2 w-full rounded-md border border-gray-300 p-2 text-sm text-gray-700"
                />
              )}
            </div>
          ))}

          {/* Boutons */}
          <div className="flex justify-end gap-4 pt-6">
            <button
              type="button"
              onClick={() => navigate("/liste-entretiens")}
              className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-300 transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
            >
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormulaireEntretien;
