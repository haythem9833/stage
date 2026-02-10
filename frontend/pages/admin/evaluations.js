import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import PrivateRoute from "../../components/PrivateRoute";
import { api } from "../../services/api";
import {
  Star,
  ArrowLeft,
  Download,
  ChevronDown,
  TrendingUp,
  Users,
  Award,
  BarChart3,
  MessageSquare,
  RefreshCw,
  Filter,
  Search,
} from "lucide-react";

export default function AdminEvaluations() {
  const router = useRouter();
  const [formations, setFormations] = useState([]);
  const [evaluations, setEvaluations] = useState({});
  const [expandedFormation, setExpandedFormation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({
    totalEvaluations: 0,
    averageRating: 0,
    evaluatedFormations: 0,
    topRated: null,
    lowRated: null,
  });

  useEffect(() => {
    fetchEvaluations();
  }, []);

  const fetchEvaluations = async () => {
    try {
      setLoading(true);
      setError(null);

      // Récupérer toutes les formations
      const formationsRes = await api.get("/formations");
      const allFormations = formationsRes.data || [];

      // Récupérer toutes les sessions
      const sessionsRes = await api.get("/sessions");
      const allSessions = sessionsRes.data || [];

      // Regrouper les évaluations par formation
      const evaluationsMap = {};
      let totalEvals = 0;
      let totalRating = 0;
      let evaluatedCount = 0;

      for (const session of allSessions) {
        const formationId = session.formation_id;
        const formation = allFormations.find((f) => f.id === formationId);

        if (!evaluationsMap[formationId]) {
          evaluationsMap[formationId] = {
            formation: formation,
            evaluations: [],
          };
        }

        // Chercher les évaluations pour cette session
        if (session.id) {
          try {
            const sessionEval = await api.get(`/sessions/${session.id}/evaluations`);
            if (sessionEval.data && Array.isArray(sessionEval.data)) {
              const evals = sessionEval.data;
              evaluationsMap[formationId].evaluations.push(...evals);

              evals.forEach((e) => {
                totalEvals++;
                const notes = [];
                if (e.environnement_note) notes.push(e.environnement_note);
                if (e.formateur_note) notes.push(e.formateur_note);
                if (e.formation_note) notes.push(e.formation_note);
                if (e.services_note) notes.push(e.services_note);
                if (notes.length > 0) {
                  const avg =
                    notes.reduce((a, b) => a + b) / notes.length;
                  totalRating += avg;
                  evaluatedCount++;
                }
              });
            }
          } catch (err) {
            console.log(`Pas d'évaluations pour la session ${session.id}`);
          }
        }
      }

      // Calculer les statistiques
      const avgRating = evaluatedCount > 0 ? (totalRating / evaluatedCount).toFixed(1) : 0;
      const evaluatedFormations = Object.values(evaluationsMap).filter(
        (f) => f.evaluations.length > 0
      ).length;

      // Trouver la meilleure et pire formation
      const formationsWithAvg = Object.values(evaluationsMap)
        .filter((f) => f.evaluations.length > 0)
        .map((f) => ({
          ...f,
          avgRating: calculateAverageNote(f.evaluations),
        }))
        .sort((a, b) => b.avgRating - a.avgRating);

      setStats({
        totalEvaluations: totalEvals,
        averageRating: avgRating,
        evaluatedFormations: evaluatedFormations,
        topRated: formationsWithAvg[0] || null,
        lowRated: formationsWithAvg[formationsWithAvg.length - 1] || null,
      });

      setEvaluations(evaluationsMap);
      setFormations(allSessions);
    } catch (err) {
      console.error("Erreur chargement évaluations:", err);
      setError("Impossible de charger les évaluations");
    } finally {
      setLoading(false);
    }
  };

  const calculateAverageNote = (evals) => {
    if (!evals || evals.length === 0) return 0;
    const notes = evals
      .map((e) => {
        const notes = [];
        if (e.environnement_note) notes.push(e.environnement_note);
        if (e.formateur_note) notes.push(e.formateur_note);
        if (e.formation_note) notes.push(e.formation_note);
        if (e.services_note) notes.push(e.services_note);
        return notes.length > 0 ? notes.reduce((a, b) => a + b) / notes.length : 0;
      })
      .filter((n) => n > 0);

    return notes.length > 0 ? (notes.reduce((a, b) => a + b) / notes.length).toFixed(1) : 0;
  };

  const renderStars = (note) => {
    return (
      <div className="stars-display">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`star ${i < Math.floor(note) ? "filled" : ""}`}
            size={14}
          />
        ))}
      </div>
    );
  };

  const handleExportCSV = () => {
    let csvContent =
      "Formation,Formateur,Nombre d'Évaluations,Note Moyenne,Date\n";

    Object.values(evaluations).forEach((item) => {
      if (item.evaluations.length > 0) {
        const avgNote = calculateAverageNote(item.evaluations);
        csvContent += `"${item.formation?.titre || ""}","${
          item.formation?.formateur_nom || "-"
        }",${item.evaluations.length},${avgNote},"${new Date().toLocaleDateString(
          "fr-FR"
        )}"\n`;
      }
    });

    const element = document.createElement("a");
    element.setAttribute("href", "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent));
    element.setAttribute("download", "evaluations-admin.csv");
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (loading) {
    return (
      <PrivateRoute roles={["admin"]}>
        <div className="evaluations-container">
          <div className="loading-state">
            <RefreshCw className="spinning" />
            <span>Chargement des évaluations...</span>
          </div>

          <style jsx>{`
            .evaluations-container {
              min-height: 100vh;
              background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);
              padding: 24px;
              display: flex;
              align-items: center;
              justify-content: center;
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
              color: #f43f5e;
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

  const filteredFormations = Object.values(evaluations)
    .filter((f) => f.evaluations.length > 0)
    .filter(
      (f) =>
        f.formation?.titre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.formation?.formateur_nom?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <PrivateRoute roles={["admin"]}>
      <div className="evaluations-container">
        {/* Header */}
        <div className="evaluations-header">
          <div className="header-top">
            <Link href="/admin/dashboard" className="back-button">
              <ArrowLeft /> Retour
            </Link>
            <h1>Analyse des Évaluations</h1>
            <button className="export-btn" onClick={handleExportCSV}>
              <Download /> Exporter CSV
            </button>
          </div>
          <p className="header-subtitle">
            Tableau de bord complét des évaluations de formations
          </p>
        </div>

        {/* Stats Cards */}
        {stats.totalEvaluations > 0 && (
          <div className="stats-cards-container">
            <div className="stat-card">
              <div className="stat-icon">
                <Star />
              </div>
              <div className="stat-info">
                <span className="stat-value">{stats.averageRating}</span>
                <span className="stat-label">/5 Note Moyenne</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <Users />
              </div>
              <div className="stat-info">
                <span className="stat-value">{stats.totalEvaluations}</span>
                <span className="stat-label">Total d'Évaluations</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <Award />
              </div>
              <div className="stat-info">
                <span className="stat-value">{stats.evaluatedFormations}</span>
                <span className="stat-label">Formations Évaluées</span>
              </div>
            </div>

            {stats.topRated && (
              <div className="stat-card top-rated">
                <div className="stat-icon">
                  <TrendingUp />
                </div>
                <div className="stat-info">
                  <span className="stat-value">{stats.topRated.avgRating}</span>
                  <span className="stat-label">Meilleure Note</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Search */}
        <div className="search-section">
          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="Rechercher une formation ou un formateur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Content */}
        <div className="evaluations-content">
          {filteredFormations.length === 0 ? (
            <div className="empty-state">
              <Star size={64} />
              <h2>Aucune évaluation disponible</h2>
              <p>Les évaluations apparaîtront ici une fois que les formations seront évaluées.</p>
            </div>
          ) : (
            <div className="formations-evaluations">
              {filteredFormations.map((item) => {
                const evals = item.evaluations || [];
                const avgNote = calculateAverageNote(evals);
                const isExpanded = expandedFormation === item.formation?.id;

                return (
                  <div key={item.formation?.id} className="formation-eval-card">
                    <button
                      className="formation-eval-header"
                      onClick={() =>
                        setExpandedFormation(
                          isExpanded ? null : item.formation?.id
                        )
                      }
                    >
                      <div className="formation-eval-info">
                        <h3>{item.formation?.titre || "Formation sans titre"}</h3>
                        <div className="formation-eval-meta">
                          <span className="meta-item">
                            <span className="formateur-name">
                              Formateur: {item.formation?.formateur_nom || "-"}
                            </span>
                          </span>
                          <span className="meta-item">
                            <Users size={16} />
                            {evals.length} évaluation{evals.length > 1 ? "s" : ""}
                          </span>
                          <span className="meta-item avg-note">
                            {renderStars(avgNote)}
                            <strong>{avgNote}/5</strong>
                          </span>
                        </div>
                      </div>
                      <div className={`expand-icon ${isExpanded ? "expanded" : ""}`}>
                        <ChevronDown size={20} />
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="formation-eval-details">
                        <div className="evaluations-list">
                          {evals.map((evaluation, idx) => (
                            <div key={idx} className="evaluation-item">
                              <div className="evaluation-header-mini">
                                <h4>{evaluation.etudiant_nom || "Étudiant"}</h4>
                                {evaluation.submitted_at && (
                                  <span className="eval-date">
                                    {new Date(
                                      evaluation.submitted_at
                                    ).toLocaleDateString("fr-FR")}
                                  </span>
                                )}
                              </div>

                              <div className="evaluation-notes">
                                <div className="notes-grid">
                                  {evaluation.environnement_note && (
                                    <div className="note-cell">
                                      <span className="note-label-small">
                                        Environnement
                                      </span>
                                      <div className="note-display">
                                        {renderStars(evaluation.environnement_note)}
                                        <span>{evaluation.environnement_note}/5</span>
                                      </div>
                                    </div>
                                  )}

                                  {evaluation.formateur_note && (
                                    <div className="note-cell">
                                      <span className="note-label-small">
                                        Formateur
                                      </span>
                                      <div className="note-display">
                                        {renderStars(evaluation.formateur_note)}
                                        <span>{evaluation.formateur_note}/5</span>
                                      </div>
                                    </div>
                                  )}

                                  {evaluation.formation_note && (
                                    <div className="note-cell">
                                      <span className="note-label-small">
                                        Contenu
                                      </span>
                                      <div className="note-display">
                                        {renderStars(evaluation.formation_note)}
                                        <span>{evaluation.formation_note}/5</span>
                                      </div>
                                    </div>
                                  )}

                                  {evaluation.services_note && (
                                    <div className="note-cell">
                                      <span className="note-label-small">
                                        Services
                                      </span>
                                      <div className="note-display">
                                        {renderStars(evaluation.services_note)}
                                        <span>{evaluation.services_note}/5</span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {(evaluation.suggestions ||
                                evaluation.environnement_commentaire ||
                                evaluation.formateur_commentaire ||
                                evaluation.formation_commentaire ||
                                evaluation.services_commentaire) && (
                                <div className="evaluation-comments">
                                  {evaluation.suggestions && (
                                    <div className="comment-block">
                                      <strong>Suggestions d'amélioration:</strong>
                                      <p>{evaluation.suggestions}</p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .evaluations-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);
          padding: 24px;
        }

        .evaluations-header {
          background: white;
          border-radius: 16px;
          padding: 32px;
          margin-bottom: 24px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        }

        .header-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 12px;
        }

        .back-button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: #f3f4f6;
          color: #374151;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .back-button:hover {
          background: #e5e7eb;
          transform: translateX(-4px);
        }

        .evaluations-header h1 {
          font-size: 2rem;
          font-weight: 700;
          color: #1a1a2e;
          margin: 0;
        }

        .export-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          background: linear-gradient(135deg, #f43f5e 0%, #e11d48 100%);
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 0.9375rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .export-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(244, 63, 94, 0.4);
        }

        .header-subtitle {
          font-size: 1rem;
          color: #6b7280;
          margin: 0;
        }

        /* Stats Cards */
        .stats-cards-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .stat-card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 4px 12px rgba(244, 63, 94, 0.15);
        }

        .stat-card.top-rated {
          background: linear-gradient(135deg, #ffe4e6 0%, #fecdd3 100%);
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          background: linear-gradient(135deg, #f43f5e 0%, #e11d48 100%);
          color: white;
          flex-shrink: 0;
        }

        .stat-icon svg {
          width: 24px;
          height: 24px;
        }

        .stat-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1a1a2e;
        }

        .stat-label {
          font-size: 0.875rem;
          color: #6b7280;
        }

        /* Search Section */
        .search-section {
          background: white;
          border-radius: 12px;
          padding: 16px 24px;
          margin-bottom: 24px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        }

        .search-box {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 16px;
          background: #f3f4f6;
          border-radius: 8px;
        }

        .search-box svg {
          color: #9ca3af;
        }

        .search-box input {
          flex: 1;
          border: none;
          background: transparent;
          font-size: 1rem;
          color: #374151;
        }

        .search-box input::placeholder {
          color: #9ca3af;
        }

        /* Content */
        .evaluations-content {
          background: white;
          border-radius: 16px;
          padding: 32px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          text-align: center;
        }

        .empty-state svg {
          width: 80px;
          height: 80px;
          color: #9ca3af;
          margin-bottom: 16px;
        }

        .empty-state h2 {
          font-size: 1.5rem;
          color: #1a1a2e;
          margin: 0 0 8px 0;
        }

        .empty-state p {
          font-size: 1rem;
          color: #6b7280;
          margin: 0;
        }

        /* Formations Evaluations */
        .formations-evaluations {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .formation-eval-card {
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .formation-eval-card:hover {
          border-color: #f43f5e;
          box-shadow: 0 4px 12px rgba(244, 63, 94, 0.15);
        }

        .formation-eval-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding: 20px;
          background: #f8fafc;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .formation-eval-header:hover {
          background: #f0f4f8;
        }

        .formation-eval-info {
          text-align: left;
          flex: 1;
        }

        .formation-eval-info h3 {
          font-size: 1.125rem;
          font-weight: 600;
          color: #1a1a2e;
          margin: 0 0 8px 0;
        }

        .formation-eval-meta {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.875rem;
          color: #6b7280;
        }

        .meta-item.avg-note {
          color: #f43f5e;
          font-weight: 600;
        }

        .formateur-name {
          font-weight: 500;
        }

        .expand-icon {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          background: white;
          color: #6b7280;
          transition: all 0.3s ease;
          margin-left: 16px;
        }

        .expand-icon.expanded {
          transform: rotate(180deg);
          color: #f43f5e;
        }

        .formation-eval-details {
          padding: 24px;
          background: white;
          border-top: 1px solid #e5e7eb;
        }

        .evaluations-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .evaluation-item {
          padding: 20px;
          background: #f8fafc;
          border-radius: 12px;
          border-left: 4px solid #f43f5e;
        }

        .evaluation-header-mini {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .evaluation-header-mini h4 {
          font-size: 1rem;
          font-weight: 600;
          color: #1a1a2e;
          margin: 0;
        }

        .eval-date {
          font-size: 0.875rem;
          color: #9ca3af;
        }

        .evaluation-notes {
          margin-bottom: 16px;
        }

        .notes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 12px;
        }

        .note-cell {
          padding: 12px;
          background: white;
          border-radius: 8px;
        }

        .note-label-small {
          display: block;
          font-size: 0.75rem;
          color: #6b7280;
          font-weight: 500;
          margin-bottom: 6px;
        }

        .note-display {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .stars-display {
          display: flex;
          gap: 2px;
        }

        .star {
          color: #d1d5db;
        }

        .star.filled {
          color: #f59e0b;
        }

        .note-display span {
          font-size: 0.875rem;
          font-weight: 600;
          color: #1a1a2e;
        }

        .evaluation-comments {
          padding-top: 12px;
          border-top: 1px solid #e5e7eb;
        }

        .comment-block {
          padding: 12px;
          background: white;
          border-radius: 8px;
          margin-top: 8px;
        }

        .comment-block strong {
          display: block;
          font-size: 0.875rem;
          color: #6b7280;
          margin-bottom: 4px;
        }

        .comment-block p {
          margin: 0;
          font-size: 0.9375rem;
          color: #374151;
          line-height: 1.5;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .evaluations-container {
            padding: 16px;
          }

          .evaluations-header {
            padding: 20px;
          }

          .header-top {
            flex-direction: column;
            align-items: flex-start;
          }

          .evaluations-header h1 {
            font-size: 1.5rem;
          }

          .evaluations-content {
            padding: 16px;
          }

          .stats-cards-container {
            grid-template-columns: repeat(2, 1fr);
          }

          .formation-eval-meta {
            flex-direction: column;
            gap: 8px;
          }

          .notes-grid {
            grid-template-columns: repeat(2, 1fr);
          }
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
    </PrivateRoute>
  );
}
