import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import PublicApiService from "../../Api/APIpublic"; 
 
export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const emailFromURL = searchParams.get("email") || "";
 
  const [email, setEmail] = useState(emailFromURL);
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
 
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
 
    if (!email || !code || !newPassword || !confirmPassword) {
      setError("Tous les champs sont requis.");
      return;
    }
 
    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
 
    try {
      await PublicApiService.resetPassword({
        email,
        code,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
 
      setMessage("Mot de passe réinitialisé avec succès. Redirection...");
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      console.error("Erreur API :", err.response?.data);
      setError(err.response?.data?.error || "Une erreur s'est produite.");
    }
  };
 
  return (
<div className="flex flex-col items-center justify-center min-h-screen">
<div className="bg-white p-8 rounded-lg shadow-md w-96">
<h2 className="text-2xl font-bold mb-4 text-center">Réinitialiser le mot de passe</h2>
 
        {message && <p className="text-green-600 text-center">{message}</p>}
        {error && <p className="text-red-500 text-center">{error}</p>}
 
        <form onSubmit={handleResetPassword} className="space-y-4">
<input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-2 border border-gray-300 rounded"
          />
<input
            type="text"
            placeholder="Code de vérification"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            className="w-full p-2 border border-gray-300 rounded"
          />
<input
            type="password"
            placeholder="Nouveau mot de passe"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="w-full p-2 border border-gray-300 rounded"
          />
<input
            type="password"
            placeholder="Confirmer le mot de passe"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full p-2 border border-gray-300 rounded"
          />
<button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
            Réinitialiser
</button>
</form>
 
        <div className="text-center mt-4">
<a href="/" className="text-blue-600 hover:underline">Retour à la connexion</a>
</div>
</div>
</div>
  );
}