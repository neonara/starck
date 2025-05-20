import React, { useEffect, useState } from "react";
import ApiService from "../../Api/Api";
import { toast } from "react-toastify";
import { useNavigate } from 'react-router-dom';
import { geocodeAdresse } from "../utils/geocode"; 

const sectionTitle = "text-xl font-semibold text-gray-800 mb-4 flex justify-between items-center";
const inputStyle = "w-full px-4 py-2 border border-gray-300 rounded-lg bg-white  focus:outline-none focus:ring-2 focus:ring-blue-500";
const labelStyle = "text-sm text-gray-600 font-medium mb-1 block";

const AjouterInstallation = () => {
  const [formData, setFormData] = useState({
    nom: "", client_email: "", installateur_email: "", type_installation: "",
    statut: "active", date_installation: "", capacite_kw: "", latitude: "",
    longitude: "", adresse: "", ville: "", code_postal: "", pays: "",
    expiration_garantie: "", reference_contrat: "", documentation_technique: null,
    photo_installation: "", type_contrat: "", date_mise_en_service: "",
    statut_diagnostic: "", diagnostic_realise: false, devis_associe: null
  });

  const [photoPreview, setPhotoPreview] = useState(null);
  const [clients, setClients] = useState([]);
  const [installateurs, setInstallateurs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sections, setSections] = useState({ system: true, location: true, users: true, extra: true });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const resClients = await ApiService.getClients();
        setClients(resClients.data.results || []);
        const resInstallateurs = await ApiService.getInstallateurs();
        setInstallateurs(resInstallateurs.data.results || []);
      } catch (err) {
        toast.error("Erreur lors du chargement des utilisateurs.");
      }
    };
    fetchUsers();
  }, []);


  const geocodeAdresse = async (adresse) => {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(adresse)}`);
    const data = await response.json();
    if (data && data.length > 0) {
      const { lat, lon } = data[0];
      toast.success("📍 Coordonnées récupérées avec succès !");
      return { latitude: parseFloat(lat).toFixed(6), longitude: parseFloat(lon).toFixed(6) };
    } else {
      toast.error("❌ Adresse non trouvée");
      return null;
    }
  } catch (error) {
    toast.error("Erreur lors de la récupération des coordonnées");
    return null;
  }
};
const handleAdresseChange = (e) => {
  const adresse = e.target.value;
  setFormData(prev => ({ ...prev, adresse }));
};

const handleFindCoords = async () => {
  if (!formData.adresse.trim()) {
    toast.error("Veuillez saisir une adresse d'abord.");
    return;
  }
  const coords = await geocodeAdresse(formData.adresse);
  if (coords) {
    setFormData(prev => ({ ...prev, latitude: coords.latitude, longitude: coords.longitude }));
  }
};
  const handleChange = (e) => {
    const { name, value, type, files, checked } = e.target;
    if (type === "file") {
      if (name === "photo_installation") {
        setFormData(prev => ({ ...prev, [name]: files[0] }));
        setPhotoPreview(URL.createObjectURL(files[0]));
      } else {
        setFormData(prev => ({ ...prev, [name]: files[0] }));
      }
    } else if (type === "checkbox") {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const toggleSection = (key) => {
    setSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  if (!formData.nom) {
    toast.error("Le nom de l'installation est requis !");
    setLoading(false);
    return;
  }

  const data = new FormData();
  for (const key in formData) {
    if (formData[key] !== null && formData[key] !== undefined) data.append(key, formData[key]);
  }

  try {
    const response = await ApiService.ajouterInstallation(data);
    toast.success("✅ " + response.data.message);
    navigate("/liste-installations");
  } catch (error) {
    const errors = error.response?.data;
    if (errors && typeof errors === "object") {
console.log("🟥 Backend errors:", errors);
Object.entries(errors).forEach(([field, msg]) => toast.error(`${field}: ${msg}`));
    } else {
      toast.error("❌ Erreur inconnue lors de l'ajout");
    }
  } finally {
    setLoading(false);
  }
};


  return (
    <form onSubmit={handleSubmit} className="max-w-6xl mx-auto pt-6 space-y-10">
      <section className="bg-white p-6 rounded-xl shadow space-y-6">
        <h2 className={sectionTitle}>
          Infos sur le système
          <button className="text-sm text-blue-600" onClick={() => toggleSection("system")}>{sections.system ? "Réduire ▲" : "Afficher ▼"}</button>
        </h2>
        {sections.system && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input type="text" name="nom" placeholder="Nom de centrale" value={formData.nom} onChange={handleChange} required className={inputStyle} />
            <select name="type_installation" value={formData.type_installation} onChange={handleChange} required className={inputStyle}>
              <option value="">Sélectionner le type</option>
              <option value="residential">Résidentiel</option>
              <option value="commercial">Commercial</option>
              <option value="industrial">Industriel</option>
              <option value="utility">Utilitaire</option>
            </select>
            <select name="statut" value={formData.statut} onChange={handleChange} className={inputStyle}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="maintenance">En maintenance</option>
              <option value="fault">En panne</option>
            </select>
            <input type="number" name="capacite_kw" placeholder="Capacité (kW)" value={formData.capacite_kw} onChange={handleChange} required className={inputStyle} />
            <div>
                    <label className={labelStyle}>date_installation :</label>

            <input type="date" name="date_installation" value={formData.date_installation} onChange={handleChange} required className={inputStyle} />

         </div>

               <div>
  <label className={labelStyle}>Photo de l'installation :</label>
  <input
    type="file"
    name="photo_installation"
    accept="image/*"
    onChange={handleChange}
    className={inputStyle}
  />
 
</div>
       
          </div>
        )}
      </section>

      {/* Coordonnées */}
<section className="bg-white p-6 rounded-xl shadow space-y-6">
  <h2 className={sectionTitle}>
    Coordonnées et emplacement
    <button className="text-sm text-blue-600" onClick={() => toggleSection("location")}>
      {sections.location ? "Réduire ▲" : "Afficher ▼"}
    </button>
  </h2>
  {sections.location && (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <input
        name="latitude"
        placeholder="Latitude"
        value={formData.latitude}
        onChange={handleChange}
        className={inputStyle}
        required
      />
      <input
        name="longitude"
        placeholder="Longitude"
        value={formData.longitude}
        onChange={handleChange}
        className={inputStyle}
        required
      />
      <div className="flex gap-2">
        <input
          name="adresse"
          placeholder="Adresse"
          value={formData.adresse}
          onChange={handleAdresseChange}
          className={`${inputStyle} flex-1`}
        />
        <button
          type="button"
          onClick={handleFindCoords}
          disabled={!formData.adresse.trim()}
          className={`px-3 py-1 text-sm rounded text-white ${
            formData.adresse.trim() ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          📍 Trouver coord.
        </button>
      </div>
      <input
        name="ville"
        placeholder="Ville"
        value={formData.ville}
        onChange={handleChange}
        className={inputStyle}
      />
      <input
        name="code_postal"
        placeholder="Code postal"
        value={formData.code_postal}
        onChange={handleChange}
        className={inputStyle}
      />
      <input
        name="pays"
        placeholder="Pays"
        value={formData.pays}
        onChange={handleChange}
        className={inputStyle}
      />
    </div>
  )}
