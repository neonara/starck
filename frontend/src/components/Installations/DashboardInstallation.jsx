import React, { useEffect, useState, Suspense } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { FaBolt, FaMapMarkerAlt, FaCloudSun, FaDownload } from "react-icons/fa";
import { ArrowUpRight } from "lucide-react";
import ReactApexChart from "react-apexcharts";
import ApiService from "../../Api/Api";

const weather = {
  temperature: "16.2°C",
  condition: "Nuage",
  wind: "7.6 m/s",
  humidity: "72%",
  sunrise: "06:07",
  sunset: "18:33",
};

const DashboardInstallation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [installation, setInstallation] = useState(null);
  const [productionStats, setProductionStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("jour");
  const [showExportOptions, setShowExportOptions] = useState(false);

  const buttons = ["jour", "mois", "annee", "total"];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resInstall, resProd] = await Promise.all([
          ApiService.getInstallationById(id),
          ApiService.statistiquesProduction(id),
        ]);
        setInstallation(resInstall.data);
        setProductionStats(resProd.data);
      } catch (err) {
        toast.error("Erreur chargement des données ❌");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading || !installation || !productionStats) return <div className="p-8">Chargement...</div>;

  // ✅ Dépend des données disponibles
  const dynamicData = {
    jour: [productionStats.production_journaliere],
    mois: [productionStats.production_mensuelle],
    annee: [productionStats.production_annuelle],
    total: [productionStats.production_totale],
  };

  const chartOptions = {
    chart: { id: "prod-chart", toolbar: { show: true } },
    xaxis: {
      categories: ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"],
    },
    stroke: { curve: "smooth" },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.5,
        opacityTo: 0.1,
        stops: [0, 90, 100],
      },
    },
  };

  const chartSeries = [
    {
      name: "Production (kWh)",
      data: dynamicData[view],
    },
    {
      name: "Consommation (kWh)",
      data: dynamicData[view].map((v) => Math.round(v * 0.8)),
    },
  ];


  const handleExport = async (format) => {
    try {
      await ApiService.exportHistorique.creerExport(format, installation.id);
      toast.success(`Export ${format.toUpperCase()} lancé ✅`);
      setShowExportOptions(false);
    } catch (err) {
      toast.error("Erreur export ❌");
    }
  };

  if (loading || !installation) return <div className="p-8">Chargement...</div>;

  return (
    <div className="p-6 pt-24 max-w-7xl mx-auto">
      <div className="flex justify-between items-start mb-4">
        <h1 className="text-3xl font-semibold">Détails de l'installation</h1>
        <div className="flex gap-2">
          <button
            onClick={() => navigate("/liste-installations")}
            className="text-sm text-blue-600 hover:underline flex items-center gap-2"
          >
            <ArrowUpRight size={16} /> Retour
          </button>
          <div className="relative">
            <button
              onClick={() => setShowExportOptions(!showExportOptions)}
              className="flex items-center gap-2 px-3 py-1 border rounded text-sm text-gray-700 hover:bg-gray-100"
            >
              <FaDownload /> Exporter
            </button>
            {showExportOptions && (
              <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow z-50">
                <button onClick={() => handleExport("csv")} className="block w-full px-4 py-2 text-left hover:bg-gray-100">
                  Exporter en CSV
                </button>
                <button onClick={() => handleExport("xlsx")} className="block w-full px-4 py-2 text-left hover:bg-gray-100">
                  Exporter en Excel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow col-span-1">
          <div className="flex items-center gap-4 mb-4">
            <FaMapMarkerAlt className="text-blue-500 text-xl" />
            <div>
              <h2 className="text-xl font-semibold">{installation.nom}</h2>
              <p className="text-gray-500">{installation.adresse}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div>
              <p className="text-gray-600 text-sm">Capacité installée (kW)</p>
              <p className="text-xl font-bold">{installation.capacite_kw}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">État</p>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
  installation.statut === "active"
    ? "bg-green-100 text-green-700"
    : installation.statut === "maintenance"
    ? "bg-yellow-100 text-yellow-700"
    : "bg-red-100 text-red-700"
}`}>
  {installation.statut}
</span>

            </div>
            <div className="flex items-center gap-2 col-span-2">
              <FaBolt className="text-red-600 text-lg" />
              <div>
                <p className="text-sm text-gray-600">Alarme active</p>
                <p className="font-semibold">{installation.alarme_active ? "Oui" : "Non"}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow col-span-1 lg:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <FaCloudSun className="text-yellow-500 text-2xl" />
            <h2 className="text-xl font-semibold text-gray-800">Conditions météo</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-700">
            {Object.entries(weather).map(([key, value]) => (
              <div key={key}>
                <p className="text-gray-500 capitalize">{key.replace("_", " ")}</p>
                <p className="text-lg font-medium">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white p-6 mt-6 rounded-xl shadow-md w-full">
        <div className="flex justify-between items-start mb-4">
        <div>
            <h2 className="text-xl font-semibold text-gray-800">Statistiques</h2>
            <p className="text-sm text-gray-500">Production & Consommation</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {buttons.map((b) => (
              <button
                key={b}
                onClick={() => setView(b)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium ${
                  view === b ? "bg-blue-100 text-blue-900" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {b.charAt(0).toUpperCase() + b.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <Suspense fallback={<div>Chargement du graphique...</div>}>
          <ReactApexChart options={chartOptions} series={chartSeries} type="area" height={320} />
        </Suspense>
      </div>
    </div>
  );
};

export default DashboardInstallation;