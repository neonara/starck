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
  planifie: "bg-yellow-100 text-yellow-700",
  en_cours: "bg-blue-100 text-blue-700",
  termine: "bg-green-100 text-green-700",
  annule: "bg-red-100 text-red-700",
};

const ListeEntretiensClient = () => {
  const [data, setData] = useState([]);
  const [pageSize, setPageSize] = useState(5);
  const [globalFilter, setGlobalFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statutFilter, setStatutFilter] = useState("");
  const [periodeFilter, setPeriodeFilter] = useState("tous");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await ApiService.getEntretiensClient();

        let results = [];
        if (Array.isArray(res.data)) {
          results = res.data;
        } else if (Array.isArray(res.data.results)) {
          results = res.data.results;
        } else {
          throw new Error("Format inattendu");
        }

        const today = new Date();
        const oneWeekAhead = new Date();
        oneWeekAhead.setDate(today.getDate() + 7);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        const filtered = results.filter((item) => {
          const matchType = typeFilter ? item.type === typeFilter : true;
          const matchStatut = statutFilter ? item.statut === statutFilter : true;

          const dateDebut = new Date(item.date_debut);
          let matchPeriode = true;
          if (periodeFilter === "jour") {
            matchPeriode = dateDebut.toDateString() === today.toDateString();
          } else if (periodeFilter === "semaine") {
            matchPeriode = dateDebut >= today && dateDebut <= oneWeekAhead;
          } else if (periodeFilter === "mois") {
            matchPeriode = dateDebut >= today && dateDebut <= endOfMonth;
          }

          const matchGlobal = globalFilter
            ? item.installation_nom?.toLowerCase().includes(globalFilter.toLowerCase()) ||
              item.type_display?.toLowerCase().includes(globalFilter.toLowerCase()) ||
              item.statut?.toLowerCase().includes(globalFilter.toLowerCase())
            : true;

          return matchType && matchStatut && matchPeriode && matchGlobal;
        });

        setData(filtered);
      } catch (err) {
        toast.error("Erreur de chargement des entretiens");
        console.error(err);
      }
    };

    fetchData();
  }, [typeFilter, statutFilter, periodeFilter, globalFilter]);

  const columns = useMemo(() => [
    {
      header: "Installation",
      accessorKey: "installation_nom",
    },
    {
      header: "Type",
      accessorKey: "type_display",
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
        <span className={`px-2 py-1 rounded text-xs font-medium ${statutColors[info.getValue()] || "bg-gray-100 text-gray-700"}`}>
          {info.getValue()}
        </span>
      ),
    },
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
            <option value="planifie">Planifié</option>
            <option value="en_cours">En cours</option>
            <option value="termine">Terminé</option>
            <option value="annule">Annulé</option>
          </select>

          <select value={periodeFilter} onChange={(e) => setPeriodeFilter(e.target.value)} className="border rounded text-gray-600 px-2 py-1 text-sm">
            <option value="tous">Toutes les périodes</option>
            <option value="jour">Aujourd’hui</option>
            <option value="semaine">Cette semaine</option>
            <option value="mois">Ce mois</option>
          </select>

          <input
            type="text"
            placeholder="🔍 Rechercher..."
            value={globalFilter ?? ""}
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
                <tr key={row.id} className="hover:bg-gray-100">
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

export default ListeEntretiensClient;
