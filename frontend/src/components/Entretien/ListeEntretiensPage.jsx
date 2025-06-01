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
  FaPlus,
  FaDownload
} from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";
 
const statutColors = {
  planifie: "bg-yellow-100 text-yellow-700",
  en_cours: "bg-blue-100 text-blue-700",
  termine: "bg-green-100 text-green-700",
  annule: "bg-red-100 text-red-700",
};
 
const ListeEntretiensPage = () => {
  const [data, setData] = useState([]);
  const [pageSize, setPageSize] = useState(5);
  const [globalFilter, setGlobalFilter] = useState("");
  const [statutFilter, setStatutFilter] = useState("");
  const [technicienFilter, setTechnicienFilter] = useState("");
  const [installationFilter, setInstallationFilter] = useState("");
  const [techniciens, setTechniciens] = useState([]);
  const [installations, setInstallations] = useState([]);
 const [showExportOptions, setShowExportOptions] = useState(false);
const [showModalExports, setShowModalExports] = useState(false);
const [exports, setExports] = useState([]);

  const navigate = useNavigate();
 
  useEffect(() => {
    const fetchEntretiens = async () => {
      try {
        const params = {};
        if (globalFilter) params.search = globalFilter;
        if (statutFilter) params.statut = statutFilter;
        if (technicienFilter) params.technicien_id = technicienFilter;
        if (installationFilter) params.installation_id = installationFilter;
 
        const res = await ApiService.getAllEntretiens(params);
        setData(res.data.results || res.data);
      } catch (err) {
        console.error("Erreur chargement entretiens", err);
        toast.error("Erreur de chargement ❌");
      }
    };
 
    fetchEntretiens();
  }, [globalFilter, statutFilter, technicienFilter, installationFilter]);
 
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const [techRes, instRes] = await Promise.all([
          ApiService.getTechnicien(),
          ApiService.getInstallations()
        ]);
        setTechniciens(techRes.data.results || techRes.data);
        setInstallations(instRes.data.results || instRes.data);
      } catch (err) {
        console.error("Erreur chargement filtres", err);
      }
    };
    loadFilters();
  }, []);
const handleExportClick = async (format) => {
  setShowExportOptions(false);
  try {
    await ApiService.exportHistorique.exportEntretiens(format);
    toast.success(`Export ${format.toUpperCase()} lancé ✅`);
    setShowModalExports(true);
    setTimeout(() => loadExports(), 1000);
  } catch (err) {
    console.error("Erreur export :", err);
    toast.error("Erreur export ❌");
  }
};

const loadExports = async () => {
  try {
    const res = await ApiService.exportHistorique.getExports();
    setExports(res.data.results.filter((e) => e.nom.includes("entretiens")));
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
 



  const columns = useMemo(() => [
    {
      header: "Installation",
      accessorKey: "installation_nom",
      cell: (info) => info.getValue() || "—",
    },
    {
      header: "Type",
      accessorKey: "type_entretien",
    },
    {
      header: "Début",
      accessorKey: "date_debut",
      cell: (info) => new Date(info.getValue()).toLocaleString(),
    },
    {
      header: "Fin",
      accessorKey: "date_fin",
      cell: (info) => new Date(info.getValue()).toLocaleString(),
    },
    {
      header: "Statut",
      accessorKey: "statut",
      cell: (info) => (
<span className={`px-2 py-1 rounded text-xs font-medium ${
          statutColors[info.getValue()] || "bg-gray-100 text-gray-700"
        }`}>
          {info.getValue()}
</span>
      ),
    },
    {
      header: "Technicien",
      accessorKey: "technicien_details",
      cell: (info) => {
        const val = info.getValue();
        return val ? `${val.first_name ?? ""} ${val.last_name ?? ""}` : "—";
      },
    },
    {
      header: "Actions",
      cell: ({ row }) => (
<div className="flex gap-2">
<button
            className="text-blue-600 hover:text-blue-800"
            onClick={() => navigate(`/modifier-entretien/${row.original.id}`)}>
<FaEdit />
</button>
<button
            className="text-red-600 hover:text-red-800"
            onClick={async () => {
              const confirmed = window.confirm("Supprimer cet entretien ?");
              if (!confirmed) return;
              try {
                await ApiService.deleteEntretien(row.original.id);
                toast.success("Entretien supprimé ✅");
                setData((prev) => prev.filter((item) => item.id !== row.original.id));
              } catch (err) {
                console.error("Erreur suppression :", err);
                toast.error("Erreur lors de la suppression ❌");
              }
            }}>
<FaTrash />
</button>
</div>
      ),
    },
  ], [navigate]);
 
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
 
    <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
        <div className="flex flex-wrap gap-2 items-center">
<label className="text-sm text-gray-600">Afficher</label>
<select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="border rounded px-2 text-gray-700 py-1 text-sm"
>
            {[5, 10, 20].map((size) => (
<option key={size} value={size}>{size}</option>
            ))}
</select>
</div>
 
        <div className="flex flex-wrap gap-3 items-center">
<select
            value={statutFilter}
            onChange={(e) => setStatutFilter(e.target.value)}
            className="border rounded px-2 py-1 text-gray-700 text-sm"
>
<option value="">Tous les statuts</option>
<option value="planifie">Planifié</option>
<option value="en_cours">En cours</option>
<option value="termine">Terminé</option>
<option value="annule">Annulé</option>
</select>
 
          <select
            value={technicienFilter}
            onChange={(e) => setTechnicienFilter(e.target.value)}
            className="border rounded px-2 py-1 text-gray-700 text-sm"
>
<option value="">Tous les techniciens</option>
            {techniciens.map((t) => (
<option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>
            ))}
</select>
 
          <select
            value={installationFilter}
            onChange={(e) => setInstallationFilter(e.target.value)}
            className="border rounded px-2 py-1 text-gray-700 text-sm"
>
<option value="">Toutes les installations</option>
            {installations.map((inst) => (
<option key={inst.id} value={inst.id}>{inst.nom}</option>
            ))}
</select>
 
          <input
            type="text"
            placeholder="🔍 Rechercher..."
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="border px-3 py-1 rounded w-64 text-sm"
          />
 
<div className="flex items-center gap-3 ml-auto">
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
            handleExportClick("pdf");
          }}
          className="block w-full px-4 py-2 text-left hover:bg-gray-100"
        >
          Exporter en PDF
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            handleExportClick("xlsx");
          }}
          className="block w-full px-4 py-2 text-left hover:bg-gray-100"
        >
          Exporter en Excel
        </button>
      </div>
    )}
  </div>

  <button
    onClick={() => navigate("/ajouter-entretien")}
    className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
  >
    <FaPlus /> Planifier
  </button>
</div>
</div>

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
                        {{ asc: <FaSortUp />, desc: <FaSortDown /> }[
                          header.column.getIsSorted()
                        ] || <FaSort className="text-xs" />}
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
                    navigate(`/details-entretien/${row.original.id}`);
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
<div className="mt-4 flex justify-between text-sm items-center">
  <span>
    Affichage de {data.length > 0 ? table.getPaginationRowModel().rows[0]?.index + 1 : 0}
    {" "}à{" "}
    {data.length > 0 ? table.getPaginationRowModel().rows[table.getPaginationRowModel().rows.length - 1]?.index + 1 : 0}
    {" "}sur {data.length} entrées
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
  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded shadow w-[600px]">
      <h2 className="text-lg font-bold mb-4">📁 Historique d’exports – Entretiens</h2>
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
 
export default ListeEntretiensPage;