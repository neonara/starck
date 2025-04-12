import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ApiService from "../../../Api/Api";
import toast from "react-hot-toast";

const AjouterCodeAlarmePage = ({ initialData = null, onSuccess, onClose }) => {
  const [form, setForm] = useState({
    marque: "",
    type_alarme: "",
    code_constructeur: "",
    gravite: "",
    description: "",
  });

  useEffect(() => {
    if (initialData) {
      setForm(initialData);
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (initialData?.id) {
        await ApiService.updateAlarmeCode(initialData.id, form);
        toast.success("✅ Code modifié");
      } else {
        await ApiService.addAlarmeCode(form);
        toast.success("✅ Code ajouté");
      }
      onSuccess?.();
      onClose?.();   
    } catch (err) {
      toast.error("❌ Erreur lors de l’enregistrement");
      console.error(err);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-6">
        {initialData ? "✏️ Modifier un Code" : "➕ Ajouter un Code"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <select name="marque" value={form.marque} onChange={handleChange} className="w-full border p-2 rounded" required>
          <option value="">-- Choisir une marque --</option>
          <option value="Huawei">Huawei</option>
          <option value="Kstar">Kstar</option>
          <option value="Solax">Solax</option>
        </select>

        <select name="type_alarme" value={form.type_alarme} onChange={handleChange} className="w-full border p-2 rounded" required>
          <option value="">-- Type d'alarme --</option>
          <option value="DC">Partie DC</option>
          <option value="AC">Partie AC</option>
          <option value="Terre">Partie Terre</option>
          <option value="Logiciel">Logiciel</option>
          <option value="autre">Autre</option>
        </select>

        <input
          type="text"
          name="code_constructeur"
          value={form.code_constructeur}
          onChange={handleChange}
          placeholder="Code constructeur"
          className="w-full border p-2 rounded"
          required
        />

        <select name="gravite" value={form.gravite} onChange={handleChange} className="w-full border p-2 rounded" required>
          <option value="">-- Gravité --</option>
          <option value="critique">Critique</option>
          <option value="majeure">Majeure</option>
          <option value="mineure">Mineure</option>
        </select>

        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Description"
          className="w-full border p-2 rounded"
          rows={3}
          required
        />

        <div className="flex justify-end gap-4">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400">
            Annuler
          </button>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            {initialData ? "Modifier" : "Ajouter"}
          </button>
        </div>
      </form>
    </div>
  );
};


export default AjouterCodeAlarmePage;
