import React, { useState } from "react";
import ApiService from "../../Api/Api";
import { Toaster, toast } from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { Dialog } from "@headlessui/react";

const FormulaireEnvoyerReclamation = () => {
  const [formData, setFormData] = useState({
    sujet: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false); // 👉 Pour ouvrir la confirmation
  const [pendingSubmit, setPendingSubmit] = useState(false); // 👉 Pour attendre la vraie confirmation

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSend = async () => {
    setLoading(true);
    try {
      await ApiService.envoyerReclamation(formData);
      toast.success("Réclamation envoyée ✅");
      setFormData({ sujet: "", message: "" });
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de l'envoi ❌");
    } finally {
      setLoading(false);
      setIsConfirmDialogOpen(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // 👉 Avant d'envoyer, ouvrir une popup de confirmation
    setIsConfirmDialogOpen(true);
  };

  return (
    <div className="pt-24 px-6 w-full">
      <Toaster />
      <div className="bg-white rounded-xl shadow p-8 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-blue-600 mb-6 text-center">
          Envoyer une Réclamation
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Sujet */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sujet</label>
            <input
              type="text"
              name="sujet"
              value={formData.sujet}
              onChange={handleChange}
              required
              placeholder="Problème rencontré..."
              className="w-full border rounded-lg p-3 bg-gray-50"
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              placeholder="Décrivez votre problème en détail..."
              className="w-full border rounded-lg p-3 text-gray-700 bg-gray-50 h-32"
            />
          </div>

          {/* Bouton Envoyer */}
          <button
            type="submit"
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Envoyer
          </button>
        </form>
      </div>

      {/* Popup de confirmation */}
      <Dialog open={isConfirmDialogOpen} onClose={() => setIsConfirmDialogOpen(false)} className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen p-4">
          <Dialog.Panel className="bg-white p-8 rounded-xl shadow-xl max-w-md w-full text-center">
            <Dialog.Title className="text-2xl font-bold text-gray-800 mb-4">
              Confirmation
            </Dialog.Title>
            <p className="text-gray-600 mb-6">
              Voulez-vous vraiment envoyer cette réclamation ?
            </p>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => setIsConfirmDialogOpen(false)}
                className="px-6 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold"
              >
                Annuler
              </button>

              <button
                onClick={handleSend}
                disabled={loading}
                className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-2"
              >
                {loading && <Loader2 className="animate-spin" size={20} />}
                Confirmer
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};

export default FormulaireEnvoyerReclamation;
