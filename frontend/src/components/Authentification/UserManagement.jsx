import React, { useEffect, useState } from "react";
import { AddUserType } from "../../types/type"; 
import ApiService from "../../Api/Api";
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
      setSuccess("Utilisateur ajouté avec succès !");
      setError(null);
      setFormData(AddUserType);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.error || "Échec de l'ajout.");
      setSuccess(null);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center px-4">
      <div className="w-full max-w-3xl bg-white p-10 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-center text-blue-700 mb-6">
          Ajouter un utilisateur
        </h2>

        {error && <p className="text-red-500 text-center">{error}</p>}
        {success && <p className="text-green-500 text-center">{success}</p>}

        <div className="mb-4">
          <input
            type="email"
            name="email"
            placeholder="Email de l'utilisateur"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="mb-4 relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-full flex justify-between items-center bg-gray-100 px-4 py-3 rounded-lg border border-gray-300 hover:bg-gray-200 cursor-pointer"
          >
            {formData.role.charAt(0).toUpperCase() + formData.role.slice(1)}
            <span>{dropdownOpen ? "▲" : "▼"}</span>
          </button>

          {dropdownOpen && (
            <div className="absolute w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
              {["installateur", "technicien", "client"].map((option) => (
                <div
                  key={option}
                  className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                  onClick={() => {
                    setFormData({ ...formData, role: option });
                    setDropdownOpen(false);
                  }}
                >
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-center mt-4">
          <button
            onClick={handleAddUser}
            className="bg-blue-700 text-white py-3 px-6 rounded-lg hover:bg-blue-600 transition duration-300"
          >
            Ajouter
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
