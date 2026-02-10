import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import PrivateRoute from "../../../components/PrivateRoute";
import { AuthContext } from "../../../context/AuthContext";
import { completerInscription, api } from "../../../services/api";
import {
  ArrowLeft,
  Users,
  Clock,
  BookOpen,
  CheckCircle,
  AlertCircle,
  Loader,
} from "lucide-react";
import Link from "next/link";

export default function FormationDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useContext(AuthContext);
  const [formation, setFormation] = useState(null);
  const [inscriptions, setInscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completingId, setCompletingId] = useState(null);
  const [success, setSuccess] = useState(null);

  const fetchFormation = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Appeler directement l'endpoint de détail avec axios
      const res = await api.get(`/formations/${id}`);
      const found = res.data;

      // Check if user is the formateur or admin
      if (Number(found.formateur_id) !== Number(user?.id) && user?.role !== "admin") {
        setError("Vous n'avez pas accès à cette formation");
        return;
      }

      setFormation(found);
      setInscriptions(found.inscriptions || []);
    } catch (err) {
      console.error("Erreur chargement:", err);
      setError(err.response?.data?.message || "Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id && user?.id) {
      fetchFormation();
    }
  }, [id, user?.id]);

  const handleCompleterInscription = async (inscriptionId) => {
    try {
      setCompletingId(inscriptionId);
      await completerInscription(inscriptionId);
      setSuccess("Inscription marquée comme terminée");
      // Refresh formation data
      fetchFormation();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Erreur:", err);
      setError(err.response?.data?.message || "Erreur lors de la completion");
    } finally {
      setCompletingId(null);
    }
  };

  if (loading) {
    return (
      <PrivateRoute>
        <div className="detail-container">
          <div className="loading-state">
            <Loader size={48} />
            <p>Chargement...</p>
          </div>
        </div>
        <style jsx>{`
          .detail-container {
            padding: 2rem;
          }
          .loading-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 400px;
            gap: 1rem;
          }
        `}</style>
      </PrivateRoute>
    );
  }

  if (error || !formation) {
    return (
      <PrivateRoute>
        <div className="detail-container">
          <Link href="/formateur/mes-formations" className="back-btn">
            <ArrowLeft size={20} /> Retour
          </Link>
          <div className="error-state">
            <AlertCircle size={48} />
            <p>{error || "Formation non trouvée"}</p>
          </div>
        </div>
        <style jsx>{`
          .detail-container {
            padding: 2rem;
          }
          .back-btn {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            color: #0066cc;
            text-decoration: none;
            margin-bottom: 1rem;
            cursor: pointer;
          }
          .back-btn:hover {
            text-decoration: underline;
          }
          .error-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 400px;
            gap: 1rem;
            color: #d32f2f;
          }
        `}</style>
      </PrivateRoute>
    );
  }

  return (
    <PrivateRoute>
      <div className="detail-container">
        <Link href="/formateur/mes-formations" className="back-btn">
          <ArrowLeft size={20} /> Retour
        </Link>

        {success && (
          <div className="alert alert-success">
            <CheckCircle size={20} /> {success}
          </div>
        )}

        <div className="formation-header">
          <div className="header-content">
            <h1>{formation.nom}</h1>
            <p className="description">{formation.description}</p>
            <div className="meta-info">
              <div className="meta-item">
                <Users size={18} />
                <span>{formation.inscrits || 0} inscrits</span>
              </div>
              {formation.duree && (
                <div className="meta-item">
                  <Clock size={18} />
                  <span>{formation.duree} heures</span>
                </div>
              )}
              {formation.categorie && (
                <div className="meta-item">
                  <BookOpen size={18} />
                  <span>{formation.categorie}</span>
                </div>
              )}
            </div>
          </div>
          <div className="status-badge" data-status={formation.status}>
            {formation.status === "commencee" && <CheckCircle size={20} />}
            <span>{formation.status}</span>
          </div>
        </div>

        <div className="content-section">
          <h2>Inscriptions</h2>
          {inscriptions.length === 0 ? (
            <div className="empty-state">
              <Users size={40} />
              <p>Aucune inscription pour cette formation</p>
            </div>
          ) : (
            <div className="inscriptions-table">
              <table>
                <thead>
                  <tr>
                    <th>Étudiant</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {inscriptions.map((inscription) => (
                    <tr key={inscription.id}>
                      <td className="name-cell">
                        {inscription.user?.prenom} {inscription.user?.nom}
                      </td>
                      <td>{inscription.user?.email}</td>
                      <td>
                        <span
                          className={`status-badge ${inscription.status}`}
                        >
                          {inscription.status}
                        </span>
                      </td>
                      <td>
                        {inscription.status !== "terminez" ? (
                          <button
                            className="btn btn-complete"
                            onClick={() =>
                              handleCompleterInscription(inscription.id)
                            }
                            disabled={completingId === inscription.id}
                          >
                            {completingId === inscription.id ? (
                              <>
                                <Loader size={16} /> Traitement...
                              </>
                            ) : (
                              <>
                                <CheckCircle size={16} /> Marquer comme
                                terminée
                              </>
                            )}
                          </button>
                        ) : (
                          <span className="completed-badge">
                            <CheckCircle size={16} /> Terminée
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .detail-container {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .back-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: #0066cc;
          text-decoration: none;
          margin-bottom: 2rem;
          cursor: pointer;
          font-weight: 500;
        }

        .back-btn:hover {
          text-decoration: underline;
        }

        .alert {
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .alert-success {
          background-color: #e8f5e9;
          color: #2e7d32;
          border: 1px solid #c8e6c9;
        }

        .formation-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 2rem;
          border-radius: 12px;
          margin-bottom: 2rem;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 2rem;
        }

        .header-content {
          flex: 1;
        }

        .formation-header h1 {
          margin: 0 0 0.5rem 0;
          font-size: 2rem;
        }

        .description {
          margin: 0.5rem 0 1.5rem 0;
          opacity: 0.95;
          font-size: 1.05rem;
        }

        .meta-info {
          display: flex;
          gap: 2rem;
          flex-wrap: wrap;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.95rem;
        }

        .status-badge {
          background: rgba(255, 255, 255, 0.2);
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
          text-transform: uppercase;
          font-size: 0.85rem;
        }

        .content-section {
          margin-bottom: 2rem;
        }

        .content-section h2 {
          margin: 0 0 1.5rem 0;
          font-size: 1.5rem;
          color: #333;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem 2rem;
          color: #999;
          background: #f5f5f5;
          border-radius: 8px;
          gap: 1rem;
        }

        .inscriptions-table {
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .inscriptions-table table {
          width: 100%;
          border-collapse: collapse;
        }

        .inscriptions-table thead {
          background-color: #f5f5f5;
          border-bottom: 2px solid #ddd;
        }

        .inscriptions-table th {
          padding: 1rem;
          text-align: left;
          font-weight: 600;
          color: #333;
        }

        .inscriptions-table td {
          padding: 1rem;
          border-bottom: 1px solid #eee;
        }

        .inscriptions-table tbody tr:hover {
          background-color: #fafafa;
        }

        .name-cell {
          font-weight: 500;
          color: #333;
        }

        .status-badge {
          display: inline-block;
          padding: 0.4rem 0.8rem;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 500;
          text-transform: capitalize;
        }

        .status-badge.inscrit {
          background-color: #e3f2fd;
          color: #1976d2;
        }

        .status-badge.terminez {
          background-color: #e8f5e9;
          color: #388e3c;
        }

        .btn {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.9rem;
          font-weight: 500;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.3s ease;
        }

        .btn-complete {
          background-color: #4caf50;
          color: white;
        }

        .btn-complete:hover:not(:disabled) {
          background-color: #45a049;
        }

        .btn-complete:disabled {
          background-color: #cccccc;
          cursor: not-allowed;
        }

        .completed-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: #388e3c;
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .detail-container {
            padding: 1rem;
          }

          .formation-header {
            flex-direction: column;
            gap: 1rem;
          }

          .formation-header h1 {
            font-size: 1.5rem;
          }

          .meta-info {
            gap: 1rem;
          }

          .inscriptions-table {
            overflow-x: auto;
          }

          .inscriptions-table table {
            font-size: 0.9rem;
          }

          .inscriptions-table th,
          .inscriptions-table td {
            padding: 0.75rem;
          }

          .btn {
            padding: 0.4rem 0.75rem;
            font-size: 0.85rem;
          }
        }
      `}</style>
    </PrivateRoute>
  );
}
