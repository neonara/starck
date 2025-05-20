import React, { useEffect, useState } from "react";
import ApiService from "../Api/Api";
import toast from "react-hot-toast";
import { FaDownload, FaEye, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const graviteLabels = {
  critique: "🔴 Critique",
  majeure: "🟠 Majeure",
  mineure: "🟢 Mineure",
};

const ListeAlarmesInstallateur = () => {
  const [alarmList, setAlarmList] = useState([]);
  const [activeGravite, setActiveGravite] = useState("all");
  const [modalData, setModalData] = useState(null);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [exports, setExports] = useState([]);
  const [showModalExports, setShowModalExports] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAlarmes();
  }, []);

  const fetchAlarmes = async () => {
    try {
      const res = await ApiService.getAlarmesInstallateur();
      setAlarmList(res.data.results || res.data);
    } catch {
      toast.error("Erreur chargement alarmes ❌");
    }
  };

  const markAsResolved = async (id) => {
    try {
      await ApiService.modifierAlarmeDeclenchee(id, { est_resolue: true });
      toast.success("✅ Marquée comme résolue");
      fetchAlarmes();
    } catch {
      toast.error("Erreur lors de la mise à jour ❌");
    }
  };

  const handleExportClick = async (format) => {
    setShowExportOptions(false);
    try {
      await ApiService.exportHistorique.exportAlarmesDeclenchees(format);
      toast.success(`Export ${format.toUpperCase()} lancé ✅`);
      setShowModalExports(true);
      setTimeout(() => loadExports(), 1000);
    } catch {
      toast.error("Erreur lors de l’export ❌");
    }
  };

  const loadExports = async () => {
    try {
      const res = await ApiService.exportHistorique.getExports();
      setExports(res.data.results.filter((e) => e.nom.includes("alarmes-declenchees")));
    } catch {
      toast.error("Erreur de chargement des exports");
    }
  };

  const handleDeleteExport = async (id) => {
    try {
      await ApiService.exportHistorique.deleteExport(id);
      loadExports();
      toast.success("Fichier supprimé ✅");
    } catch {
      toast.error("Erreur suppression ❌");
    }
  };

  const gravites = ["all", "critique", "majeure", "mineure"];
  const filteredByGravite = activeGravite === "all"
    ? alarmList
    : alarmList.filter((a) => a.gravite === activeGravite);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-3">
          {gravites.map((g) => (
            <button
              key={g}
              onClick={() => setActiveGravite(g)}
              className={`px-3 py-1 rounded-full text-sm font-medium border ${
                activeGravite === g
                  ? "bg-blue-100 border-blue-400 text-blue-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {g === "all" ? "Toutes" : graviteLabels[g]}
            </button>
          ))}
        </div>

        {/* Export */}
        <div className="relative">
          <button
            onClick={() => setShowExportOptions(!showExportOptions)}
            className="flex items-center gap-2 px-3 py-1 border rounded text-sm text-gray-700 hover:bg-gray-100"
          >
            <FaDownload /> Exporter
          </button>
          {showExportOptions && (
            <div className="absolute right-0 mt-2 bg-white border rounded shadow z-50">
              <button
                onClick={() => handleExportClick("pdf")}
                className="block px-4 py-2 w-full hover:bg-gray-100 text-left"
              >
                Export PDF
              </button>
              <button
                onClick={() => handleExportClick("xlsx")}
                className="block px-4 py-2 w-full hover:bg-gray-100 text-left"
              >
                Export Excel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Alarmes */}
      {filteredByGravite.map((a) => (
        <div
          key={a.id}
          onClick={() => {
            if (a.installation_id) {
              navigate(`/dashboard-installation/${a.installation_id}`);
            } else {
              toast.error("ID installation manquant");
            }
          }}
          className={`flex justify-between items-center rounded-lg border p-4 shadow-sm mb-3 transition hover:shadow-md hover:bg-gray-50 ${
            a.est_resolue ? "opacity-60 line-through" : "bg-white"
          }`}
        >
          <div className="flex items-start gap-4">
            <input
              type="checkbox"
              checked={a.est_resolue}
              onChange={() => markAsResolved(a.id)}
              disabled={a.est_resolue}
              className="mt-1 accent-blue-600 w-5 h-5"
            />
            <div>
              <p className="font-medium text-gray-800 text-base">{a.installation_nom}</p>
              <p className="text-sm text-gray-500">Code : {a.code_constructeur}</p>
              <div className="mt-1 flex items-center gap-3 text-xs text-gray-400">
                <span>📅 {new Date(a.date_declenchement).toLocaleDateString()}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-white font-semibold ${
                    a.gravite === "critique"
                      ? "bg-red-500"
                      : a.gravite === "majeure"
                      ? "bg-yellow-500"
                      : "bg-green-500"
                  }`}
                >
                  {a.gravite}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span
              className={`text-xs px-3 py-1 rounded-full font-medium ${
                a.est_resolue
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {a.est_resolue ? "Résolue" : "Non résolue"}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setModalData(a);
              }}
              className="text-blue-600 hover:text-blue-800"
            >
              <FaEye />
            </button>
          </div>
        </div>
      ))}

      {/* Modal alarme */}
      {modalData && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow w-[500px]">
            <h2 className="text-lg font-bold mb-2">Détail de l’alarme</h2>
            <p><strong>Installation:</strong> {modalData.installation_nom}</p>
            <p><strong>Code:</strong> {modalData.code_constructeur}</p>
            <p><strong>Gravité:</strong> {modalData.gravite}</p>
            <p><strong>Date:</strong> {new Date(modalData.date_declenchement).toLocaleString()}</p>
            <p><strong>Résolue:</strong> {modalData.est_resolue ? "Oui" : "Non"}</p>
            <div className="flex justify-end mt-4">
              <button
                className="border px-4 py-2 rounded"
                onClick={() => setModalData(null)}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Historique export */}
      {showModalExports && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow w-[600px]">
            <h2 className="text-lg font-bold mb-4">📁 Historique d’exports</h2>
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left py-2 px-3">Fichier</th>
                  <th className="text-left py-2 px-3">Créé le</th>
                  <th className="text-left py-2 px-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {exports.map((exp) => (
                  <tr key={exp.id} className="hover:bg-gray-50">
                    <td className="py-2 px-3">{exp.nom}</td>
                    <td className="py-2 px-3">{new Date(exp.date_creation).toLocaleString()}</td>
                    <td className="py-2 px-3 flex gap-2">
                      <a href={exp.fichier} download>
                        <FaDownload className="text-blue-600 cursor-pointer" />
                      </a>
                      <FaTrash
                        className="text-red-500 cursor-pointer"
                        onClick={() => handleDeleteExport(exp.id)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-end mt-4">
              <button
                className="px-4 py-1 border rounded"
                onClick={() => setShowModalExports(false)}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListeAlarmesInstallateur;
