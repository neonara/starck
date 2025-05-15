import { useState } from "react";
import ApiService from "../../../Api/Api";
export default function RappelForm({ entretienId, onSuccess }) {
  const [datetime, setDatetime] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await ApiService.ajouterRappelEntretien(entretienId, datetime);
      setLoading(false);
      alert("📬 Rappel enregistré avec succès !");
      onSuccess?.();
    } catch (err) {
      setLoading(false);
      setError(
        err?.response?.data?.error || "Erreur lors de l'enregistrement du rappel."
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow space-y-4 max-w-md mx-auto">
      <label className="block">
        <span className="text-gray-700 font-medium">📅 Choisir la date et l'heure du rappel :</span>
        <input
          type="datetime-local"
          className="mt-1 block w-full border rounded p-2"
          value={datetime}
          onChange={(e) => setDatetime(e.target.value)}
        />
      </label>

      {error && <p className="text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading || !datetime}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Enregistrement..." : "Enregistrer le rappel"}
      </button>
    </form>
  );
}
