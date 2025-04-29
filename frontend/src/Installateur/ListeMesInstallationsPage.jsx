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
import { FaSort, FaSortUp, FaSortDown, FaEdit, FaTrash, FaDownload, FaPlus } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";

const statusColors = {
  active: "bg-green-100 text-green-700",
  maintenance: "bg-orange-100 text-orange-700",
  inactive: "bg-red-100 text-red-700",
  fault: "bg-red-200 text-red-800",
};

const ListeInstallationsInstallateurPage = () => {
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
      try {
        const res = await ApiService.getInstallationsByInstallateur();
        let installations = res.data;

        if (globalFilter) {
          installations = installations.filter(inst =>
            inst.nom.toLowerCase().includes(globalFilter.toLowerCase())
          );
        }
        if (statutFilter) {
          installations = installations.filter(inst =>
            inst.statut === statutFilter
          );
        }
        if (villeFilter) {
          installations = installations.filter(inst =>
            inst.ville && inst.ville.toLowerCase().includes(villeFilter.toLowerCase())
          );
        }

        setData(installations);

        const villes = [...new Set(installations.map(inst => inst.ville).filter(Boolean))];
        setVillesDisponibles(villes);
      } catch (err) {
        console.error("Erreur lors du chargement des installations", err);
        toast.error("Erreur de chargement ❌");
      }
    };
    fetchInstallations();
  }, [globalFilter, statutFilter, villeFilter]);

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
    ];

    const moreColumns = [
      { header: "Latitude", accessorKey: "latitude" },
      { header: "Longitude", accessorKey: "longitude" },
      {
        header: "Date installation",
        accessorKey: "date_installation",
        cell: (info) => new Date(info.getValue()).toLocaleDateString(),
      },
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
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="border text-gray-500 rounded px-2 py-1 text-sm"
          >
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
            className="border rounded text-gray-500 px-2 py-1 text-sm"
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
            className="border rounded text-gray-500 px-2 py-1 text-sm"
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
            className="border text-gray-500 px-3 py-1 rounded w-64 text-sm"
          />
        </div>
      </div>

      {/* SHOW MORE */}
      <div className="mb-2">
        <button onClick={() => setShowMore(!showMore)} className="text-sm text-blue-600 hover:underline">
          {showMore ? "📂 Réduire les colonnes" : "📂 Afficher plus de colonnes"}
        </button>
      </div>

      {/* TABLE */}
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

export default ListeInstallationsInstallateurPage;
