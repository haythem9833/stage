import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import PrivateRoute from "../../components/PrivateRoute";
import { api } from "../../services/api";
import {
  Star,
  ArrowLeft,
  Filter,
  Download,
  ChevronDown,
  TrendingUp,
  Users,
  Award,
  Calendar,
  BarChart3,
  MessageSquare,
  RefreshCw,
} from "lucide-react";

export default function FormateurEvaluations() {
  const router = useRouter();
  const [formations, setFormations] = useState([]);
  const [evaluations, setEvaluations] = useState({});
  const [expandedFormation, setExpandedFormation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    fetchEvaluations();
  }, []);

  const fetchEvaluations = async () => {
    try {
      setLoading(true);
      setError(null);

      // Récupérer les formations du formateur
      const formationsRes = await api.get("/formations");
      const allFormations = formationsRes.data || [];

      // Récupérer les sessions du formateur
      const sessionsRes = await api.get("/formateur/sessions");
      const sessions = sessionsRes.data || [];

      // Récupérer toutes les évaluations
      const evaluationsRes = await api.get("/sessions");
      const allEvaluations = evaluationsRes.data || [];

      // Regrouper les évaluations par formation
      const evaluationsMap = {};

      for (const session of sessions) {
        const formationId = session.formation_id;
        if (!evaluationsMap[formationId]) {
          evaluationsMap[formationId] = [];
        }

        // Chercher les évaluations pour cette session
        if (session.id) {
          try {
            const sessionEval = await api.get(`/sessions/${session.id}/evaluations`);
            if (sessionEval.data) {
              evaluationsMap[formationId].push(...(sessionEval.data || []));
            }
          } catch (err) {
            console.log(`Pas d'évaluations pour la session ${session.id}`);
          }
        }
      }

      setEvaluations(evaluationsMap);
      setFormations(sessions);
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
            size={16}
          />
        ))}
      </div>
    );
  };

  const handleExportCSV = () => {
    let csvContent = "Formation,Étudiant,Note Environnement,Note Formateur,Note Formation,Note Services,Date\n";

    formations.forEach((formation) => {
      const evals = evaluations[formation.id] || [];
      evals.forEach((evaluation) => {
        csvContent += `"${formation.titre || ""}","${evaluation.etudiant_nom || ""}",${evaluation.environnement_note || "-"},${evaluation.formateur_note || "-"},${evaluation.formation_note || "-"},${evaluation.services_note || "-"},"${evaluation.submitted_at || ""}"\n`;
      });
    });

    const element = document.createElement("a");
    element.setAttribute("href", "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent));
    element.setAttribute("download", "evaluations-formations.csv");
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (loading) {
    return (
      <PrivateRoute roles={["formateur"]}>
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

  return (
    <PrivateRoute roles={["formateur"]}>
      <div className="evaluations-container">
        {/* Header */}
        <div className="evaluations-header">
          <div className="header-top">
            <Link href="/formateur/dashboard" className="back-button">
              <ArrowLeft /> Retour
            </Link>
            <h1>Résultats d'Évaluation</h1>
            <button className="export-btn" onClick={handleExportCSV}>
              <Download /> Exporter CSV
            </button>
          </div>
          <p className="header-subtitle">
            Consultez les évaluations des formations complétées
          </p>
        </div>

        {/* Content */}
        <div className="evaluations-content">
          {formations.length === 0 ? (
            <div className="empty-state">
              <Star size={64} />
              <h2>Aucune évaluation disponible</h2>
              <p>Les évaluations apparaîtront ici une fois que vos formations seront complétées.</p>
              <Link href="/formateur/formations" className="btn-primary">
                Gérer mes formations
              </Link>
            </div>
          ) : (
            <div className="formations-evaluations">
              {formations.map((formation) => {
                const evals = evaluations[formation.id] || [];
                const avgNote = calculateAverageNote(evals);
                const isExpanded = expandedFormation === formation.id;

                return (
                  <div key={formation.id} className="formation-eval-card">
                    <button
                      className="formation-eval-header"
                      onClick={() =>
                        setExpandedFormation(isExpanded ? null : formation.id)
                      }
                    >
                      <div className="formation-eval-info">
                        <h3>{formation.titre || "Formation sans titre"}</h3>
                        <div className="formation-eval-meta">
                          <span className="meta-item">
                            <Users size={16} />
                            {evals.length} évaluation{evals.length > 1 ? "s" : ""}
                          </span>
                          {evals.length > 0 && (
                            <span className="meta-item avg-note">
                              <Star size={16} />
                              Note moyenne: {avgNote}/5
                            </span>
                          )}
                        </div>
                      </div>
                      <div className={`expand-icon ${isExpanded ? "expanded" : ""}`}>
                        <ChevronDown size={20} />
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="formation-eval-details">
                        {evals.length === 0 ? (
                          <div className="no-evaluations">
                            <MessageSquare size={32} />
                            <p>Aucune évaluation pour cette formation</p>
                          </div>
                        ) : (
                          <div className="evaluations-list">
                            {evals.map((evaluation, idx) => (
                              <div key={idx} className="evaluation-item">
                                <div className="evaluation-header-mini">
                                  <h4>{evaluation.etudiant_nom || "Étudiant"}</h4>
                                  {evaluation.submitted_at && (
                                    <span className="eval-date">
                                      {new Date(evaluation.submitted_at).toLocaleDateString(
                                        "fr-FR"
                                      )}
                                    </span>
                                  )}
                                </div>

                                <div className="evaluation-notes">
                                  {evaluation.environnement_note && (
                                    <div className="note-row">
                                      <span className="note-label">Environnement</span>
                                      <div className="note-content">
                                        {renderStars(evaluation.environnement_note)}
                                        <span className="note-value">
                                          {evaluation.environnement_note}/5
                                        </span>
                                      </div>
                                    </div>
                                  )}

                                  {evaluation.formateur_note && (
                                    <div className="note-row">
                                      <span className="note-label">Formateur</span>
                                      <div className="note-content">
                                        {renderStars(evaluation.formateur_note)}
                                        <span className="note-value">
                                          {evaluation.formateur_note}/5
                                        </span>
                                      </div>
                                    </div>
                                  )}

                                  {evaluation.formation_note && (
                                    <div className="note-row">
                                      <span className="note-label">Contenu formation</span>
                                      <div className="note-content">
                                        {renderStars(evaluation.formation_note)}
                                        <span className="note-value">
                                          {evaluation.formation_note}/5
                                        </span>
                                      </div>
                                    </div>
                                  )}

                                  {evaluation.services_note && (
                                    <div className="note-row">
                                      <span className="note-label">Services</span>
                                      <div className="note-content">
                                        {renderStars(evaluation.services_note)}
                                        <span className="note-value">
                                          {evaluation.services_note}/5
                                        </span>
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {(evaluation.environnement_commentaire ||
                                  evaluation.formateur_commentaire ||
                                  evaluation.formation_commentaire ||
                                  evaluation.services_commentaire ||
                                  evaluation.suggestions) && (
                                  <div className="evaluation-comments">
                                    {evaluation.environnement_commentaire && (
                                      <div className="comment-block">
                                        <strong>Commentaire Environnement:</strong>
                                        <p>{evaluation.environnement_commentaire}</p>
                                      </div>
                                    )}

                                    {evaluation.formateur_commentaire && (
                                      <div className="comment-block">
                                        <strong>Commentaire Formateur:</strong>
                                        <p>{evaluation.formateur_commentaire}</p>
                                      </div>
                                    )}

                                    {evaluation.formation_commentaire && (
                                      <div className="comment-block">
                                        <strong>Commentaire Contenu:</strong>
                                        <p>{evaluation.formation_commentaire}</p>
                                      </div>
                                    )}

                                    {evaluation.services_commentaire && (
                                      <div className="comment-block">
                                        <strong>Commentaire Services:</strong>
                                        <p>{evaluation.services_commentaire}</p>
                                      </div>
                                    )}

                                    {evaluation.suggestions && (
                                      <div className="comment-block">
                                        <strong>Suggestions:</strong>
                                        <p>{evaluation.suggestions}</p>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
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
          margin-bottom: 32px;
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

        .evaluations-content {
          background: white;
          border-radius: 16px;
          padding: 32px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        }

        /* Empty State */
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
          margin: 0 0 24px 0;
          max-width: 400px;
        }

        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          background: linear-gradient(135deg, #f43f5e 0%, #e11d48 100%);
          color: white;
          text-decoration: none;
          border-radius: 10px;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(244, 63, 94, 0.4);
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

        .no-evaluations {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          padding: 40px 20px;
          color: #9ca3af;
        }

        .evaluations-list {
          display: flex;
          flex-direction: column;
          gap: 24px;
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
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 16px;
        }

        .note-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          background: white;
          border-radius: 8px;
        }

        .note-label {
          font-weight: 500;
          color: #6b7280;
          min-width: 120px;
        }

        .note-content {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .stars-display {
          display: flex;
          gap: 2px;
        }

        .star {
          color: #d1d5db;
          transition: color 0.2s ease;
        }

        .star.filled {
          color: #f59e0b;
        }

        .note-value {
          font-weight: 600;
          color: #1a1a2e;
          min-width: 40px;
          text-align: right;
        }

        .evaluation-comments {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding-top: 12px;
          border-top: 1px solid #e5e7eb;
        }

        .comment-block {
          padding: 12px;
          background: white;
          border-radius: 8px;
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

          .formation-eval-meta {
            flex-direction: column;
            gap: 8px;
          }

          .note-row {
            flex-direction: column;
            align-items: flex-start;
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
