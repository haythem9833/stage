import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Props {
  sessionId: number;
}

export default function FeuillePresenceForm({ sessionId }: Props) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [inscriptions, setInscriptions] = useState<any[]>([]);
  const [presences, setPresences] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInscriptions();
  }, [sessionId]);

  const fetchInscriptions = async () => {
    try {
      const response = await axios.get(`/api/sessions/${sessionId}`);
      const inscrs = response.data.inscriptions || [];
      setInscriptions(inscrs);
      
      // Initialiser les statuts
      const initialPresences: Record<number, string> = {};
      inscrs.forEach((insc: any) => {
        initialPresences[insc.id] = 'present';
      });
      setPresences(initialPresences);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleStatutChange = (inscriptionId: number, newStatut: string) => {
    setPresences((prev) => ({
      ...prev,
      [inscriptionId]: newStatut,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await axios.post(`/api/sessions/${sessionId}/presences/batch`, {
        date,
        presences,
      });
      alert('Presences enregistrées avec succès!');
    } catch (err) {
      console.error(err);
      alert('Erreur lors de l\'enregistrement');
    }
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Feuille de Présence</h2>
      
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Date:</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left px-4 py-2">Étudiant</th>
              <th className="text-left px-4 py-2">Statut</th>
            </tr>
          </thead>
          <tbody>
            {inscriptions.map((insc) => (
              <tr key={insc.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2">{insc.etudiant?.prenom} {insc.etudiant?.nom}</td>
                <td className="px-4 py-2">
                  <select
                    value={presences[insc.id] || 'present'}
                    onChange={(e) => handleStatutChange(insc.id, e.target.value)}
                    className="border rounded px-3 py-1"
                  >
                    <option value="present">Présent</option>
                    <option value="absent">Absent</option>
                    <option value="retard">Retard</option>
                    <option value="justifie">Justifié</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        type="submit"
        className="mt-6 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
      >
        Enregistrer les Présences
      </button>
    </form>
  );
}
