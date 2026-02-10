import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import PrivateRoute from "../../components/PrivateRoute";
import {
  getUsers,
  getFormations,
  getSessions,
  getInscriptions,
  getCertificats,
  getRoleRequests,
} from "../../services/api";
import {
  Shield,
  Users,
  BookOpen,
  FileText,
  Award,
  Clock,
  TrendingUp,
  ArrowRight,
  RefreshCw,
  AlertTriangle,
  UserPlus,
  Video,
  Activity,
  CheckCircle,
  BarChart3,
  Target,
  Settings,
  Zap,
  Play,
  Calendar,
  User,
  Bell,
  Lock,
  ShieldAlert,
  Edit,
  Star,
} from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({
    users: 0,
    formations: 0,
    sessions: 0,
    inscriptions: 0,
    certificats: 0,
    formateurs: 0,
    etudiants: 0,
    sessionsActives: 0,
    pendingRequests: 0,
    formationsPubliees: 0,
    formationsBrouillon: 0,
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [systemAlerts, setSystemAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        users,
        formations,
        sessions,
        inscriptions,
        certificats,
        roleRequests,
      ] = await Promise.all([
        getUsers(),
        getFormations(),
        getSessions(),
        getInscriptions(),
        getCertificats(),
        getRoleRequests().catch((e) => ({ data: [] })),
      ]);

      const usersData = users.data || [];
      const formationsData = formations.data || [];
      const sessionsData = sessions.data || [];
      const inscriptionsData = inscriptions.data || [];
      const certificatsData = certificats.data || [];
      const roleRequestsData = roleRequests.data || [];

      const formateurs = usersData.filter((u) => u.role === "formateur");
      const etudiants = usersData.filter((u) => u.role === "etudiant");
      const sessionsActives = sessionsData.filter((s) => s.statut === "active");
      const formationsPubliees = formationsData.filter((f) => f.statut === "publie");
      const formationsBrouillon = formationsData.filter((f) => f.statut === "brouillon");
      const upcoming = sessionsData
        .filter((s) => new Date(s.date) > new Date())
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 4);

      setStats({
        users: usersData.length,
        formations: formationsData.length,
        sessions: sessionsData.length,
        inscriptions: inscriptionsData.length,
        certificats: certificatsData.length,
        formateurs: formateurs.length,
        etudiants: etudiants.length,
        sessionsActives: sessionsActives.length,
        pendingRequests: roleRequestsData.length,
        formationsPubliees: formationsPubliees.length,
        formationsBrouillon: formationsBrouillon.length,
      });

      // Generate recent activities
      const activities = [
        ...sessionsData.slice(0, 3).map((s) => ({
          id: `session-${s.id}`,
          type: "session",
          title: `Session ${s.nom || "créée"}`,
          date: s.created_at || new Date().toISOString(),
        })),
        ...formationsData.slice(0, 2).map((f) => ({
          id: `formation-${f.id}`,
          type: "formation",
          title: `Formation ${f.nom} ${f.statut === "publie" ? "publiée" : "créée"}`,
          date: f.created_at || new Date().toISOString(),
        })),
      ];
      setRecentActivities(activities.slice(0, 5));

      // System alerts
      const alerts = [];
      if (roleRequestsData.length > 0) {
        alerts.push({
          type: "warning",
          message: `${roleRequestsData.length} demande${roleRequestsData.length > 1 ? "s" : ""} de changement de rôle en attente`,
          count: roleRequestsData.length,
        });
      }
      if (sessionsActives.length > 10) {
        alerts.push({
          type: "info",
          message: `${sessionsActives.length} sessions actives`,
          count: sessionsActives.length,
        });
      }
      if (formationsBrouillon.length > 3) {
        alerts.push({
          type: "info",
          message: `${formationsBrouillon.length} formations en brouillon`,
          count: formationsBrouillon.length,
        });
      }
      setSystemAlerts(alerts);

    } catch (err) {
      console.error("Erreur chargement dashboard:", err);
      setError("Impossible de charger les données du dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (path) => {
    router.push(path);
  };

  if (loading) {
    return (
      <PrivateRoute roles={["admin"]}>
        <div className="admin-dashboard">
          <div className="loading-state">
            <RefreshCw className="spinning" />
            <span>Chargement du tableau de bord...</span>
          </div>

          <style jsx>{`
            .admin-dashboard {
              min-height: 100vh;
              background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 24px;
            }

            .loading-state {
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 16px;
            }

            .loading-state svg {
              width: 64px;
              height: 64px;
              color: #667eea;
            }

            .loading-state span {
              font-size: 1.125rem;
              color: #6b7280;
            }

            @keyframes spin {
              to {
                transform: rotate(360deg);
              }
            }

            .spinning {
              animation: spin 1s linear infinite;
            }
          `}</style>
        </div>
      </PrivateRoute>
    );
  }

  return (
    <PrivateRoute roles={["admin"]}>
      <div className="admin-dashboard">
        {/* Header */}
        <div className="dashboard-header">
          <div className="header-content">
            <div className="welcome-section">
              <div className="avatar-wrapper">
                <Shield />
              </div>
              <div>
                <h1>Bonjour, Admin ! 🛡️</h1>
                <p>Panneau de contrôle de la plateforme</p>
              </div>
            </div>
            <div className="header-actions">
              <Link href="/" className="btn-menu-principal">
                ← Menu Principal
              </Link>
              <button className="btn-refresh" onClick={fetchDashboardData}>
                <RefreshCw />
                Actualiser
              </button>
            </div>
          </div>
        </div>

        {/* System Alerts */}
        {systemAlerts.length > 0 && (
          <div className="alerts-section">
            {systemAlerts.map((alert, index) => (
              <div
                key={index}
                className={`alert-card alert-${alert.type}`}
              >
                <div className="alert-icon-wrapper">
                  {alert.type === "warning" ? (
                    <AlertTriangle />
                  ) : (
                    <Bell />
                  )}
                </div>
                <div className="alert-content">
                  <p className="alert-message">{alert.message}</p>
                  <button
                    className="alert-action"
                    onClick={() =>
                      alert.type === "warning"
                        ? handleQuickAction("/admin/users")
                        : handleQuickAction("/admin/formations")
                    }
                  >
                    Gérer
                    <ArrowRight />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card stat-primary">
            <div className="stat-icon">
              <Users />
            </div>
            <div className="stat-content">
              <span className="stat-value">{stats.users}</span>
              <span className="stat-label">Utilisateurs</span>
            </div>
            <TrendingUp className="stat-trend" />
          </div>

          <div className="stat-card stat-purple">
            <div className="stat-icon">
              <BookOpen />
            </div>
            <div className="stat-content">
              <span className="stat-value">{stats.formations}</span>
              <span className="stat-label">Formations</span>
            </div>
            <TrendingUp className="stat-trend" />
          </div>

          <div className="stat-card stat-success">
            <div className="stat-icon">
              <FileText />
            </div>
            <div className="stat-content">
              <span className="stat-value">{stats.inscriptions}</span>
              <span className="stat-label">Inscriptions</span>
            </div>
            <TrendingUp className="stat-trend" />
          </div>

          <div className="stat-card stat-info">
            <div className="stat-icon">
              <UserPlus />
            </div>
            <div className="stat-content">
              <span className="stat-value">{stats.formateurs}</span>
              <span className="stat-label">Formateurs</span>
            </div>
            <TrendingUp className="stat-trend" />
          </div>
        </div>

        {/* Secondary Stats */}
        <div className="secondary-stats-grid">
          <div className="secondary-stat">
            <div className="stat-icon-small stat-icon-indigo">
              <Lock />
            </div>
            <div className="stat-content-small">
              <span className="stat-value-small">{stats.sessionsActives}</span>
              <span className="stat-label-small">Sessions Actives</span>
            </div>
          </div>

          <div className="secondary-stat">
            <div className="stat-icon-small stat-icon-rose">
              <ShieldAlert />
            </div>
            <div className="stat-content-small">
              <span className="stat-value-small">{stats.pendingRequests}</span>
              <span className="stat-label-small">Demandes</span>
            </div>
          </div>

          <div className="secondary-stat">
            <div className="stat-icon-small stat-icon-green">
              <CheckCircle />
            </div>
            <div className="stat-content-small">
              <span className="stat-value-small">{stats.formationsPubliees}</span>
              <span className="stat-label-small">Publiées</span>
            </div>
          </div>

          <div className="secondary-stat">
            <div className="stat-icon-small stat-icon-orange">
              <Edit />
            </div>
            <div className="stat-content-small">
              <span className="stat-value-small">{stats.formationsBrouillon}</span>
              <span className="stat-label-small">Brouillons</span>
            </div>
          </div>
        </div>

        {/* Quick Actions & Content */}
        <div className="dashboard-content">
          {/* Quick Actions */}
          <div className="quick-actions-section">
            <div className="section-header">
              <h2>Accès Rapide</h2>
              <p>Gérez tous les aspects de la plateforme</p>
            </div>
            <div className="quick-actions-grid">
              <button
                className="quick-action-card action-primary"
                onClick={() => handleQuickAction("/admin/users")}
              >
                <div className="action-icon">
                  <Users />
                </div>
                <div className="action-content">
                  <h3>Utilisateurs</h3>
                  <p>Gérez les utilisateurs et leurs rôles</p>
                </div>
                <div className="action-arrow">
                  <ArrowRight />
                </div>
              </button>

              <button
                className="quick-action-card action-purple"
                onClick={() => handleQuickAction("/admin/formations")}
              >
                <div className="action-icon">
                  <BookOpen />
                </div>
                <div className="action-content">
                  <h3>Formations</h3>
                  <p>Créez et gérez les formations</p>
                </div>
                <div className="action-arrow">
                  <ArrowRight />
                </div>
              </button>

              <button
                className="quick-action-card action-success"
                onClick={() => handleQuickAction("/admin/inscriptions")}
              >
                <div className="action-icon">
                  <FileText />
                </div>
                <div className="action-content">
                  <h3>Inscriptions</h3>
                  <p>Suivez les inscriptions</p>
                </div>
                <div className="action-arrow">
                  <ArrowRight />
                </div>
              </button>

              <button
                className="quick-action-card action-info"
                onClick={() => handleQuickAction("/admin/role-requests")}
              >
                <div className="action-icon">
                  <ShieldAlert />
                </div>
                <div className="action-content">
                  <h3>Changements de Rôle</h3>
                  <p>{stats.pendingRequests} en attente</p>
                </div>
                <div className="action-arrow">
                  <ArrowRight />
                </div>
              </button>

              <button
                className="quick-action-card action-rose"
                onClick={() => handleQuickAction("/admin/evaluations")}
              >
                <div className="action-icon">
                  <Star />
                </div>
                <div className="action-content">
                  <h3>Résultats d'Évaluation</h3>
                  <p>Analysez les évaluations</p>
                </div>
                <div className="action-arrow">
                  <ArrowRight />
                </div>
              </button>
            </div>
          </div>

          {/* Right Column */}
          <div className="right-column">
            {/* Recent Activities */}
            <div className="activities-section">
              <div className="section-header">
                <h2>
                  <Activity className="section-icon" />
                  Activités Récentes
                </h2>
              </div>

              {recentActivities.length === 0 ? (
                <div className="empty-cards">
                  <Activity />
                  <p>Aucune activité récente</p>
                </div>
              ) : (
                <div className="activities-list">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="activity-item">
                      <div
                        className={`activity-icon-wrapper ${activity.type === "formation" ? "formation" : "session"}`}
                      >
                        {activity.type === "formation" ? (
                          <BookOpen className="activity-icon" />
                        ) : (
                          <Video className="activity-icon" />
                        )}
                      </div>
                      <div className="activity-info">
                        <p className="activity-title">{activity.title}</p>
                        <p className="activity-date">
                          {new Date(activity.date).toLocaleDateString("fr-FR", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Progress Stats */}
            <div className="progress-section">
              <div className="section-header">
                <h2>
                  <BarChart3 className="section-icon" />
                  Statistiques Clés
                </h2>
              </div>

              <div className="progress-stats">
                <div className="progress-item">
                  <div className="progress-header">
                    <span>Sessions Actives</span>
                    <span>{stats.sessionsActives} / {stats.sessions}</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill progress-primary"
                      style={{
                        width: `${stats.sessions > 0 ? (stats.sessionsActives / stats.sessions) * 100 : 0}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div className="progress-item">
                  <div className="progress-header">
                    <span>Formations Publiées</span>
                    <span>{stats.formationsPubliees} / {stats.formations}</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill progress-purple"
                      style={{ width: `${stats.formations > 0 ? (stats.formationsPubliees / stats.formations) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>

                <div className="progress-item">
                  <div className="progress-header">
                    <span>Taux de Demande</span>
                    <span>{stats.pendingRequests}</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill progress-warning"
                      style={{ width: `${Math.min(stats.pendingRequests * 10, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .admin-dashboard {
          min-height: 100vh;
          background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);
          padding: 24px;
        }

        /* Header */
        .dashboard-header {
          background: white;
          border-radius: 16px;
          padding: 32px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
          margin-bottom: 32px;
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-actions {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .btn-menu-principal {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 12px 20px;
          background: #f0f4f8;
          color: #667eea;
          border: 2px solid #667eea;
          border-radius: 10px;
          font-size: 0.9375rem;
          font-weight: 600;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .btn-menu-principal:hover {
          background: #667eea;
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .welcome-section {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .avatar-wrapper {
          width: 72px;
          height: 72px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 50%;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .avatar-wrapper svg {
          width: 36px;
          height: 36px;
        }

        .dashboard-header h1 {
          font-size: 1.75rem;
          font-weight: 700;
          color: #1a1a2e;
          margin: 0 0 4px 0;
        }

        .dashboard-header p {
          font-size: 0.9375rem;
          color: #6b7280;
          margin: 0;
        }

        .btn-refresh {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 0.9375rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-refresh:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .btn-refresh svg {
          width: 18px;
          height: 18px;
        }

        /* Alerts Section */
        .alerts-section {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 32px;
        }

        .alert-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px 20px;
          border-radius: 12px;
          background: white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
          transition: all 0.3s ease;
        }

        .alert-card.alert-warning {
          border-left: 4px solid #f59e0b;
          background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
        }

        .alert-card.alert-info {
          border-left: 4px solid #667eea;
          background: linear-gradient(135deg, #e8eaf6 0%, #ede7f6 100%);
        }

        .alert-card:hover {
          transform: translateX(4px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .alert-icon-wrapper {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          flex-shrink: 0;
        }

        .alert-card.alert-warning .alert-icon-wrapper {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          color: white;
        }

        .alert-card.alert-info .alert-icon-wrapper {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .alert-icon-wrapper svg {
          width: 20px;
          height: 20px;
        }

        .alert-content {
          flex: 1;
        }

        .alert-message {
          font-size: 0.9375rem;
          color: #1f293b;
          font-weight: 500;
          margin: 0 0 4px 0;
        }

        .alert-action {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: rgba(102, 126, 234, 0.1);
          border: 1px solid #667eea;
          border-radius: 8px;
          font-size: 0.8125rem;
          color: #667eea;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .alert-action:hover {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 24px;
        }

        .stat-card {
          background: white;
          border-radius: 16px;
          padding: 24px;
          display: flex;
          align-items: center;
          gap: 16px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .stat-card::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
        }

        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        }

        .stat-card.stat-primary::before {
          background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
        }

        .stat-card.stat-purple::before {
          background: linear-gradient(90deg, #8b5cf6 0%, #7c3aed 100%);
        }

        .stat-card.stat-blue::before {
          background: linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%);
        }

        .stat-card.stat-success::before {
          background: linear-gradient(90deg, #10b981 0%, #059669 100%);
        }

        .stat-card.stat-warning::before {
          background: linear-gradient(90deg, #f59e0b 0%, #d97706 100%);
        }

        .stat-card.stat-info::before {
          background: linear-gradient(90deg, #06b6d4 0%, #0891b2 100%);
        }

        .stat-icon {
          width: 56px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          flex-shrink: 0;
        }

        .stat-card.stat-primary .stat-icon {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .stat-card.stat-purple .stat-icon {
          background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
          color: white;
        }

        .stat-card.stat-blue .stat-icon {
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          color: white;
        }

        .stat-card.stat-success .stat-icon {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
        }

        .stat-card.stat-warning .stat-icon {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          color: white;
        }

        .stat-card.stat-info .stat-icon {
          background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
          color: white;
        }

        .stat-icon svg {
          width: 28px;
          height: 28px;
        }

        .stat-content {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .stat-value {
          font-size: 1.75rem;
          font-weight: 700;
          color: #1a1a2e;
          line-height: 1;
        }

        .stat-label {
          font-size: 0.875rem;
          color: #6b7280;
          font-weight: 500;
        }

        .stat-trend {
          position: absolute;
          top: 16px;
          right: 16px;
          width: 20px;
          height: 20px;
          color: #10b981;
          opacity: 0.5;
        }

        /* Secondary Stats Grid */
        .secondary-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 16px;
          margin-bottom: 32px;
        }

        .secondary-stat {
          background: white;
          border-radius: 12px;
          padding: 16px 20px;
          display: flex;
          align-items: center;
          gap: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
          transition: all 0.3s ease;
        }

        .secondary-stat:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .stat-icon-small {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          flex-shrink: 0;
        }

        .stat-icon-small.stat-icon-indigo {
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
          color: white;
        }

        .stat-icon-small.stat-icon-rose {
          background: linear-gradient(135deg, #f43f5e 0%, #e11d48 100%);
          color: white;
        }

        .stat-icon-small.stat-icon-green {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
        }

        .stat-icon-small.stat-icon-orange {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          color: white;
        }

        .stat-icon-small svg {
          width: 18px;
          height: 18px;
        }

        .stat-content-small {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .stat-value-small {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1a1a2e;
          line-height: 1;
        }

        .stat-label-small {
          font-size: 0.75rem;
          color: #6b7280;
          font-weight: 500;
        }

        /* Dashboard Content */
        .dashboard-content {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 24px;
        }

        @media (max-width: 1024px) {
          .dashboard-content {
            grid-template-columns: 1fr;
          }
        }

        /* Quick Actions Section */
        .quick-actions-section {
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        }

        .section-header {
          margin-bottom: 24px;
        }

        .section-header h2 {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1a1a2e;
          margin: 0 0 8px 0;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .section-icon {
          width: 24px;
          height: 24px;
          color: #667eea;
        }

        .section-header p {
          font-size: 0.875rem;
          color: #6b7280;
          margin: 0;
        }

        .quick-actions-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        @media (max-width: 640px) {
          .quick-actions-grid {
            grid-template-columns: 1fr;
          }
        }

        .quick-action-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          border: 2px solid transparent;
          border-radius: 12px;
          background: #f8fafc;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: left;
        }

        .quick-action-card.action-primary:hover {
          border-color: #667eea;
          background: linear-gradient(135deg, #ede7f6 0%, #e8eaf6 100%);
          transform: translateX(4px);
        }

        .quick-action-card.action-purple:hover {
          border-color: #8b5cf6;
          background: linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%);
          transform: translateX(4px);
        }

        .quick-action-card.action-blue:hover {
          border-color: #3b82f6;
          background: linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%);
          transform: translateX(4px);
        }

        .quick-action-card.action-success:hover {
          border-color: #10b981;
          background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
          transform: translateX(4px);
        }

        .quick-action-card.action-warning:hover {
          border-color: #f59e0b;
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          transform: translateX(4px);
        }

        .quick-action-card.action-info:hover {
          border-color: #06b6d4;
          background: linear-gradient(135deg, #cffafe 0%, #a5f3fc 100%);
          transform: translateX(4px);
        }

        .quick-action-card.action-rose:hover {
          border-color: #f43f5e;
          background: linear-gradient(135deg, #ffe4e6 0%, #fecdd3 100%);
          transform: translateX(4px);
        }

        .action-icon {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          flex-shrink: 0;
        }

        .quick-action-card.action-primary .action-icon {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .quick-action-card.action-purple .action-icon {
          background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
          color: white;
        }

        .quick-action-card.action-blue .action-icon {
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          color: white;
        }

        .quick-action-card.action-success .action-icon {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
        }

        .quick-action-card.action-warning .action-icon {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          color: white;
        }

        .quick-action-card.action-info .action-icon {
          background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
          color: white;
        }

        .quick-action-card.action-rose .action-icon {
          background: linear-gradient(135deg, #f43f5e 0%, #e11d48 100%);
          color: white;
        }

        .action-icon svg {
          width: 24px;
          height: 24px;
        }

        .action-content {
          flex: 1;
        }

        .action-content h3 {
          font-size: 1rem;
          font-weight: 600;
          color: #1a1a2e;
          margin: 0 0 4px 0;
        }

        .action-content p {
          font-size: 0.8125rem;
          color: #6b7280;
          margin: 0;
        }

        .action-arrow {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          color: #94a3b8;
          transition: all 0.3s ease;
        }

        .quick-action-card:hover .action-arrow {
          background: white;
          color: currentColor;
          transform: translateX(4px);
        }

        .action-arrow svg {
          width: 18px;
          height: 18px;
        }

        /* Right Column */
        .right-column {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        /* Upcoming Section */
        .upcoming-section {
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        }

        .section-header .view-all {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.875rem;
          color: #667eea;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .section-header .view-all:hover {
          color: #764ba2;
        }

        .section-header .view-all svg {
          width: 16px;
          height: 16px;
          transition: transform 0.3s ease;
        }

        .section-header .view-all:hover svg {
          transform: translateX(4px);
        }

        .sessions-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .session-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: #f8fafc;
          border-radius: 10px;
          transition: all 0.3s ease;
        }

        .session-card:hover {
          background: linear-gradient(135deg, #ede7f6 0%, #e8eaf6 100%);
          transform: translateX(4px);
        }

        .session-icon-wrapper {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          flex-shrink: 0;
        }

        .session-icon {
          width: 20px;
          height: 20px;
        }

        .session-info {
          flex: 1;
        }

        .session-info h3 {
          font-size: 0.875rem;
          font-weight: 600;
          color: #1a1a2e;
          margin: 0 0 4px 0;
        }

        .session-meta {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 0.75rem;
          color: #6b7280;
        }

        .session-meta .meta-item {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .session-meta svg {
          width: 14px;
          height: 14px;
        }

        .session-arrow {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          color: #94a3b8;
          transition: all 0.3s ease;
        }

        .session-card:hover .session-arrow {
          background: white;
          color: #667eea;
        }

        .session-arrow svg {
          width: 16px;
          height: 16px;
        }

        /* Activities Section */
        .activities-section {
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        }

        .activities-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .activity-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: #f8fafc;
          border-radius: 10px;
        }

        .activity-icon-wrapper {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          flex-shrink: 0;
        }

        .activity-icon-wrapper.formation {
          background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
          color: white;
        }

        .activity-icon-wrapper.session {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .activity-icon {
          width: 20px;
          height: 20px;
        }

        .activity-info {
          flex: 1;
        }

        .activity-title {
          font-size: 0.875rem;
          font-weight: 600;
          color: #1a1a2e;
          margin: 0 0 4px 0;
        }

        .activity-date {
          font-size: 0.75rem;
          color: #6b7280;
          margin: 0;
        }

        /* Progress Section */
        .progress-section {
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        }

        .progress-stats {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .progress-item {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .progress-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.875rem;
          color: #1a1a2e;
          font-weight: 500;
        }

        .progress-bar {
          width: 100%;
          height: 8px;
          background: #f1f5f9;
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.5s ease;
        }

        .progress-fill.progress-primary {
          background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
        }

        .progress-fill.progress-purple {
          background: linear-gradient(90deg, #8b5cf6 0%, #7c3aed 100%);
        }

        .progress-fill.progress-warning {
          background: linear-gradient(90deg, #f59e0b 0%, #d97706 100%);
        }

        /* Empty States */
        .empty-cards {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          padding: 40px 20px;
        }

        .empty-cards svg {
          width: 48px;
          height: 48px;
          color: #94a3b8;
        }

        .empty-cards p {
          font-size: 0.875rem;
          color: #94a3b8;
          margin: 0;
          text-align: center;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .admin-dashboard {
            padding: 16px;
          }

          .dashboard-header {
            padding: 24px;
          }

          .header-content {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }

          .dashboard-header h1 {
            font-size: 1.5rem;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .stat-card {
            padding: 20px;
          }

          .stat-icon {
            width: 48px;
            height: 48px;
          }

          .stat-icon svg {
            width: 24px;
            height: 24px;
          }

          .stat-value {
            font-size: 1.5rem;
          }

          .dashboard-content {
            grid-template-columns: 1fr;
          }

          .quick-actions-grid {
            grid-template-columns: 1fr;
          }

          .secondary-stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 480px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }

          .stat-card {
            padding: 16px;
          }

          .secondary-stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </PrivateRoute>
  );
}