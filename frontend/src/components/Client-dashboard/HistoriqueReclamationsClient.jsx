import React, { useEffect, useState } from "react";
import ApiService from "../../Api/Api";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { Toaster, toast } from "react-hot-toast";

const statusColors = {
  en_attente: "bg-yellow-100 text-yellow-700",
  en_cours: "bg-blue-100 text-blue-700",
  resolu: "bg-green-100 text-green-700",
};

const HistoriqueReclamationsClient = () => {
  const [reclamations, setReclamations] = useState([]); 
  const [loading, setLoading] = useState(true);

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
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reclamations.map((rec) => (
                  <tr key={rec.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2">{rec.sujet}</td>
                    <td className="px-4 py-2">{rec.message}</td>
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
      </div>
    </div>
  );
};

export default HistoriqueReclamationsClient;
