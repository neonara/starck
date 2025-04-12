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
import { FaSort, FaSortUp, FaSortDown, FaEdit, FaTrash, FaDownload, FaPlus } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";

const statusColors = {
  active: "bg-green-100 text-green-700",
  "maintenance": "bg-orange-100 text-orange-700",
  inactive: "bg-red-100 text-red-700",
  fault: "bg-red-200 text-red-800"
};

const ListeInstallationPage = () => {

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
      const params = {}; 
    
      if (globalFilter) params.nom = globalFilter;
      if (statutFilter) params.etat = statutFilter;
      if (villeFilter) params.ville = villeFilter;
    
      try {
        const res = await ApiService.getInstallations({ params });
        setData(res.data);
    
        const villes = [...new Set(res.data.map(inst => inst.ville).filter(Boolean))];
        setVillesDisponibles(villes);
      } catch (err) {
        console.error("Erreur lors du chargement des installations", err);
        toast.error("Erreur de chargement ❌");
      }
    };
    
  
    fetchInstallations();
  }, [globalFilter, statutFilter, villeFilter]);
  
  //  Gestion des exports
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

  useEffect(() => {
    if (showModalExports) loadExports();
  }, [showModalExports]);

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
        cell: (info) => new Date(info.getValue()).toLocaleDateString()
      },
      {
        header: "Fin de garantie",
        accessorKey: "expiration_garantie",
        cell: (info) => info.getValue() ? new Date(info.getValue()).toLocaleDateString() : "—"
      },
      {
        header: "Référence contrat",
        accessorKey: "reference_contrat"
      }
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
          <button
            onClick={async () => {
              const confirmed = window.confirm(`Supprimer l'installation "${row.original.nom}" ?`);
              if (!confirmed) return;
    
              try {
                await ApiService.deleteInstallation(row.original.id);
                toast.success("Installation supprimée ✅");
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
          <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} className="border rounded px-2 py-1 text-sm">
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
  className="border rounded px-2 py-1 text-sm"
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
  className="border rounded px-2 py-1 text-sm"
>
  <option value="">Toutes les villes</option>
  {villesDisponibles.map((ville) => (
    <option key={ville} value={ville}>{ville}</option>
  ))}
</select>


          <input
            type="text"
            placeholder="🔍 Rechercher..."
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="border px-3 py-1 rounded w-64 text-sm"
          />
          <div className="relative">
            <button onClick={() => setShowExportOptions(!showExportOptions)} className="flex items-center gap-2 px-3 py-1 border rounded text-sm text-gray-700 hover:bg-gray-100">
              <FaDownload /> Télécharger
            </button>
            {showExportOptions && (
              <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow z-50">
                <button onClick={() => handleExportClick("csv")} className="block w-full px-4 py-2 text-left hover:bg-gray-100">Exporter en CSV</button>
                <button onClick={() => handleExportClick("xlsx")} className="block w-full px-4 py-2 text-left hover:bg-gray-100">Exporter en Excel</button>
              </div>
            )}
          </div>

          <button
            onClick={() => navigate("/ajouter-installation")}
            className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
          >
            <FaPlus /> Ajouter
          </button>
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
      </div>
      </div>
    </div>
  );
};

export default ListeInstallationPage;
