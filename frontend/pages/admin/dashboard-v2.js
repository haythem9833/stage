import { useEffect, useState } from "react";
import PrivateRoute from "../../components/PrivateRoute";
import {
  getDashboardStats,
  getFormationsStats,
  getPresencesStats,
  getStats,
} from "../../services/api";
import {
  BarChart3,
  TrendingUp,
  Users,
  BookOpen,
  Calendar,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Percent,
  Clock,
  Target,
  Activity,
  Award,
} from "lucide-react";

export default function AdminDashboardV2() {
  const [stats, setStats] = useState(null);
  const [formationsStats, setFormationsStats] = useState(null);
  const [presencesStats, setPresencesStats] = useState(null);
  const [globalStats, setGlobalStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeMetric, setActiveMetric] = useState("overview");

  const fetchAllStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const [stats, formations, presences, global] = await Promise.all([
        getDashboardStats(),
        getFormationsStats(),
        getPresencesStats(),
        getStats(),
      ]);

      setStats(stats.data || {});
      setFormationsStats(formations.data || {});
      setPresencesStats(presences.data || {});
      setGlobalStats(global.data || {});
    } catch (err) {
      setError("Impossible de charger les statistiques");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllStats();
  }, []);

  const StatCard = ({
    icon: Icon,
    label,
    value,
    subtext,
    bgColor,
    textColor,
  }) => (
    <div
      className={`rounded-lg shadow p-6 border-l-4 ${bgColor} hover:shadow-lg transition`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-sm font-medium ${textColor} mb-2`}>{label}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {subtext && <p className="text-xs text-gray-500 mt-2">{subtext}</p>}
        </div>
        <Icon className={`${textColor} flex-shrink-0`} size={32} />
      </div>
    </div>
  );

  if (loading) {
    return (
      <PrivateRoute roles={["admin"]}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <RefreshCw className="animate-spin mx-auto mb-4" size={40} />
            <p>Chargement des statistiques...</p>
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
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg">
                  <BarChart3 className="text-white" size={28} />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Dashboard Avancé V2
                  </h1>
                  <p className="text-gray-600">
                    Vue d'ensemble complète du système
                  </p>
                </div>
              </div>
              <button
                onClick={fetchAllStats}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                <RefreshCw size={18} />
                Actualiser
              </button>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-900">Erreur</p>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Metric Selector Tabs */}
          <div className="mb-8 bg-white rounded-lg shadow border-b border-gray-200">
            <div className="flex flex-wrap">
              {[
                { id: "overview", label: "Vue d'ensemble", icon: BarChart3 },
                { id: "formations", label: "Formations", icon: BookOpen },
                { id: "presences", label: "Présences", icon: Calendar },
                { id: "users", label: "Utilisateurs", icon: Users },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveMetric(id)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium transition border-b-2 ${
                    activeMetric === id
                      ? "text-indigo-600 border-indigo-600"
                      : "text-gray-600 border-transparent hover:text-gray-900"
                  }`}
                >
                  <Icon size={18} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Overview Tab */}
          {activeMetric === "overview" && globalStats && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  icon={Users}
                  label="Total d'utilisateurs"
                  value={globalStats.total_users || 0}
                  bgColor="bg-blue-50 border-blue-500"
                  textColor="text-blue-600"
                />
                <StatCard
                  icon={BookOpen}
                  label="Total de formations"
                  value={globalStats.total_formations || 0}
                  bgColor="bg-purple-50 border-purple-500"
                  textColor="text-purple-600"
                />
                <StatCard
                  icon={Calendar}
                  label="Total de sessions"
                  value={globalStats.total_sessions || 0}
                  bgColor="bg-green-50 border-green-500"
                  textColor="text-green-600"
                />
                <StatCard
                  icon={Activity}
                  label="Total d'inscriptions"
                  value={globalStats.total_inscriptions || 0}
                  bgColor="bg-orange-50 border-orange-500"
                  textColor="text-orange-600"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <StatCard
                  icon={Award}
                  label="Total de certificats"
                  value={globalStats.total_certificats || 0}
                  bgColor="bg-red-50 border-red-500"
                  textColor="text-red-600"
                />
                <StatCard
                  icon={Users}
                  label="Administrateurs"
                  value={globalStats.admins || 0}
                  bgColor="bg-red-50 border-red-500"
                  textColor="text-red-600"
                />
                <StatCard
                  icon={Users}
                  label="Formateurs"
                  value={globalStats.formateurs || 0}
                  bgColor="bg-indigo-50 border-indigo-500"
                  textColor="text-indigo-600"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <StatCard
                  icon={Users}
                  label="Étudiants"
                  value={globalStats.etudiants || 0}
                  subtext={`${Math.round(
                    ((globalStats.etudiants || 0) /
                      (globalStats.total_users || 1)) *
                      100
                  )}% des utilisateurs`}
                  bgColor="bg-teal-50 border-teal-500"
                  textColor="text-teal-600"
                />
              </div>
            </div>
          )}

          {/* Formations Tab */}
          {activeMetric === "formations" && formationsStats && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <StatCard
                  icon={BookOpen}
                  label="Formations actives"
                  value={formationsStats.active || 0}
                  bgColor="bg-green-50 border-green-500"
                  textColor="text-green-600"
                />
                <StatCard
                  icon={BookOpen}
                  label="Formations terminées"
                  value={formationsStats.completed || 0}
                  bgColor="bg-blue-50 border-blue-500"
                  textColor="text-blue-600"
                />
                <StatCard
                  icon={Calendar}
                  label="Sessions planifiées"
                  value={formationsStats.sessions_scheduled || 0}
                  bgColor="bg-purple-50 border-purple-500"
                  textColor="text-purple-600"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <StatCard
                  icon={Users}
                  label="Moyenne d'inscrits par formation"
                  value={(formationsStats.avg_inscrits || 0).toFixed(1)}
                  bgColor="bg-orange-50 border-orange-500"
                  textColor="text-orange-600"
                />
                <StatCard
                  icon={Percent}
                  label="Taux de complétion moyen"
                  value={`${(formationsStats.avg_completion_rate || 0).toFixed(1)}%`}
                  bgColor="bg-indigo-50 border-indigo-500"
                  textColor="text-indigo-600"
                />
              </div>

              {formationsStats.top_formations && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Formations les plus populaires
                  </h3>
                  <div className="space-y-3">
                    {formationsStats.top_formations.map((formation, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-gray-900">
                            {formation.nom || `Formation ${idx + 1}`}
                          </p>
                          <p className="text-sm text-gray-600">
                            {formation.inscrits || 0} inscrits
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-purple-600">
                            {formation.inscrits || 0}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Presences Tab */}
          {activeMetric === "presences" && presencesStats && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  icon={CheckCircle}
                  label="Présents"
                  value={presencesStats.total_presents || 0}
                  bgColor="bg-green-50 border-green-500"
                  textColor="text-green-600"
                />
                <StatCard
                  icon={AlertCircle}
                  label="Absents"
                  value={presencesStats.total_absents || 0}
                  bgColor="bg-red-50 border-red-500"
                  textColor="text-red-600"
                />
                <StatCard
                  icon={Activity}
                  label="Absences justifiées"
                  value={presencesStats.total_justifies || 0}
                  bgColor="bg-orange-50 border-orange-500"
                  textColor="text-orange-600"
                />
                <StatCard
                  icon={Percent}
                  label="Taux de présence"
                  value={`${(presencesStats.avg_presence_rate || 0).toFixed(1)}%`}
                  bgColor="bg-blue-50 border-blue-500"
                  textColor="text-blue-600"
                />
              </div>

              {presencesStats.sessions_with_attendance && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Taux de présence par session
                  </h3>
                  <div className="space-y-3">
                    {presencesStats.sessions_with_attendance.map(
                      (session, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">
                              {session.nom || `Session ${idx + 1}`}
                            </p>
                            <p className="text-sm text-gray-600">
                              {session.total_present || 0} / {session.total ||
                                0}{" "}
                              présents
                            </p>
                          </div>
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all"
                              style={{
                                width: `${
                                  ((session.total_present || 0) /
                                    (session.total || 1)) *
                                  100
                                }%`,
                              }}
                            />
                          </div>
                          <span className="ml-4 font-bold text-gray-900 w-12 text-right">
                            {Math.round(
                              ((session.total_present || 0) /
                                (session.total || 1)) *
                                100
                            )}
                            %
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Users Tab */}
          {activeMetric === "users" && globalStats && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard
                  icon={Users}
                  label="Administrateurs"
                  value={globalStats.admins || 0}
                  subtext={`${Math.round(
                    ((globalStats.admins || 0) /
                      (globalStats.total_users || 1)) *
                      100
                  )}% des utilisateurs`}
                  bgColor="bg-red-50 border-red-500"
                  textColor="text-red-600"
                />
                <StatCard
                  icon={Users}
                  label="Formateurs"
                  value={globalStats.formateurs || 0}
                  subtext={`${Math.round(
                    ((globalStats.formateurs || 0) /
                      (globalStats.total_users || 1)) *
                      100
                  )}% des utilisateurs`}
                  bgColor="bg-indigo-50 border-indigo-500"
                  textColor="text-indigo-600"
                />
                <StatCard
                  icon={Users}
                  label="Étudiants"
                  value={globalStats.etudiants || 0}
                  subtext={`${Math.round(
                    ((globalStats.etudiants || 0) /
                      (globalStats.total_users || 1)) *
                      100
                  )}% des utilisateurs`}
                  bgColor="bg-teal-50 border-teal-500"
                  textColor="text-teal-600"
                />
              </div>

              {/* User Distribution */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6">
                  Distribution des rôles
                </h3>
                <div className="space-y-4">
                  {/* Admins */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        Administrateurs
                      </span>
                      <span className="text-sm font-bold text-red-600">
                        {globalStats.admins || 0}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-red-600 h-3 rounded-full transition-all"
                        style={{
                          width: `${
                            ((globalStats.admins || 0) /
                              (globalStats.total_users || 1)) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Formateurs */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        Formateurs
                      </span>
                      <span className="text-sm font-bold text-indigo-600">
                        {globalStats.formateurs || 0}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-indigo-600 h-3 rounded-full transition-all"
                        style={{
                          width: `${
                            ((globalStats.formateurs || 0) /
                              (globalStats.total_users || 1)) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Étudiants */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        Étudiants
                      </span>
                      <span className="text-sm font-bold text-teal-600">
                        {globalStats.etudiants || 0}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-teal-600 h-3 rounded-full transition-all"
                        style={{
                          width: `${
                            ((globalStats.etudiants || 0) /
                              (globalStats.total_users || 1)) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </PrivateRoute>
  );
}
