import React, { useEffect, useState, Suspense, lazy } from "react";
import ApiService from "../../Api/Api";
import dayjs from "dayjs";
import { AlertTriangle, AlertCircle, Zap, Info } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const ReactApexChart = lazy(() => import("react-apexcharts"));

const StatCard = ({ icon, label, value }) => (
  <div className="bg-white shadow rounded-xl p-4 flex items-center gap-4 w-full border-t-4 border-blue-500">
    <div className="p-3 bg-blue-100 text-blue-600 rounded-full">{icon}</div>
    <div>
      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
      <p className="text-xl font-bold text-gray-800 mt-1">{value}</p>
    </div>
  </div>
);

const ClientDashboard = () => {
  const [data, setData] = useState(null);
  const [stats, setStats] = useState(null);
  const [alertStats, setAlertStats] = useState(null);
  const [chartView, setChartView] = useState("daily");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      const [resInstallation, resStats, resAlerts] = await Promise.all([
        ApiService.getInstallationClient(),
        ApiService.statistiquesInstallationClient(),
        ApiService.getStatistiquesAlarmesClient()
      ]);
      setData(resInstallation.data);
      setStats(resStats.data);
      setAlertStats(resAlerts.data);
    } catch (error) {
      console.error("Erreur chargement installation client:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (!data || !stats || !alertStats) return <div className="p-8">Chargement en cours...</div>;

  const productionData = {
    daily: data.production_journaliere,
    monthly: data.production_mensuelle,
    total: stats.production_totale ? [stats.production_totale] : []
  };

  const chartData = {
    categories:
      chartView === "daily"
        ? Object.keys(productionData.daily)
        : chartView === "monthly"
        ? Object.keys(productionData.monthly)
        : ["Total"],
    values:
      chartView === "daily"
        ? Object.values(productionData.daily)
        : chartView === "monthly"
        ? Object.values(productionData.monthly)
        : productionData.total
  };

  const chartOptions = {
    chart: { type: "area", toolbar: { show: false }, zoom: { enabled: false } },
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 2 },
    fill: {
      type: "gradient",
      gradient: { opacityFrom: 0.4, opacityTo: 0, stops: [0, 100] }
    },
    xaxis: { categories: chartData.categories },
    tooltip: { y: { formatter: (val) => `${val} kWh` } },
    colors: ["#3b82f6"]
  };

  const alertIcon = (type) => {
    switch (type) {
      case "critique": return <AlertCircle className="text-red-500" size={18} />;
      case "majeure": return <Zap className="text-orange-500" size={18} />;
      case "mineure": return <AlertTriangle className="text-yellow-500" size={18} />;
      default: return <Info className="text-gray-400" size={18} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Vue générale de mon installation</h1>

      {/* Image et état */}
      <div className="flex items-center bg-white rounded-xl shadow p-4 gap-6">
        {data.photo_installation_url ? (
          <img
            src={data.photo_installation_url}
            alt="Installation"
            className="w-32 h-32 object-cover rounded-xl border cursor-pointer"
            onClick={() => setIsModalOpen(true)}
          />
        ) : (
          <div className="w-32 h-32 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
            Pas d’image
          </div>
        )}
        <div>
          <h2 className="text-lg font-semibold text-gray-700">{data.nom}</h2>
          <p className="text-sm text-gray-500 flex items-center gap-2">
  État :
  <span
    className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
      data.etat_fonctionnement === "Fonctionnelle"
        ? "bg-green-100 text-green-600"
        : "bg-red-100 text-red-600"
    }`}
  >
    {data.etat_fonctionnement}
  </span>
</p>

          <p className="text-sm text-gray-400">Dernier contrôle : {data.dernier_controle ? dayjs(data.dernier_controle).format("DD MMM YYYY") : "—"}</p>
          <p className="text-sm text-gray-400">Prochaine visite : {data.prochaine_visite ? dayjs(data.prochaine_visite).format("DD MMM YYYY") : "—"}</p>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg max-w-xl w-full relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl"
            >
              &times;
            </button>
            <img
              src={data.photo_installation_url}
              alt="Photo agrandie"
              className="w-full h-auto rounded"
            />
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard icon={<Zap />} label="Prod. aujourd'hui" value={`${stats.production_jour} kWh`} />
        <StatCard icon={<Zap />} label="Prod. mensuelle" value={`${stats.production_mois} kWh`} />
        <StatCard icon={<Zap />} label="Prod. totale" value={`${stats.production_totale} kWh`} />
        <StatCard icon={<Zap />} label="Conso. aujourd'hui" value={`${stats.consommation_jour} kWh`} />
        <StatCard icon={<Zap />} label="Conso. mensuelle" value={`${stats.consommation_mois} kWh`} />
        <StatCard icon={<Zap />} label="Conso. totale" value={`${stats.consommation_totale} kWh`} />
        <StatCard icon={<AlertTriangle />} label="Alertes mineures" value={alertStats.mineures || 0} />
        <StatCard icon={<AlertCircle />} label="Alertes majeures" value={alertStats.majeures || 0} />
        <StatCard icon={<AlertCircle />} label="Alertes critiques" value={alertStats.critiques || 0} />
      </div>

      {/* Graphique production */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-700">Production</h2>
          <div className="flex gap-2">
            <button onClick={() => setChartView("daily")} className={`px-3 py-1 rounded text-sm ${chartView === "daily" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-500"}`}>Jour</button>
            <button onClick={() => setChartView("monthly")} className={`px-3 py-1 rounded text-sm ${chartView === "monthly" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-500"}`}>Mois</button>
            <button onClick={() => setChartView("total")} className={`px-3 py-1 rounded text-sm ${chartView === "total" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-500"}`}>Total</button>
          </div>
        </div>
        <Suspense fallback={<div>Chargement du graphique...</div>}>
          <ReactApexChart options={chartOptions} series={[{ name: "Production", data: chartData.values }]} type="area" height={300} />
        </Suspense>
      </div>

      {/* Carte de localisation */}
      {data.latitude && data.longitude && (
  <div className="bg-white p-6 rounded-xl shadow-md">
    <h2 className="text-lg font-semibold text-gray-700 mb-4">Localisation de l'installation</h2>
    <MapContainer
      center={[parseFloat(data.latitude), parseFloat(data.longitude)]}
      zoom={13}
      scrollWheelZoom={false}
      style={{ height: 300, width: "100%" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Marker position={[parseFloat(data.latitude), parseFloat(data.longitude)]}>
        <Popup>{data.nom}</Popup>
      </Marker>
    </MapContainer>
  </div>
)}

    </div>
  );
};

export default ClientDashboard;