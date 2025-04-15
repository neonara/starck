import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import ApiService from "../../Api/Api";
import ProductionChart from "../carte-géo.jsx/ProductionChart";
import AlarmesChart from "../carte-géo.jsx/AlarmeChart";
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const InstallationMap = () => {
  const [installations, setInstallations] = useState([]);
  const [selectedInstallationId, setSelectedInstallationId] = useState(null);
  const [alarmesData, setAlarmesData] = useState(null);

  useEffect(() => {
    ApiService.getInstallationsGeoData()
      .then((res) => setInstallations(res.data.results))
      .catch((err) => console.error("Erreur API :", err));
  }, []);

  useEffect(() => {
    if (selectedInstallationId) {
      ApiService.getStatistiquesAlarmes(selectedInstallationId)
        .then((res) => setAlarmesData(res.data))
        .catch((err) => console.error("Erreur chargement alarmes", err));
    }
  }, [selectedInstallationId]);

  return (
    <div className="fixed left-64 top-16 right-0 bottom-0 z-0">
      <MapContainer
        center={[33.8869, 9.5375]}
        zoom={6}
        scrollWheelZoom={true}
        className="w-full h-full rounded-xl shadow"
      >
        <TileLayer
          attribution='© <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {installations.map((install) => (
          <Marker
            key={install.id}
            position={[parseFloat(install.latitude), parseFloat(install.longitude)]}
            eventHandlers={{
              click: () => setSelectedInstallationId(install.id),
            }}
          >
            <Popup>
              <div className="text-sm">
                <strong>{install.nom}</strong><br />
                Aujourd’hui : <span className="text-green-600 font-semibold">
                  {install.production_journaliere_kwh} kWh
                </span><br />
                <a
                  href={`/dashboard-installation/${install.id}`}
                  className="text-blue-600 underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Voir détails
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {selectedInstallationId && (
        <>
          <ProductionChart installationId={selectedInstallationId} onClose={() => setSelectedInstallationId(null)} />
          {alarmesData && <AlarmesChart data={alarmesData} />}

          <div className="absolute top-6 left-6 bg-white shadow-md rounded-lg px-4 py-3 z-[1000] w-[260px]">
            <h3 className="text-sm text-gray-600 font-medium mb-1">Revenus estimés (ce mois)</h3>
            <p className="text-xl font-bold text-green-600">
              {
                installations.find(inst => inst.id === selectedInstallationId)?.revenus_mensuels_dt
                || 0
              } DT
            </p>
          </div>
        </>
      )}

    </div>
  );
};

export default InstallationMap;
