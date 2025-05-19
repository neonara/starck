import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ApiService from "../../Api/Api";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";
import {
  FaSort,
  FaSortUp,
  FaSortDown,
  FaEdit,
  FaTrash,
  FaDownload,
  FaPlus,
} from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";

const statusColors = {
  en_attente: "bg-yellow-100 text-yellow-700",
  en_cours: "bg-blue-100 text-blue-700",
  terminee: "bg-green-100 text-green-700",
  annulee: "bg-red-100 text-red-700",
};

const ListeInterventionPage = () => {
  const [data, setData] = useState([]);
  const [pageSize, setPageSize] = useState(5);
  const [globalFilter, setGlobalFilter] = useState("");
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [statutFilter, setStatutFilter] = useState("");
  const [technicienFilter, setTechnicienFilter] = useState("");
  const [techniciensDisponibles, setTechniciensDisponibles] = useState([]);
  const [typeFilter, setTypeFilter] = useState("");
const [showModalExports, setShowModalExports] = useState(false);
const [exports, setExports] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchInterventions = async () => {
      try {
        const params = {
          statut: statutFilter || undefined,
          technicien: technicienFilter || undefined,
          type_intervention: typeFilter || undefined,
          search: globalFilter || undefined,
        };

        const res = await ApiService.getInterventions(params); 
        const interventions = res.data.results || res.data;

        if (Array.isArray(interventions)) {
          setData(interventions);

          const uniqueTechs = [
            ...new Map(
              interventions
                .map((interv) => {
                  const tech = interv.technicien_details || interv.technicien;
                  if (typeof tech === "object" && tech !== null) {
                    return [
                      tech.id,
                      {
                        id: tech.id,
                        nom: `${tech.first_name || ""} ${tech.last_name || ""}`.trim() || tech.email,
                      },
                    ];
                  }
                  return null;
                })
                .filter(Boolean)
            ).values(),
          ];
          setTechniciensDisponibles(uniqueTechs);
        } else {
          console.error("Les données reçues ne sont pas un tableau:", interventions);
          setData([]);
          setTechniciensDisponibles([]);
        }
      } catch (err) {
        console.error("Erreur lors du chargement des interventions", err);
        toast.error("Erreur de chargement ❌");
        setData([]);
        setTechniciensDisponibles([]);
      }
    };

    fetchInterventions();
  }, [ statutFilter, technicienFilter, typeFilter, globalFilter]);

const handleExportClick = async (format) => {
  setShowExportOptions(false);
  try {
    await ApiService.exportHistorique.exportInterventions({ format }); // 👈 utilise maintenant cette méthode
    toast.success(`Export ${format.toUpperCase()} lancé ✅`);
    setShowModalExports(true);
    setTimeout(() => loadExports(), 1000);
  } catch (err) {
    toast.error("Erreur export ❌");
  }
};


