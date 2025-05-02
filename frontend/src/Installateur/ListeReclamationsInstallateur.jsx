import React, { useEffect, useMemo, useState } from "react";
import ApiService from "../Api/Api"; 
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";
import { Dialog } from "@headlessui/react";
import { FaSort, FaSortUp, FaSortDown, FaTrash } from "react-icons/fa";
import toast from "react-hot-toast";
import { format } from "date-fns";

const ListeReclamationsInstallateur = () => {
  const [data, setData] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pageSize, setPageSize] = useState(5);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await ApiService.getReclamationsInstallateur();
        setData(res.data.results || res.data); // gère pagination ou non
      } catch {
        toast.error("Erreur lors du chargement ❌");
      }
    };
    fetch();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Confirmer la suppression ?")) return;
    try {
      await ApiService.deleteReclamation(id);
      setData(prev => prev.filter(r => r.id !== id));
      toast.success("Supprimée ✅");
    } catch {
      toast.error("Erreur suppression ❌");
    }
  };

  const columns = useMemo(() => [
    { header: "Installation", accessorKey: "installation_nom" },
    { header: "Client", accessorKey: "client_email" },
    { header: "Sujet", accessorKey: "sujet" },
    { header: "Message", accessorKey: "message" },
    {
      header: "Date",
      accessorKey: "date_envoi",
      cell: info => format(new Date(info.getValue()), "dd/MM/yyyy HH:mm"),
    },
    {
      header: "Statut",
      accessorKey: "statut",
      cell: info => (
        <span className="text-sm px-2 py-1 rounded bg-gray-100">
          {info.getValue().replace("_", " ")}
        </span>
      ),
    },
    {
      header: "Action",
      cell: ({ row }) => (
        <button onClick={() => handleDelete(row.original.id)} className="text-red-600">
          <FaTrash />
        </button>
      ),
    },
  ], []);

  const table = useReactTable({
    data,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, _, val) =>
      Object.values(row.original).some(field =>
        String(field || "").toLowerCase().includes(val.toLowerCase())
      ),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize } },
  });

  return (
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <input
          value={globalFilter}
          onChange={e => setGlobalFilter(e.target.value)}
          placeholder="🔍 Rechercher..."
          className="border px-3 py-1 rounded w-64"
        />
        <select
          value={pageSize}
          onChange={e => setPageSize(Number(e.target.value))}
          className="border px-2 py-1 rounded"
        >
          {[5, 10, 20].map(n => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>

      <div className="overflow-auto bg-white rounded shadow">
        <table className="min-w-full text-sm text-left text-gray-700">
          <thead className="bg-gray-100">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className="px-4 py-2 cursor-pointer"
                  >
                    <div className="flex items-center gap-1">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {{ asc: <FaSortUp />, desc: <FaSortDown /> }[header.column.getIsSorted()] || <FaSort />}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(row => (
              <tr
                key={row.id}
                className="hover:bg-gray-100"
                onClick={() => setSelected(row.original)}
              >
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="px-4 py-2">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Détail modal */}
      <Dialog open={!!selected} onClose={() => setSelected(null)}>
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <Dialog.Panel className="bg-white p-6 rounded shadow w-full max-w-md">
            <Dialog.Title className="font-bold text-lg mb-2">Détail</Dialog.Title>
            {selected && (
              <div className="space-y-2 text-sm text-gray-700">
                <p><strong>Client :</strong> {selected.client_email}</p>
                <p><strong>Installation :</strong> {selected.installation_nom}</p>
                <p><strong>Sujet :</strong> {selected.sujet}</p>
                <p><strong>Message :</strong> {selected.message}</p>
                <p><strong>Date :</strong> {format(new Date(selected.date_envoi), "dd/MM/yyyy HH:mm")}</p>
                <p><strong>Statut :</strong> {selected.statut.replace("_", " ")}</p>
              </div>
            )}
            <div className="mt-4 flex justify-end">
              <button onClick={() => setSelected(null)} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
                Fermer
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};

export default ListeReclamationsInstallateur;