</section>

      {/* Utilisateurs liés */}
      <section className="bg-white p-6 rounded-xl shadow space-y-6">
        <h2 className={sectionTitle}>
          Utilisateurs liés
          <button className="text-sm text-blue-600" onClick={() => toggleSection("users")}>{sections.users ? "Réduire ▲" : "Afficher ▼"}</button>
        </h2>
        {sections.users && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <select name="client_email" value={formData.client_email} onChange={handleChange} required className={inputStyle}>
              <option value="">Sélectionner un client</option>
              {clients.map((c) => (
                <option key={c.id} value={c.email}>{c.first_name} {c.last_name} ({c.email})</option>
              ))}
            </select>
            <select name="installateur_email" value={formData.installateur_email} onChange={handleChange} className={inputStyle}>
              <option value="">Sélectionner un installateur</option>
              {installateurs.map((i) => (
                <option key={i.id} value={i.email}>{i.first_name} {i.last_name} ({i.email})</option>
              ))}
            </select>
          </div>
        )}
      </section>

 {/* Informations supplémentaires */}
<section className="bg-white p-6 rounded-xl shadow space-y-6">
  <h2 className={sectionTitle}>
    Informations supplémentaires
    <button className="text-sm text-blue-600" onClick={() => toggleSection("extra")}>
      {sections.extra ? "Réduire ▲" : "Afficher ▼"}
    </button>
  </h2>

  {sections.extra && (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
     <div>
        <label className={labelStyle}>Date d'expiration de la garantie :</label>
        <input
          type="date"
          name="expiration_garantie"
          value={formData.expiration_garantie}
          onChange={handleChange}
          className={inputStyle}
        />
      </div>


<select
  name="type_contrat"
  value={formData.type_contrat}
  onChange={handleChange}
  className={inputStyle}
>
  <option value="" >-- Sélectionner un type de contrat --</option>
  <option value="exploitation">Contrat : Exploitation</option>
  <option value="preventive_curative">Contrat : Préventive + Curative</option>
  <option value="exploitation_curative">Contrat : Exploitation + Curative</option>
</select>



      {formData.type_contrat === "exploitation" && (
        
               <div>
  <label className={labelStyle}>date_mise_en_service:</label>
        <input
          type="date"
          name="date_mise_en_service"
          value={formData.date_mise_en_service}
          onChange={handleChange}
          className={inputStyle}
          placeholder="Date de mise en service"
        />
        </div>
      )}

      {formData.type_contrat !== "exploitation" && (
        <>

  <select
    name="statut_diagnostic"
    value={formData.statut_diagnostic}
    onChange={handleChange}
    className={inputStyle}
  >
      <option value="" disabled hidden>-- Sélectionner un Statut du diagnostic  --</option>

    <option value="en_attente">En attente</option>
    <option value="traitee">Traité</option>
  </select>





          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="diagnostic_realise"
              checked={formData.diagnostic_realise}
              onChange={handleChange}
            />
            <label className="text-sm text-gray-700">Diagnostic réalisé</label>
          </div>
<div>
  <label className={labelStyle}>Téléverser un devis:</label>
          <input
            type="file"
            name="devis_associe"
            onChange={handleChange}
            className={inputStyle}
            placeholder="Téléverser un devis"
          />
            </div>
        </>
      
      )}

    <div>
  <label className={labelStyle}>Documentation technique :</label>
  <input
    type="file"
    name="documentation_technique"
    onChange={handleChange}
    className={inputStyle}
    accept=".pdf,.doc,.docx"
  />
  {!formData.documentation_technique && (
    <p className="text-sm text-gray-500 mt-1">Veuillez téléverser un fichier PDF ou Word.</p>
  )}
</div>



    </div>
  )}
</section>

      <div className="text-right">
        <button type="submit" disabled={loading} className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
          {loading ? "Ajout..." : "Ajouter l'installation"}
        </button>
      </div>
    </form>
  );
};

export default AjouterInstallation;
