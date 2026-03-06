import { useEffect, useState, useContext } from "react";
import { useRouter } from "next/router";
import PrivateRoute from "../../components/PrivateRoute";
import { AuthContext } from "../../context/AuthContext";
import {
  getFormations,
  getFormation,
  getPresences,
  batchRecordPresences,
  getPresenceSynthese,
} from "../../services/api";
import {
  Calendar,
  Users,
  CheckCircle,
  AlertCircle,
  Save,
  Lock,
  ArrowLeft,
  Eye,
  Plus,
} from "lucide-react";

export default function FormateurPresences() {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const [formations, setFormations] = useState([]);
  const [selectedFormation, setSelectedFormation] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState('record');
  const [presenceMarks, setPresenceMarks] = useState({});
  const [recordedPresences, setRecordedPresences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [synthese, setSynthese] = useState(null);

  const fetchFormations = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getFormations();
      const formateurFormations = (res.data || []).filter(
        (f) => Number(f.formateur_id) === Number(user?.id) && f.date_debut && new Date(f.date_debut) <= new Date()
      );
      setFormations(formateurFormations);

      if (formateurFormations.length > 0 && !selectedFormation) {
        setSelectedFormation(formateurFormations[0]);
      }
    } catch (err) {
      setError("Impossible de charger les formations");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPresences = async (formationId) => {
    try {
      const res = await getPresences(formationId);
      const presences = res.data || [];
      
      const enrichedPresences = presences.map(p => ({
        ...p,
        nom: p.inscription?.user?.nom || 'N/A',
        prenom: p.inscription?.user?.prenom || 'N/A',
        email: p.inscription?.user?.email || 'N/A',
      }));
      
      setRecordedPresences(enrichedPresences);

      const syntheseRes = await getPresenceSynthese(formationId);
      setSynthese(syntheseRes.data || {});
    } catch (err) {
      console.error("Erreur lors du chargement des presences:", err);
    }
  };

  useEffect(() => {
    fetchFormations();
  }, [user?.id]);

  useEffect(() => {
    if (selectedFormation?.id) {
      fetchPresences(selectedFormation.id);
      setPresenceMarks({});
      setError(null);
      setSuccess(null);
    }
  }, [selectedFormation?.id]);

  const isDateLocked = () => {
    return recordedPresences.some(p => p.date_session === selectedDate);
  };

  const togglePresence = (inscriptionId) => {
    setPresenceMarks(prev => {
      const current = prev[inscriptionId];
      const next = current === 'present' ? 'absent' : current === 'absent' ? null : 'present';
      return {
        ...prev,
        [inscriptionId]: next
      };
    });
  };

  const handleSavePresences = async () => {
    try {
      if (!selectedFormation) {
        setError("Aucune formation sélectionnée");
        return;
      }

      const presences = Object.entries(presenceMarks)
        .filter(([_, statut]) => statut !== null)
        .map(([inscriptionId, statut]) => ({
          inscription_id: parseInt(inscriptionId),
          statut: statut
        }));

      if (presences.length === 0) {
        setError("Veuillez marquer au moins un étudiant");
        return;
      }

      setSaving(true);
      setError(null);

      await batchRecordPresences(selectedFormation.id, {
        date: selectedDate,
        presences: presences
      });

      setSuccess("✅ Feuille de présence sauvegardée avec succès!");
      
      await fetchPresences(selectedFormation.id);
      setPresenceMarks({});
      
      setTimeout(() => setSuccess(null), 4000);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Erreur lors de la sauvegarde";
      setError("❌ " + errorMsg);
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PrivateRoute roles={["formateur"]}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Chargement...</p>
            </div>
          </div>
        </div>
      </PrivateRoute>
    );
  }

  return (
    <PrivateRoute roles={["formateur"]}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-white rounded-lg transition"
            >
              <ArrowLeft className="text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Feuille de Présence</h1>
              <p className="text-gray-600 mt-1">Enregistrer et consulter les présences</p>
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2">
              <AlertCircle size={20} />
              {error}
            </div>
          )}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 flex items-center gap-2">
              <CheckCircle size={20} />
              {success}
            </div>
          )}

          {formations.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <Calendar className="mx-auto mb-4 text-gray-400" size={48} />
              <p className="text-gray-600">
                Vous n'avez aucune formation qui a commencé
              </p>
            </div>
          ) : (
            <>
              {/* Top Controls */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Formation Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      📚 Formation
                    </label>
                    <select
                      value={selectedFormation?.id || ""}
                      onChange={(e) => {
                        const formation = formations.find(f => f.id == e.target.value);
                        setSelectedFormation(formation);
                        setViewMode('record');
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                    >
                      {formations.map((formation) => (
                        <option key={formation.id} value={formation.id}>
                          {formation.titre}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Mode Toggle */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      👁️ Mode
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setViewMode('record')}
                        className={`flex-1 px-4 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
                          viewMode === 'record'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <Plus size={18} />
                        Enregistrer
                      </button>
                      <button
                        onClick={() => setViewMode('view')}
                        className={`flex-1 px-4 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
                          viewMode === 'view'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <Eye size={18} />
                        Consulter
                      </button>
                    </div>
                  </div>

                  {/* Date Picker (Record Mode Only) */}
                  {viewMode === 'record' && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        📅 Date de la séance
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="date"
                          value={selectedDate}
                          onChange={(e) => {
                            setSelectedDate(e.target.value);
                            setPresenceMarks({});
                            setError(null);
                          }}
                          disabled={isDateLocked()}
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium disabled:bg-gray-100 disabled:cursor-not-allowed"
                        />
                        {isDateLocked() && (
                          <div className="flex items-center gap-2 px-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <Lock size={18} className="text-yellow-600" />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {selectedFormation && (
                <>
                  {/* Statistics */}
                  {synthese && synthese.synthese && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                      <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-green-500">
                        <p className="text-xs text-gray-600 uppercase">Présents</p>
                        <p className="text-2xl font-bold text-green-600">
                          {synthese.synthese.reduce((sum, s) => sum + s.present, 0) || 0}
                        </p>
                      </div>
                      <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-red-500">
                        <p className="text-xs text-gray-600 uppercase">Absents</p>
                        <p className="text-2xl font-bold text-red-600">
                          {synthese.synthese.reduce((sum, s) => sum + s.absent, 0) || 0}
                        </p>
                      </div>
                      <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-orange-500">
                        <p className="text-xs text-gray-600 uppercase">Justifiés</p>
                        <p className="text-2xl font-bold text-orange-600">
                          {synthese.synthese.reduce((sum, s) => sum + s.justifie, 0) || 0}
                        </p>
                      </div>
                      <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-blue-500">
                        <p className="text-xs text-gray-600 uppercase">Total</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {synthese.inscriptions_count || 0}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Record Mode */}
                  {viewMode === 'record' && (
                    <>
                      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden mb-8">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                            <Users size={20} />
                            Étudiants inscrits ({selectedFormation?.inscriptions?.length || 0})
                          </h2>
                        </div>

                        {selectedFormation?.inscriptions && selectedFormation.inscriptions.length > 0 ? (
                          <div className="divide-y divide-gray-200">
                            {selectedFormation.inscriptions.map((inscription) => {
                              const currentMark = presenceMarks[inscription.id];
                              const isLocked = isDateLocked();

                              return (
                                <div
                                  key={inscription.id}
                                  className="px-6 py-4 hover:bg-gray-50 transition flex items-center justify-between"
                                >
                                  <div className="flex-1">
                                    <p className="font-medium text-gray-900">
                                      {inscription.user ? `${inscription.user.prenom || ''} ${inscription.user.nom || ''}`.trim() : "N/A"}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                      {inscription.user?.email || ""}
                                    </p>
                                  </div>

                                  <div className="flex items-center gap-3 ml-4">
                                    {isLocked ? (
                                      <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
                                        <span className="text-sm font-semibold text-gray-600">
                                          🔒 Verrouillé
                                        </span>
                                      </div>
                                    ) : (
                                      <div className="flex gap-2">
                                        <button
                                          onClick={() => togglePresence(inscription.id)}
                                          className={`px-4 py-2 rounded-lg font-semibold transition ${
                                            currentMark === 'present'
                                              ? 'bg-green-600 text-white'
                                              : 'bg-gray-100 text-gray-700 hover:bg-green-100'
                                          }`}
                                        >
                                          ✅ Présent
                                        </button>
                                        <button
                                          onClick={() => {
                                            setPresenceMarks(prev => {
                                              const current = prev[inscription.id];
                                              return {
                                                ...prev,
                                                [inscription.id]: current === 'absent' ? null : 'absent'
                                              };
                                            });
                                          }}
                                          className={`px-4 py-2 rounded-lg font-semibold transition ${
                                            currentMark === 'absent'
                                              ? 'bg-red-600 text-white'
                                              : 'bg-gray-100 text-gray-700 hover:bg-red-100'
                                          }`}
                                        >
                                          ❌ Absent
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="px-6 py-8 text-center text-gray-500">
                            Aucun étudiant inscrit à cette formation
                          </div>
                        )}
                      </div>

                      {!isDateLocked() && Object.values(presenceMarks).some(v => v !== null) && (
                        <div className="flex justify-end mb-8">
                          <button
                            onClick={handleSavePresences}
                            disabled={saving}
                            className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg"
                          >
                            <Save size={20} />
                            {saving ? "Sauvegarde en cours..." : "💾 Sauvegarder"}
                          </button>
                        </div>
                      )}

                      {isDateLocked() && (
                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-3 mb-8">
                          <Lock className="text-yellow-600" size={20} />
                          <p className="text-yellow-700">
                            <strong>Feuille verrouillée :</strong> Cette date a déjà été sauvegardée.
                          </p>
                        </div>
                      )}
                    </>
                  )}

                  {/* View Mode - Table */}
                  {viewMode === 'view' && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Nom</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Prénom</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Date</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Email</th>
                            <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Statut</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {recordedPresences.length > 0 ? (
                            recordedPresences.map((presence, idx) => (
                              <tr key={idx} className="hover:bg-gray-50 transition">
                                <td className="px-6 py-4 text-sm text-gray-900 font-medium">{presence.nom}</td>
                                <td className="px-6 py-4 text-sm text-gray-900">{presence.prenom}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                  {new Date(presence.date_session).toLocaleDateString('fr-FR')}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">{presence.email}</td>
                                <td className="px-6 py-4 text-center">
                                  {presence.statut === 'present' && (
                                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                                      ✅ Présent
                                    </span>
                                  )}
                                  {presence.statut === 'absent' && (
                                    <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
                                      ❌ Absent
                                    </span>
                                  )}
                                  {presence.statut === 'justifie' && (
                                    <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold">
                                      📝 Justifié
                                    </span>
                                  )}
                                  {presence.statut === 'retard' && (
                                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold">
                                      ⏰ Retard
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                Aucune présence enregistrée
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </PrivateRoute>
  );
}
