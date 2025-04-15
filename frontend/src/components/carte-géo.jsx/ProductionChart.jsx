// ProductionCharts.jsx
import { useEffect, useState, useRef } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Title
} from "chart.js";
import ApiService from "../../Api/Api";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend, Title);

const ProductionCharts = ({ installationId, onClose }) => {
  const [prodJour, setProdJour] = useState({});
  const [prodMois, setProdMois] = useState({});
  const chartJourRef = useRef();
  const chartMoisRef = useRef();

  useEffect(() => {
    if (!installationId) return;
    ApiService.statistiquesProduction(installationId).then((res) => {
      setProdJour(res.data.prod_journaliere_par_heure || {});
      setProdMois(res.data.prod_mensuelle_par_jour || {});
    });
  }, [installationId]);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: false }
    },
    animation: { duration: 1000 },
    scales: { y: { beginAtZero: true } }
  };

  const exportChart = (ref, filename) => {
    const link = document.createElement("a");
    link.download = filename;
    link.href = ref.current.toBase64Image();
    link.click();
  };

  const dataJour = {
    labels: Object.keys(prodJour),
    datasets: [
      {
        label: "Aujourd'hui (kWh)",
        data: Object.values(prodJour),
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.4)",
        tension: 0.4,
        fill: true,
      }
    ]
  };

  const dataMois = {
    labels: Object.keys(prodMois),
    datasets: [
      {
        label: "Ce mois (kWh)",
        data: Object.values(prodMois),
        borderColor: "#10b981",
        backgroundColor: "rgba(16, 185, 129, 0.3)",
        tension: 0.4,
        fill: true,
      }
    ]
  };

  return (
    <>
      <div className="absolute top-6 right-6 bg-white shadow-xl rounded-xl p-4 w-[320px] z-[1000]">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-semibold text-gray-800">Production journalière</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500">X</button>
        </div>
        <Line ref={chartJourRef} data={dataJour} options={chartOptions} />
        <button
          onClick={() => exportChart(chartJourRef, "production-journaliere.png")}
          className="mt-2 text-sm text-blue-600 hover:underline"
        >
          Exporter en PNG
        </button>
      </div>

      <div className="absolute bottom-6 right-6 bg-white shadow-xl rounded-xl p-4 w-[320px] z-[1000]">
        <h3 className="text-sm font-semibold text-gray-800 mb-2">Production mensuelle</h3>
        <Line ref={chartMoisRef} data={dataMois} options={chartOptions} />
        <button
          onClick={() => exportChart(chartMoisRef, "production-mensuelle.png")}
          className="mt-2 text-sm text-blue-600 hover:underline"
        >
          Exporter en PNG
        </button>
      </div>
    </>
  );
};

export default ProductionCharts;