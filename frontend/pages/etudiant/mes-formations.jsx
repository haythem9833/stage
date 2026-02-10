import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { api } from "../../services/api";
import PrivateRoute from "../../components/PrivateRoute";
import {
  BookOpen,
  Star,
  Calendar,
  Clock,
  Users,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Send,
} from "lucide-react";

export default function MesFormations() {
  const router = useRouter();
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [evaluatingId, setEvaluatingId] = useState(null);
  const [evaluations, setEvaluations] = useState({});

  const fetchMesFormations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Récupérer les inscriptions de l'utilisateur
      const res = await api.get("/my-inscriptions");
      const inscriptions = res.data || [];
      
      // Mapper les inscriptions avec leurs formations
      const formationsMap = {};
      inscriptions.forEach(inscription => {
        if (inscription.formation && typeof inscription.formation === 'object') {
          const key = inscription.formation.id;
          if (!formationsMap[key]) {
            // Extraire uniquement les propriétés primaires, pas les objets imbriqués
            formationsMap[key] = {
              formation: {
                id: inscription.formation.id,
                titre: String(inscription.formation.titre || ''),
                description: String(inscription.formation.description || ''),
                duree: Number(inscription.formation.duree) || 0,
                inscrits: Number(inscription.formation.inscrits) || 0,
                statut_formation: String(inscription.formation.statut_formation || ''),
              },
              inscription: inscription.id,
              statut: String(inscription.statut || '')
            };
          }
        }
      });
      
      setFormations(Object.values(formationsMap));
    } catch (err) {
      console.error('Fetch error:', err);
      console.error('Error details:', err.response?.data);
      setError("Erreur lors du chargement de vos formations");
      setFormations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMesFormations();
  }, []);

  const handleEvaluation = async (inscriptionId) => {
    const note = evaluations[inscriptionId]?.note;
    const commentaire = evaluations[inscriptionId]?.commentaire;

    if (!note) {
      setError("Veuillez sélectionner une note");
      return;
    }

    try {
      setEvaluatingId(inscriptionId);
      await api.post("/evaluations", {
        inscription_id: inscriptionId,
        note: parseInt(note),
        commentaire: commentaire || null,
      });

      setSuccess("Évaluation enregistrée avec succès!");
      setEvaluations(prev => ({
        ...prev,
        [inscriptionId]: { note: "", commentaire: "" }
      }));
      
      setTimeout(() => {
        setSuccess(null);
        fetchMesFormations();
      }, 2000);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || "Erreur lors de l'enregistrement de l'évaluation"
      );
    } finally {
      setEvaluatingId(null);
    }
  };


  return (
    <PrivateRoute roles={["etudiant"]}>
      <div className="mes-formations-page">
        {/* Page Header */}
        <div className="page-header">
          <div className="header-content">
            <div className="header-icon">
              <BookOpen />
            </div>
            <div>
              <h1>Mes Formations</h1>
              <p>Suivez vos formations et évaluez vos expériences</p>
            </div>
          </div>
          <button className="btn-refresh" onClick={fetchMesFormations} disabled={loading}>
            <RefreshCw className={loading ? "spinning" : ""} />
            <span>Actualiser</span>
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="alert alert-error">
            <AlertCircle />
            <span>{error}</span>
            <button onClick={() => setError(null)} className="alert-close">
              ×
            </button>
          </div>
        )}
        {success && (
          <div className="alert alert-success">
            <CheckCircle />
            <span>{success}</span>
            <button onClick={() => setSuccess(null)} className="alert-close">
              ×
            </button>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="loading-state">
            <RefreshCw className="spinning" />
            <span>Chargement de vos formations...</span>
          </div>
        ) : formations.length === 0 ? (
          <div className="empty-state">
            <BookOpen className="empty-icon" />
            <h3>Aucune formation en cours</h3>
            <p>Inscrivez-vous à une formation pour commencer</p>
          </div>
        ) : (
          <div className="formations-list">
            {formations.map((item) => {
              // Vérifier que formation est un objet valide
              if (!item || !item.formation) return null;
              
              return (
              <div key={item.formation.id} className="formation-item">
                <div className="formation-header">
                  <div>
                    <h2 className="formation-title">
                      {typeof item.formation.titre === 'string' ? item.formation.titre : 'Sans titre'}
                    </h2>
                  </div>
                  <div className={`status-badge status-${item.formation.statut_formation}`}>
                    {item.formation.statut_formation === "commencee" ? "En cours" : "Ouvert"}
                  </div>
                </div>

                <div className="formation-meta">
                  <div className="meta-item">
                    <Users />
                    <span>{typeof item.formation.inscrits === 'number' ? item.formation.inscrits : 0} inscrits</span>
                  </div>
                  <div className="meta-item">
                    <Clock />
                    <span>{typeof item.formation.duree === 'number' ? item.formation.duree : '?'} heures</span>
                  </div>
                  <div className="meta-item">
                    <Users />
                    <span>Statut: {typeof item.statut === 'string' ? item.statut : 'N/A'}</span>
                  </div>
                </div>

                {item.formation.statut_formation !== "terminee" && (
                  <div className="evaluation-section">
                    <h3 className="evaluation-title">
                      <Star />
                      Évaluer cette formation
                    </h3>
                    <div className="evaluation-form">
                      <div className="form-group">
                        <label>Note (0 à 5 étoiles)</label>
                        <div className="rating-input">
                          {[0, 1, 2, 3, 4, 5].map((num) => (
                            <button
                              key={num}
                              className={`star ${
                                evaluations[item.inscription]?.note === String(num) ? "selected" : ""
                              }`}
                              onClick={() =>
                                setEvaluations(prev => ({
                                  ...prev,
                                  [item.inscription]: {
                                    ...prev[item.inscription],
                                    note: String(num)
                                  }
                                }))
                              }
                            >
                              ⭐
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Commentaire (optionnel)</label>
                        <textarea
                          value={evaluations[item.inscription]?.commentaire || ""}
                          onChange={(e) =>
                            setEvaluations(prev => ({
                              ...prev,
                              [item.inscription]: {
                                ...prev[item.inscription],
                                commentaire: e.target.value
                              }
                            }))
                          }
                          placeholder="Partagez votre avis sur cette formation..."
                          maxLength={1000}
                        />
                      </div>

                      <button
                        className="btn-submit"
                        onClick={() => handleEvaluation(item.inscription)}
                        disabled={evaluatingId === item.inscription || !evaluations[item.inscription]?.note}
                      >
                        {evaluatingId === item.inscription ? (
                          <RefreshCw className="spinning" />
                        ) : (
                          <>
                            <Send />
                            <span>Envoyer l'évaluation</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
            })}
          </div>
        )}
      </div>

      <style jsx>{`
        .mes-formations-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);
          padding: 24px;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
        }

        .header-content {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .header-icon {
          width: 56px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .page-header h1 {
          font-size: 2rem;
          font-weight: 700;
          color: #1a1a2e;
          margin: 0 0 4px 0;
        }

        .page-header p {
          font-size: 0.9375rem;
          color: #6b7280;
          margin: 0;
        }

        .btn-refresh {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          background: white;
          color: #667eea;
          border: 2px solid #667eea;
          border-radius: 10px;
          font-size: 0.9375rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-refresh:hover:not(:disabled) {
          background: #667eea;
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .btn-refresh:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .alert {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 20px;
          border-radius: 12px;
          margin-bottom: 24px;
          position: relative;
        }

        .alert-error {
          background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
          border: 1px solid #fecaca;
          color: #991b1b;
        }

        .alert-success {
          background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
          border: 1px solid #bbf7d0;
          color: #166534;
        }

        .alert-close {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: inherit;
          opacity: 0.7;
          padding: 4px;
          line-height: 1;
        }

        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 80px 20px;
          gap: 16px;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 80px 20px;
          gap: 16px;
        }

        .empty-icon {
          width: 64px;
          height: 64px;
          color: #9ca3af;
        }

        .empty-state h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1a1a2e;
          margin: 0;
        }

        .empty-state p {
          font-size: 0.9375rem;
          color: #9ca3af;
          margin: 0;
        }

        .formations-list {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .formation-item {
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
          transition: all 0.3s ease;
        }

        .formation-item:hover {
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        }

        .formation-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          margin-bottom: 16px;
        }

        .formation-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1a1a2e;
          margin: 0 0 4px 0;
        }

        .session-title {
          font-size: 0.9375rem;
          color: #6b7280;
          margin: 0;
        }

        .status-badge {
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 600;
          white-space: nowrap;
        }

        .status-terminee {
          background: #d1fae5;
          color: #065f46;
        }

        .status-en_cours {
          background: #dbeafe;
          color: #1e40af;
        }

        .status-planifiee {
          background: #fef3c7;
          color: #92400e;
        }

        .formation-meta {
          display: flex;
          gap: 16px;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.9375rem;
          color: #6b7280;
        }

        .meta-item svg {
          width: 16px;
          height: 16px;
          color: #667eea;
        }

        .session-lieu {
          font-size: 0.9375rem;
          color: #6b7280;
          margin-bottom: 16px;
          padding: 8px 12px;
          background: #f8fafc;
          border-radius: 8px;
          display: inline-block;
        }

        .evaluation-section {
          margin-top: 24px;
          padding-top: 24px;
          border-top: 1px solid #e2e8f0;
        }

        .evaluation-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 1.0625rem;
          font-weight: 700;
          color: #1a1a2e;
          margin: 0 0 16px 0;
        }

        .evaluation-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group label {
          font-size: 0.9375rem;
          font-weight: 600;
          color: #1a1a2e;
        }

        .rating-input {
          display: flex;
          gap: 8px;
        }

        .star {
          width: 40px;
          height: 40px;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          background: white;
          cursor: pointer;
          font-size: 1.5rem;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .star:hover {
          border-color: #667eea;
          background: #f8fafc;
        }

        .star.selected {
          border-color: #667eea;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        textarea {
          padding: 12px;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          font-size: 0.9375rem;
          font-family: inherit;
          resize: vertical;
          min-height: 100px;
          transition: border-color 0.2s ease;
        }

        textarea:focus {
          outline: none;
          border-color: #667eea;
        }

        .btn-submit {
          display: flex;
          align-items: center;
          justify-content: center;
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
          align-self: flex-start;
        }

        .btn-submit:hover:not(:disabled) {
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .btn-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .spinning {
          animation: spin 1s linear infinite;
        }

        @media (max-width: 768px) {
          .page-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }

          .formation-header {
            flex-direction: column;
            gap: 12px;
          }

          .formation-meta {
            flex-direction: column;
          }

          .rating-input {
            justify-content: space-between;
          }

          .star {
            flex: 1;
          }
        }
      `}</style>
    </PrivateRoute>
  );
}
