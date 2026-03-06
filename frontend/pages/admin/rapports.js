import { useEffect, useState } from "react";
import PrivateRoute from "../../components/PrivateRoute";
import {
  getMyHistory,
  getParticipantHistory,
  getAllParticipantsHistory,
  exportPresencesCSV,
  exportFormationsCSV,
  exportInscriptionsCSV,
  getSessionBilan,
  getPeriodBilan,
  getFormations,
  getUsers,
} from "../../services/api";
import {
  FileText,
  Download,
  Calendar,
  Users,
  BarChart3,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Activity,
} from "lucide-react";

export default function AdminRapports() {
  const [activeTab, setActiveTab] = useState("exports");
  const [formations, setFormations] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [exporting, setExporting] = useState(null);
  const [selectedFormation, setSelectedFormation] = useState(null);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [dateRange, setDateRange] = useState({
    dateDebut: "",
    dateFin: "",
  });
  const [bilanData, setBilanData] = useState(null);

  // Charger les formations et participants
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [formationsRes, participantsRes] = await Promise.all([
          getFormations(),
          getUsers(),
        ]);
        setFormations(formationsRes.data || []);
        setParticipants(participantsRes.data || []);
        if (formationsRes.data?.length > 0) {
          setSelectedFormation(formationsRes.data[0].id);
        }
        if (participantsRes.data?.length > 0) {
          setSelectedParticipant(participantsRes.data[0].id);
        }
      } catch (err) {
        setError("Impossible de charger les données");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleExportPresences = async () => {
    try {
      setExporting("presences");
      setError(null);
      const res = await exportPresencesCSV(
        selectedFormation || undefined
      );
      downloadCSV(res.data, "presences.csv");
      setSuccess("Export des présences réussi !");
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError("Erreur lors de l'export des présences");
      console.error(err);
    } finally {
      setExporting(null);
    }
  };

  const handleExportFormations = async () => {
    try {
      setExporting("formations");
      setError(null);
      const res = await exportFormationsCSV();
      downloadCSV(res.data, "formations.csv");
      setSuccess("Export des formations réussi !");
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError("Erreur lors de l'export des formations");
    } finally {
      setExporting(null);
    }
  };

  const handleExportInscriptions = async () => {
    try {
      setExporting("inscriptions");
      setError(null);
      const res = await exportInscriptionsCSV(
        selectedFormation || undefined
      );
      downloadCSV(res.data, "inscriptions.csv");
      setSuccess("Export des inscriptions réussi !");
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError("Erreur lors de l'export des inscriptions");
    } finally {
      setExporting(null);
    }
  };

  const handleGetSessionBilan = async () => {
    if (!selectedFormation) {
      setError("Sélectionnez une formation");
      return;
    }

    try {
      setError(null);
      const res = await getSessionBilan(selectedFormation);
      setBilanData(res.data);
      setSuccess("Bilan de formation chargé");
    } catch (err) {
      setError("Erreur lors du chargement du bilan");
    }
  };

  const handleGetPeriodBilan = async () => {
    if (!dateRange.dateDebut || !dateRange.dateFin) {
      setError("Sélectionnez une période");
      return;
    }

    try {
      setError(null);
      const res = await getPeriodBilan(
        dateRange.dateDebut,
        dateRange.dateFin
      );
      setBilanData(res.data);
      setSuccess("Bilan de période chargé");
    } catch (err) {
      setError("Erreur lors du chargement du bilan");
    }
  };

  const downloadCSV = (data, filename) => {
    if (typeof data === "string") {
      const blob = new Blob([data], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.click();
    }
  };

  if (loading) {
    return (
      <PrivateRoute roles={["admin"]}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <RefreshCw className="animate-spin mx-auto mb-4" size={40} />
            <p>Chargement des rapports...</p>
          </div>
        </div>
      </PrivateRoute>
    );
  }

  return (
    <PrivateRoute roles={["admin"]}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg">
                <FileText className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Rapports et Statistiques
                </h1>
                <p className="text-gray-600">
                  Exportez et consultez les rapports détaillés
                </p>
              </div>
            </div>
          </div>

          {/* Alerts */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-900">Erreur</p>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
              <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-green-900">Succès</p>
                <p className="text-green-700 text-sm">{success}</p>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="mb-8 bg-white rounded-lg shadow border-b border-gray-200">
            <div className="flex flex-wrap">
              {[
                { id: "exports", label: "Exports CSV", icon: Download },
                { id: "bilans", label: "Bilans", icon: BarChart3 },
                { id: "historique", label: "Historique", icon: Activity },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium transition border-b-2 ${
                    activeTab === id
                      ? "text-emerald-600 border-emerald-600"
                      : "text-gray-600 border-transparent hover:text-gray-900"
                  }`}
                >
                  <Icon size={18} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            {/* Exports Tab */}
            {activeTab === "exports" && (
              <div className="space-y-6">
                {/* Export Presences */}
                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        Exporter les Présences
                      </h3>
                      <p className="text-gray-600 text-sm mt-1">
                        Téléchargez un fichier CSV avec toutes les présences
                      </p>
                    </div>
                    <Users className="text-blue-600" size={28} />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Filtrer par formation (optionnel)
                    </label>
                    <select
                      value={selectedFormation || ""}
                      onChange={(e) =>
                        setSelectedFormation(
                          e.target.value ? parseInt(e.target.value) : null
                        )
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Toutes les formations</option>
                      {formations.map((formation) => (
                        <option key={formation.id} value={formation.id}>
                          {formation.titre} ({formation.date_debut})
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={handleExportPresences}
                    disabled={exporting === "presences"}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition font-medium"
                  >
                    {exporting === "presences" ? (
                      <>
                        <RefreshCw className="animate-spin" size={18} />
                        Export en cours...
                      </>
                    ) : (
                      <>
                        <Download size={18} />
                        Exporter les présences (CSV)
                      </>
                    )}
                  </button>
                </div>

                {/* Export Formations */}
                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        Exporter les Formations
                      </h3>
                      <p className="text-gray-600 text-sm mt-1">
                        Téléchargez la liste complète des formations
                      </p>
                    </div>
                    <TrendingUp className="text-purple-600" size={28} />
                  </div>

                  <button
                    onClick={handleExportFormations}
                    disabled={exporting === "formations"}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition font-medium"
                  >
                    {exporting === "formations" ? (
                      <>
                        <RefreshCw className="animate-spin" size={18} />
                        Export en cours...
                      </>
                    ) : (
                      <>
                        <Download size={18} />
                        Exporter les formations (CSV)
                      </>
                    )}
                  </button>
                </div>

                {/* Export Inscriptions */}
                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        Exporter les Inscriptions
                      </h3>
                      <p className="text-gray-600 text-sm mt-1">
                        Téléchargez la liste des inscriptions
                      </p>
                    </div>
                    <Users className="text-green-600" size={28} />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Filtrer par formation (optionnel)
                    </label>
                    <select
                      value={selectedFormation || ""}
                      onChange={(e) =>
                        setSelectedFormation(
                          e.target.value ? parseInt(e.target.value) : null
                        )
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">Toutes les formations</option>
                      {formations.map((formation) => (
                        <option key={formation.id} value={formation.id}>
                          {formation.titre} ({formation.date_debut})
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={handleExportInscriptions}
                    disabled={exporting === "inscriptions"}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition font-medium"
                  >
                    {exporting === "inscriptions" ? (
                      <>
                        <RefreshCw className="animate-spin" size={18} />
                        Export en cours...
                      </>
                    ) : (
                      <>
                        <Download size={18} />
                        Exporter les inscriptions (CSV)
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Bilans Tab */}
            {activeTab === "bilans" && (
              <div className="space-y-6">
                {/* Bilan Session */}
                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-500">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Bilan par Session
                  </h3>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sélectionner une formation *
                    </label>
                    <select
                      value={selectedFormation || ""}
                      onChange={(e) => setSelectedFormation(parseInt(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="">-- Choisir une formation --</option>
                      {formations.map((formation) => (
                        <option key={formation.id} value={formation.id}>
                          {formation.titre} (
                          {formation.date_debut})
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={handleGetSessionBilan}
                    disabled={!selectedFormation || exporting === "sessionBilan"}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 transition font-medium"
                  >
                    {exporting === "sessionBilan" ? (
                      <>
                        <RefreshCw className="animate-spin" size={18} />
                        Chargement...
                      </>
                    ) : (
                      <>
                        <BarChart3 size={18} />
                        Voir le bilan
                      </>
                    )}
                  </button>
                </div>

                {/* Bilan Period */}
                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-indigo-500">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Bilan par Période
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date de début *
                      </label>
                      <input
                        type="date"
                        value={dateRange.dateDebut}
                        onChange={(e) =>
                          setDateRange({
                            ...dateRange,
                            dateDebut: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date de fin *
                      </label>
                      <input
                        type="date"
                        value={dateRange.dateFin}
                        onChange={(e) =>
                          setDateRange({
                            ...dateRange,
                            dateFin: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleGetPeriodBilan}
                    disabled={
                      !dateRange.dateDebut ||
                      !dateRange.dateFin ||
                      exporting === "periodBilan"
                    }
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition font-medium"
                  >
                    {exporting === "periodBilan" ? (
                      <>
                        <RefreshCw className="animate-spin" size={18} />
                        Chargement...
                      </>
                    ) : (
                      <>
                        <BarChart3 size={18} />
                        Voir le bilan
                      </>
                    )}
                  </button>
                </div>

                {/* Bilan Results */}
                {bilanData && (
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg shadow p-6 border border-emerald-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                      Résultats du bilan
                    </h3>
                    <pre className="bg-white p-4 rounded border border-gray-200 overflow-x-auto text-sm">
                      {JSON.stringify(bilanData, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}

            {/* Historique Tab */}
            {activeTab === "historique" && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Historique des Activités
                </h3>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sélectionner un participant
                  </label>
                  <select
                    value={selectedParticipant || ""}
                    onChange={(e) => setSelectedParticipant(parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {participants.map((participant) => (
                      <option key={participant.id} value={participant.id}>
                        {participant.prenom} {participant.nom} ({participant.email})
                      </option>
                    ))}
                  </select>
                </div>

                <p className="text-gray-600 text-sm">
                  L'historique détaillé des activités d'un participant sera affichée ici après sélection.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PrivateRoute>
  );
}
