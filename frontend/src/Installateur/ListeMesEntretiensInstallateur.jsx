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
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";

const statutColors = {
  planifie: "bg-yellow-100 text-yellow-700",
  en_cours: "bg-blue-100 text-blue-700",
  termine: "bg-green-100 text-green-700",
  annule: "bg-red-100 text-red-700",
};

const ListeMesEntretiensInstallateurPage = () => {
  const [data, setData] = useState([]);
  const [pageSize, setPageSize] = useState(5);
  const [globalFilter, setGlobalFilter] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEntretiens = async () => {
      try {
        const res = await ApiService.getMesEntretiensInstallateur();
        setData(res.data);
      } catch (err) {
        console.error("Erreur chargement entretiens", err);
        toast.error("Erreur de chargement ❌");
      }
    };
    fetchEntretiens();
  }, []);

  const columns = useMemo(() => [
    {
      header: "Installation",
      accessorKey: "installation_details.nom",
      cell: (info) => info.row.original.installation_details?.nom || "—",
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
      cell: (info) => info.getValue() ? new Date(info.getValue()).toLocaleString() : "—",
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

  useEffect(() => {
    table.setPageSize(pageSize);
  }, [pageSize]);

  return (
    <div className="pt-24 px-6 w-full">
      <Toaster />

      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2 items-center">
          <label className="text-sm text-gray-600">Afficher</label>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="border rounded px-2 py-1 text-gray-700 text-sm"
          >
            {[5, 10, 20].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-3 items-center">
          <input
            type="text"
            placeholder="🔍 Rechercher..."
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="border px-3 py-1 rounded w-64 text-sm"
          />
        </div>
      </div>

      {/* Table */}
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
                  onClick={() => navigate(`/details-entretien/${row.original.id}`)}
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
    </div>
  );
};

export default ListeMesEntretiensInstallateurPage;
