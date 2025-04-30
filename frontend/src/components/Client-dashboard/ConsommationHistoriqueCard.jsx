import React from "react";
import ReactApexChart from "react-apexcharts";

const ConsommationHistoriqueCard = ({ chartData, chartOptions, chartView, setChartView }) => {
  return (
    <div className="w-full bg-white rounded-2xl flex flex-col h-full">
      {/* Titre */}
      <h2 className="text-xl font-bold text-blue-600 mb-4 text-center">Évolution de la consommation</h2>

      {/* Boutons de sélection Jour / Mois */}
      <div className="flex justify-center text-gray-700 gap-4 mb-4">
        <button
          onClick={() => setChartView("daily")}
          className={`px-4 py-2 rounded-lg text-sm text-gray-700 font-semibold ${
            chartView === "daily" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-700"
          }`}
        >
          Jour
        </button>
        <button
          onClick={() => setChartView("monthly")}
          className={`px-4 py-2 rounded-lg text-sm text-gray-700 font-semibold ${
            chartView === "monthly" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-700"
          }`}
        >
          Mois
        </button>
      </div>

      {/* Graphique */}
      <div className="flex-grow text-gray-700">
        <ReactApexChart
          options={chartOptions}
          series={[{ name: "Consommation", data: chartData.values }]}
          type="area"
          height={250}
        />
      </div>
    </div>
  );
};

export default ConsommationHistoriqueCard;
