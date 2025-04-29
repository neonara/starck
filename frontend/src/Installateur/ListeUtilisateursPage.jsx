import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";
import { FaSort, FaSortUp, FaSortDown, FaEdit, FaTrash } from "react-icons/fa";
import { Toaster, toast } from "react-hot-toast";
import ApiService from "../Api/Api";
const ListeUtilisateursPage = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pageSize, setPageSize] = useState(5);

  useEffect(() => {
    const fetchUtilisateurs = async () => {
      try {
        const resClients = await ApiService.getMyClients();
        const resTechniciens = await ApiService.getTechnicien();
        const merged = [...resClients.data.results, ...resTechniciens.data.results];
        setData(merged);
      } catch (err) {
        console.error("Erreur chargement utilisateurs :", err);
        toast.error("Erreur chargement utilisateurs ❌");
      }
    };

    fetchUtilisateurs();
  }, []);

  const handleDelete = async (row) => {
    if (confirm(`Supprimer ${row.original.first_name} ${row.original.last_name} ?`)) {
      try {
        await ApiService.deleteUser(row.original.id);
        setData((prev) => prev.filter((u) => u.id !== row.original.id));
        toast.success("Utilisateur supprimé ✅");
      } catch (err) {
        if (err.response?.status === 404) {
          toast.error("Utilisateur introuvable ❌");
        } else {
          console.error("Erreur suppression utilisateur :", err);
          toast.error("Erreur lors de la suppression ❌");
        }
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
    {
      header: "Rôle",
      accessorKey: "role",
      cell: (info) => info.getValue()?.charAt(0).toUpperCase() + info.getValue()?.slice(1) || "—"
    },
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

  return (
    <div className="p-6 pt-28 bg-white rounded-xl shadow">
      <Toaster />
      <h2 className="text-xl font-bold mb-4">Mes Utilisateurs (Clients et Techniciens)</h2>

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

        <input
          type="text"
          placeholder="🔍 Rechercher..."
          value={globalFilter ?? ""}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="border px-3 py-1 rounded w-64 text-sm"
        />
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
              <tr key={row.id} className="hover:bg-gray-50">
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
    </div>
  );
};

export default ListeUtilisateursPage;
