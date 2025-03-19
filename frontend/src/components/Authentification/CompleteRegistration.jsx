import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { CompleteRegistrationType } from "../../types/type"; 
import PublicApiService from "../../Api/APIpublic"; 


const CompleteRegistration = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [formData, setFormData] = useState(CompleteRegistrationType); 
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await PublicApiService.getUserByToken(email, token);  
        setFormData({ ...response.data, password: "", confirm_password: "" });
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
      await PublicApiService.completeRegistration({
        email,
        token,
        ...formData,
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
      <div className="w-full max-w-lg p-6 sm:p-10 rounded-lg shadow-lg bg-white">
        <h2 className="text-2xl font-semibold text-center text-gray-900">
          Complétez votre inscription
        </h2>

        {error && <p className="text-red-500 text-center mt-3">{error}</p>}
        {success && <p className="text-green-500 text-center mt-3">{success}</p>}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} placeholder="Prénom" required />
          <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} placeholder="Nom" required />
          <input type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="Téléphone" />
          <input type="password" name="password" onChange={handleChange} placeholder="Mot de passe" required />
          <input type="password" name="confirm_password" onChange={handleChange} placeholder="Confirmer" required />

          <button type="submit" disabled={loading}>
            {loading ? "Inscription en cours..." : "S'inscrire"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CompleteRegistration;
