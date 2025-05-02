import React, { useEffect, useState } from "react";
import ApiService from "../../Api/Api";
import dayjs from "dayjs";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import WeatherCard from "./WeatherCard";
import ReactApexChart from "react-apexcharts";
import ConsommationHistoriqueCard from "./ConsommationHistoriqueCard";
import InstallationDetailsModal from "./InstallationDetailsModal";

const ClientDashboard = () => {
  const [data, setData] = useState(null);
  const [stats, setStats] = useState(null);
  const [alertStats, setAlertStats] = useState(null);
  const [chartView, setChartView] = useState("daily");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [weather, setWeather] = useState(null);

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
      if (resInstallation.data.latitude && resInstallation.data.longitude) {
        fetchWeather(resInstallation.data.latitude, resInstallation.data.longitude);
      }
    } catch (error) {
      console.error("Erreur chargement installation client:", error);
    }
  };
  const fetchWeather = async (lat, lon) => {
    try {
      const apiKey = import.meta.env.VITE_OPENWEATHER_KEY;
      const res = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
      );
      console.log("API Weather response:", res.data);
      setWeather(res.data);
    } catch (error) {
      console.error("Erreur de chargement météo:", error);
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
    chart: {
      type: "area",
      toolbar: { show: false },
      zoom: { enabled: false },
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 700,
        animateGradually: {
          enabled: true,
          delay: 200
        },
        dynamicAnimation: {
          enabled: true,
          speed: 700
        }
      }
    },
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 2 },
    fill: { type: "gradient", gradient: { opacityFrom: 0.4, opacityTo: 0, stops: [0, 100] } },
    xaxis: { categories: chartData.categories },
    tooltip: { y: { formatter: (val) => `${val} kWh` } },
    colors: ["#3b82f6"]
  };

  const todayWeather = weather ? weather.list[0] : null;

  return (
    <div className="pt-6  justify-center">
    <div className="flex w-full max-w-[2000px] gap-4">
        {/* Photo + Info Card */}
        <div className="basis-1/3 flex-grow bg-white rounded-2xl shadow pl-2 p-4 px-4 flex flex-col ">
        {data.photo_installation_url ? (
            <img src={data.photo_installation_url} alt="Installation" className="rounded-xl object-cover h-48 w-full cursor-pointer" onClick={() => setIsModalOpen(true)} />

          ) : (
            <div className="h-48 bg-gray-200 rounded-xl flex items-center justify-center">Pas d'image</div>
          )}
            <InstallationDetailsModal
             isOpen={isModalOpen}
             setIsOpen={setIsModalOpen}
             installation={data}
            />
          <div className="space-y-1">
            <h2 className="text-xl font-bold p-4 text-gray-800">{data.nom}</h2>
            {/* État de fonctionnement */}
  <div>
  <p className="text-sm pl-4 text-gray-500 flex gap-2">
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
  </div>

  {/* Dates contrôle et visite */}
  <div className="text-sm pl-4 text-gray-600  space-y-1">
  <p className="text-sm flex text-gray-400">Dernier contrôle : {data.dernier_controle ? dayjs(data.dernier_controle).format("DD MMM YYYY") : "—"}</p>
  <p className="text-sm flex text-gray-400">Prochaine visite : {data.prochaine_visite ? dayjs(data.prochaine_visite).format("DD MMM YYYY") : "—"}</p>
  </div>
          </div>
        </div>

        {/* Production + Stats */}
        <div className="basis-2/4 flex-grow bg-white rounded-2xl shadow p-4 flex flex-col">
        <div className="flex flex-col items-center justify-center">
            <div className="text-2xl font-bold text-gray-800 mb-2">Production</div>
            <div className="w-40 h-40 rounded-full border-8 border-blue-300 flex items-center justify-center text-4xl font-bold text-blue-600">
              {stats.production_jour ? `${stats.production_jour} kWh` : "0%"}
            </div>

            <p className="text-gray-500 text-sm mt-2">Production solaire journalière</p>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-blue-50 p-3 rounded-xl text-center">
              <p className="text-sm text-blue-400">Jour</p>
              <p className="text-lg font-bold">{stats.production_jour || 0} kWh</p>
            </div>
            <div className="bg-red-50 p-3 rounded-xl text-center">
              <p className="text-sm text-red-400">Mois</p>
              <p className="text-lg font-bold">{stats.production_mois || 0} kWh</p>
            </div>
            <div className="bg-green-50 p-3 rounded-xl text-center">
              <p className="text-sm text-green-400">Année</p>
              <p className="text-lg font-bold">{stats.production_annee || 0} kWh</p>
            </div>
            <div className="bg-purple-50 p-3 rounded-xl text-center">
              <p className="text-sm text-purple-400">Total</p>
              <p className="text-lg font-bold">{stats.production_totale || 0} kWh</p>
            </div>
          </div>
        </div>

        {/* Weather Card */}
<div className='flex-grow rounded-2xl  flex flex-col'>
<WeatherCard todayWeather={todayWeather} weather={weather} />

  </div>
  </div>
  
  <div className="w-full flex flex-wrap gap-4 mt-6 items-stretch">
  {/* Carte Alarmes */}
  <div className="flex-1 min-w-[300px] bg-white rounded-2xl shadow p-6 flex flex-col">
    <AlarmesActivesCard alertStats={alertStats} />
  </div>

  {/* Carte Evolution de production */}
  <div className="flex-1 min-w-[300px] bg-white rounded-2xl shadow p-6 flex flex-col">
  <ConsommationHistoriqueCard
  chartData={chartData}
  chartOptions={chartOptions}
  chartView={chartView}
  setChartView={setChartView}
/>

  </div>
</div>



</div>
    
  );
};


const AlarmesActivesCard = ({ alertStats }) => {
  if (!alertStats) {
    return <div className="w-full bg-white rounded-2xl  mt-6 text-center">Chargement alarmes...</div>;
  }

  return (
    <div className="w-full bg-white rounded-2xl flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="w-full bg-white rounded-2xl  mt-6 flex flex-col items-center">
          <h2 className="text-xl font-bold text-red-500 mb-4">Alarmes Actives</h2>
          <div className="w-60">
            <ReactApexChart
              type="donut"
              series={[
                alertStats.critiques || 0,
                alertStats.majeures || 0,
                alertStats.mineures || 0
              ]}
              options={{
                labels: ['Critiques', 'Majeures', 'Mineures'],
                colors: ['#ef4444', '#f59e0b', '#facc15'],
                legend: {
                  position: 'bottom'
                },
                dataLabels: {
                  enabled: true,
                  style: { colors: ['#333'] }
                },
                tooltip: {
                  y: {
                    formatter: (val) => `${val} alarmes`
                  }
                },
                plotOptions: {
                  pie: {
                    donut: {
                      size: '70%'
                    }
                  }
                }
              }}
              height={250}
            />
          </div>
        </div>
      </div>
    </div>
  );
};



export default ClientDashboard;