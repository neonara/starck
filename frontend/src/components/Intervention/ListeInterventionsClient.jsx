import React, { useEffect, useMemo, useState } from "react";
import ApiService from "../../Api/Api";
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
  en_attente: "bg-yellow-100 text-yellow-700",
  en_cours: "bg-blue-100 text-blue-700",
  termine: "bg-green-100 text-green-700",
  annulee: "bg-red-100 text-red-700",
};

const ListeInterventionsClient = () => {
  const [data, setData] = useState([]);
  const [pageSize, setPageSize] = useState(5);
  const [globalFilter, setGlobalFilter] = useState("");
  const [statutFilter, setStatutFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await ApiService.getInterventionsClient();
        let results = Array.isArray(res.data) ? res.data : res.data.results || [];

        if (statutFilter) results = results.filter(i => i.statut === statutFilter);
        if (typeFilter) results = results.filter(i => i.type_intervention === typeFilter);
        if (globalFilter) {
          const search = globalFilter.toLowerCase();
          results = results.filter(i =>
            i.installation_details?.nom?.toLowerCase().includes(search) ||
            i.description?.toLowerCase().includes(search) ||
            i.statut?.toLowerCase().includes(search)
          );
        }

        setData(results);
      } catch (err) {
        toast.error("Erreur de chargement des interventions");
      }
    };

    fetchData();
  }, [globalFilter, statutFilter, typeFilter]);

  const columns = useMemo(() => [
    {
      header: "Installation",
      accessorKey: "installation_details.nom",
      cell: (info) => info.getValue() || "Non spécifiée",
    },
    {
      header: "Type",
      accessorKey: "type_intervention",
    },
    {
      header: "Date prévue",
      accessorKey: "date_prevue",
      cell: (info) => new Date(info.getValue()).toLocaleString(),
    },
    {
      header: "Statut",
      accessorKey: "statut",
      cell: (info) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${statutColors[info.getValue()] || "bg-gray-100 text-gray-700"}`}>
          {info.getValue()}
        </span>
      ),
    },
    {
      header: "Description",
      accessorKey: "description",
      cell: (info) => info.getValue() || "-",
    }
  ], []);

  const table = useReactTable({
    data,
    columns,
    initialState: { pagination: { pageSize } },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  useEffect(() => {
    table.setPageSize(pageSize);
  }, [pageSize]);

  return (
    <div className="pt-24 px-6 w-full">
      <Toaster />

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <div className="flex gap-2 items-center">
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
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="border rounded text-gray-600 px-2 py-1 text-sm">
            <option value="">Tous les types</option>
            <option value="preventif">Préventif</option>
            <option value="correctif">Correctif</option>
            <option value="diagnostic">Diagnostic</option>
          </select>

          <select value={statutFilter} onChange={(e) => setStatutFilter(e.target.value)} className="border rounded text-gray-600 px-2 py-1 text-sm">
            <option value="">Tous les statuts</option>
            <option value="en_attente">En attente</option>
            <option value="en_cours">En cours</option>
            <option value="termine">Terminé</option>
            <option value="annulee">Annulée</option>
          </select>

          <input
            type="text"
            placeholder="🔍 Rechercher..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="border px-3 py-1 rounded w-64 text-sm"
          />
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
                        {{ asc: <FaSortUp />, desc: <FaSortDown /> }[header.column.getIsSorted()] || <FaSort className="text-xs" />}
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

          {/* Pagination */}
          <div className="flex justify-between items-center mt-4 text-sm text-gray-700">
            <div>
              Page {table.getState().pagination.pageIndex + 1} sur {table.getPageCount()}
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

export default ListeInterventionsClient;
