import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

const CompleteRegistration = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    password: "",
    confirm_password: "",
  });

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/users/get-user-by-token/`, {
          params: { email, token }
        });

        setFormData({
          first_name: response.data.first_name,
          last_name: response.data.last_name,
          phone: response.data.phone,
          password: "",
          confirm_password: "",
        });
      } catch (err) {
        setError("Impossible de récupérer les données. Vérifiez votre lien.");
      }
    };

    fetchUserData();
  }, [email, token]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (formData.password !== formData.confirm_password) {
      setError("Les mots de passe ne correspondent pas.");
      setLoading(false);
      return;
    }

    try {
      await axios.post("http://127.0.0.1:8000/users/complete-registration/", {
        email,
        token,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        password: formData.password,
        confirm_password: formData.confirm_password,
      });

      setSuccess("Inscription réussie ! Redirection...");
      setTimeout(() => navigate("/"), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center w-full h-screen px-5 ">
      
      {/* Formulaire */}
      <div className="w-full max-w-lg p-6 sm:p-10 rounded-lg shadow-lg bg-white">
        <h2 className="text-2xl font-semibold text-center text-gray-900">
          Complétez votre inscription
        </h2>

        {error && <p className="text-red-500 text-center mt-3">{error}</p>}
        {success && <p className="text-green-500 text-center mt-3">{success}</p>}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              name="first_name"
              className="w-full px-4 py-3 rounded-lg font-medium border-2 border-gray-300 placeholder-gray-500 text-sm focus:outline-none focus:border-black"
              value={formData.first_name}
              onChange={handleChange}
              placeholder="Prénom"
              required
            />
            <input
              type="text"
              name="last_name"
              className="w-full px-4 py-3 rounded-lg font-medium border-2 border-gray-300 placeholder-gray-500 text-sm focus:outline-none focus:border-black"
              value={formData.last_name}
              onChange={handleChange}
              placeholder="Nom"
              required
            />
          </div>

          <input
            type="text"
            name="phone"
            className="w-full px-4 py-3 rounded-lg font-medium border-2 border-gray-300 placeholder-gray-500 text-sm focus:outline-none focus:border-black"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Téléphone"
          />

          <input
            type="password"
            name="password"
            className="w-full px-4 py-3 rounded-lg font-medium border-2 border-gray-300 placeholder-gray-500 text-sm focus:outline-none focus:border-black"
            onChange={handleChange}
            placeholder="Mot de passe"
            required
          />

          <input
            type="password"
            name="confirm_password"
            className="w-full px-4 py-3 rounded-lg font-medium border-2 border-gray-300 placeholder-gray-500 text-sm focus:outline-none focus:border-black"
            onChange={handleChange}
            placeholder="Confirmer le mot de passe"
            required
          />

          <button
            type="submit"
            className="w-full bg-[#1d50db] text-white py-3 rounded-lg hover:bg-[#1d50db]/90 transition-all duration-300 ease-in-out flex items-center justify-center focus:shadow-outline focus:outline-none"
            disabled={loading}
          >
            {loading ? "Inscription en cours..." : "S'inscrire"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CompleteRegistration;
