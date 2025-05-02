import { useEffect, useState } from "react";
import ApiService from "../../../Api/Api";
import RappelForm from "./RappelForm";
export default function MesEntretiens() {
  const [entretiens, setEntretiens] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const response = await ApiService.getMesEntretiens();
      setEntretiens(response.data);
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold mb-4">🛠️ Mes entretiens</h1>

      {entretiens.map((e) => (
        <div key={e.id} className="border p-4 rounded shadow">
          <h2 className="font-semibold text-lg">{e.installation_details.nom}</h2>
          <p>Type : {e.type_entretien}</p>
          <p>Date : {new Date(e.date_debut).toLocaleString()}</p>

          <div className="mt-4">
            <RappelForm entretienId={e.id} />
          </div>
        </div>
      ))}
    </div>
  );
}
