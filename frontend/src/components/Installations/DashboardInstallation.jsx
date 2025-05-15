import React, { useEffect, useState, Suspense } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { FaBolt, FaMapMarkerAlt } from "react-icons/fa";
import { ArrowUpRight, MoreVertical } from "lucide-react";
import ReactApexChart from "react-apexcharts";
import ApiService from "../../Api/Api";
import WeatherCard from "../Client-dashboard/WeatherCard";
import axios from "axios";

const DashboardInstallation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [installation, setInstallation] = useState(null);
  const [productionStats, setProductionStats] = useState(null);
  const [weather, setWeather] = useState(null);
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
        if (resInstall.data.latitude && resInstall.data.longitude) {
          fetchWeather(resInstall.data.latitude, resInstall.data.longitude);
        }
      } catch (err) {
        toast.error("Erreur chargement des données ❌");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const fetchWeather = async (lat, lon) => {
    try {
      const apiKey = import.meta.env.VITE_OPENWEATHER_KEY;
      const res = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
      );
      setWeather(res.data);
    } catch (error) {
      console.error("Erreur de chargement météo:", error);
    }
  };

  if (loading || !installation || !productionStats)
    return <div className="p-8">Chargement...</div>;

  const dynamicData = {
    jour: productionStats.prod_journaliere_par_heure || {},
    mois: productionStats.prod_mensuelle_par_jour || {},
    annee: productionStats.prod_annuelle_par_mois || {},
    total: { Total: productionStats.prod_totale || 0 },
  };

  const categories = Object.keys(dynamicData[view]);
  const values = Object.values(dynamicData[view]);

  const chartOptions = {
    chart: {
      id: "prod-chart",
      toolbar: { show: true },
      animations: {
        enabled: true,
        easing: "easeinout",
        speed: 700,
      },
    },
    stroke: { curve: "smooth", width: 2 },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.5,
        opacityTo: 0.1,
        stops: [0, 90, 100],
      },
    },
    xaxis: {
      categories,
      labels: { style: { fontSize: "13px" } },
    },
    colors: ["#3b82f6"],
    tooltip: {
      y: {
        formatter: (val) => `${val} kWh`,
      },
    },
  };

  const chartSeries = [
    {
      name: "Production (kWh)",
      data: values,
    },
  ];

  const handleExport = (type) => {
    window.ApexCharts.exec("prod-chart", "exportChart", {
      type,
      filename: `production-${view}`,
    });
    setShowExportOptions(false);
  };

  const todayWeather = weather ? weather.list[0] : null;

  return (
    <div className="p-6 pt-24 max-w-7xl mx-auto">
      <div className="flex justify-between items-start mb-4">
        <h1 className="text-3xl font-semibold">Détails de l'installation</h1>
        <button
          onClick={() => navigate("/liste-installations")}
          className="text-sm text-blue-600 hover:underline flex items-center gap-2"
        >
          <ArrowUpRight size={16} /> Retour
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow col-span-1">
          <div className="flex flex-col gap-4 mb-4">
            {installation.photo_installation_url ? (
              <img
                src={installation.photo_installation_url}
                alt="Installation"
                className="rounded-xl object-cover h-48 w-full mb-2"
              />
            ) : (
              <div className="h-48 bg-gray-200 rounded-xl flex items-center justify-center mb-2">
                Pas d'image
              </div>
            )}
            <div className="flex items-center gap-2">
              <FaMapMarkerAlt className="text-blue-500 text-xl" />
              <div>
                <h2 className="text-xl font-semibold">{installation.nom}</h2>
                <p className="text-gray-500">{installation.adresse}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div>
              <p className="text-gray-600 text-sm">Capacité installée (kW)</p>
              <p className="text-xl font-bold">{installation.capacite_kw}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">État</p>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  installation.statut === "active"
                    ? "bg-green-100 text-green-700"
                    : installation.statut === "maintenance"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
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
          <WeatherCard todayWeather={todayWeather} weather={weather} />
        </div>
      </div>

      <div className="bg-white p-6 mt-6 rounded-xl shadow-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Statistiques de production</h2>
          <div className="relative">
            <button
              onClick={() => setShowExportOptions(!showExportOptions)}
              className="p-2 border rounded-full text-gray-500 hover:text-blue-600"
            >
              <MoreVertical size={20} />
            </button>
            {showExportOptions && (
              <div className="absolute right-0 mt-2 w-32 bg-white border rounded shadow z-50">
                <button
                  onClick={() => handleExport("png")}
                  className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                >
                  PNG
                </button>
                <button
                  onClick={() => handleExport("svg")}
                  className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                >
                  SVG
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {buttons.map((b) => (
            <button
              key={b}
              onClick={() => setView(b)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium ${
                view === b
                  ? "bg-blue-600 text-white shadow"
                  : "bg-gray-100 text-gray-600 hover:bg-blue-100"
              }`}
            >
              {b.charAt(0).toUpperCase() + b.slice(1)}
            </button>
          ))}
        </div>

        <Suspense fallback={<div>Chargement du graphique...</div>}>
          <ReactApexChart
            options={chartOptions}
            series={chartSeries}
            type="area"
            height={320}
          />
        </Suspense>
      </div>
    </div>
  );
};

export default DashboardInstallation;