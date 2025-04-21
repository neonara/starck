import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ApiService from "../../Api/Api";
import toast from "react-hot-toast";
import { ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

const inputStyle = "input border border-gray-300 px-3 py-2 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500";

const EditInstallation = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nom: "",
    type_installation: "",
    date_installation: "",
    capacite_kw: "",
    latitude: "",
    longitude: "",
    adresse: "",
    ville: "",
    code_postal: "",
    pays: "",
    expiration_garantie: "",
    reference_contrat: "",
    client_email: "",
    installateur_email: "",
    photo_installation: null,
    documentation_technique: null
  });

  const [photoPreview, setPhotoPreview] = useState(null);
  const [clients, setClients] = useState([]);
  const [installateurs, setInstallateurs] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resInstallation, resClients, resInstallateurs] = await Promise.all([
          ApiService.getInstallationById(id),
          ApiService.getClients(),
          ApiService.getInstallateurs()
        ]);

        const data = resInstallation.data;
        setForm({
          nom: data.nom || "",
          type_installation: data.type_installation || "",
          date_installation: data.date_installation || "",
          capacite_kw: data.capacite_kw || "",
          latitude: data.latitude || "",
          longitude: data.longitude || "",
          adresse: data.adresse || "",
          ville: data.ville || "",
          code_postal: data.code_postal || "",
          pays: data.pays || "",
          expiration_garantie: data.expiration_garantie || "",
          reference_contrat: data.reference_contrat || "",
          client_email: data.client?.email || "",
          installateur_email: data.installateur?.email || "",
          photo_installation: null,
          documentation_technique: null
        });

        setPhotoPreview(data.photo_installation_url || null);
        setClients(resClients.data.results || []);
        setInstallateurs(resInstallateurs.data.results || []);
      } catch (err) {
        console.error("Erreur lors du chargement :", err);
        toast.error("❌ Erreur chargement données");
      }
    };

    fetchData();
  }, [id]);

  const geocodeAdresse = async (adresse) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(adresse)}`);
      const data = await response.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        setForm((prev) => ({
          ...prev,
          latitude: parseFloat(lat).toFixed(6),
          longitude: parseFloat(lon).toFixed(6),
        }));
        toast.success("📍 Coordonnées récupérées avec succès !");
      } else {
        toast.error("❌ Adresse non trouvée");
      }
    } catch (error) {
      console.error("Erreur géocodage :", error);
      toast.error("Erreur lors de la récupération des coordonnées");
    }
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === "file") {
      const file = files?.[0];
      setForm((prev) => ({ ...prev, [name]: file }));

      if (name === "photo_installation" && file && file.type.startsWith("image/")) {
        setPhotoPreview(URL.createObjectURL(file));
      }
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      for (const key in form) {
        if (form[key]) {
          if (key === "capacite_kw") {
            data.append(key, parseFloat(form[key]).toFixed(2));
          } else {
            data.append(key, form[key]);
          }
        }
      }

      await ApiService.updateInstallation(id, data);
      toast.success("✅ Installation mise à jour");
      navigate("/liste-installations");
    } catch (err) {
      if (err.response?.data) {
        console.error("🔥 Erreur serveur :", err.response.data);
        const errorData = err.response.data;
        for (const field in errorData) {
          const message = Array.isArray(errorData[field])
            ? errorData[field].join(" - ")
            : errorData[field];
          toast.error(`${field} : ${message}`);
        }
      } else {
        console.error("Erreur inattendue :", err);
        toast.error("Erreur inattendue lors de la mise à jour");
      }
    }
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
          <motion.div animate={{ opacity: 1 }} initial={{ opacity: 0 }} transition={{ duration: 0.4 }} className="bg-gray-50 p-6 rounded-xl shadow">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input name="nom" value={form.nom} onChange={handleChange} placeholder="Nom" className={inputStyle} required />
              <div className="flex gap-2 col-span-2">
                <input name="adresse" value={form.adresse} onChange={handleChange} placeholder="Adresse" className={`${inputStyle} flex-1`} />
                <button type="button" onClick={() => geocodeAdresse(form.adresse)} className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                  📍 Trouver coord.
                </button>
              </div>
              <input name="latitude" value={form.latitude} onChange={handleChange} placeholder="Latitude" className={inputStyle} />
              <input name="longitude" value={form.longitude} onChange={handleChange} placeholder="Longitude" className={inputStyle} />
            </div>
          </motion.div>

          <motion.div animate={{ opacity: 1 }} initial={{ opacity: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="bg-gray-50 p-6 rounded-xl shadow">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input name="capacite_kw" type="number" value={form.capacite_kw} onChange={handleChange} placeholder="Capacité (kW)" className={inputStyle} />
              <input name="type_installation" value={form.type_installation} onChange={handleChange} placeholder="Type d'installation" className={inputStyle} />
              <input name="ville" value={form.ville} onChange={handleChange} placeholder="Ville" className={inputStyle} />
              <input name="code_postal" value={form.code_postal} onChange={handleChange} placeholder="Code postal" className={inputStyle} />
              <input name="pays" value={form.pays} onChange={handleChange} placeholder="Pays" className={inputStyle} />
              <input type="date" name="expiration_garantie" value={form.expiration_garantie} onChange={handleChange} className={inputStyle} />
            </div>
          </motion.div>

          <motion.div animate={{ opacity: 1 }} initial={{ opacity: 0 }} transition={{ duration: 0.4, delay: 0.2 }} className="bg-gray-50 p-6 rounded-xl shadow col-span-1 lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select name="client_email" value={form.client_email} onChange={handleChange} className={inputStyle} required>
                <option value="">Sélectionner un client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.email}>
                    {client.first_name} {client.last_name} ({client.email})
                  </option>
                ))}
              </select>
              <select name="installateur_email" value={form.installateur_email} onChange={handleChange} className={inputStyle}>
                <option value="">Sélectionner un installateur</option>
                {installateurs.map((inst) => (
                  <option key={inst.id} value={inst.email}>
                    {inst.first_name} {inst.last_name} ({inst.email})
                  </option>
                ))}
              </select>
              <input type="date" name="date_installation" value={form.date_installation} onChange={handleChange} className={inputStyle} />
              <input name="reference_contrat" value={form.reference_contrat} onChange={handleChange} placeholder="Référence contrat" className={inputStyle} />

              <div>
                <label className="text-sm text-gray-600">Photo de l'installation</label>
                <input type="file" name="photo_installation" onChange={handleChange} accept="image/*" className={inputStyle} />
                {photoPreview && (
                  <img src={photoPreview} alt="Aperçu" className="mt-2 rounded-lg h-32 object-cover border" />
                )}
              </div>

              <div>
                <label className="text-sm text-gray-600">Documentation technique</label>
                <input type="file" name="documentation_technique" onChange={handleChange} accept=".pdf,.doc,.docx" className={inputStyle} />
              </div>
            </div>
          </motion.div>

          <div className="col-span-1 lg:col-span-2 flex justify-end gap-4 mt-6">
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

export default EditInstallation;
