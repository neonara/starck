import React, { useEffect, useState } from "react";

import ApiService from "../../Api/Api";

import { Bar, Pie, Line } from "react-chartjs-2";

import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, LineElement, PointElement } from "chart.js";
 
Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, LineElement, PointElement);
 
const StatistiquesEntretiens = () => {

  const [stats, setStats] = useState(null);
 
  useEffect(() => {

    const fetchStats = async () => {

      try {

        const res = await ApiService.getEntretienStats();

        setStats(res.data);

      } catch (err) {

        console.error("Erreur stats entretien :", err);

      }

    };

    fetchStats();

  }, []);
 
  if (!stats) return <div className="p-6">Chargement des statistiques...</div>;
 
  const pieData = {

    labels: Object.keys(stats.par_type),

    datasets: [{

      label: "Types d'entretien",

      data: Object.values(stats.par_type),

      backgroundColor: ["#3B82F6", "#F97316", "#10B981", "#EF4444"]

    }]

  };
 
  const statutBarData = {

    labels: Object.keys(stats.par_statut),

    datasets: [{

      label: "Entretiens par statut",

      data: Object.values(stats.par_statut),

      backgroundColor: "#6366F1"

    }]

  };
 
  const moisLineData = {

    labels: Object.keys(stats.par_mois),

    datasets: [{

      label: "Nombre d'entretiens/mois",

      data: Object.values(stats.par_mois),

      borderColor: "#0EA5E9",

      backgroundColor: "#BAE6FD"

    }]

  };
 
  const technicienBarData = {

    labels: Object.keys(stats.par_technicien),

    datasets: [{

      label: "Entretiens par technicien",

      data: Object.values(stats.par_technicien),

      backgroundColor: "#22C55E"

    }]

  };
 
  return (
<div className="p-6 max-w-7xl mx-auto">
<h2 className="text-3xl font-bold text-gray-800 mb-6">📊 Statistiques des entretiens</h2>
 
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
<div className="bg-white p-6 rounded-xl shadow">
<h3 className="text-lg font-semibold mb-2 text-gray-700">Répartition par type d'entretien</h3>
<Pie data={pieData} />
</div>
 
        <div className="bg-white p-6 rounded-xl shadow">
<h3 className="text-lg font-semibold mb-2 text-gray-700">Répartition par statut</h3>
<Bar data={statutBarData} />
</div>
</div>
 
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
<div className="bg-white p-6 rounded-xl shadow">
<h3 className="text-lg font-semibold mb-2 text-gray-700">Entretiens par mois</h3>
<Line data={moisLineData} />
</div>
 
        <div className="bg-white p-6 rounded-xl shadow">
<h3 className="text-lg font-semibold mb-2 text-gray-700">Par technicien</h3>
<Bar data={technicienBarData} />
</div>
</div>
</div>

  );

};
 
export default StatistiquesEntretiens;
 