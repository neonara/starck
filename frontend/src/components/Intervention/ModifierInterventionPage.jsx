import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ApiService from '../../Api/Api';
import toast, { Toaster } from 'react-hot-toast';
import { ClipboardEdit } from 'lucide-react';

const ModifierInterventionPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [installations, setInstallations] = useState([]);
  const [techniciens, setTechniciens] = useState([]);
  const [formData, setFormData] = useState({
    installation: '',
    technicien: '',
    date_prevue: '',
    statut: '',
    description: '',
  });

  const statutOptions = [
    { value: 'en_attente', label: 'En attente' },
    { value: 'en_cours', label: 'En cours' },
    { value: 'terminee', label: 'Terminée' },
    { value: 'annulee', label: 'Annulée' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [interventionRes, installationsRes, techniciensRes] = await Promise.all([
          ApiService.getInterventionDetail(id),
          ApiService.getInstallations(),
          ApiService.getTechnicien(),
        ]);

        setFormData({
          installation: interventionRes.data.installation,
          technicien: interventionRes.data.technicien,
          date_prevue: interventionRes.data.date_prevue,
          statut: interventionRes.data.statut,
          description: interventionRes.data.description || '',
        });

        setInstallations(installationsRes.data?.results || installationsRes.data || []);
        setTechniciens(techniciensRes.data?.results || techniciensRes.data || []);
      } catch (err) {
        console.error('Erreur lors du chargement des données:', err);
        toast.error('Erreur lors du chargement des données ❌');
      }
    };

    fetchData();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const interventionData = {
        installation: parseInt(formData.installation),
        technicien: parseInt(formData.technicien),
        date_prevue: formData.date_prevue,
        statut: formData.statut,
        description: formData.description || 'Aucune description',
      };

      await ApiService.updateIntervention(id, interventionData);
      toast.success("Intervention modifiée avec succès ✅");
      navigate('/liste-interventions');
    } catch (err) {
      console.error('Erreur lors de la modification:', err);
      toast.error('Erreur lors de la modification ❌');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="pt-24 px-4 md:px-10">
      <Toaster position="top-right" />
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8 border">
        <h1 className="text-3xl font-bold text-blue-600 mb-8 flex items-center gap-2">
          <ClipboardEdit className="w-7 h-7" /> Modifier l'intervention
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            {
              label: 'Installation',
              name: 'installation',
              type: 'select',
              options: installations.map((install) => ({
                value: install.id,
                label: install.nom,
              })),
            },
            {
              label: 'Technicien',
              name: 'technicien',
              type: 'select',
              options: techniciens.map((tech) => ({
                value: tech.id,
                label: `${tech.first_name || ''} ${tech.last_name || ''}`.trim() || tech.email || 'Technicien sans nom',
              })),
            },
            {
              label: 'Date prévue',
              name: 'date_prevue',
              type: 'date',
            },
            {
              label: 'Statut',
              name: 'statut',
              type: 'select',
              options: statutOptions,
            },
            {
              label: 'Description',
              name: 'description',
              type: 'textarea',
            },
          ].map((field, index) => (
            <div key={index} className="grid grid-cols-3 items-center gap-4">
              <label className="text-sm font-medium text-gray-700">{field.label}</label>
              {field.type === 'select' ? (
                <select
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  className="col-span-2 block w-full rounded-md border border-gray-300 p-2 text-gray-700"
                  required
                >
                  <option value="">Sélectionner {field.label.toLowerCase()}</option>
                  {field.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : field.type === 'textarea' ? (
                <textarea
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  rows="4"
                  placeholder={`Entrer ${field.label.toLowerCase()}`}
                  className="col-span-2 block w-full rounded-md border border-gray-300 p-2 text-gray-700"
                  required
                />
              ) : (
                <input
                  type={field.type}
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  className="col-span-2 block w-full rounded-md border border-gray-300 p-2 text-gray-700"
                  required
                />
              )}
            </div>
          ))}

          <div className="flex justify-end gap-4 pt-6">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
            >
              Enregistrer
            </button>
            <button
              type="button"
              onClick={() => navigate('/liste-interventions')}
              className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-300 transition"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModifierInterventionPage;
