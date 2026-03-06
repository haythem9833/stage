import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import PrivateRoute from "../../components/PrivateRoute";
import { getFormationsSessions, getFormateursInscriptions } from "../../services/api";
import {
  BookOpen,
  FileText,
  Award,
  ArrowRight,
  TrendingUp,
  Clock,
  Users,
  Target,
  Calendar,
  BarChart3,
  RefreshCw,
  Play,
  Video,
  Edit,
  Plus,
  User,
  Settings,
  CheckCircle,
  Users as UsersIcon,
} from "lucide-react";

export default function FormateurDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({
    sessions: 0,
    inscriptions: 0,
    participantsTotal: 0,
    sessionsActives: 0,
    tauxCompletion: 0,
    sessionsAVenir: 0,
    moyenneInscrits: 0,
  });
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [sessions, inscriptions] = await Promise.all([
        getFormationsSessions(),
        getFormateursInscriptions(),
      ]);

      const sessionsData = sessions.data || [];
      const inscriptionsData = inscriptions.data || [];

      // Calculate additional stats
      const participantsTotal = sessionsData.reduce((acc, s) => acc + (s.inscrits || 0), 0);
      const sessionsActives = sessionsData.filter((s) => s.statut === "active").length;
      const tauxCompletion = inscriptionsData.length > 0
        ? Math.round(
            (inscriptionsData.filter((i) => i.progress === 100).length / inscriptionsData.length) * 100
          )
        : 0;
      const sessionsAVenir = sessionsData.filter((s) => new Date(s.date) > new Date()).length;
      const moyenneInscrits = sessionsData.length > 0
        ? Math.round(participantsTotal / sessionsData.length)
        : 0;

      setStats({
        sessions: sessionsData.length,
        inscriptions: inscriptionsData.length,
        participantsTotal,
        sessionsActives,
        tauxCompletion,
        sessionsAVenir,
        moyenneInscrits,
      });

      // Get upcoming sessions
      const upcoming = sessionsData
        .filter((s) => new Date(s.date) > new Date() && s.statut === "active")
        .slice(0, 4);
      setUpcomingSessions(upcoming);

      // Generate recent activities from sessions
      const activities = [
        ...sessionsData.slice(0, 3).map((s) => ({
          id: s.id,
          type: "session",
          title: s.formation_nom || "Session",
          date: s.date,
          statut: s.statut,
        })),
        ...inscriptionsData.slice(0, 2).map((i) => ({
          id: i.id,
          type: "inscription",
          title: i.formation_nom || "Inscription",
          date: i.date_inscription || new Date().toISOString(),
        })),
      ];
      setRecentActivities(activities.slice(0, 5));

    } catch (err) {
      console.error("Erreur chargement dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (path) => {
    router.push(path);
  };

  if (loading) {
    return (
      <PrivateRoute roles={["formateur"]}>
        <div className="formateur-dashboard">
          <div className="loading-state">
            <RefreshCw className="spinning" />
            <span>Chargement du tableau de bord...</span>
          </div>

          <style jsx>{`
            .formateur-dashboard {
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
              color: #8b5cf6;
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
    <PrivateRoute roles={["formateur"]}>
      <div className="formateur-dashboard">
        {/* Header */}
        <div className="dashboard-header">
          <div className="header-content">
            <div className="avatar-wrapper">
              <User />
            </div>
            <div>
              <h1>Bonjour, Formateur ! 👨‍🏫</h1>
              <p>Gérez vos sessions et formez vos apprenants</p>
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

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card stat-blue">
            <div className="stat-icon">
              <Users />
            </div>
            <div className="stat-content">
              <span className="stat-value">{stats.inscriptions}</span>
              <span className="stat-label">Inscriptions</span>
            </div>
            <TrendingUp className="stat-trend" />
          </div>

          <div className="stat-card stat-green">
            <div className="stat-icon">
              <UsersIcon />
            </div>
            <div className="stat-content">
              <span className="stat-value">{stats.participantsTotal}</span>
              <span className="stat-label">Participants</span>
            </div>
            <TrendingUp className="stat-trend" />
          </div>

          <div className="stat-card stat-pink">
            <div className="stat-icon">
              <Play />
            </div>
            <div className="stat-content">
              <span className="stat-value">{stats.sessionsActives}</span>
              <span className="stat-label">Actives</span>
            </div>
            <TrendingUp className="stat-trend" />
          </div>

          <div className="stat-card stat-indigo">
            <div className="stat-icon">
              <Clock />
            </div>
            <div className="stat-content">
              <span className="stat-value">{stats.moyenneInscrits}</span>
              <span className="stat-label">Moyenne / Session</span>
            </div>
            <TrendingUp className="stat-trend" />
          </div>
        </div>

        {/* Quick Actions & Content */}
        <div className="dashboard-content">
          {/* Quick Actions */}
          <div className="quick-actions-section">
            <div className="section-header">
              <h2>Accès Rapide</h2>
              <p>Créez et gérez vos sessions rapidement</p>
            </div>
            <div className="quick-actions-grid">
              <button
                className="quick-action-card action-blue"
                onClick={() => handleQuickAction("/formateur/formations")}
              >
                <div className="action-icon">
                  <BookOpen />
                </div>
                <div className="action-content">
                  <h3>Mes Formations</h3>
                  <p>Gérez le contenu de vos formations</p>
                </div>
                <div className="action-arrow">
                  <ArrowRight />
                </div>
              </button>

              <button
                className="quick-action-card action-orange"
                onClick={() => handleQuickAction("/formateur/presences")}
              >
                <div className="action-icon">
                  <Clock />
                </div>
                <div className="action-content">
                  <h3>Présences</h3>
                  <p>Enregistrez et consultez les présences</p>
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
                  <BarChart3 className="section-icon" />
                  Activités Récentes
                </h2>
              </div>

              {recentActivities.length === 0 ? (
                <div className="empty-cards">
                  <BarChart3 />
                  <p>Aucune activité récente</p>
                </div>
              ) : (
                <div className="activities-list">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="activity-item">
                      <div className={`activity-icon-wrapper ${activity.type}`}>
                        {activity.type === "session" ? (
                          <Video className="activity-icon" />
                        ) : (
                          <UsersIcon className="activity-icon" />
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
                  <Target className="section-icon" />
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
                      className="progress-fill progress-purple"
                      style={{
                        width: `${stats.sessions > 0 ? (stats.sessionsActives / stats.sessions) * 100 : 0}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div className="progress-item">
                  <div className="progress-header">
                    <span>Taux de Réussite</span>
                    <span>{stats.tauxCompletion}%</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill progress-green"
                      style={{ width: `${stats.tauxCompletion}%` }}
                    ></div>
                  </div>
                </div>

                <div className="progress-item">
                  <div className="progress-header">
                    <span>Sessions à Venir</span>
                    <span>{stats.sessionsAVenir}</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill progress-blue"
                      style={{
                        width: `${stats.sessions > 0 ? (stats.sessionsAVenir / stats.sessions) * 100 : 0}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .formateur-dashboard {
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
          color: #8b5cf6;
          border: 2px solid #8b5cf6;
          border-radius: 10px;
          font-size: 0.9375rem;
          font-weight: 600;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .btn-menu-principal:hover {
          background: #8b5cf6;
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
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
          background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
          color: white;
          border-radius: 50%;
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
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
          background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
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
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
        }

        .btn-refresh svg {
          width: 18px;
          height: 18px;
        }

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 32px;
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

        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
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

        .stat-card.stat-purple .stat-icon {
          background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
          color: white;
        }

        .stat-card.stat-blue .stat-icon {
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          color: white;
        }

        .stat-card.stat-orange .stat-icon {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          color: white;
        }

        .stat-card.stat-green .stat-icon {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
        }

        .stat-card.stat-pink .stat-icon {
          background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);
          color: white;
        }

        .stat-card.stat-indigo .stat-icon {
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
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
          color: #8b5cf6;
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

        .quick-action-card.action-purple:hover {
          border-color: #8b5cf6;
          background: linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%);
          transform: translateX(4px);
        }

        .quick-action-card.action-blue:hover {
          border-color: #3b82f6;
          background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
          transform: translateX(4px);
        }

        .quick-action-card.action-green:hover {
          border-color: #10b981;
          background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
          transform: translateX(4px);
        }

        .quick-action-card.action-orange:hover {
          border-color: #f59e0b;
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
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

        .quick-action-card.action-purple .action-icon {
          background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
          color: white;
        }

        .quick-action-card.action-blue .action-icon {
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          color: white;
        }

        .quick-action-card.action-green .action-icon {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
        }

        .quick-action-card.action-orange .action-icon {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          color: white;
        }

        .quick-action-card.action-rose .action-icon {
          background: linear-gradient(135deg, #f43f5e 0%, #e11d48 100%);
          color: white;
        }

        .quick-action-card.action-red:hover {
          border-color: #ef4444;
          background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
          transform: translateX(4px);
        }

        .quick-action-card.action-red .action-icon {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
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
          color: #9ca3af;
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
        .upcoming-section,
        .activities-section,
        .progress-section {
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
          color: #8b5cf6;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .section-header .view-all:hover {
          color: #7c3aed;
        }

        .section-header .view-all svg {
          width: 16px;
          height: 16px;
          transition: transform 0.3s ease;
        }

        .section-header .view-all:hover svg {
          transform: translateX(4px);
        }

        /* Sessions List */
        .sessions-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .session-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          background: #f8fafc;
          border: 2px solid transparent;
          border-radius: 12px;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .session-card:hover {
          border-color: #8b5cf6;
          background: white;
          transform: translateX(4px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .session-icon-wrapper {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
          color: white;
          border-radius: 8px;
          flex-shrink: 0;
        }

        .session-icon {
          width: 20px;
          height: 20px;
        }

        .session-info {
          flex: 1;
          min-width: 0;
        }

        .session-info h3 {
          font-size: 0.9375rem;
          font-weight: 600;
          color: #1a1a2e;
          margin: 0 0 6px 0;
          line-height: 1.3;
        }

        .session-meta {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.8125rem;
          color: #6b7280;
        }

        .meta-item svg {
          width: 14px;
          height: 14px;
        }

        .session-arrow {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          color: #9ca3af;
          transition: all 0.3s ease;
        }

        .session-card:hover .session-arrow {
          background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
          color: white;
        }

        .session-arrow svg {
          width: 18px;
          height: 18px;
        }

        /* Activities List */
        .activities-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .activity-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
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

        .activity-icon-wrapper.session {
          background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
          color: white;
        }

        .activity-icon-wrapper.inscription {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
        }

        .activity-icon {
          width: 20px;
          height: 20px;
        }

        .activity-info {
          flex: 1;
          min-width: 0;
        }

        .activity-title {
          font-size: 0.875rem;
          font-weight: 600;
          color: #1a1a2e;
          margin: 0 0 4px 0;
        }

        .activity-date {
          font-size: 0.75rem;
          color: #9ca3af;
          margin: 0;
        }

        /* Progress Section */
        .progress-stats {
          display: flex;
          flex-direction: column;
          gap: 20px;
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
        }

        .progress-bar {
          height: 8px;
          background: #e2e8f0;
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.5s ease;
        }

        .progress-fill.progress-purple {
          background: linear-gradient(90deg, #8b5cf6 0%, #7c3aed 100%);
        }

        .progress-fill.progress-green {
          background: linear-gradient(90deg, #10b981 0%, #059669 100%);
        }

        .progress-fill.progress-blue {
          background: linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%);
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
          color: #9ca3af;
        }

        .empty-cards p {
          font-size: 0.875rem;
          color: #9ca3af;
          margin: 0;
          text-align: center;
        }

        /* Loading State */
        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          padding: 80px 20px;
        }

        .loading-state svg {
          width: 64px;
          height: 64px;
          color: #8b5cf6;
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

        /* Responsive */
        @media (max-width: 768px) {
          .formateur-dashboard {
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
            gap: 16px;
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
        }

        @media (max-width: 480px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </PrivateRoute>
  );
}
