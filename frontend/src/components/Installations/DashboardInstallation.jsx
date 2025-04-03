import React, { Suspense, useState } from "react";
import { FaBolt, FaMapMarkerAlt, FaCloudSun } from "react-icons/fa";
import ReactApexChart from "react-apexcharts";
import { useNavigate } from "react-router-dom";
import {  ArrowUpRight } from "lucide-react";



const installation = {
  nom: "Installation Mahdia",
  adresse: "Mahdia, Tunisie",
  capacite_kw: 2000,
  etat: "Actif",
  alarme_active: false,
};

const weather = {
  temperature: "16.2°C",
  condition: "Nuage",
  wind: "7.6 m/s",
  humidity: "72%",
  sunrise: "06:07",
  sunset: "18:33",
};

const DashboardInstallation = () => {
  const navigate = useNavigate(); 

  const [view, setView] = useState("jour");

  const buttons = [
    { label: "Jour", value: "jour" },
    { label: "Mois", value: "mois" },
    { label: "Année", value: "annee" },
    { label: "Total", value: "total" },
  ];

  const handleViewChange = (value) => setView(value);

  const data = {
    jour: [10, 20, 15, 30, 25, 40, 35],
    mois: [200, 220, 210, 250, 230, 240, 260],
    annee: [2500, 2600, 2400, 2550, 2650, 2700, 2750],
    total: [10000, 10500, 11000, 11500, 12000, 12500, 13000],
  };

  const options = {
    chart: {
      id: "production-chart",
      toolbar: {
        show: true,
        tools: {
          download: true,
        },
      },
    },
    xaxis: {
      categories: ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"],
    },
    stroke: {
      curve: "smooth",
    },
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

  const series = [
    {
      name: "Production (kWh)",
      data: data[view],
    },
    {
      name: "Consommation (kWh)",
      data: data[view].map((v) => Math.round(v * 0.8)),
    },
  ];

  return (
    <div className="p-6 pt-24 max-w-7xl mx-auto">
    <div className="flex justify-between items-start mb-4">
      <h1 className="text-3xl font-semibold">Détails de l'installation</h1>
  
      <button
        onClick={() => navigate(`/liste-installations/`)}
        className="text-sm text-blue-600 hover:underline flex items-center gap-2"
      >
        <ArrowUpRight size={16} /> Retour
      </button>
    </div>
  
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Carte principale simplifiée */}
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
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  installation.etat === "Actif"
                    ? "bg-green-100 text-green-700"
                    : installation.etat === "En maintenance"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {installation.etat}
              </span>
            </div>
            <div className="flex items-center gap-2 col-span-2">
              <FaBolt className="text-red-600 text-lg" />
              <div>
                <p className="text-sm text-gray-600">Alarme active</p>
                <p className="font-semibold">
                  {installation.alarme_active ? "Oui" : "Non"}
                </p>
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
            <div>
              <p className="text-gray-500">Température</p>
              <p className="text-lg font-medium">{weather.temperature}</p>
            </div>
            <div>
              <p className="text-gray-500">Condition</p>
              <p className="text-lg font-medium">{weather.condition}</p>
            </div>
            <div>
              <p className="text-gray-500">Vent</p>
              <p className="text-lg font-medium">{weather.wind}</p>
            </div>
            <div>
              <p className="text-gray-500">Humidité</p>
              <p className="text-lg font-medium">{weather.humidity}</p>
            </div>
            <div>
              <p className="text-gray-500">Lever du soleil</p>
              <p className="text-lg font-medium">{weather.sunrise}</p>
            </div>
            <div>
              <p className="text-gray-500">Coucher du soleil</p>
              <p className="text-lg font-medium">{weather.sunset}</p>
            </div>
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
            {buttons.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => handleViewChange(value)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium ${
                  view === value
                    ? "bg-blue-100 text-blue-900"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <Suspense fallback={<div>Chargement du graphique...</div>}>
          <ReactApexChart options={options} series={series} type="area" height={320} />
        </Suspense>
      </div>
    </div>
  );
};

export default DashboardInstallation;
