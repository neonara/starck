import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ApiService from "../Api/Api";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";
import { Dialog } from "@headlessui/react";
import { FaSort, FaSortUp, FaSortDown, FaEdit,FaTrash } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";
import { format } from "date-fns";
 
const statusColors = {
  en_attente: "bg-yellow-100 text-yellow-700",
  en_cours: "bg-blue-100 text-blue-700",
  resolu: "bg-green-100 text-green-700",
};
 
const ListeReclamationsInstallateur = () => {
  const [data, setData] = useState([]);
  const [pageSize, setPageSize] = useState(5);
  const [globalFilter, setGlobalFilter] = useState("");
  const [selectedReclamation, setSelectedReclamation] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const navigate = useNavigate();
 
  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await ApiService.getReclamationsInstallateur();
        setData(res.data.results || res.data); 
      } catch {
        toast.error("Erreur lors du chargement ❌");
      }
    };
    fetch();
  }, []);
 
  const handleStatusUpdate = async () => {
    try {
      await ApiService.updateReclamation(selectedReclamation.id, {
        ...selectedReclamation,
        statut: newStatus,
      });
      toast.success("Statut mis à jour ✅");
      setShowDetail(false);
      const updated = data.map((item) =>
        item.id === selectedReclamation.id ? { ...item, statut: newStatus } : item
      );
      setData(updated);
    } catch (err) {
      toast.error("Erreur lors de la mise à jour ❌");
    }
  };
  const handleDelete = async (id) => {
    const confirmed = window.confirm("Voulez-vous vraiment supprimer cette réclamation ?");
    if (!confirmed) return;
  
    try {
      await ApiService.deleteReclamation(id);
      toast.success("Réclamation supprimée ✅");
      setData((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      toast.error("Erreur lors de la suppression ❌");
    }
  };
  
  const columns = useMemo(() => [
    {
      header: "Installation",
      accessorKey: "installation_nom", 
      cell: (info) => info.getValue() || "Non lié"
    },
    { header: "Client", accessorKey: "client_email" },
    { header: "Sujet", accessorKey: "sujet" },
    { header: "Message", accessorKey: "message" },
    {
      header: "Date",
      accessorKey: "date_envoi",
      cell: (info) => format(new Date(info.getValue()), "dd/MM/yyyy HH:mm"),
    },
    {
      header: "Statut",
      accessorKey: "statut",
      cell: (info) => (
<span
          className={`px-2 py-1 rounded text-xs font-medium ${
            statusColors[info.getValue()] || "bg-gray-100 text-gray-700"
          }`}
>
          {info.getValue().replace("_", " ")}
</span>
      ),
    },
    {
      header: "Action",
      cell: ({ row }) => (
        <div className="flex gap-2">
        <button
          onClick={() => navigate(`/reclamations/${row.original.id}/edit`)}
          className="text-blue-500 hover:text-blue-700"
        >
          <FaEdit />
        </button>
        <button
          onClick={() => handleDelete(row.original.id)}
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
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, columnId, filterValue) => {
      const search = filterValue.toLowerCase();
      const fields = ["client_email", "sujet", "message", "statut"];
      return fields.some(field => {
        const value = row.original[field];
        return value && String(value).toLowerCase().includes(search);
      });
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });
 
  useEffect(() => {
    table.setPageSize(pageSize);
  }, [pageSize]);
 
  return (
<div className="pt-24 px-6 w-full">
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
<option key={size} value={size}>
                {size}
</option>
            ))}
</select>
</div>
<input
          type="text"
          placeholder="🔍 Rechercher..."
          value={globalFilter ?? ""}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="border px-3 py-1 rounded w-64 text-sm"
        />
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
                  onClick={() => {
                    setSelectedReclamation(row.original);
                    setNewStatus(row.original.statut);
                    setShowDetail(true);
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
 
      <Dialog open={showDetail} onClose={() => setShowDetail(false)} className="fixed z-50 inset-0 overflow-y-auto">
<div className="flex items-center justify-center min-h-screen p-4">
<Dialog.Panel className="bg-white p-6 rounded shadow-lg max-w-md w-full">
<Dialog.Title className="text-lg font-semibold text-gray-700 mb-4">Détail de la réclamation</Dialog.Title>
            {selectedReclamation && (
<div className="space-y-3 text-gray-700 text-sm">
<p><strong>Client :</strong> {selectedReclamation.client_email}</p>
<p><strong>Installation :</strong> {selectedReclamation.installation_nom || "Non lié"}</p>
<p><strong>Sujet :</strong> {selectedReclamation.sujet}</p>
<p><strong>Message :</strong> {selectedReclamation.message}</p>
<p><strong>Date :</strong> {format(new Date(selectedReclamation.date_envoi), "dd/MM/yyyy HH:mm")}</p>
<div>
<label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
<select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full border text-gray-700 rounded px-3 py-2"
>
<option value="en_attente">En attente</option>
<option value="en_cours">En cours</option>
<option value="resolu">Résolu</option>
</select>
</div>
</div>
            )}
<div className="mt-4 flex justify-between">
<button
                onClick={() => setShowDetail(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 text-gray-700 rounded hover:bg-gray-400"
>
                Fermer
</button>
<button
                onClick={handleStatusUpdate}
                className="px-4 py-2 bg-green-600 text-white text-gray-700 rounded hover:bg-green-700"
>
                Enregistrer
</button>
</div>
</Dialog.Panel>
</div>
</Dialog>
</div>
  );
};
 
export default ListeReclamationsInstallateur;