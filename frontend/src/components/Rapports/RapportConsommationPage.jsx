import React, { useEffect, useState } from "react";
import ApiService from "../../Api/Api";
import Chart from "react-apexcharts";
import dayjs from "dayjs";
 
const RapportConsommationPage = () => {
  const [installations, setInstallations] = useState([]);
  const [installationId, setInstallationId] = useState("");
  const [mois, setMois] = useState(dayjs().format("YYYY-MM"));
  const [donnees, setDonnees] = useState([]);
 
  const fetchInstallations = async () => {
    try {
      const res = await ApiService.getInstallations();
      setInstallations(res.data.results || res.data);
    } catch (err) {
      console.error("Erreur installations :", err);
    }
  };
 
  const fetchRapport = async () => {
    try {
      const res = await ApiService.rapports.getRapportConsommationMensuelle(
        installationId,
        mois
      );
      setDonnees(res.data);
    } catch (err) {
      console.error("Erreur chargement rapport :", err);
    }
  };
 
  useEffect(() => {
    fetchInstallations();
  }, []);
 
  const handleSubmit = (e) => {
    e.preventDefault();
    if (installationId && mois) fetchRapport();
  };
 
  const handleExportExcel = async () => {
    try {
      const res = await ApiService.rapports.exportRapportConsommation({
        installation_id: installationId,
        mois,
      });
 
      const blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `rapport_consommation_${mois}.xlsx`;
      a.click();
    } catch (err) {
      console.error("Erreur export Excel :", err);
    }
  };
 
  const handleExportPDF = async () => {
    try {
      const res = await ApiService.rapports.exportRapportConsommationPDF({
        installation_id: installationId,
        mois,
      });
 
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `rapport_consommation_${mois}.pdf`;
      a.click();
    } catch (err) {
      console.error("Erreur export PDF :", err);
    }
  };
 
  return (
<div className="p-8 text-gray-800">
<h2 className="text-2xl font-bold mb-6">Rapport de Consommation Mensuelle</h2>
 
<form
        onSubmit={handleSubmit}
        className="mb-6 flex flex-wrap items-center gap-4"
>
<select
          value={installationId}
          onChange={(e) => setInstallationId(e.target.value)}
          className="border border-gray-300 p-2 rounded w-full sm:w-auto"
>
<option value="">-- Sélectionner une installation --</option>
          {installations.map((inst) => (
<option key={inst.id} value={inst.id}>
              {inst.nom}
</option>
          ))}
</select>
 
        <input
          type="month"
          value={mois}
          onChange={(e) => setMois(e.target.value)}
          className="border border-gray-300 p-2 rounded"
        />
 
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
>
          Générer
</button>
</form>
 
      {donnees.length > 0 && (
<div className="grid md:grid-cols-2 gap-8">
<div>
<h3 className="text-lg font-semibold mb-2">Tableau de consommation</h3>
<div className="overflow-x-auto">
<table className="w-full border border-gray-300 text-sm">
<thead className="bg-gray-100">
<tr>
<th className="p-2 border">Date</th>
<th className="p-2 border">Consommation (kWh)</th>
</tr>
</thead>
<tbody>
                  {donnees.map((item, index) => (
<tr key={index} className="hover:bg-gray-50">
<td className="p-2 border">{item.jour}</td>
<td className="p-2 border">
                        {item.consommation_kwh.toFixed(2)}
</td>
</tr>
                  ))}
</tbody>
</table>
</div>
</div>
 
<div>
<h3 className="text-lg font-semibold mb-2">Graphique de consommation</h3>
<Chart
              type="line"
              height={320}
              options={{
                chart: { id: "conso-line" },
                xaxis: {
                  categories: donnees.map((d) => d.jour),
                  title: { text: "Jour" },
                },
                yaxis: { title: { text: "kWh" } },
                stroke: { curve: "smooth" },
                tooltip: { enabled: true },
              }}
              series={[
                {
                  name: "Consommation",
                  data: donnees.map((d) => d.consommation_kwh),
                },
              ]}
            />
</div>
 
<div className="md:col-span-2 flex justify-end gap-4 mt-4">
<button
              type="button"
              onClick={handleExportExcel}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
>
              📤 Exporter Excel
</button>
<button
              type="button"
              onClick={handleExportPDF}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
>
              📄 Exporter PDF
</button>
</div>
</div>
      )}
</div>
  );
};
 
export default RapportConsommationPage;