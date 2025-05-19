import React, { useEffect, useMemo, useState } from "react";
import ApiService from "../../Api/Api";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";
import { Dialog } from "@headlessui/react";
import { FaSort, FaSortUp, FaSortDown, FaTrash,FaDownload  } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";
import { format } from "date-fns";

const statusColors = {
  en_attente: "bg-yellow-100 text-yellow-700",
  en_cours: "bg-blue-100 text-blue-700",
  resolu: "bg-green-100 text-green-700",
};
const ListeReclamationsPage = () => {
  const [data, setData] = useState([]);
  const [pageSize, setPageSize] = useState(5);
  const [globalFilter, setGlobalFilter] = useState("");
  const [selectedReclamation, setSelectedReclamation] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [selectedImages, setSelectedImages] = useState([]);
  const [showImagesModal, setShowImagesModal] = useState(false);
const [showExportOptions, setShowExportOptions] = useState(false);
const [showModalExports, setShowModalExports] = useState(false);
const [exports, setExports] = useState([]);

  useEffect(() => {
    const fetchReclamations = async () => {
      try {
        const res = await ApiService.getReclamations();
        setData(Array.isArray(res.data) ? res.data : res.data.results || []);
      } catch (err) {
        console.error("Erreur lors du chargement des réclamations", err);
        toast.error("Erreur de chargement ❌");
      }
    };
    fetchReclamations();
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
const handleExportClick = async (format) => {
  setShowExportOptions(false);
  try {
    await ApiService.exportHistorique.exportReclamations(format);
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
    setExports(res.data.results.filter((e) => e.nom.includes("reclamations")));
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

  const columns = useMemo(
    () => [
      {
        header: "Installation",
        accessorKey: "installation_nom",
        cell: (info) => info.getValue() || "Non lié",
      },
      { header: "Client", accessorKey: "client_email" },
      { header: "Sujet", accessorKey: "sujet" },
      { header: "Message", accessorKey: "message" },
      {
        header: "Images",
        accessorKey: "images",
        cell: (info) => {
          const images = info.row.original.images;
          return images && images.length > 0 ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImages(images);
                setShowImagesModal(true);
              }}
              className="text-blue-600 underline hover:text-blue-800 text-sm"
            >
              Voir les photos ({images.length})
            </button>
          ) : (
            <span className="text-gray-400 italic">Aucune</span>
          );
        },
      },
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
              onClick={() => handleDelete(row.original.id)}
              className="text-red-500 hover:text-red-700"
            >
              <FaTrash />
            </button>
          </div>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    initialState: { pagination: { pageSize } },
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, columnId, filterValue) => {
      const search = filterValue.toLowerCase();
      const fields = ["client_email", "sujet", "message", "statut"];
      return fields.some((field) => {
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
 <div className="flex gap-2 ml-auto">
    <div className="relative">
      <button
        onClick={() => setShowExportOptions(!showExportOptions)}
        className="flex items-center gap-2 px-3 py-1 border rounded text-sm text-gray-700 hover:bg-gray-100"
      >
       <FaDownload /> Exporter
      </button>
      {showExportOptions && (
        <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow z-50">
          <button
            onClick={(e) => { e.preventDefault(); handleExportClick("pdf"); }}
            className="block w-full px-4 py-2 text-left hover:bg-gray-100"
          >
            Exporter en PDF
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
        <div className="mt-4 flex justify-between text-sm items-center">
  <span>
    Affichage de {data.length > 0 ? table.getPaginationRowModel().rows[0]?.index + 1 : 0} à{" "}
    {data.length > 0 ? table.getPaginationRowModel().rows[table.getPaginationRowModel().rows.length - 1]?.index + 1 : 0} sur {data.length} entrées
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

      <Dialog open={showImagesModal} onClose={() => setShowImagesModal(false)} className="fixed z-50 inset-0 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen p-4">
          <Dialog.Panel className="bg-white p-6 rounded shadow-lg max-w-3xl w-full">
            <Dialog.Title className="text-xl font-semibold text-gray-800 mb-4">Photos jointes</Dialog.Title>
            <div className="flex flex-wrap gap-4">
              {selectedImages.map((img, idx) => (
                <a
                  key={idx}
                  href={img.image}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <img
                    src={img.image}
                    alt={`image-${idx}`}
                    className="w-32 h-32 object-cover rounded border hover:scale-105 transition"
                  />
                </a>
              ))}
            </div>
            <div className="mt-6 text-right">
              <button
                onClick={() => setShowImagesModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Fermer
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {showModalExports && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded shadow w-[600px]">
      <h2 className="text-lg font-bold mb-4">📁 Historique d’exports – Réclamations</h2>
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
                <a href={exp.fichier} download>
                  📥
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

export default ListeReclamationsPage;