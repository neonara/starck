import React, { useState } from "react";
import ApiService from "../../Api/Api";
import { Toaster, toast } from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { Dialog } from "@headlessui/react";
import { useNavigate } from "react-router-dom";

const FormulaireEnvoyerReclamation = () => {
  const [formData, setFormData] = useState({
    sujet: "",
    message: "",
  });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Gestion de l'ajout multiple cumulatif des images avec limite 5 max
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);

    if (images.length + files.length > 5) {
      toast.error("Vous ne pouvez pas avoir plus de 5 images au total.");
      return;
    }

    setImages((prevImages) => [...prevImages, ...files]);
  };

  // Supprimer une image par son index
  const handleRemoveImage = (indexToRemove) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== indexToRemove));
  };

  const handleSend = async () => {
    setLoading(true);
    const data = new FormData();
    data.append("sujet", formData.sujet);
    data.append("message", formData.message);

    images.forEach((file) => {
      data.append("images", file);
    });

    try {
      await ApiService.envoyerReclamation(data);
      toast.success("Réclamation envoyée ✅");
      setFormData({ sujet: "", message: "" });
      setImages([]);
      navigate("/liste-reclamations");
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sujet
            </label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              placeholder="Décrivez votre problème en détail..."
              className="w-full border rounded-lg p-3 text-gray-700 bg-gray-50 h-32"
            />
          </div>

          {/* Images */}
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Joindre des images (max 5)
            </label>

            <label
              htmlFor="imageUpload"
              className="flex items-center justify-center w-full border-2 border-dashed border-gray-300 bg-gray-50 text-gray-500 rounded-lg py-8 px-4 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition"
            >
              {images.length === 0
                ? "Aucun fichier n’a été sélectionné"
                : `${images.length} fichier(s) sélectionné(s)`}
              <input
                id="imageUpload"
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            {images.length > 0 && (
              <div className="flex gap-2 flex-wrap mt-3">
                {images.map((file, i) => (
                  <div
                    key={i}
                    className="relative w-16 h-16 rounded border overflow-hidden"
                  >
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`preview-${i}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(i)}
                      className="absolute top-0 right-0 bg-black bg-opacity-50 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 transition"
                      title="Supprimer cette image"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Boutons */}
          <div className="flex justify-center gap-4">
            <button
              type="button"
              onClick={() => navigate("/liste-reclamations")}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-3 rounded-lg font-semibold transition"
            >
              Annuler
            </button>

            <button
              type="submit"
              className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Envoyer
            </button>
          </div>
        </form>
      </div>

      {/* Popup de confirmation */}
      <Dialog
        open={isConfirmDialogOpen}
        onClose={() => setIsConfirmDialogOpen(false)}
        className="fixed inset-0 z-50 overflow-y-auto"
      >
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
