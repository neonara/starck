import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaChevronUp, FaChevronDown, FaArrowLeft } from "react-icons/fa";

const AjouterInstallation = () => {
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
    date_installation: "",
  });

  const [sections, setSections] = useState({
    localisation: true,
    capacite: true,
    etat: true,
    propriete: true,
  });

  const handleToggle = (section) => {
    setSections({ ...sections, [section]: !sections[section] });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleMultiSelect = (e) => {
    const options = [...e.target.options];
    const selected = options.filter((o) => o.selected).map((o) => o.value);
    setForm({ ...form, installateurs: selected });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Formulaire soumis:", form);
  };

  return (
<div className="p-6 pt-24 w-full bg-white rounded-xl shadow mx-auto max-w-7xl">
<div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Ajouter une Installation</h2>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-600 hover:underline"
        >
          <FaArrowLeft className="mr-1" /> Retour
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <div
            className="flex justify-between items-center cursor-pointer"
            onClick={() => handleToggle("localisation")}
          >
            <h3 className="text-lg font-medium">Localisation</h3>
            {sections.localisation ? <FaChevronUp /> : <FaChevronDown />}
          </div>
          {sections.localisation && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <input name="nom" value={form.nom} onChange={handleChange} className="input" placeholder="Nom" required />
              <input name="adresse" value={form.adresse} onChange={handleChange} className="input" placeholder="Adresse" />
              <input name="latitude" value={form.latitude} onChange={handleChange} className="input" placeholder="Latitude" />
              <input name="longitude" value={form.longitude} onChange={handleChange} className="input" placeholder="Longitude" />
            </div>
          )}
        </div>

        <div>
          <div
            className="flex justify-between items-center cursor-pointer"
            onClick={() => handleToggle("capacite")}
          >
            <h3 className="text-lg font-medium">Capacité et Production</h3>
            {sections.capacite ? <FaChevronUp /> : <FaChevronDown />}
          </div>
          {sections.capacite && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <input name="capacite_kw" value={form.capacite_kw} onChange={handleChange} className="input" placeholder="Capacité (kW)" />
              <input name="production_actuelle_kw" value={form.production_actuelle_kw} onChange={handleChange} className="input" placeholder="Production actuelle (kW)" />
              <input name="consommation_kw" value={form.consommation_kw} onChange={handleChange} className="input" placeholder="Consommation (kW)" />
            </div>
          )}
        </div>

        <div>
          <div
            className="flex justify-between items-center cursor-pointer"
            onClick={() => handleToggle("etat")}
          >
            <h3 className="text-lg font-medium">État et Connexion</h3>
            {sections.etat ? <FaChevronUp /> : <FaChevronDown />}
          </div>
          {sections.etat && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <select name="etat" value={form.etat} onChange={handleChange} className="input">
                <option value="Actif">Actif</option>
                <option value="Inactif">Inactif</option>
                <option value="En maintenance">En maintenance</option>
              </select>
              <label className="flex gap-2 items-center">
                <input type="checkbox" name="connecte_reseau" checked={form.connecte_reseau} onChange={handleChange} />
                Connecté au réseau
              </label>
              <label className="flex gap-2 items-center">
                <input type="checkbox" name="alarme_active" checked={form.alarme_active} onChange={handleChange} />
                Alarme active
              </label>
              <input name="dernier_controle" type="datetime-local" value={form.dernier_controle} onChange={handleChange} className="input" />
            </div>
          )}
        </div>

        <div>
          <div
            className="flex justify-between items-center cursor-pointer"
            onClick={() => handleToggle("propriete")}
          >
            <h3 className="text-lg font-medium">Informations Propriétaire</h3>
            {sections.propriete ? <FaChevronUp /> : <FaChevronDown />}
          </div>
          {sections.propriete && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <input name="client" value={form.client} onChange={handleChange} className="input" placeholder="Nom du client" />
              <select
                name="installateurs"
                multiple
                value={form.installateurs}
                onChange={handleMultiSelect}
                className="input h-32"
              >
                <option value="tech1">tech1</option>
                <option value="tech2">tech2</option>
                <option value="tech3">tech3</option>
              </select>
              <input name="date_installation" type="date" value={form.date_installation} onChange={handleChange} className="input" />
            </div>
          )}
        </div>

        <button
          type="submit"
          className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Enregistrer
        </button>
      </form>
    </div>
  );
};

export default AjouterInstallation;