const loadExports = async () => {
  try {
    const res = await ApiService.exportHistorique.getExports();
    setExports(res.data.results.filter(e => e.nom.includes("interventions")));
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


  const columns = useMemo(
    () => [
      {
        header: "INSTALLATION",
        accessorKey: "installation",
        cell: (info) => {
          const installation =
            info.row.original.installation_details || info.row.original.installation;
          return typeof installation === "object" ? installation.nom || "—" : "—";
        },
      },
      {
        header: "TECHNICIEN",
        accessorKey: "technicien",
        cell: (info) => {
          const tech = info.row.original.technicien_details || info.row.original.technicien;
          if (typeof tech === "object" && tech !== null) {
            const nom = `${tech.first_name || ""} ${tech.last_name || ""}`.trim();
            return nom || tech.email || "—";
          }
          return "—";
        },
      },
      {
        header: "DATE PRÉVUE",
        accessorKey: "date_prevue",
        cell: (info) => {
          const date = info.getValue();
          return date ? new Date(date).toLocaleDateString() : "—";
        },
      },
      {
        header: "TYPE",
        accessorKey: "type_intervention",
        cell: (info) => {
          const type = info.getValue();
          switch (type) {
            case "diagnostic":
              return "Diagnostic";
            case "preventive":
              return "Préventive";
            case "curative":
              return "Curative";
            default:
              return "—";
          }
        }
      },

      {
        header: "STATUT",
        accessorKey: "statut",
        cell: (info) => (
          <span
            className={`px-2 py-1 rounded text-xs font-medium ${
              statusColors[info.getValue()] || "bg-gray-100 text-gray-700"
            }`}
          >
            {info.getValue() || "—"}
          </span>
        ),
      },
      {
        header: "ACTIONS",
        cell: ({ row }) => (
          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/modifier-intervention/${row.original.id}`)}
              className="text-blue-500 hover:text-blue-700"
            >
              <FaEdit />
            </button>
            <button
              onClick={async () => {
                const confirmed = window.confirm("Supprimer l'intervention ?");
                if (!confirmed) return;

                try {
                  await ApiService.deleteIntervention(row.original.id);
                  toast.success("Intervention supprimée ✅");
                  setData((prev) => prev.filter((item) => item.id !== row.original.id));
                } catch (err) {
                  console.error("Erreur suppression :", err);
                  toast.error("Erreur lors de la suppression ❌");
                }
              }}
              className="text-red-500 hover:text-red-700"
            >
              <FaTrash />
            </button>
          </div>
        ),
      },
    ],
    [navigate]
  );

  const table = useReactTable({
    data,
    columns,
    initialState: { pagination: { pageSize } },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    state: {},
  });

  useEffect(() => {
    table.setPageSize(pageSize);
  }, [pageSize]);

  return (
    <div className="pt-24 px-6 w-full">
      <Toaster />

       <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
        <div className="flex flex-wrap gap-2 items-center">
          <label className="text-sm text-gray-600">Afficher</label>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="border text-gray-500 rounded px-2 py-1 text-sm"
          >
            {[5, 10, 20].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>

        {/* Filtres et actions */}
<div className="flex flex-wrap justify-between items-center gap-4 mb-4">
          

          <select
            value={technicienFilter}
            onChange={(e) => setTechnicienFilter(e.target.value)}
            className="border text-gray-500 rounded px-2 py-1 text-sm"
          >
            <option value="">Tous les techniciens</option>
            {techniciensDisponibles.map((tech) => (
              <option key={tech.id} value={tech.id}>
                {tech.nom}
              </option>
            ))}
          </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="border text-gray-500 rounded px-2 py-1 text-sm"
        >
          <option value="">Tous les types</option>
          <option value="diagnostic">Diagnostic</option>
          <option value="preventive">Préventive</option>
          <option value="curative">Curative</option>
        </select>


          <input
            type="text"
            placeholder="🔍 Rechercher..."
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="border px-3 py-1 rounded w-64 text-sm"
          />

          <div className="relative">
            <button
              onClick={() => setShowExportOptions(!showExportOptions)}
              className="flex items-center gap-2 px-3 py-1 border rounded text-sm text-gray-700 hover:bg-gray-100"
            >
              <FaDownload /> Exporter
            </button>
            {showExportOptions && (
              <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow z-50">
              <button
    onClick={() => handleExportClick("pdf")}
    className="block w-full px-4 py-2 text-left hover:bg-gray-100"
  >
    Exporter en PDF
  </button>
  <button
    onClick={() => handleExportClick("xlsx")}
    className="block w-full px-4 py-2 text-left hover:bg-gray-100"
  >
    Exporter en Excel
  </button>
              </div>
            )}
          </div>

          <button
            onClick={() => navigate("/ajouter-intervention")}
            className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
          >
            <FaPlus /> Ajouter
          </button>
        </div>
      </div>

      {/* Tableau */}
      <div className="overflow-x-auto w-full mt-4">
        <div className="bg-white rounded-xl shadow p-6 w-full">
          <table className="w-full table-auto text-sm text-left text-gray-800">
            <thead className="bg-gray-100 text-xs uppercase">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                      className="px-4 py-2 cursor-pointer whitespace-nowrap"
                    >
                      <div className="flex items-center gap-1">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {header.column.getIsSorted() === "asc" ? (
                          <FaSortUp />
                        ) : header.column.getIsSorted() === "desc" ? (
                          <FaSortDown />
                        ) : (
                          <FaSort className="text-xs" />
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-gray-100">
              {table.getRowModel().rows.map((row) => (
                <tr 
                  key={row.id} 
                  className="hover:bg-gray-100 cursor-pointer"
                  onClick={(e) => {
                    if (!e.target.closest('button')) {
                      navigate(`/detaille-intervention/${row.original.id}`);
                    }
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-2 whitespace-nowrap">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-4 text-sm text-gray-700">
            <div>
              Page {table.getState().pagination.pageIndex + 1} sur{" "}
              {table.getPageCount()}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Précédent
              </button>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Suivant
              </button>
            </div>
          </div>
        </div>
      </div>
      {showModalExports && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded shadow w-[600px]">
      <h2 className="text-lg font-bold mb-4">📁 Historique d’exports – Interventions</h2>
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
      <p className="text-xs mt-4 text-gray-500">
        10 fichiers maximum sont conservés pendant 3 jours.
      </p>
      <div className="flex justify-end mt-4">
        <button
          className="px-4 py-1 border rounded text-gray-600 hover:bg-gray-100"
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

export default ListeInterventionPage;
