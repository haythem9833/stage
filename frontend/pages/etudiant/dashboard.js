import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import PrivateRoute from "../../components/PrivateRoute";
import { getFormations, getMyInscriptions, getMyCertificats } from "../../services/api";
import {
  BookOpen,
  FileText,
  Award,
  ArrowRight,
  TrendingUp,
  Clock,
  Users,
  Target,
  CheckCircle,
  Play,
  Calendar,
  BarChart3,
  RefreshCw,
  User,
  Star,
} from "lucide-react";

export default function EtudiantDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({
    formations: 0,
    inscriptions: 0,
    certificats: 0,
    modulesCompletes: 0,
    heuresApprises: 0,
    progressMoyen: 0,
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [recommendedFormations, setRecommendedFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [formations, inscriptions, certificats] = await Promise.all([
        getFormations(),
        getMyInscriptions(),
        getMyCertificats(),
      ]);

      const formationsData = formations.data || [];
      const inscriptionsData = inscriptions.data || [];
      const certificatsData = certificats.data || [];

      // Calculate additional stats
      const modulesCompletes = inscriptionsData.reduce((acc, ins) => acc + (ins.modules_completes || 0), 0);
      const heuresApprises = inscriptionsData.reduce((acc, ins) => acc + (ins.heures_apprises || 0), 0);
      const progressMoyen = inscriptionsData.length > 0
        ? Math.round(inscriptionsData.reduce((acc, ins) => acc + (ins.progress || 0), 0) / inscriptionsData.length)
        : 0;

      setStats({
        formations: formationsData.length,
        inscriptions: inscriptionsData.length,
        certificats: certificatsData.length,
        modulesCompletes,
        heuresApprises,
        progressMoyen,
      });

      // Get recommended formations (not yet subscribed)
      const inscritsIds = inscriptionsData.map((i) => i.formation_id);
      const recommended = formationsData
        .filter((f) => !inscritsIds.includes(f.id))
        .slice(0, 4);
      setRecommendedFormations(recommended);

      // Generate recent activities from inscriptions
      const activities = inscriptionsData
        .slice(0, 5)
        .map((ins) => ({
          id: ins.id,
          type: "inscription",
          title: ins.formation_nom || "Formation",
          date: ins.date_inscription || new Date().toISOString(),
          formation_id: ins.formation_id,
        }));
      setRecentActivities(activities);

    } catch (err) {
      console.error("Erreur chargement dashboard:", err);
      setError("Impossible de charger le dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (path) => {
    router.push(path);
  };

  if (loading) {
    return (
      <PrivateRoute roles={["etudiant"]}>
        <div className="dashboard-container">
          <div className="loading-state">
            <RefreshCw className="spinning" />
            <span>Chargement du tableau de bord...</span>
          </div>

          <style jsx>{`
            .dashboard-container {
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
    <PrivateRoute roles={["etudiant"]}>
      <div className="etudiant-dashboard">
        {/* Header */}
        <div className="dashboard-header">
          <div className="header-content">
            <div className="welcome-section">
              <div className="avatar-wrapper">
                <User />
              </div>
              <div>
                <h1>Bonjour, Étudiant ! 👋</h1>
                <p>Bienvenue sur votre espace d'apprentissage</p>
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

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card stat-primary">
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

          <div className="stat-card stat-warning">
            <div className="stat-icon">
              <Award />
            </div>
            <div className="stat-content">
              <span className="stat-value">{stats.certificats}</span>
              <span className="stat-label">Certificats</span>
            </div>
            <TrendingUp className="stat-trend" />
          </div>

          <div className="stat-card stat-info">
            <div className="stat-icon">
              <CheckCircle />
            </div>
            <div className="stat-content">
              <span className="stat-value">{stats.modulesCompletes}</span>
              <span className="stat-label">Modules</span>
            </div>
            <TrendingUp className="stat-trend" />
          </div>

          <div className="stat-card stat-purple">
            <div className="stat-icon">
              <Clock />
            </div>
            <div className="stat-content">
              <span className="stat-value">{stats.heuresApprises}h</span>
              <span className="stat-label">Temps</span>
            </div>
            <TrendingUp className="stat-trend" />
          </div>

          <div className="stat-card stat-rose">
            <div className="stat-icon">
              <BarChart3 />
            </div>
            <div className="stat-content">
              <span className="stat-value">{stats.progressMoyen}%</span>
              <span className="stat-label">Progression</span>
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
              <p>Accédez rapidement à vos espaces d'apprentissage</p>
            </div>
            <div className="quick-actions-grid">
              <button
                className="quick-action-card action-blue"
                onClick={() => handleQuickAction("/etudiant/formations")}
              >
                <div className="action-icon">
                  <BookOpen />
                </div>
                <div className="action-content">
                  <h3>Mes Formations</h3>
                  <p>Découvrez nos formations disponibles</p>
                </div>
                <div className="action-arrow">
                  <ArrowRight />
                </div>
              </button>

              <button
                className="quick-action-card action-green"
                onClick={() => handleQuickAction("/etudiant/mes-inscriptions")}
              >
                <div className="action-icon">
                  <FileText />
                </div>
                <div className="action-content">
                  <h3>Mes Inscriptions</h3>
                  <p>Gérez vos formations en cours</p>
                </div>
                <div className="action-arrow">
                  <ArrowRight />
                </div>
              </button>

              <button
                className="quick-action-card action-purple"
                onClick={() => handleQuickAction("/etudiant/certificats")}
              >
                <div className="action-icon">
                  <Award />
                </div>
                <div className="action-content">
                  <h3>Mes Certificats</h3>
                  <p>Consultez vos certificats obtenus</p>
                </div>
                <div className="action-arrow">
                  <ArrowRight />
                </div>
              </button>

              <button
                className="quick-action-card action-rose"
                onClick={() => handleQuickAction("/etudiant/evaluations")}
              >
                <div className="action-icon">
                  <Star />
                </div>
                <div className="action-content">
                  <h3>Évaluations</h3>
                  <p>Évaluez vos formations complétées</p>
                </div>
                <div className="action-arrow">
                  <ArrowRight />
                </div>
              </button>
            </div>
          </div>

          {/* Right Column */}
          <div className="right-column">
            {/* Recommended Formations */}
            <div className="recommended-section">
              <div className="section-header">
                <h2>
                  <Play className="section-icon" />
                  Recommandé pour vous
                </h2>
                <Link href="/etudiant/formations" className="view-all">
                  Voir tout
                  <ArrowRight />
                </Link>
              </div>

              {recommendedFormations.length === 0 ? (
                <div className="empty-cards">
                  <BookOpen />
                  <p>Aucune formation recommandée pour le moment</p>
                </div>
              ) : (
                <div className="formations-list">
                  {recommendedFormations.map((formation) => (
                    <Link
                      key={formation.id}
                      href={`/etudiant/formations/${formation.id}`}
                      className="formation-card"
                    >
                      <div className="formation-image">
                        {formation.image ? (
                          <img src={formation.image} alt={formation.nom} />
                        ) : (
                          <div className="formation-placeholder">
                            <BookOpen />
                          </div>
                        )}
                        <span className="formation-category">
                          {formation.categorie || "Général"}
                        </span>
                      </div>
                      <div className="formation-info">
                        <h3>{formation.nom}</h3>
                        <p className="formation-description">
                          {formation.description || "Formation professionnelle"}
                        </p>
                        <div className="formation-meta">
                          <span className="meta-item">
                            <Clock />
                            {formation.duree || "Non spécifié"}
                          </span>
                          <span className="meta-item">
                            <Users />
                            {formation.inscrits || 0}
                          </span>
                        </div>
                      </div>
                      <div className="formation-arrow">
                        <ArrowRight />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Activities */}
            <div className="activities-section">
              <div className="section-header">
                <h2>
                  <Calendar className="section-icon" />
                  Activités Récentes
                </h2>
              </div>

              {recentActivities.length === 0 ? (
                <div className="empty-cards">
                  <FileText />
                  <p>Aucune activité récente</p>
                </div>
              ) : (
                <div className="activities-list">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="activity-item">
                      <div className="activity-icon-wrapper">
                        <Play className="activity-icon" />
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
          </div>
        </div>
      </div>

      <style jsx>{`
        .etudiant-dashboard {
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

        .header-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .btn-menu-principal {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          background: #f3f4f6;
          color: #374151;
          text-decoration: none;
          border-radius: 10px;
          font-size: 0.9375rem;
          font-weight: 600;
          transition: all 0.3s ease;
          border: 1px solid #e5e7eb;
        }

        .btn-menu-principal:hover {
          background: #e5e7eb;
          color: #1f2937;
          transform: translateY(-2px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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

        .stat-card.stat-success::before {
          background: linear-gradient(90deg, #10b981 0%, #059669 100%);
        }

        .stat-card.stat-warning::before {
          background: linear-gradient(90deg, #f59e0b 0%, #d97706 100%);
        }

        .stat-card.stat-info::before {
          background: linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%);
        }

        .stat-card.stat-purple::before {
          background: linear-gradient(90deg, #8b5cf6 0%, #7c3aed 100%);
        }

        .stat-card.stat-rose::before {
          background: linear-gradient(90deg, #f43f5e 0%, #e11d48 100%);
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

        .stat-card.stat-success .stat-icon {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
        }

        .stat-card.stat-warning .stat-icon {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          color: white;
        }

        .stat-card.stat-info .stat-icon {
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          color: white;
        }

        .stat-card.stat-purple .stat-icon {
          background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
          color: white;
        }

        .stat-card.stat-rose .stat-icon {
          background: linear-gradient(135deg, #f43f5e 0%, #e11d48 100%);
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

        .quick-action-card.action-blue:hover {
          border-color: #667eea;
          background: linear-gradient(135deg, #eff6ff 0%, #e0e7ff 100%);
          transform: translateX(4px);
        }

        .quick-action-card.action-green:hover {
          border-color: #10b981;
          background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
          transform: translateX(4px);
        }

        .quick-action-card.action-purple:hover {
          border-color: #8b5cf6;
          background: linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%);
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

        .quick-action-card.action-blue .action-icon {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .quick-action-card.action-green .action-icon {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
        }

        .quick-action-card.action-purple .action-icon {
          background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
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

        /* Recommended Section */
        .recommended-section,
        .activities-section {
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

        /* Formations List */
        .formations-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .formation-card {
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

        .formation-card:hover {
          border-color: #667eea;
          background: white;
          transform: translateX(4px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .formation-image {
          position: relative;
          width: 80px;
          height: 80px;
          flex-shrink: 0;
        }

        .formation-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 8px;
        }

        .formation-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 8px;
        }

        .formation-placeholder svg {
          width: 28px;
          height: 28px;
        }

        .formation-category {
          position: absolute;
          top: 6px;
          left: 6px;
          padding: 4px 8px;
          background: rgba(0, 0, 0, 0.7);
          color: white;
          font-size: 0.6875rem;
          font-weight: 600;
          border-radius: 4px;
          text-transform: capitalize;
        }

        .formation-info {
          flex: 1;
          min-width: 0;
        }

        .formation-info h3 {
          font-size: 0.9375rem;
          font-weight: 600;
          color: #1a1a2e;
          margin: 0 0 6px 0;
          line-height: 1.3;
        }

        .formation-description {
          font-size: 0.8125rem;
          color: #6b7280;
          margin: 0 0 8px 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          line-height: 1.4;
        }

        .formation-meta {
          display: flex;
          gap: 12px;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.75rem;
          color: #9ca3af;
        }

        .meta-item svg {
          width: 14px;
          height: 14px;
        }

        .formation-arrow {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          color: #9ca3af;
          transition: all 0.3s ease;
        }

        .formation-card:hover .formation-arrow {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .formation-arrow svg {
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
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 8px;
          flex-shrink: 0;
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

        /* Responsive */
        @media (max-width: 768px) {
          .etudiant-dashboard {
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

          .welcome-section {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
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
