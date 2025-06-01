import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ApiService from "../../Api/Api";
import { toast, Toaster } from "react-hot-toast";

const ModifierReclamationPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [reclamation, setReclamation] = useState(null);
  const [sujet, setSujet] = useState("");
  const [message, setMessage] = useState("");
  const [statut, setStatut] = useState("");
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState([]); // images existantes
  const [newImages, setNewImages] = useState([]); // nouvelles images uploadées
  const [deletedImageIds, setDeletedImageIds] = useState([]); // ids images supprimées

  useEffect(() => {
    const fetchReclamation = async () => {
      try {
        const res = await ApiService.getReclamations();
        const list = Array.isArray(res.data) ? res.data : res.data.results || [];
        const found = list.find((item) => item.id === parseInt(id, 10));

        if (found) {
          setReclamation(found);
          setSujet(found.sujet || "");
          setMessage(found.message || "");
          setStatut(found.statut || "");
          setImages(found.images || []);
        } else {
          toast.error("Réclamation introuvable");
          navigate("/list_reclamations");
        }
      } catch (err) {
        console.error(err);
        toast.error("Erreur lors du chargement");
      } finally {
        setLoading(false);
      }
    };

    fetchReclamation();
  }, [id, navigate]);

  const handleUpdate = async () => {
    const formData = new FormData();
    formData.append("sujet", sujet);
    formData.append("message", message);
    formData.append("statut", statut);

    newImages.forEach((file) => formData.append("images", file));
    deletedImageIds.forEach((imgId) => formData.append("deleted_images", imgId));

    try {
      await ApiService.updateReclamation(id, formData);
      toast.success("Réclamation mise à jour ✅");
      navigate("/liste-reclamations");
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de la mise à jour ❌");
    }
  };

  if (loading || !reclamation) return <div className="p-6">Chargement...</div>;

  const totalImagesCount = images.length + newImages.length;
  const isSaveDisabled = totalImagesCount > 5;

  return (
    <div className="p-6 max-w-xl mx-auto mt-24 bg-white shadow rounded">
      <Toaster />
      <h2 className="text-xl font-semibold mb-4">Modifier la réclamation</h2>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Installation</label>
        <input
          type="text"
          value={reclamation.installation_nom || "Non lié"}
          disabled
          className="mt-1 block w-full rounded border-gray-300 shadow-sm text-sm bg-gray-100"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Sujet</label>
        <input
          type="text"
          value={sujet}
          onChange={(e) => setSujet(e.target.value)}
          className="mt-1 block w-full rounded border-gray-300 shadow-sm text-sm"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Message</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="mt-1 block w-full rounded border-gray-300 shadow-sm text-sm"
        />
      </div>

      {/* Images existantes */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Images jointes</label>
        {images.length > 0 ? (
          <div className="flex flex-wrap gap-2 mt-2">
            {images.map((img, i) => (
              <div key={img.id || i} className="relative group">
                <a href={img.image} target="_blank" rel="noopener noreferrer" tabIndex={-1}>
                  <img
                    src={img.image}
                    alt={`img-${i}`}
                    className="w-20 h-20 object-cover rounded border"
                  />
                </a>
                <button
                  type="button"
                  onClick={() => {
                    setImages(images.filter((_, index) => index !== i));
                    if (img.id) setDeletedImageIds((prev) => [...prev, img.id]);
                  }}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 text-xs hidden group-hover:block"
                  title="Supprimer"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 italic mt-2">Aucune image jointe</p>
        )}
      </div>

      {/* Nouvelles images uploadées */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Ajouter des images</label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => {
            const files = Array.from(e.target.files);
            const total = files.length + images.length + newImages.length;

            if (total > 5) {
              toast.error(
                `Maximum 5 images autorisées au total (${images.length + newImages.length} existantes)`
              );
              return;
            }
            setNewImages((prev) => [...prev, ...files]);
          }}
          className="mt-1 block w-full text-sm"
        />
        {newImages.length > 0 && (
          <div className="flex gap-2 flex-wrap mt-2">
            {newImages.map((file, idx) => (
              <div key={idx} className="relative group">
                <img
                  src={URL.createObjectURL(file)}
                  alt={`preview-${idx}`}
                  className="w-16 h-16 object-cover rounded border"
                />
                <button
                  type="button"
                  onClick={() =>
                    setNewImages((prev) => prev.filter((_, index) => index !== idx))
                  }
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 text-xs hidden group-hover:block"
                  title="Supprimer"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Boutons */}
      <div className="flex justify-end gap-4">
        <button
          onClick={() => navigate("/liste-reclamations")}
          className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition"
        >
          Annuler
        </button>
        <button
          onClick={handleUpdate}
          disabled={isSaveDisabled}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          title={isSaveDisabled ? "Maximum 5 images autorisées" : ""}
        >
          Enregistrer
        </button>
      </div>
    </div>
  );
};

export default ModifierReclamationPage;
