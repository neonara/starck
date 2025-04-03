import React, { useEffect, useState } from "react";
import { AddUserType } from "../../types/type";
import ApiService from "../../Api/Api";
import { motion } from "framer-motion";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState(AddUserType);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await ApiService.getUsers();
      setUsers(response.data);
    } catch (err) {
      console.error("Erreur de récupération des utilisateurs", err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddUser = async () => {
    try {
      await ApiService.addUser(formData);
      setSuccess("✅ Utilisateur ajouté !");
      setError(null);
      setFormData(AddUserType);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.error || "❌ Échec de l'ajout.");
      setSuccess(null);
    }
  };

// Fonction qui sera appelée lors du logout
const handleLogout = () => {
  ApiService.logout();
};

  return (
    <div className="w-full px-6 pt-28 pb-16 flex flex-col items-center">
      {/* TITRE en dehors de la carte */}
      <h2 className="text-3xl font-bold text-gray-800 mb-6 self-start max-w-3xl">
        ➕ Ajouter un utilisateur
      </h2>

      {/* CARTE */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-3xl bg-white rounded-2xl shadow-xl p-10"
      >
        {error && <p className="text-red-600 mb-4">{error}</p>}
        {success && <p className="text-green-600 mb-4">{success}</p>}

        <div className="space-y-6">
          {/* Email */}
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Adresse Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="ex: utilisateur@email.com"
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Dropdown Rôle */}
          <div className="relative">
            <label className="text-sm text-gray-600 mb-1 block">Rôle</label>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-full bg-gray-100 px-4 py-3 rounded-lg border flex justify-between items-center text-sm text-gray-700 hover:bg-gray-200"
            >
              {formData.role.charAt(0).toUpperCase() + formData.role.slice(1)}
              <span>{dropdownOpen ? "▲" : "▼"}</span>
            </button>

            {dropdownOpen && (
              <div className="absolute w-full mt-1 bg-white border rounded-lg shadow-md z-10">
                {["installateur", "technicien", "client"].map((option) => (
                  <div
                    key={option}
                    onClick={() => {
                      setFormData({ ...formData, role: option });
                      setDropdownOpen(false);
                    }}
                    className="px-4 py-2 hover:bg-blue-100 cursor-pointer text-sm"
                  >
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bouton */}
          <div className="pt-4 text-right">
            <button
              onClick={handleAddUser}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition"
            >
              Enregistrer
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default UserManagement;
