import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapPin, Cpu, User, ChevronsUpDown, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

const EditInstallation = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nom: "",
    adresse: "",
    latitude: "",
    longitude: "",
    capacite_kw: "",
    production_actuelle_kw: "",
    consommation_kw: "",
    etat: "Actif",
    connecte_reseau: false,
    dernier_controle: "",
    alarme_active: false,
    client: "",
    installateurs: [],
    date_installation: ""
  });

  const [sections, setSections] = useState({
    base: true,
    systeme: true,
    proprietaire: true,
  });

  useEffect(() => {
    setForm({
      nom: "Installation A",
      adresse: "Tunis",
      latitude: 36.8065,
      longitude: 10.1815,
      capacite_kw: 10.5,
      production_actuelle_kw: 6.3,
      consommation_kw: 4.2,
      etat: "Actif",
      connecte_reseau: true,
      dernier_controle: "2025-03-01T10:00:00Z",
      alarme_active: false,
      client: "client1",
      installateurs: ["tech1", "tech2"],
      date_installation: "2024-12-01"
    });
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleMultiSelect = (e) => {
    const selected = [...e.target.options]
      .filter((opt) => opt.selected)
      .map((opt) => opt.value);
    setForm({ ...form, installateurs: selected });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Updated installation:", form);
    navigate("/liste-installations");
  };

  const toggleSection = (section) => {
    setSections({ ...sections, [section]: !sections[section] });
  };

  return (
    <div className="min-h-screen bg-blue-50 p-8">
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-xl p-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-3xl font-bold text-gray-800">Modifier l'installation</h2>
          <button
            onClick={() => navigate(`/liste-installations/`)}
            className="text-sm text-blue-600 hover:underline flex items-center gap-1"
          >
            <ArrowUpRight size={16} /> Retour 
          </button>
        </div>
        <p className="text-gray-500 text-sm mb-6">Mettez à jour les informations de votre installation.</p>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Infos de base */}
          <motion.div animate={{ opacity: 1 }} initial={{ opacity: 0 }} transition={{ duration: 0.4 }} className="bg-gray-50 p-6 rounded-xl shadow">
            <div onClick={() => toggleSection("base")} className="flex items-center justify-between cursor-pointer">
              <div className="flex gap-2 items-center text-lg font-semibold"><MapPin size={20} /> Infos de base</div>
              <ChevronsUpDown className="text-gray-500" />
            </div>
            {sections.base && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="flex flex-col">
                  <label htmlFor="nom" className="text-sm font-medium text-gray-700">Nom</label>
                  <input id="nom" name="nom" value={form.nom} onChange={handleChange} className="input" placeholder="Nom" />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="adresse" className="text-sm font-medium text-gray-700">Adresse</label>
                  <input id="adresse" name="adresse" value={form.adresse} onChange={handleChange} className="input" placeholder="Adresse" />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="latitude" className="text-sm font-medium text-gray-700">Latitude</label>
                  <input id="latitude" name="latitude" value={form.latitude} onChange={handleChange} className="input" placeholder="Latitude" />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="longitude" className="text-sm font-medium text-gray-700">Longitude</label>
                  <input id="longitude" name="longitude" value={form.longitude} onChange={handleChange} className="input" placeholder="Longitude" />
                </div>
              </div>
            )}
          </motion.div>

          {/* Infos système */}
          <motion.div animate={{ opacity: 1 }} initial={{ opacity: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="bg-gray-50 p-6 rounded-xl shadow">
            <div onClick={() => toggleSection("systeme")} className="flex items-center justify-between cursor-pointer">
              <div className="flex gap-2 items-center text-lg font-semibold"><Cpu size={20} /> Infos sur le système</div>
              <ChevronsUpDown className="text-gray-500" />
            </div>
            {sections.systeme && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="flex flex-col">
                  <label htmlFor="capacite_kw" className="text-sm font-medium text-gray-700">Capacité (kW)</label>
                  <input id="capacite_kw" name="capacite_kw" value={form.capacite_kw} onChange={handleChange} className="input" />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="production_actuelle_kw" className="text-sm font-medium text-gray-700">Production actuelle (kW)</label>
                  <input id="production_actuelle_kw" name="production_actuelle_kw" value={form.production_actuelle_kw} onChange={handleChange} className="input" />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="consommation_kw" className="text-sm font-medium text-gray-700">Consommation (kW)</label>
                  <input id="consommation_kw" name="consommation_kw" value={form.consommation_kw} onChange={handleChange} className="input" />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="etat" className="text-sm font-medium text-gray-700">État</label>
                  <select id="etat" name="etat" value={form.etat} onChange={handleChange} className="input">
                    <option value="Actif">Actif</option>
                    <option value="Inactif">Inactif</option>
                    <option value="En maintenance">En maintenance</option>
                  </select>
                </div>
                <label className="flex gap-2 items-center">
                  <input type="checkbox" name="connecte_reseau" checked={form.connecte_reseau} onChange={handleChange} />
                  Connecté au réseau
                </label>
                <label className="flex gap-2 items-center">
                  <input type="checkbox" name="alarme_active" checked={form.alarme_active} onChange={handleChange} />
                  Alarme active
                </label>
                <div className="flex flex-col col-span-2">
                  <label htmlFor="dernier_controle" className="text-sm font-medium text-gray-700">Dernier contrôle</label>
                  <input id="dernier_controle" name="dernier_controle" type="datetime-local" value={form.dernier_controle} onChange={handleChange} className="input" />
                </div>
              </div>
            )}
          </motion.div>

          {/* Infos propriétaire */}
          <motion.div animate={{ opacity: 1 }} initial={{ opacity: 0 }} transition={{ duration: 0.4, delay: 0.2 }} className="bg-gray-50 p-6 rounded-xl shadow col-span-1 lg:col-span-2">
            <div onClick={() => toggleSection("proprietaire")} className="flex items-center justify-between cursor-pointer">
              <div className="flex gap-2 items-center text-lg font-semibold"><User size={20} /> Infos propriétaire & installateurs</div>
              <ChevronsUpDown className="text-gray-500" />
            </div>
            {sections.proprietaire && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="flex flex-col">
                  <label htmlFor="client" className="text-sm font-medium text-gray-700">Nom du client</label>
                  <input id="client" name="client" value={form.client} onChange={handleChange} className="input" />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="installateurs" className="text-sm font-medium text-gray-700">Installateurs</label>
                  <select multiple name="installateurs" value={form.installateurs} onChange={handleMultiSelect} className="input h-32">
                    <option value="tech1">tech1</option>
                    <option value="tech2">tech2</option>
                    <option value="tech3">tech3</option>
                  </select>
                </div>
                <div className="flex flex-col col-span-2">
                  <label htmlFor="date_installation" className="text-sm font-medium text-gray-700">Date d'installation</label>
                  <input id="date_installation" type="date" name="date_installation" value={form.date_installation} onChange={handleChange} className="input" />
                </div>
              </div>
            )}
          </motion.div>

          <div className="col-span-1 lg:col-span-2 flex justify-end gap-4 mt-6">
            <button type="button" onClick={() => navigate(-1)} className="px-4 py-2 border rounded text-gray-700">
              Fermer
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

export default EditInstallation;
