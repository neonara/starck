import React, { useEffect, useMemo, useState } from "react";
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

const statusColors = {
  Actif: "bg-green-100 text-green-700",
  "En maintenance": "bg-orange-100 text-orange-700",
  Inactif: "bg-red-100 text-red-700",
};

const ListeInstallationPage = () => {
  const [globalFilter, setGlobalFilter] = useState("");
  const [pageSize, setPageSize] = useState(5);
  const [showMore, setShowMore] = useState(false);
  const navigate = useNavigate();
  const [data, setData] = useState([
    {
      id: "1",
      nom: "Installation A",
      adresse: "Tunis",
      latitude: 36.8065,
      longitude: 10.1815,
      capacite_kw: 10.5,
      production_actuelle_kw: 6.3,
      consommation_kw: 4.2,
      etat: "Actif",
      connecte_reseau: true,
      dernier_controle: "2025-03-01T10:00:00Z",
      alarme_active: false,
      client: "client1",
      installateurs: ["tech1", "tech2"],
      date_installation: "2024-12-01",
      derniere_mise_a_jour: "2025-03-28T14:00:00Z"
    },
    {
      id: "2",
      nom: "Installation B",
      adresse: "Sfax",
      latitude: 34.7406,
      longitude: 10.7603,
      capacite_kw: 20.0,
      production_actuelle_kw: 15.0,
      consommation_kw: 5.0,
      etat: "En maintenance",
      connecte_reseau: false,
      dernier_controle: null,
      alarme_active: true,
      client: "client2",
      installateurs: ["tech3"],
      date_installation: "2024-11-20",
      derniere_mise_a_jour: "2025-03-28T14:00:00Z"
    },
  ]);

  const [newInstallation, setNewInstallation] = useState({
    nom: "",
    adresse: "",
    capacite_kw: 0,
    production_actuelle_kw: 0,
    consommation_kw: 0,
    etat: "Actif",
    client: "",
    installateurs: [],
    date_installation: new Date().toISOString().split("T")[0],
  });

  const handleDelete = (row) => {
    if (confirm(`Supprimer ${row.original.nom} ?`)) {
      setData((prev) => prev.filter((item) => item.id !== row.original.id));
      toast.success("Suppression réussie ✅");
    }
  };

  const handleExportCSV = () => {
    const headers = Object.keys(data[0]).join(",");
    const rows = data.map((row) => Object.values(row).join(","));
    const csvContent = [headers, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "installations.csv");
    link.click();
  };

  const handleAddInstallation = () => {
    const id = crypto.randomUUID();
    setData((prev) => [
      ...prev,
      {
        ...newInstallation,
        id,
        latitude: 0,
        longitude: 0,
        connecte_reseau: true,
        dernier_controle: null,
        alarme_active: false,
        derniere_mise_a_jour: new Date().toISOString(),
      },
    ]);
    toast.success("Installation ajoutée ✅");
  }; 

  const columns = useMemo(() => {
    const baseColumns = [
      { header: "Nom", accessorKey: "nom" },
      { header: "Adresse", accessorKey: "adresse" },
      { header: "Capacité (kW)", accessorKey: "capacite_kw" },
      { header: "Production (kW)", accessorKey: "production_actuelle_kw" },
      {
        header: "État",
        accessorKey: "etat",
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
      },
      {
        header: "Installateurs",
        accessorKey: "installateurs",
        cell: (info) => info.getValue().join(", "),
      },
    ];

    const moreColumns = [
      { header: "Latitude", accessorKey: "latitude" },
      { header: "Longitude", accessorKey: "longitude" },
      {
        header: "Connecté au réseau",
        accessorKey: "connecte_reseau",
        cell: (info) => (info.getValue() ? "Oui" : "Non"),
      },
      {
        header: "Dernier contrôle",
        accessorKey: "dernier_controle",
        cell: (info) => info.getValue() ? new Date(info.getValue()).toLocaleString() : "—",
      },
      {
        header: "Alarme active",
        accessorKey: "alarme_active",
        cell: (info) => (info.getValue() ? "Oui" : "Non"),
      },
      {
        header: "Date d'installation",
        accessorKey: "date_installation",
        cell: (info) => new Date(info.getValue()).toLocaleDateString(),
      },
      {
        header: "Dernière mise à jour",
        accessorKey: "derniere_mise_a_jour",
        cell: (info) => new Date(info.getValue()).toLocaleString(),
      },
    ];

    const actions = {
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <button onClick={() => navigate(`/modifier-installation/${row.original.id}`)} className="text-blue-500 hover:text-blue-700">
            <FaEdit />
          </button>
          <button onClick={() => handleDelete(row)} className="text-red-500 hover:text-red-700">
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
          <button onClick={handleExportCSV} className="flex items-center gap-2 px-3 py-1 border rounded text-sm text-gray-700 hover:bg-gray-100">
            <FaDownload /> Télécharger
          </button>
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

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left text-gray-800">
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

      <div className="mt-4 flex justify-between text-sm items-center">
        <span>
          Affichage de {data.length > 0 ? table.getRowModel().rows[0]?.index + 1 : 0} à {data.length > 0 ? table.getRowModel().rows[table.getRowModel().rows.length - 1]?.index + 1 : 0} sur {data.length} entrées
        </span>
        <div className="space-x-2">
          <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} className="px-3 py-1 rounded border text-gray-600 disabled:opacity-50">
            Précédent
          </button>
          <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} className="px-3 py-1 rounded border text-gray-600 disabled:opacity-50">
            Suivant
          </button>
        </div>
      </div>




    </div>
  );
};

export default ListeInstallationPage;
