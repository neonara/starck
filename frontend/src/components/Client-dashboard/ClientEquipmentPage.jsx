import React, { useState, useEffect } from "react";
import ApiService from "../../Api/Api";
import { toast } from "react-hot-toast";
import {
  FaSort,
  FaSortUp,
  FaSortDown,
  FaDownload,
} from "react-icons/fa";

const ClientEquipmentPage = () => {
  const [installation, setInstallation] = useState(null);
  const [equipments, setEquipments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [filterState, setFilterState] = useState("all");
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [showExportOptions, setShowExportOptions] = useState(false);

  // Charger l'installation du client
  useEffect(() => {
    const fetchInstallation = async () => {
      try {
        const response = await ApiService.getInstallationClient();
        console.log("Structure de response.data :", response.data);
        let dataToProcess = response.data;

        // Vérifier si data contient un champ 'results'
        if (dataToProcess.results && Array.isArray(dataToProcess.results)) {
          dataToProcess = dataToProcess.results;
        }

        if (
          dataToProcess &&
          (Array.isArray(dataToProcess) ? dataToProcess.length > 0 : Object.keys(dataToProcess).length > 0)
        ) {
          const installationData = Array.isArray(dataToProcess) ? dataToProcess[0] : dataToProcess;
          setInstallation(installationData);
          console.log("Installation trouvée :", installationData);
        } else {
          console.warn("Aucune installation trouvée dans la réponse :", response.data);
          toast.error("Aucune installation trouvée pour ce client");
          setInstallation(null);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération de l'installation :", error);
        toast.error("Erreur lors de la récupération de l'installation");
        setInstallation(null);
      }
    };
    fetchInstallation();
  }, []);

  // Charger les équipements de l'installation
  useEffect(() => {
    if (installation) {
      // Vérifier si l'installation a un ID
      if (!installation.id) {
        console.error("Erreur : Aucun ID trouvé pour l'installation :", installation);
        toast.error("Erreur : L'installation n'a pas d'ID. Veuillez contacter l'administrateur pour corriger l'API.");
        setEquipments([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      const fetchEquipments = async () => {
        try {
          const response = await ApiService.getEquipementsParInstallation(installation.id);
          console.log("Équipements récupérés :", response.data);
          setEquipments(response.data);
        } catch (error) {
          console.error("Erreur lors de la récupération des équipements :", error);
          toast.error("Erreur lors de la récupération des équipements");
          setEquipments([]);
        } finally {
          setLoading(false);
        }
      };
      fetchEquipments();
    } else {
      setEquipments([]);
    }
  }, [installation]);

  // Filtrer les équipements selon l'état
  const filteredEquipments = equipments.filter((equipement) => {
    if (filterState === "all") return true;
    return equipement.etat === filterState;
  });

  // Trier les équipements
  const sortedEquipments = [...filteredEquipments].sort((a, b) => {
    if (!sortColumn) return 0;
    const aValue = a[sortColumn] || "";
    const bValue = b[sortColumn] || "";
    if (sortDirection === "asc") {
      return String(aValue).localeCompare(String(bValue));
    }
    return String(bValue).localeCompare(String(aValue));
  });

  // Pagination
  const totalItems = sortedEquipments.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEquipments = sortedEquipments.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  // Exportation en CSV avec la date et l'heure actuelles
  const exportToCSV = () => {
    const currentDateTime = "13/05/2025, 23:51:00 CET"; // Date et heure actuelles fournies par le système
    const headers = [
      "État d'appareil",
      "Nom de l'appareil",
      "Nom de la centrale",
      "Type d'appareil",
    ];
    const rows = equipments.map((equipement) => [
      equipement.etat,
      equipement.nom,
      installation ? installation.nom : "Non défini",
      equipement.type_appareil.charAt(0).toUpperCase() +
        equipement.type_appareil.slice(1).replace("_", " "),
    ]);

    const csvContent = [
      `Exporté le : ${currentDateTime}`,
      "",
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `equipements_${currentDateTime.replace(/[:/]/g, "-")}.csv`
    );
    link.click();
    URL.revokeObjectURL(url);
  };

  const columns = [
    {
      header: "État d'appareil",
      accessorKey: "etat",
      cell: (equipement) => (
        <span
          className={
            equipement.etat === "actif"
              ? "text-green-600 font-medium"
              : "text-red-500 font-medium"
          }
        >
          {equipement.etat.charAt(0).toUpperCase() + equipement.etat.slice(1)}
        </span>
      ),
    },
    { header: "Nom de l'appareil", accessorKey: "nom" },
    {
      header: "Nom de la centrale",
      accessorKey: "installation.nom",
      cell: () => (installation ? installation.nom : "Non défini"),
    },
    {
      header: "Type d'appareil",
      accessorKey: "type_appareil",
      cell: (equipement) =>
        equipement.type_appareil.charAt(0).toUpperCase() +
        equipement.type_appareil.slice(1).replace("_", " "),
    },
  ];

  return (
    <div className="p-6 bg-white rounded-xl shadow">
      <h1 className="text-3xl font-semibold mb-6">État des équipements</h1>

      {/* Affichage du nom de l'installation */}
      {installation ? (
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Installation : <strong>{installation.nom}</strong>
          </p>
        </div>
      ) : (
        <p className="text-gray-500 mb-4">Aucune installation trouvée.</p>
      )}

      {/* Tableau des équipements */}
      {installation && (
        <>
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-2 items-center">
              <label className="text-sm text-gray-600">Afficher</label>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="border rounded px-2 py-1 text-sm"
              >
                {[5, 10, 20].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
              <span className="text-sm text-gray-600">entrées</span>
            </div>

            <div className="flex gap-4 items-center">
              <div className="flex gap-2 items-center">
                <label className="text-sm text-gray-600">État</label>
                <select
                  value={filterState}
                  onChange={(e) => {
                    setFilterState(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="border rounded px-2 py-1 text-sm"
                >
                  <option value="all">Tous</option>
                  <option value="actif">Actif</option>
                  <option value="inactif">Inactif</option>
                </select>
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowExportOptions(!showExportOptions)}
                  className="flex items-center gap-2 px-3 py-1 border rounded text-sm text-gray-700 hover:bg-gray-100"
                >
                  <FaDownload /> Télécharger
                </button>
                {showExportOptions && (
                  <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow z-50">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        exportToCSV();
                      }}
                      className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                    >
                      Exporter en CSV
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left text-gray-800">
              <thead className="bg-gray-100 text-xs uppercase">
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column.accessorKey || column.header}
                      onClick={() =>
                        column.accessorKey && handleSort(column.accessorKey)
                      }
                      className="px-4 py-2 cursor-pointer whitespace-nowrap"
                    >
                      <div className="flex items-center gap-1">
                        {column.header}
                        {column.accessorKey &&
                          sortColumn === column.accessorKey ? (
                          sortDirection === "asc" ? (
                            <FaSortUp />
                          ) : (
                            <FaSortDown />
                          )
                        ) : column.accessorKey && <FaSort className="text-xs" />}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="py-4 text-center text-gray-500">
                      Chargement des équipements...
                    </td>
                  </tr>
                ) : paginatedEquipments.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-4 text-center text-gray-500">
                      Aucune donnée
                    </td>
                  </tr>
                ) : (
                  paginatedEquipments.map((equipement) => (
                    <tr
                      key={equipement.id}
                      className="hover:bg-gray-100 cursor-pointer"
                    >
                      {columns.map((column) => (
                        <td key={column.header} className="px-4 py-2 whitespace-nowrap">
                          {column.cell
                            ? column.cell(equipement)
                            : column.accessorKey.includes(".")
                            ? equipement[column.accessorKey.split(".")[0]][
                                column.accessorKey.split(".")[1]
                              ]
                            : equipement[column.accessorKey]}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex justify-between text-sm items-center">
            <span>
              Affichage de {totalItems > 0 ? startIndex + 1 : 0} à{" "}
              {Math.min(startIndex + itemsPerPage, totalItems)} sur {totalItems}{" "}
              entrées
            </span>
            <div className="space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded border text-gray-600 disabled:opacity-50"
              >
                Précédent
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded border text-gray-600 disabled:opacity-50"
              >
                Suivant
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ClientEquipmentPage;
