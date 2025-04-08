import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FaPen } from "react-icons/fa";
import { Toaster, toast } from "react-hot-toast";
import { IoClose } from "react-icons/io5";
import ApiService from "../../../Api/Api";

const ModifierClientPage = () => {
  const { id } = useParams();
  const [client, setClient] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    installation: "",
    last_login: "",
  });
  

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const res = await ApiService.getUserById(id);
        setClient(res.data);
        setForm(res.data);
      } catch (err) {
        toast.error("Erreur lors du chargement du client ❌");
      }
    };
    fetchClient();
  }, [id]);
  if (!client) {
  return (
    <div className="pt-28 p-6 text-gray-700">
      Chargement des données du client...
    </div>
  );
}


  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await ApiService.updateUser(id, form);
      setClient(form);
      toast.success("Client modifié avec succès ✅");
      setIsEditing(false);
    } catch (err) {
      toast.error("Erreur lors de la modification ❌");
      console.error("Erreur PATCH :", err);
    }
  };
  


  return (
<div className="pt-28 px-6 w-full">
    <Toaster />

    <div className="w-full max-w-5xl mx-20">
      <div className="bg-white rounded-xl shadow p-6 relative">
        <h2 className="text-xl font-semibold mb-4">Informations personnelles</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 text-sm text-gray-700">
          <div>
          <p className="text-gray-500">Prénom</p>
          <p className="font-medium">{client.first_name}</p>
        </div>
        <div>
          <p className="text-gray-500">Nom</p>
          <p className="font-medium">{client.last_name}</p>
        </div>
        <div>
          <p className="text-gray-500">Email</p>
          <p className="font-medium">{client.email}</p>
        </div>
        <div>
          <p className="text-gray-500">Téléphone</p>
          <p className="font-medium">{client.phone_number}</p>
        </div>
        <div>
          <p className="text-gray-500">Installation</p>
          <p className="font-medium">{client.installation}</p>
        </div>
        <div>
          <p className="text-gray-500">Dernière connexion</p>
          <p className="font-medium">{new Date(client.last_login).toLocaleString()}</p>
        </div>
      </div>

      <button
        onClick={() => setIsEditing(true)}
        className="absolute top-6 right-6 px-4 py-2 flex items-center gap-2 rounded-full border text-sm hover:bg-gray-100"
      >
        ✏️ Modifier
      </button>
    </div>
  </div>


      {/* ---- MODAL ÉDITION ---- */}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center">
          <form
            onSubmit={handleSubmit}
            className="bg-white w-full max-w-2xl rounded-xl p-6 shadow-lg relative max-h-[90vh] overflow-y-auto"
          >
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-black text-xl"
            >
              <IoClose />
            </button>

            <h2 className="text-2xl font-semibold mb-1">Modifier le client</h2>
            <p className="text-gray-500 mb-6">Met à jour les informations du client sélectionné.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Prénom</label>
                <input
                  type="text"
                  name="first_name"
                  value={form.first_name || ""}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Nom</label>
                <input
                  type="text"
                  name="last_name"
                  value={form.last_name}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Numéro de téléphone</label>
                <input
                  type="text"
                  name="phone_number"
                  value={form.phone_number}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Installation associée</label>
                <select
                  name="installation"
                  value={form.installation}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded"
                >
                  <option value="Installation A">Installation A</option>
                  <option value="Installation B">Installation B</option>
                  <option value="Installation C">Installation C</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Dernière connexion</label>
                <input
                  type="text"
                  value={
                    form.last_login
                      ? new Date(form.last_login).toLocaleString()
                      : "—"
                  }
                  disabled
                  className="w-full border px-3 py-2 rounded bg-gray-100 text-gray-600"
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded border text-gray-700 hover:bg-gray-100"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
              >
                Enregistrer
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ModifierClientPage;
