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
  active: "bg-green-100 text-green-700",
  maintenance: "bg-orange-100 text-orange-700",
  inactive: "bg-red-100 text-red-700",
  fault: "bg-red-200 text-red-800",
};

const ListeInstallationPage = () => {
  const [data, setData] = useState([]);
  const [pageSize, setPageSize] = useState(5);
  const [globalFilter, setGlobalFilter] = useState("");
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [showModalExports, setShowModalExports] = useState(false);
  const [exports, setExports] = useState([]);
  const [exportFormat, setExportFormat] = useState("csv");
  const [statutFilter, setStatutFilter] = useState("");
  const [villeFilter, setVilleFilter] = useState("");
  const [villesDisponibles, setVillesDisponibles] = useState([]);
  const [showMore, setShowMore] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchInstallations = async () => {
      const params = {};
      if (globalFilter) params.nom = globalFilter;
      if (statutFilter) params.etat = statutFilter;
      if (villeFilter) params.ville = villeFilter;

      try {
        const res = await ApiService.getInstallations({ params });
        setData(res.data);
        const villes = [...new Set(res.data.map((inst) => inst.ville).filter(Boolean))];
        setVillesDisponibles(villes);
      } catch (err) {
        console.error("Erreur lors du chargement des installations", err);
        toast.error("Erreur de chargement ❌");
      }
    };
    fetchInstallations();
  }, [globalFilter, statutFilter, villeFilter]);

  const loadExports = async () => {
    try {
      const res = await ApiService.exportHistorique.getExports();
      setExports(Array.isArray(res.data.results) ? res.data.results : []);
    } catch (err) {
      console.error("Erreur chargement des exports", err);
    }
  };

  const handleDeleteExport = async (id) => {
    try {
      await ApiService.exportHistorique.deleteExport(id);
      toast.success("Fichier supprimé ✅");
      loadExports();
    } catch (err) {
      toast.error("Erreur suppression ❌");
    }
  };

  const handleExportClick = async (format) => {
    setExportFormat(format);
    setShowExportOptions(false);
    try {
      await ApiService.exportHistorique.creerExportGlobal({ format });
      toast.success(`Export ${format.toUpperCase()} lancé ✅`);
      setShowModalExports(true);
      loadExports();
    } catch (err) {
      toast.error("Erreur lors de l’export ❌");
    }
  };

  const baseColumns = [
    { header: "Nom", accessorKey: "nom" },
    { header: "Adresse", accessorKey: "adresse" },
    { header: "Capacité (kW)", accessorKey: "capacite_kw" },
    { header: "Ville", accessorKey: "ville" },
    {
      header: "État",
      accessorKey: "statut",
      cell: (info) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[info.getValue()] || "bg-gray-100 text-gray-700"}`}>
          {info.getValue()}
        </span>
      ),
    },
    {
      header: "Client",
      accessorKey: "client",
      cell: (info) => {
        const val = info.getValue();
        return val ? `${val.first_name ?? ""} ${val.last_name ?? ""}` : "—";
      },
    },
    {
      header: "Installateur",
      accessorKey: "installateur",
      cell: (info) => {
        const val = info.getValue();
        return val ? `${val.first_name ?? ""} ${val.last_name ?? ""}` : "—";
      },
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
    {
      header: "Fin de garantie",
      accessorKey: "expiration_garantie",
      cell: (info) => info.getValue() ? new Date(info.getValue()).toLocaleDateString() : "—",
    },
    { header: "Type de contract", accessorKey: "type_contrat" },
  ];

  const actions = {
    header: "Actions",
    cell: ({ row }) => (
      <div className="flex gap-2">
        <button onClick={() => navigate(`/modifier-installation/${row.original.id}`)} className="text-blue-500 hover:text-blue-700">
          <FaEdit />
        </button>
        <button onClick={async () => {
          if (!window.confirm(`Supprimer l'installation "${row.original.nom}" ?`)) return;
          try {
            await ApiService.deleteInstallation(row.original.id);
            toast.success("Installation supprimée ✅");
            setData(prev => prev.filter(item => item.id !== row.original.id));
          } catch {
            toast.error("Erreur lors de la suppression ❌");
          }
        }} className="text-red-500 hover:text-red-700">
          <FaTrash />
        </button>
      </div>
    ),
  };

  const columns = useMemo(() => showMore ? [...baseColumns, ...moreColumns, actions] : [...baseColumns, actions], [showMore]);

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
    <div className="p-6 pt-24 bg-white rounded-xl shadow">
      <Toaster />
            <div className="mb-1 flex justify-end">
        <button onClick={() => setShowMore(!showMore)} className="text-sm text-blue-600 hover:underline">
          {showMore ? "📂 Réduire les colonnes" : "📂 Afficher plus de colonnes"}
        </button>
      </div>

      <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
        <div className="flex flex-wrap gap-2 items-center">
          <label className="text-sm text-gray-600">Afficher</label>
          <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} className="border rounded px-2 py-1 text-sm">
            {[5, 10, 20].map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
          <span className="text-sm text-gray-600">entrées</span>
        </div>
<div className="flex flex-wrap justify-between items-center gap-4 mb-4">
          <select value={statutFilter} onChange={(e) => setStatutFilter(e.target.value)} className="border rounded px-2 py-1 text-sm">
            <option value="">Tous les statuts</option>
            <option value="active">Actif</option>
            <option value="maintenance">En maintenance</option>
            <option value="inactive">Inactif</option>
            <option value="fault">fault </option>
          </select>
          <select value={villeFilter} onChange={(e) => setVilleFilter(e.target.value)} className="border rounded px-2 py-1 text-sm">
            <option value="">Toutes les villes</option>
            {villesDisponibles.map((ville) => (
              <option key={ville} value={ville}>{ville}</option>
            ))}
          </select>

          <input type="text" placeholder="🔍 Rechercher..." value={globalFilter ?? ""} onChange={(e) => setGlobalFilter(e.target.value)} className="border px-3 py-1 rounded w-64 text-sm" />
  <div className="flex gap-2 items-center">

          <div className="relative">
            <button onClick={() => setShowExportOptions(!showExportOptions)} className="flex items-center gap-2 px-3 py-1 border rounded text-sm text-gray-700 hover:bg-gray-100">
              <FaDownload /> Exporter
            </button>
            {showExportOptions && (
              <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow z-50">
                <button onClick={() => handleExportClick("pdf")} className="block w-full px-4 py-2 text-left hover:bg-gray-100">Exporter en PDF</button>
                <button onClick={() => handleExportClick("xlsx")} className="block w-full px-4 py-2 text-left hover:bg-gray-100">Exporter en Excel</button>
              </div>
            )}
          </div>
          <button onClick={() => navigate("/ajouter-installation")} className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
            <FaPlus /> Ajouter
          </button>
        </div>
      </div>
      </div>


      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left text-gray-800">
          <thead className="bg-gray-100 text-xs uppercase">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} onClick={header.column.getToggleSortingHandler()} className="px-4 py-2 cursor-pointer whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {{ asc: <FaSortUp />, desc: <FaSortDown /> }[header.column.getIsSorted()] || <FaSort className="text-xs" />}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-gray-100">
            {table.getPaginationRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-100 cursor-pointer" onClick={(e) => {
                if (e.target.closest("button")) return;
                navigate(`/dashboard-installation/${row.original.id}`);
              }}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-2 whitespace-nowrap">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-between text-sm items-center">
        <span>
          Affichage de {data.length > 0 ? table.getPaginationRowModel().rows[0]?.index + 1 : 0} à {data.length > 0 ? table.getPaginationRowModel().rows[table.getPaginationRowModel().rows.length - 1]?.index + 1 : 0} sur {data.length} entrées
        </span>
        <div className="space-x-2">
          <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} className="px-3 py-1 rounded border text-gray-600 disabled:opacity-50">
            Précédent
          </button>
          <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} className="px-3 py-1 rounded border text-gray-600 disabled:opacity-50">
            Suivant
          </button>
        </div>
      </div>

      {showModalExports && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-[600px] max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold mb-4">📁 Historique des exports</h2>
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left py-2 px-3">Nom de la tâche</th>
                  <th className="text-left py-2 px-3">Créé le</th>
                  <th className="text-left py-2 px-3">Opération</th>
                </tr>
              </thead>
              <tbody>
                {exports.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center py-4 text-gray-500">
                      Aucun export disponible
                    </td>
                  </tr>
                ) : (
                  exports.map((exp) => (
                    <tr key={exp.id} className="hover:bg-gray-50">
                      <td className="py-2 px-3">{exp.nom}</td>
                      <td className="py-2 px-3">{new Date(exp.date_creation).toLocaleString()}</td>
                      <td className="py-2 px-3 flex gap-3 items-center">
                        <a href={exp.fichier} download>
                          <FaDownload className="text-blue-600 cursor-pointer" />
                        </a>
                        <FaTrash className="text-red-500 cursor-pointer" onClick={() => handleDeleteExport(exp.id)} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <p className="text-xs mt-4 text-gray-500">
              10 fichiers maximum sont conservés pendant 3 jours.
            </p>
            <div className="flex justify-end mt-4">
              <button onClick={() => setShowModalExports(false)} className="px-4 py-1 border rounded text-gray-600 hover:bg-gray-100">
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListeInstallationPage;
