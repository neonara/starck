import { useState, useEffect } from "react";
import ApiService from "../../Api/Api"; 
import { UpdateProfileType } from "../../types/type";

const UpdateProfile = () => {
  const [formData, setFormData] = useState(UpdateProfileType);
  const [userRole, setUserRole] = useState("");
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    ApiService.getProfile()
      .then((response) => {
        console.log("Données du profil récupérées :", response.data);
        setFormData({
          first_name: response.data.first_name || "",
          last_name: response.data.last_name || "",
          email: response.data.email || "",
          old_password: "",
          new_password: "",
          confirm_new_password: "",
        });
        setUserRole(response.data.role || "");
      })
      .catch((error) => {
        console.error("Erreur lors du chargement du profil :", error);
        setError("Impossible de récupérer les informations du profil.");
      });
  }, []);
  

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
  
    const payload = { ...formData };
  
    if (!payload.old_password) delete payload.old_password;
    if (!payload.new_password) delete payload.new_password;
    if (!payload.confirm_new_password) delete payload.confirm_new_password;
  
    console.log("Données envoyées à l'API :", payload); 
  
    try {
      const response = await ApiService.updateProfile(payload);
      console.log("Réponse de l'API :", response.data); 
      setMessage("Profil mis à jour avec succès !");
    } catch (err) {
      console.error("Erreur lors de la mise à jour du profil :", err);
      const serverError = err.response?.data;
      if (typeof serverError === "object") {
        const firstKey = Object.keys(serverError)[0];
        setError(serverError[firstKey]);
      } else {
        setError("Erreur lors de la mise à jour du profil.");
      }
    }
  };
  

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded-lg shadow-md bg-white">
      <h2 className="text-xl font-bold mb-4">Modifier votre profil</h2>
      {message && <div className="bg-green-200 text-green-800 p-2 rounded">{message}</div>}
      {error && <div className="bg-red-200 text-red-800 p-2 rounded">{error}</div>}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700">Prénom :</label>
          <input
            type="text"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700">Nom :</label>
          <input
            type="text"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        {userRole === "admin" && (
          <div>
            <label className="block text-gray-700">Email :</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
        )}

        <div>
          <label className="block text-gray-700">Ancien mot de passe :</label>
          <input
            type="password"
            name="old_password"
            value={formData.old_password}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-gray-700">Nouveau mot de passe :</label>
          <input
            type="password"
            name="new_password"
            value={formData.new_password}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-gray-700">Confirmer le nouveau mot de passe :</label>
          <input
            type="password"
            name="confirm_new_password"
            value={formData.confirm_new_password}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Mettre à jour
        </button>
      </form>
    </div>
  );
};

export default UpdateProfile;
