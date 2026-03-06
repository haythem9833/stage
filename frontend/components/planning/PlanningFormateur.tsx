import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Props {
  formateurId: number;
}

export default function PlanningFormateur({ formateurId }: Props) {
  const [planning, setPlanning] = useState<any>(null);
  const [indisponibilites, setIndisponibilites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlanning();
  }, [formateurId]);

  const fetchPlanning = async () => {
    try {
      const response = await axios.get(`/api/formateurs/${formateurId}/planning`);
      setPlanning(response.data);
      setIndisponibilites(response.data.indisponibilites || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleAddIndisponibilite = async (dateDebut: string, dateFin: string, raison: string) => {
    try {
      await axios.post(`/api/formateurs/${formateurId}/disponibilites`, {
        date_debut: dateDebut,
        date_fin: dateFin,
        type: 'indisponibilite',
        raison,
      });
      fetchPlanning();
      alert('Indisponibilité ajoutée');
    } catch (err) {
      console.error(err);
      alert('Erreur lors de l\'ajout');
    }
  };

  if (loading) return <div>Chargement du planning...</div>;

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Planning - {planning?.formateur?.prenom} {planning?.formateur?.nom}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-3">Indisponibilités</h3>
          {indisponibilites.length > 0 ? (
            <ul className="space-y-2">
              {indisponibilites.map((ind) => (
                <li key={ind.id} className="bg-red-50 p-3 rounded border border-red-200">
                  <p className="font-medium">{ind.raison || 'Indisponible'}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(ind.date_debut).toLocaleDateString()} - {new Date(ind.date_fin).toLocaleDateString()}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">Aucune indisponibilité enregistrée</p>
          )}
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3">Horaires Préférés</h3>
          <p className="text-gray-700">
            <strong>Début:</strong> {planning?.formateur?.heure_debut_prefere || '08:00'}
          </p>
          <p className="text-gray-700">
            <strong>Fin:</strong> {planning?.formateur?.heure_fin_prefere || '17:00'}
          </p>
        </div>
      </div>
    </div>
  );
}
