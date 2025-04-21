import React, { useEffect, useState } from "react";
import ApiService from "../../Api/Api";
import { toast } from "react-toastify";
import { useNavigate } from 'react-router-dom';


const sectionTitle = "text-xl font-semibold text-gray-800 mb-4 flex justify-between items-center";
const inputStyle = "w-full px-4 py-2 border border-gray-300 rounded-lg bg-white  focus:outline-none focus:ring-2 focus:ring-blue-500";
const labelStyle = "text-sm text-gray-600 font-medium mb-1 block";

const AjouterInstallation = () => {
  const [formData, setFormData] = useState({
    nom: "", client_email: "", installateur_email: "", type_installation: "",
    statut: "active", date_installation: "", capacite_kw: "", latitude: "",
    longitude: "", adresse: "", ville: "", code_postal: "", pays: "",
    expiration_garantie: "", reference_contrat: "", documentation_technique: null
  });

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

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "file" ? files[0] : value
    }));
  };

  const toggleSection = (key) => {
    setSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("🟡 Données envoyées au backend :", formData);

    setLoading(true);
    const data = new FormData();
    for (const key in formData) {
      if (formData[key]) data.append(key, formData[key]);
    }
    if (!formData.nom) {
      toast.error("Le nom de l'installation est requis !");
      return;
    }

    try {
      const response = await ApiService.ajouterInstallation(data);
      toast.success("✅ " + response.data.message);
      navigate("/liste-installations");
    } catch (error) {
      const errors = error.response?.data;
      if (errors && typeof errors === "object") {
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
      {/* Infos système */}
      <section className="bg-white p-6 rounded-xl shadow space-y-6">
        <h2 className={sectionTitle}>
          Infos sur le système
          <button className="text-sm text-blue-600" onClick={() => toggleSection("system")}>{sections.system ? "Réduire ▲" : "Afficher ▼"}</button>
        </h2>
        {sections.system && (
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
            <label className={labelStyle}>Nom de centrale :</label>
            <input type="text" name="nom" value={formData.nom} onChange={handleChange} required className={inputStyle}/>
            </div>
            <div>
              <label className={labelStyle}>Type de centrale :</label>
              <select name="type_installation" value={formData.type_installation} onChange={handleChange} required className={inputStyle}>
                <option value="">Sélectionner</option>
                <option value="residential">Résidentiel</option>
                <option value="commercial">Commercial</option>
                <option value="industrial">Industriel</option>
                <option value="utility">Utilitaire</option>
              </select>
            </div>
            <div>
              <label className={labelStyle}>Statut :</label>
              <select name="statut" value={formData.statut} onChange={handleChange} className={inputStyle}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="maintenance">En maintenance</option>
                <option value="fault">En panne</option>
              </select>
            </div>
            <div>
              <label className={labelStyle}>Capacité installée (kW) :</label>
              <input type="number" name="capacite_kw" value={formData.capacite_kw} onChange={handleChange} required className={inputStyle} />
            </div>
            <div>
              <label className={labelStyle}>Date d’installation :</label>
              <input type="date" name="date_installation" value={formData.date_installation} onChange={handleChange} required className={inputStyle} />
            </div>
          </div>
        )}
      </section>

      {/* Coordonnées */}
      <section className="bg-white p-6 rounded-xl shadow space-y-6">
        <h2 className={sectionTitle}>
          Coordonnées et emplacement
          <button className="text-sm text-blue-600" onClick={() => toggleSection("location")}>{sections.location ? "Réduire ▲" : "Afficher ▼"}</button>
        </h2>
        {sections.location && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input name="latitude" placeholder="Latitude" value={formData.latitude} onChange={handleChange} className={inputStyle} required />
            <input name="longitude" placeholder="Longitude" value={formData.longitude} onChange={handleChange} className={inputStyle} required />
            <input name="adresse" placeholder="Adresse" value={formData.adresse} onChange={handleChange} className={inputStyle} />
            <input name="ville" placeholder="Ville" value={formData.ville} onChange={handleChange} className={inputStyle} />
            <input name="code_postal" placeholder="Code postal" value={formData.code_postal} onChange={handleChange} className={inputStyle} />
            <input name="pays" placeholder="Pays" value={formData.pays} onChange={handleChange} className={inputStyle} />
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

      {/* Autres infos */}
      <section className="bg-white p-6 rounded-xl shadow space-y-6">
        <h2 className={sectionTitle}>
          Informations supplémentaires
          <button className="text-sm text-blue-600" onClick={() => toggleSection("extra")}>{sections.extra ? "Réduire ▲" : "Afficher ▼"}</button>
        </h2>
        {sections.extra && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input type="date" name="expiration_garantie" value={formData.expiration_garantie} onChange={handleChange} className={inputStyle} />
            <input name="reference_contrat" value={formData.reference_contrat} onChange={handleChange} placeholder="Référence contrat" className={inputStyle} />
            <input type="file" name="documentation_technique" onChange={handleChange} accept=".pdf,.doc,.docx" className={inputStyle} />
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