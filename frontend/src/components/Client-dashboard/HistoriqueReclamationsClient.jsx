import React, { useEffect, useState } from "react";
import ApiService from "../../Api/Api";
import { format } from "date-fns";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import { Toaster, toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const statusColors = {
  en_attente: "bg-yellow-100 text-yellow-700",
  en_cours: "bg-blue-100 text-blue-700",
  resolu: "bg-green-100 text-green-700",
};

const HistoriqueReclamationsClient = () => {
  const [reclamations, setReclamations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImages, setSelectedImages] = useState([]);
  const [showImagesModal, setShowImagesModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReclamations = async () => {
      try {
        const res = await ApiService.getMesReclamations();
        setReclamations(Array.isArray(res.data) ? res.data : res.data.results || []);
      } catch (error) {
        console.error(error);
        toast.error("Erreur lors du chargement ❌");
      } finally {
        setLoading(false);
      }
    };
    fetchReclamations();
  }, []);

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Voulez-vous vraiment supprimer cette réclamation ?");
    if (!confirmed) return;

    try {
      await ApiService.deleteReclamation(id);
      toast.success("Réclamation supprimée ✅");
      setReclamations((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      toast.error("Erreur lors de la suppression ❌");
    }
  };

  return (
    <div className="pt-24 px-6 w-full">
      <Toaster />
      <div className="bg-white rounded-xl shadow p-6 w-full">
        <h2 className="text-2xl font-bold text-blue-600 mb-6 text-center">
          Mes Réclamations
        </h2>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 size={32} className="animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto text-sm text-left text-gray-800">
              <thead className="bg-gray-100 text-xs uppercase">
                <tr>
                  <th className="px-4 py-2">Sujet</th>
                  <th className="px-4 py-2">Message</th>
                  <th className="px-4 py-2">Images</th>
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">Statut</th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reclamations.map((rec) => (
                  <tr key={rec.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2">{rec.sujet}</td>
                    <td className="px-4 py-2">{rec.message}</td>
                    <td className="px-4 py-2">
                      {rec.images && rec.images.length > 0 ? (
                        <button
                          onClick={() => {
                            setSelectedImages(rec.images);
                            setShowImagesModal(true);
                          }}
                          className="text-blue-600 underline hover:text-blue-800 text-sm"
                        >
                          Voir les photos ({rec.images.length})
                        </button>
                      ) : (
                        <span className="text-gray-400 italic">Aucune</span>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      {format(new Date(rec.date_envoi), "dd/MM/yyyy HH:mm")}
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          statusColors[rec.statut] || "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {rec.statut.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-2 flex gap-2">
                      <button
                        onClick={() => navigate(`/reclamations/${rec.id}/edit`)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Modifier"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(rec.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Supprimer"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {reclamations.length === 0 && (
              <p className="text-center text-gray-500 mt-6">
                Aucune réclamation envoyée pour le moment.
              </p>
            )}
          </div>
        )}

        {showImagesModal && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-30 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow max-w-3xl w-full">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Photos jointes</h3>
              <div className="flex flex-wrap gap-3">
                {selectedImages.map((img, idx) => (
                  <a
                    key={idx}
                    href={img.image}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      src={img.image}
                      alt={`image-${idx}`}
                      className="w-28 h-28 object-cover rounded border hover:scale-105 transition"
                    />
                  </a>
                ))}
              </div>
              <div className="text-right mt-6">
                <button
                  onClick={() => setShowImagesModal(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoriqueReclamationsClient;