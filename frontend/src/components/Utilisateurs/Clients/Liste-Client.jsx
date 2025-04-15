import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";
import { FaSort, FaSortUp, FaSortDown, FaEdit, FaTrash, FaDownload, FaPlus } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";
import ApiService from "../../../Api/Api";

const ListeClientsPage = () => {
  const navigate = useNavigate();
  const [exportFormat, setExportFormat] = useState("csv");
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [showModalExports, setShowModalExports] = useState(false);
  const [exports, setExports] = useState([]);
  const [data, setData] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({ role: "", is_active: "" });

  const [pageSize, setPageSize] = useState(5);

  //  Charger les utilisateurs
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const params = {
          search: globalFilter,
          role: filters.role || undefined,
          is_active: filters.is_active || undefined,
        };
        const res = await ApiService.getAllUsers(params);
        setUsers(res.data.results);
        setData(res.data.results);
      } catch (err) {
        console.error("❌ Erreur chargement utilisateurs :", err);
      }
    };
  
    fetchUsers();
  }, [globalFilter, filters]);

  //  Charger les exports(historique)
  const loadExports = async () => {
    try {
      const res = await ApiService.exportHistorique.getExports();
      const result = Array.isArray(res.data.results) ? res.data.results : [];
      setExports(result);
    } catch (err) {
      console.error("❌ Erreur chargement exports", err);
      setExports([]);
    }
  };

  const handleExportClick = async (format) => {
    setExportFormat(format);
    setShowExportOptions(false);
    try {
      await ApiService.exportHistorique.creerExportGlobalUtilisateurs({ format });
      toast.success(`Export ${format.toUpperCase()} lancé ✅`);
      setShowModalExports(true);
      setTimeout(() => loadExports(), 1000);
    } catch (err) {
      toast.error("Erreur lors de l’export ❌");
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

  // Suppression utilisateur
  const handleDelete = async (row) => {
    if (confirm(`Supprimer ${row.original.first_name} ${row.original.last_name} ?`)) {
      try {
        await ApiService.deleteUser(row.original.id); 
        setData((prev) => prev.filter((u) => u.id !== row.original.id)); // 🔥 on met à jour localement
        toast.success("Utilisateur supprimé ✅");
      } catch (err) {
        console.error("Erreur suppression utilisateur :", err);
        toast.error("Erreur lors de la suppression ❌");
      }
    }
  };
  

  const columns = useMemo(() => [
    { header: "Prénom", accessorKey: "first_name" },
    { header: "Nom", accessorKey: "last_name" },
    { header: "Email", accessorKey: "email" },
    {
      header: "Téléphone",
      accessorKey: "phone_number",
      cell: (info) => info.getValue() || "—"
    },
    { header: "Rôle", accessorKey: "role" },
    {
      header: "Dernière connexion",
      accessorKey: "last_login",
      cell: (info) =>
        info.getValue()
          ? new Date(info.getValue()).toLocaleString()
          : "—",
    },
    {
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/modifier-client/${row.original.id}`)}
            className="text-blue-500 hover:text-blue-700"
          >
            <FaEdit />
          </button>
          <button
  onClick={() => handleDelete(row)}
  className="text-red-500 hover:text-red-700"
>
  <FaTrash />
</button>
        </div>
      ),
    },
  ], []);

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

  return (
    <div className="p-6 pt-28 bg-white rounded-xl shadow">
      <Toaster />

      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2 items-center">
          <label className="text-sm text-gray-600">Afficher</label>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="border rounded px-2 py-1 text-sm"
          >
            {[5, 10, 20].map((size) => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
          <span className="text-sm text-gray-600">entrées</span>
        </div>

        <div className="flex gap-4 items-center">
          <input
            type="text"
            placeholder="🔍 Rechercher..."
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="border px-3 py-1 rounded w-64 text-sm"
          />
          <div className="flex gap-2 items-center">
  <label className="text-sm text-gray-600">Rôle</label>
  <select
    className="border rounded px-2 py-1 text-sm"
    value={filters.role}
    onChange={(e) => setFilters((prev) => ({ ...prev, role: e.target.value }))}
  >
    <option value="">Tous</option>
    <option value="admin">Admin</option>
    <option value="installateur">Installateur</option>
    <option value="technicien">Technicien</option>
    <option value="client">Client</option>
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
                  onClick={(e) => { e.preventDefault(); handleExportClick("csv"); }}
                  className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                >
                  Exporter en CSV
                </button>
                <button
                  onClick={(e) => { e.preventDefault(); handleExportClick("xlsx"); }}
                  className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                >
                  Exporter en Excel
                </button>
              </div>
            )}
          </div>
          <button
            onClick={() => navigate("/user-management")}
            className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
          >
            <FaPlus /> Ajouter
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left text-gray-800">
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
                  navigate(`/dashboard-client/${row.original.id}`);
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

      {/* Modale des exports */}
      {showModalExports && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-[600px]">
            <h2 className="text-lg font-bold mb-4">Tâches</h2>
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left py-2 px-3">Nom de la tâche</th>
                  <th className="text-left py-2 px-3">Créé le</th>
                  <th className="text-left py-2 px-3">État/Opération</th>
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
              10 fichiers maximum enregistrés pendant 3 jours.
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

export default ListeClientsPage;
