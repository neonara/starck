import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PublicApiService from "../Api/apipublic"; // ✅ Nouveau service centralisé
 
export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
 
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
 
    try {
      await PublicApiService.forgotPassword(email); // ✅ Appel depuis le service public
      setMessage("Un code de vérification a été envoyé à votre email.");
 
      setTimeout(() => {
        navigate(`/reset-password?email=${encodeURIComponent(email)}`);
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || "Une erreur s'est produite.");
    }
  };
 
  return (
<div className="flex flex-col items-center justify-center min-h-screen">
<div className="bg-white p-8 rounded-lg shadow-md w-96">
<h2 className="text-2xl font-bold mb-4 text-center">Mot de passe oublié</h2>
 
        {message && <p className="text-green-600 text-center">{message}</p>}
        {error && <p className="text-red-500 text-center">{error}</p>}
 
        <form onSubmit={handleForgotPassword} className="space-y-4">
<input
            type="email"
            placeholder="Entrez votre email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-2 border border-gray-300 rounded"
          />
<button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
            Envoyer le code
</button>
</form>
 
        <div className="text-center mt-4">
<a href="/" className="text-blue-600 hover:underline">Retour à la connexion</a>
</div>
</div>
</div>
  );
}