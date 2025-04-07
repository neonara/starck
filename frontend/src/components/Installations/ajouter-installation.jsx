import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import ApiService from "../../Api/Api"; 
import { toast } from "react-hot-toast";

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
    statut: "active", 
    connecte_reseau: false,
    dernier_controle: "",
    alarme_active: false,
    client_email: "",  
    installateurs_email: [],  
    type_installation: "",  
    date_installation: "",  
    ville: "",
    code_postal: "",
    pays: "",
    documentation_technique: "", 
    expiration_garantie: "",
    reference_contrat: "",
  });

  const [clients, setClients] = useState([]);
  const [installateurs, setInstallateurs] = useState([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [loadingInstallateurs, setLoadingInstallateurs] = useState(true);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await ApiService.getClients(); 
        setClients(res.data.results);
      } catch (err) {
        console.error("Erreur lors du chargement des clients :", err);
      } finally {
        setLoadingClients(false);
      }
    };

    const fetchInstallateurs = async () => {
      try {
        const res = await ApiService.getInstallateurs(); 
        setInstallateurs(res.data.results);
      } catch (err) {
        console.error("Erreur lors du chargement des installateurs :", err);
      } finally {
        setLoadingInstallateurs(false);
      }
    };

    fetchClients();
    fetchInstallateurs();
  }, []);
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Vérification des champs requis
    if (!form.nom || !form.adresse || !form.client_email) {
      toast.error("Tous les champs requis doivent être remplis !");
      return;
    }
  
    if (!form.capacite_kw || isNaN(form.capacite_kw) || parseFloat(form.capacite_kw) <= 0) {
      toast.error("La capacité en kW doit être une valeur numérique valide et supérieure à 0 !");
      return;
    }
  
    if (isNaN(form.latitude) || isNaN(form.longitude)) {
      toast.error("Latitude et Longitude doivent être des valeurs numériques valides !");
      return;
    }
  
    const capaciteKw = parseFloat(form.capacite_kw);
    const latitude = parseFloat(form.latitude);
    const longitude = parseFloat(form.longitude);
  
    const installationData = {
      nom: form.nom,
      adresse: form.adresse,
      latitude: latitude,
      longitude: longitude,
      capacite_kw: capaciteKw,  
      production_actuelle_kw: parseFloat(form.production_actuelle_kw),
      consommation_kw: parseFloat(form.consommation_kw),
      statut: form.statut,
      connecte_reseau: form.connecte_reseau,
      dernier_controle: form.dernier_controle,
      alarme_active: form.alarme_active,
      client_email: form.client_email,
      installateurs_email: form.installateurs_email,
      type_installation: form.type_installation,
      date_installation: form.date_installation,
      ville: form.ville,
      code_postal: form.code_postal,
      pays: form.pays,
      documentation_technique: form.documentation_technique,
      expiration_garantie: form.expiration_garantie,
      reference_contrat: form.reference_contrat,
    };
  
    try {
      await ApiService.ajouterInstallation(installationData);
      toast.success("Installation ajoutée avec succès ✅");
      navigate("/liste-installations");  
    } catch (err) {
      console.error("Erreur lors de l'ajout :", err);
      toast.error("Erreur lors de l'ajout de l'installation ❌");
    }
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
        {/* Localisation */}
        <div>
          <h3 className="text-lg font-medium">Localisation</h3>
          <input
            name="nom"
            value={form.nom}
            onChange={(e) => setForm({ ...form, nom: e.target.value })}
            className="input"
            placeholder="Nom"
            required
          />
          <input
            name="adresse"
            value={form.adresse}
            onChange={(e) => setForm({ ...form, adresse: e.target.value })}
            className="input"
            placeholder="Adresse"
          />
          <input
            name="latitude"
            value={form.latitude}
            onChange={(e) => setForm({ ...form, latitude: e.target.value })}
            className="input"
            placeholder="Latitude"
          />
          <input
            name="longitude"
            value={form.longitude}
            onChange={(e) => setForm({ ...form, longitude: e.target.value })}
            className="input"
            placeholder="Longitude"
          />
        </div>
        <div>
  <h3 className="text-lg font-medium">Capacité en kW</h3>
  <input
    name="capacite_kw"
    type="number"
    step="0.01"
    value={form.capacite_kw}
    onChange={(e) => setForm({ ...form, capacite_kw: e.target.value })}
    className="input"
    placeholder="Capacité en kW"
    required
  />
</div>

        {/* Sélectionner un client */}
        <div>
          <h3 className="text-lg font-medium">Sélectionner un Client</h3>
          {loadingClients ? (
            <p>Chargement des clients...</p>
          ) : (
            <select
              name="client_email"
              value={form.client_email}
              onChange={(e) => setForm({ ...form, client_email: e.target.value })}
              className="input"
              required
            >
              <option value="">Sélectionner un client</option>
              {clients.map((client) => (
                <option key={client.id} value={client.email}>
                  {client.first_name} {client.last_name} - {client.email}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Sélectionner des installateurs */}
        <div>
          <h3 className="text-lg font-medium">Sélectionner des Installateurs</h3>
          {loadingInstallateurs ? (
            <p>Chargement des installateurs...</p>
          ) : (
            <select
              name="installateurs_email"
              multiple
              value={form.installateurs_email}
              onChange={(e) => setForm({ ...form, installateurs_email: [...e.target.selectedOptions].map(o => o.value) })}
              className="input"
            >
              {installateurs.map((installateur) => (
                <option key={installateur.id} value={installateur.email}>
                  {installateur.first_name} {installateur.last_name} - {installateur.email}
                </option>
              ))}
            </select>
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
