import React, { Suspense, lazy, useState } from 'react';
import { PieChart, Pie, Cell } from 'recharts';
import {
  AlertCircle, AlertTriangle, Info, Zap,
  Users, Wrench
} from 'lucide-react';

const ReactApexChart = lazy(() => import('react-apexcharts'));

const dataInstallations = [
  { name: 'Normales', value: 200, color: '#29b6f6' },
  { name: 'En panne', value: 60, color: '#e53935' }
];

const dataAlarms = [
  { name: 'Critique', value: 7, color: '#e53935', icon: <AlertCircle size={16} /> },
  { name: 'Majeur', value: 10, color: '#fb8c00', icon: <Zap size={16} /> },
  { name: 'Mineur', value: 60, color: '#fdd835', icon: <AlertTriangle size={16} /> },
  { name: 'Avertis.', value: 30, color: '#29b6f6', icon: <Info size={16} /> },
];

const initialData = {
  daily: [120, 150, 100, 210, 180, 190, 220],
  monthly: [800, 1200, 1400, 1300, 1100, 1500],
  annual: [15000, 16200, 14800, 15500],
  total: [58000]
};

const StatCard = ({ icon, label, value }) => (
  <div className="bg-white shadow rounded-lg p-4 flex items-center gap-4 w-full">
    <div className="p-3 bg-gray-100 rounded-full">{icon}</div>
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-lg font-semibold text-gray-800">{value}</p>
    </div>
  </div>
);

const ProductionChart = () => {
  const [view, setView] = useState('daily');
  const [series, setSeries] = useState([
    { name: 'Objectif', data: initialData.daily },
    { name: 'Réalisé', data: initialData.daily.map((val) => Math.floor(val * 0.6)) },
  ]);

  const options = {
    chart: { type: 'area', toolbar: { show: false }, zoom: { enabled: false } },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 2 },
    fill: { type: 'gradient', gradient: { opacityFrom: 0.4, opacityTo: 0, stops: [0, 100] } },
    xaxis: {
      categories:
        view === 'daily'
          ? ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
          : view === 'monthly'
          ? ['Janv', 'Févr', 'Mars', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept']
          : view === 'annual'
          ? ['2019', '2020', '2021', '2022']
          : ['Total'],
    },
    tooltip: { y: { formatter: (val) => `${val} unités` } },
    colors: ['#3b82f6', '#93c5fd'],
  };

  const handleViewChange = (newView) => {
    setView(newView);
    const newData = initialData[newView];
    setSeries([
      { name: 'Objectif', data: newData },
      { name: 'Réalisé', data: newData.map((val) => Math.floor(val * 0.6)) },
    ]);
  };

  const buttons = [
    { label: 'Production journalière', value: 'daily' },
    { label: 'Production mensuelle', value: 'monthly' },
    { label: 'Production annuelle', value: 'annual' },
    { label: 'Totale', value: 'total' },
  ];

  return (
    <div className="bg-white p-6 mt-6 rounded-xl shadow-md w-full">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Statistics</h2>
          <p className="text-sm text-gray-500">Production</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {buttons.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => handleViewChange(value)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium ${
                view === value
                  ? 'bg-blue-100 text-blue-900'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
  );
};

const Dashboard = () => {
  return (
    <div className="pr-0 pl-0 pt-16 flex flex-col gap-0">


      <div className="flex gap-6">
        <div className="flex flex-col gap-4 w-64">
          <StatCard icon={<Users className="text-blue-600" />} label="Total Clients" value="89" />
          <StatCard icon={<Wrench className="text-green-600" />} label="Total Installateurs" value="15" />
        </div>

        <div className="flex flex-1 gap-6">
          {/* Installations */}
          <div className="flex items-center gap-4 bg-white p-4 rounded shadow w-full">
            <div className="relative">
              <PieChart width={220} height={220}>
                <Pie
                  data={dataInstallations}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {dataInstallations.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
              <div className="absolute inset-0 flex flex-col justify-center items-center text-gray-800">
                <span className="text-lg font-bold">
                  {dataInstallations.reduce((a, b) => a + b.value, 0)}
                </span>
                <span className="text-xs text-gray-500">Installations</span>
              </div>
            </div>
            <div className="text-sm space-y-2">
              {dataInstallations.map((entry, index) => (
                <div key={index} className="flex items-center gap-2" style={{ color: entry.color }}>
                  <span className="font-semibold">{entry.value}</span>
                  <span>{entry.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Alarms */}
          <div className="flex items-center gap-4 bg-white p-4 rounded shadow w-full">
            <div className="relative">
              <PieChart width={220} height={220}>
                <Pie
                  data={dataAlarms}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  startAngle={90}
                  endAngle={-270}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {dataAlarms.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
              <div className="absolute inset-0 flex flex-col justify-center items-center text-gray-800">
                <span className="text-lg font-bold">
                  {dataAlarms.reduce((a, b) => a + b.value, 0)}
                </span>
                <span className="text-xs text-gray-300">Total des alarmes</span>
              </div>
            </div>
            <div className="text-sm space-y-2 ml-2">
              {dataAlarms.map((entry, index) => (
                <div key={index} className="flex items-center gap-2" style={{ color: entry.color }}>
                  <div>{entry.icon}</div>
                  <span className="font-semibold">{entry.value}</span>
                  <span>{entry.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <ProductionChart />
    </div>
  );
};

export default Dashboard;
