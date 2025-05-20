import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ApiService from "../Api/Api";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";
import { FaSort, FaSortUp, FaSortDown, FaEdit, FaTrash, FaDownload, FaPlus } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";

const statusColors = {
  active: "bg-green-100 text-green-700",
  maintenance: "bg-orange-100 text-orange-700",
  inactive: "bg-red-100 text-red-700",
  fault: "bg-red-200 text-red-800",
};

const ListeInstallationsInstallateurPage = () => {
  const [data, setData] = useState([]);
  const [pageSize, setPageSize] = useState(5);
  const [globalFilter, setGlobalFilter] = useState("");
  const [showMore, setShowMore] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [showModalExports, setShowModalExports] = useState(false);
  const [exports, setExports] = useState([]);
  const [exportFormat, setExportFormat] = useState("csv");
  const [statutFilter, setStatutFilter] = useState("");
  const [villeFilter, setVilleFilter] = useState("");
  const [villesDisponibles, setVillesDisponibles] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchInstallations = async () => {
      try {
        const res = await ApiService.getInstallationsByInstallateur();
        let installations = res.data;

        if (globalFilter) {
          installations = installations.filter(inst =>
            inst.nom.toLowerCase().includes(globalFilter.toLowerCase())
          );
        }
        if (statutFilter) {
          installations = installations.filter(inst =>
            inst.statut === statutFilter
          );
        }
        if (villeFilter) {
          installations = installations.filter(inst =>
            inst.ville && inst.ville.toLowerCase().includes(villeFilter.toLowerCase())
          );
        }

        setData(installations);

        const villes = [...new Set(installations.map(inst => inst.ville).filter(Boolean))];
        setVillesDisponibles(villes);
      } catch (err) {
        console.error("Erreur lors du chargement des installations", err);
        toast.error("Erreur de chargement ❌");
      }
    };
    fetchInstallations();
  }, [globalFilter, statutFilter, villeFilter]);
const handleExportClick = async (format) => {
  setShowExportOptions(false);
  try {
    await ApiService.exportHistorique.exportInstallationsGlobal(format);

    toast.success(`Export ${format.toUpperCase()} lancé ✅`);
    setShowModalExports(true);
    setTimeout(() => loadExports(), 1000);
  } catch {
    toast.error("Erreur export ❌");
  }
};

