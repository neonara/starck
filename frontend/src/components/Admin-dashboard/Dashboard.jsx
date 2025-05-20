import React, { useEffect, useState } from "react";
import ApiService from "../../Api/Api";
import { Users, Wrench } from "lucide-react";
import ReactApexChart from "react-apexcharts";

const Card = ({ title, children, color = "gray" }) => (
  <div className="bg-white rounded-2xl shadow-md p-6 transition-all hover:shadow-lg">
    {title && <h2 className={`text-lg font-semibold text-${color}-600 mb-4`}>{title}</h2>}
    {children}
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState({ total_clients: 0, total_installateurs: 0 });
  const [installationStats, setInstallationStats] = useState({ total_normales: 0, total_en_panne: 0 });
  const [alarmStats, setAlarmStats] = useState({ critique: 0, majeure: 0, mineure: 0 });
  const [prodStats, setProdStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("jour");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [userStats, installStats, alarmData, prodData] = await Promise.all([
          ApiService.getUserStats(),
          ApiService.getInstallationStats(),
          ApiService.getStatistiquesAlarmesglobale(),
          ApiService.statistiquesGlobales()
        ]);

        setStats(userStats.data);
        setInstallationStats(installStats.data);

        const alarmTotals = alarmData.data.reduce((acc, cur) => {
          acc[cur.code_alarme__gravite] = cur.total;
          return acc;
        }, {});
setAlarmStats({
  critique: alarmTotals.critique ?? 0,
  majeure: alarmTotals.majeure ?? 0,
  mineure: alarmTotals.mineure ?? 0
});

        setProdStats(prodData.data);
      } catch (error) {
        console.error("Erreur chargement stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const chartConfig = {
    jour: {
      title: "Production journalière",
      data: prodStats?.production_journaliere || {},
      type: "area",
      color: "#3b82f6"
    },
    mois: {
      title: "Production mensuelle",
      data: prodStats?.production_mensuelle || {},
      type: "bar",
      color: "#10b981"
    },
    totale: {
      title: "Production totale",
      data: { Total: prodStats?.production_totale || 0 },
      type: "bar",
      color: "#6366f1"
    }
  };

  const current = chartConfig[activeTab];
  const categories = Object.keys(current?.data || {});
  const values = Object.values(current?.data || {});

  if (loading || !prodStats) return <div className="text-center py-10 text-gray-500">Chargement...</div>;

  return (
    <div className="p-6 pt-20 flex flex-col gap-6">
      <div className="flex gap-6">
        {/* Colonne gauche */}
        <div className="flex flex-col gap-6 w-64">
          <Card title="Total Clients" color="blue">
            <div className="flex items-center gap-4">
              <Users className="text-blue-600" />
              <span className="text-lg font-semibold">{stats.total_clients}</span>
            </div>
          </Card>
          <Card title="Total Installateurs" color="green">
            <div className="flex items-center gap-4">
              <Wrench className="text-green-600" />
              <span className="text-lg font-semibold">{stats.total_installateurs}</span>
            </div>
          </Card>
        </div>

        {/* Colonne droite donuts */}
        <div className="flex-1 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card title="État des Installations" color="blue">
              <ReactApexChart
                type="donut"
                series={[installationStats.total_normales, installationStats.total_en_panne]}
                options={{
                  labels: ["Fonctionnelles", "En panne"],
                  colors: ["#60a5fa", "#ef4444"],
                  legend: { position: "bottom" },
                  dataLabels: { enabled: true },
                  plotOptions: { pie: { donut: { size: "70%" } } },
                  tooltip: { y: { formatter: (val) => `${val} installations` } }
                }}
                height={250}
              />
            </Card>

            <Card title="Alarmes Actives" color="red">
        <ReactApexChart
  type="donut"
  series={[
    alarmStats.critique || 0.001,
    alarmStats.majeure || 0.001,
    alarmStats.mineure || 0.001
  ]}
  options={{
    labels: ["Critiques", "Majeures", "Mineures"],
    colors: ["#ef4444", "#fb923c", "#facc15"],
    legend: { position: "bottom" },
    dataLabels: {
      enabled: true,
      formatter: (val, opts) => {
  const critique = alarmStats.critique ?? 0;
  const majeure = alarmStats.majeure ?? 0;
  const mineure = alarmStats.mineure ?? 0;
  const total = critique + majeure + mineure;
  const value = opts.w.config.series[opts.seriesIndex];
  return total === 0 ? "0%" : `${((value / total) * 100).toFixed(1)}%`;
}

    },
    plotOptions: { pie: { donut: { size: "70%" } } },
    tooltip: { y: { formatter: (val) => `${val.toFixed(0)} alarme(s)` } }
  }}
  height={250}
/>

            </Card>
          </div>
        </div>
      </div>

      {/* Graphique de production */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">📊 Statistiques de production</h2>
          <div className="flex gap-2">
            {Object.entries(chartConfig).map(([key, cfg]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium ${
                  activeTab === key
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {cfg.title}
              </button>
            ))}
          </div>
        </div>

        <ReactApexChart
          type={current?.type}
          series={[{ name: "Production", data: values }]}
          options={{
            chart: { toolbar: { show: false } },
            stroke: { curve: "smooth", width: 2 },
            dataLabels: { enabled: false },
            xaxis: {
              categories,
              labels: { style: { fontSize: "13px" } }
            },
            colors: [current?.color],
            tooltip: {
              y: { formatter: (val) => `${val} kWh` }
            }
          }}
          height={320}
        />
      </div>
    </div>
  );
};

export default Dashboard;