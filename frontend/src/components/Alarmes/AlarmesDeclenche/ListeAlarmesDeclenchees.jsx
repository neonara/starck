import React, { useEffect, useState } from "react";
import ApiService from "../../../Api/Api";
import toast from "react-hot-toast";
import { FaCheck, FaDownload, FaTimes, FaEye, FaTrash  } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const graviteLabels = {
  critique: "🔴 Critique",
  majeure: "🟡 Majeure",
  mineure: "🟢 Mineure",
};

const ListeAlarmesDeclenchees = () => {
  const [alarmList, setAlarmList] = useState([]);
  const [activeGravite, setActiveGravite] = useState("all");
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [exports, setExports] = useState([]);
  const [modalData, setModalData] = useState(null);
  const [showModalExports, setShowModalExports] = useState(false);
  const [exportFormat, setExportFormat] = useState("csv");
  const navigate = useNavigate();

  const fetchAlarmes = async () => {
    try {
      const res = await ApiService.getAlarmesDeclenchees();
      setAlarmList(res.data.results);
    } catch (err) {
      toast.error("Erreur chargement alarmes ❌");
    }
  };

  useEffect(() => {
    fetchAlarmes();
  }, []);

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
    setExportFormat(format);
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
      toast.success("Fichier supprimé");
    } catch {
      toast.error("Erreur suppression");
    }
  };


  const filteredByGravite =
    activeGravite === "all"
      ? alarmList
      : alarmList.filter((a) => a.gravite === activeGravite);

  const gravites = ["all", "critique", "majeure", "mineure"];

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

        {/* Export Button */}
        <div className="relative">
          <button
            onClick={() => setShowExportOptions(!showExportOptions)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            <FaDownload /> Exporter
          </button>
          {showExportOptions && (
            <div className="absolute right-0 mt-2 bg-white border rounded shadow z-50">
              <button
                onClick={() => handleExportClick("csv")}
                className="block px-4 py-2 w-full hover:bg-gray-100 text-left"
              >
                Export CSV
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
  className={`border rounded p-4 mb-2 flex justify-between items-center shadow-sm cursor-pointer hover:bg-gray-50 ${
    a.est_resolue ? "bg-green-50" : "bg-white"
  }`}
>


          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={a.est_resolue}
              onChange={() => markAsResolved(a.id)}
              disabled={a.est_resolue}
              className="h-4 w-4"
            />
            <div>
              <p className="font-semibold">{a.installation_nom}</p>
              <p className="text-sm text-gray-600">Code : {a.code_constructeur}</p>
              <p className="text-xs text-gray-500">{new Date(a.date_declenchement).toLocaleString()}</p>
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <span
              className={`text-xs px-3 py-1 rounded-full font-medium ${
                a.est_resolue
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {a.est_resolue ? "Résolue" : "Non résolue"}
            </span>
            <button onClick={() => setModalData(a)} className="text-blue-600">
              <FaEye />
            </button>
          </div>
        </div>
      ))}

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


export default ListeAlarmesDeclenchees;