const loadExports = async () => {
  try {
    const res = await ApiService.exportHistorique.getExports();
setExports(res.data.results.filter((e) => e.nom.includes("export-global")));
  } catch {
    toast.error("Erreur chargement exports ❌");
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

  const columns = useMemo(() => {
    const baseColumns = [
      { header: "Nom", accessorKey: "nom" },
      { header: "Adresse", accessorKey: "adresse" },
      { header: "Capacité (kW)", accessorKey: "capacite_kw" },
      { header: "Ville", accessorKey: "ville" },
      {
        header: "État",
        accessorKey: "statut",
        cell: (info) => (
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            statusColors[info.getValue()] || "bg-gray-100 text-gray-700"
          }`}>
            {info.getValue()}
          </span>
        ),
      },
    ];

    const moreColumns = [
      { header: "Latitude", accessorKey: "latitude" },
      { header: "Longitude", accessorKey: "longitude" },
      {
        header: "Date installation",
        accessorKey: "date_installation",
        cell: (info) => new Date(info.getValue()).toLocaleDateString(),
      },
    ];

    const actions = {
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/modifier-installation/${row.original.id}`)}
            className="text-blue-500 hover:text-blue-700"
          >
            <FaEdit />
          </button>
        </div>
      ),
    };

    return showMore ? [...baseColumns, ...moreColumns, actions] : [...baseColumns, actions];
  }, [showMore]);

  const table = useReactTable({
    data,
    columns,
    initialState: { pagination: { pageSize } },
    state: { globalFilter },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, columnId, filterValue) => {
      const value = row.getValue(columnId);
      return String(value).toLowerCase().includes(filterValue.toLowerCase());
    },
  });

  useEffect(() => {
    table.setPageSize(pageSize);
  }, [pageSize]);

  return (
    <div className="pt-24 px-6 w-full">
      <Toaster />

      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2 items-center">
          <label className="text-sm text-gray-600">Afficher</label>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="border text-gray-500 rounded px-2 py-1 text-sm"
          >
            {[5, 10, 20].map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
          <span className="text-sm text-gray-600">entrées</span>
        </div>

        <div className="flex gap-4 items-center">
          <select
            value={statutFilter}
            onChange={(e) => setStatutFilter(e.target.value)}
            className="border rounded text-gray-500 px-2 py-1 text-sm"
          >
            <option value="">Tous les statuts</option>
            <option value="active">Actif</option>
            <option value="maintenance">En maintenance</option>
            <option value="inactive">Inactif</option>
            <option value="fault">Défaillant</option>
          </select>

          <select
            value={villeFilter}
            onChange={(e) => setVilleFilter(e.target.value)}
            className="border rounded text-gray-500 px-2 py-1 text-sm"
          >
            <option value="">Toutes les villes</option>
            {villesDisponibles.map((ville) => (
              <option key={ville} value={ville}>{ville}</option>
            ))}
          </select>
<div className="relative">
  <button
    onClick={() => setShowExportOptions(!showExportOptions)}
    className="flex items-center gap-2 px-3 py-1 border rounded text-sm text-gray-700 hover:bg-gray-100"
  >
    <FaDownload /> Télécharger
  </button>
  {showExportOptions && (
    <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow z-50">
      <button
        type="button"
        onClick={() => handleExportClick("pdf")}
        className="block w-full px-4 py-2 text-left hover:bg-gray-100"
      >
        Exporter PDF
      </button>
      <button
        type="button"
        onClick={() => handleExportClick("xlsx")}
        className="block w-full px-4 py-2 text-left hover:bg-gray-100"
      >
        Exporter Excel
      </button>
    </div>
  )}
</div>

          <input
            type="text"
            placeholder="🔍 Rechercher..."
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="border text-gray-500 px-3 py-1 rounded w-64 text-sm"
          />
        </div>
      </div>

      <div className="mb-2">
        <button onClick={() => setShowMore(!showMore)} className="text-sm text-blue-600 hover:underline">
          {showMore ? "📂 Réduire les colonnes" : "📂 Afficher plus de colonnes"}
        </button>
      </div>

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
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {{
                          asc: <FaSortUp />,
                          desc: <FaSortDown />,
                        }[header.column.getIsSorted()] || <FaSort className="text-xs" />}
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
                    if (e.target.closest("button")) return;
                    navigate(`/dashboard-installation/${row.original.id}`);
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
<div className="mt-4 flex justify-between text-sm items-center">
  <span>
    Affichage de{" "}
    {data.length > 0 ? table.getRowModel().rows[0]?.index + 1 : 0} à{" "}
    {data.length > 0 ? table.getRowModel().rows[table.getRowModel().rows.length - 1]?.index + 1 : 0} sur {data.length} entrées
  </span>
  <div className="space-x-2">
    <button
      onClick={() => table.previousPage()}
      disabled={!table.getCanPreviousPage()}
      className="px-3 py-1 rounded border text-gray-600 disabled:opacity-50"
    >
      Précédent
    </button>
    <button
      onClick={() => table.nextPage()}
      disabled={!table.getCanNextPage()}
      className="px-3 py-1 rounded border text-gray-600 disabled:opacity-50"
    >
      Suivant
    </button>
  </div>
</div>

        </div>
      </div>
      {showModalExports && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
    <div className="bg-white p-6 rounded shadow w-[600px]">
      <h2 className="text-lg font-bold mb-4">📁 Historique d’exports – Installations</h2>
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
                <button
                  type="button"
                  onClick={() => {
                    const link = document.createElement("a");
                    link.href = exp.fichier;
                    link.setAttribute("download", exp.nom);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                >
                  <FaDownload className="text-blue-600 cursor-pointer" />
                </button>
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
          type="button"
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

export default ListeInstallationsInstallateurPage;
