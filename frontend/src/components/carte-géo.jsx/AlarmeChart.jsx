import { useRef } from "react";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const AlarmesChart = ({ data }) => {
  const chartRef = useRef();

  const total = (data.critique || 0) + (data.majeure || 0) + (data.mineure || 0);

  const chartData = {
    labels: ["Critique", "Majeure", "Mineure"],
    datasets: [
      {
        data: [data.critique || 0, data.majeure || 0, data.mineure || 0],
        backgroundColor: ["#ef4444", "#f97316", "#facc15"],
        borderWidth: 1,
        cutout: "80%",
      },
    ],
  };

  const options = {
    plugins: { legend: { display: false }, tooltip: { enabled: true } },
    animation: { duration: 1000 },
  };

  return (
    <div className="absolute bottom-6 left-6 bg-white rounded-xl shadow-xl p-4 w-[250px] z-[1000]">
      <h3 className="text-base font-semibold text-gray-800 text-center mb-2">
        Alarmes actives
      </h3>

      <div className="relative w-full flex justify-center items-center">
        <Doughnut ref={chartRef} data={chartData} options={options} />
        <div className="absolute text-center text-sm font-semibold text-blue-600">
          <p>{total}</p>
          <p className="text-xs">total</p>
        </div>
      </div>

      <div className="mt-3 space-y-1 text-sm text-gray-800">
        <div className="flex justify-between items-center">
          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-[#ef4444] rounded-full"></span>Critique</span>
          <span>{data.critique || 0}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-[#f97316] rounded-full"></span>Majeure</span>
          <span>{data.majeure || 0}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-[#facc15] rounded-full"></span>Mineure</span>
          <span>{data.mineure || 0}</span>
        </div>
      </div>
    </div>
  );
};

export default AlarmesChart;
