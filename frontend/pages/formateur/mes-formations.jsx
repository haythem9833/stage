import { useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import PrivateRoute from "../../components/PrivateRoute";
import { AuthContext } from "../../context/AuthContext";
import { getFormations, deleteFormation, updateFormation, createFormation } from "../../services/api";
import FormationCreateModal from "../../components/modals/FormationCreateModal";
import {
  BookOpen,
  Plus,
  RefreshCw,
  AlertCircle,
  Users,
  Clock,
  TrendingUp,
  Trash2,
  Edit,
  Eye,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

export default function FormateurMesFormations() {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFormation, setEditingFormation] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const myFormations = useMemo(() => {
    const myId = user?.id;
    if (!myId) return [];
    return formations.filter((f) => Number(f.formateur_id) === Number(myId));
  }, [formations, user?.id]);

  const stats = useMemo(() => {
    return {
      total: myFormations.length,
      totalInscrits: myFormations.reduce((acc, f) => acc + (f.inscrits || 0), 0),
      published: myFormations.filter((f) => f.statut === "publie").length,
      draft: myFormations.filter((f) => f.statut === "brouillon").length,
    };
  }, [myFormations]);

  const fetchFormations = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getFormations();
      setFormations(res.data || []);
    } catch (err) {
      console.error("Erreur chargement formations:", err);
      setError(err.response?.data?.message || "Impossible de charger les formations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFormations();
  }, []);

  const handleOpenModal = () => {
    setEditingFormation(null);
    setError(null);
    setSuccess(null);
    setIsModalOpen(true);
  };

  const handleEditFormation = (formation) => {
    setEditingFormation(formation);
    setError(null);
    setSuccess(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingFormation(null);
    setError(null);
  };

  const handleSubmit = async (formData) => {
    try {
      setSubmitting(true);
      setError(null);

      if (editingFormation) {
        await updateFormation(editingFormation.id, formData);
        setSuccess("Formation modifiée avec succès !");
      } else {
        await createFormation(formData);
        setSuccess("Formation créée avec succès !");
      }

      await fetchFormations();
      handleCloseModal();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Erreur lors de la soumission:", err);
      setError(err.response?.data?.message || "Une erreur est survenue");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteFormation = async (id) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette formation ?")) return;
    try {
      setDeletingId(id);
      setError(null);
      await deleteFormation(id);
      setSuccess("Formation supprimée avec succès !");
      await fetchFormations();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Erreur suppression:", err);
      setError(err.response?.data?.message || "Erreur lors de la suppression");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <PrivateRoute roles={["formateur"]}>
      <div className="mes-formations-page">
        {/* Header */}
        <div className="page-header">
          <div className="header-content">
            <div className="header-title">
              <BookOpen className="header-icon" />
              <div>
                <h1>Mes Formations</h1>
                <p>Gérez vos formations et suivez les inscriptions</p>
              </div>
            </div>
            <button className="btn btn-primary" onClick={handleOpenModal}>
              <Plus /> Créer une formation
            </button>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="alert alert-error">
            <AlertCircle />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="alert alert-success">
            <span>{success}</span>
          </div>
        )}

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
              <BookOpen />
            </div>
            <div className="stat-content">
              <span className="stat-value">{stats.total}</span>
              <span className="stat-label">Total</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)" }}>
              <CheckCircle />
            </div>
            <div className="stat-content">
              <span className="stat-value">{stats.published}</span>
              <span className="stat-label">Publiées</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)" }}>
              <Edit />
            </div>
            <div className="stat-content">
              <span className="stat-value">{stats.draft}</span>
              <span className="stat-label">Brouillons</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)" }}>
              <Users />
            </div>
            <div className="stat-content">
              <span className="stat-value">{stats.totalInscrits}</span>
              <span className="stat-label">Inscrits</span>
            </div>
          </div>
        </div>

        {/* Formations List */}
        {loading ? (
          <div className="loading-state">
            <RefreshCw className="spinning" />
            <span>Chargement des formations...</span>
          </div>
        ) : myFormations.length === 0 ? (
          <div className="empty-state">
            <BookOpen />
            <p>Aucune formation trouvée</p>
            <button className="btn btn-primary" onClick={handleOpenModal}>
              <Plus /> Créer votre première formation
            </button>
          </div>
        ) : (
          <div className="formations-grid">
            {myFormations.map((formation) => (
              <div key={formation.id} className="formation-card">
                <div className="card-header">
                  <div className="card-title">
                    <h3>{formation.nom}</h3>
                    <span className={`badge badge-${formation.statut}`}>
                      {formation.statut === "publie" ? "Publiée" : "Brouillon"}
                    </span>
                  </div>
                </div>

                <div className="card-body">
                  <p className="card-description">{formation.description}</p>
                  <div className="card-meta">
                    <div className="meta-item">
                      <Users />
                      <span>{formation.inscrits || 0} inscrits</span>
                    </div>
                    <div className="meta-item">
                      <Clock />
                      <span>{formation.duree || "N/A"}</span>
                    </div>
                  </div>
                </div>

                <div className="card-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() => handleEditFormation(formation)}
                  >
                    <Edit /> Modifier
                  </button>
                  <Link href={`/formateur/formations/${formation.id}`} className="btn btn-secondary">
                    <Eye /> Voir
                  </Link>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDeleteFormation(formation.id)}
                    disabled={deletingId === formation.id}
                  >
                    <Trash2 /> {deletingId === formation.id ? "Suppression..." : "Supprimer"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {isModalOpen && (
          <FormationCreateModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onSubmit={handleSubmit}
            isLoading={submitting}
            editingFormation={editingFormation}
          />
        )}

        <style jsx>{`
          .mes-formations-page {
            min-height: 100vh;
            background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);
            padding: 24px;
          }

          .page-header {
            background: white;
            border-radius: 16px;
            padding: 32px;
            margin-bottom: 32px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
          }

          .header-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 24px;
          }

          .header-title {
            display: flex;
            align-items: center;
            gap: 16px;
          }

          .header-icon {
            width: 48px;
            height: 48px;
            color: #667eea;
            background: rgba(102, 126, 234, 0.1);
            padding: 12px;
            border-radius: 12px;
          }

          .header-title h1 {
            font-size: 1.75rem;
            font-weight: 700;
            color: #1a1a2e;
            margin: 0;
          }

          .header-title p {
            color: #6b7280;
            margin: 4px 0 0 0;
          }

          .btn {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 12px 24px;
            border: none;
            border-radius: 10px;
            font-size: 0.9375rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
          }

          .btn-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }

          .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
          }

          .btn-secondary {
            background: #f3f4f6;
            color: #374151;
            border: 1px solid #d1d5db;
          }

          .btn-secondary:hover {
            background: #e5e7eb;
          }

          .btn-danger {
            background: #fee2e2;
            color: #dc2626;
            border: 1px solid #fecaca;
          }

          .btn-danger:hover {
            background: #fecaca;
          }

          .btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          .alert {
            padding: 16px 20px;
            border-radius: 10px;
            margin-bottom: 24px;
            display: flex;
            align-items: center;
            gap: 12px;
            font-weight: 500;
          }

          .alert-error {
            background: #fee2e2;
            color: #dc2626;
            border: 1px solid #fecaca;
          }

          .alert-success {
            background: #dcfce7;
            color: #16a34a;
            border: 1px solid #bbf7d0;
          }

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
            color: white;
            flex-shrink: 0;
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
          }

          .stat-label {
            font-size: 0.875rem;
            color: #6b7280;
          }

          .loading-state,
          .empty-state {
            background: white;
            border-radius: 16px;
            padding: 60px 24px;
            text-align: center;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
          }

          .loading-state svg {
            width: 48px;
            height: 48px;
            color: #667eea;
            margin-bottom: 16px;
          }

          .empty-state svg {
            width: 64px;
            height: 64px;
            color: #d1d5db;
            margin-bottom: 16px;
          }

          .empty-state p {
            font-size: 1.125rem;
            color: #6b7280;
            margin-bottom: 24px;
          }

          .spinning {
            animation: spin 1s linear infinite;
          }

          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }

          .formations-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
            gap: 24px;
          }

          .formation-card {
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
            transition: all 0.3s ease;
            display: flex;
            flex-direction: column;
          }

          .formation-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
          }

          .card-header {
            padding: 20px;
            border-bottom: 1px solid #e5e7eb;
            background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
          }

          .card-title {
            display: flex;
            justify-content: space-between;
            align-items: start;
            gap: 12px;
          }

          .card-title h3 {
            font-size: 1.125rem;
            font-weight: 700;
            color: #1a1a2e;
            margin: 0;
            flex: 1;
          }

          .badge {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 600;
            white-space: nowrap;
          }

          .badge-publie {
            background: #dcfce7;
            color: #16a34a;
          }

          .badge-brouillon {
            background: #fef3c7;
            color: #d97706;
          }

          .card-body {
            padding: 20px;
            flex: 1;
          }

          .card-description {
            color: #6b7280;
            margin: 0 0 16px 0;
            line-height: 1.5;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }

          .card-meta {
            display: flex;
            gap: 16px;
            flex-wrap: wrap;
          }

          .meta-item {
            display: flex;
            align-items: center;
            gap: 6px;
            color: #6b7280;
            font-size: 0.875rem;
          }

          .meta-item svg {
            width: 16px;
            height: 16px;
          }

          .card-footer {
            padding: 16px 20px;
            border-top: 1px solid #e5e7eb;
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
          }

          .card-footer .btn {
            flex: 1;
            min-width: 100px;
            justify-content: center;
            padding: 10px 16px;
            font-size: 0.875rem;
          }

          @media (max-width: 768px) {
            .header-content {
              flex-direction: column;
              align-items: flex-start;
            }

            .formations-grid {
              grid-template-columns: 1fr;
            }

            .card-footer {
              flex-direction: column;
            }

            .card-footer .btn {
              width: 100%;
            }
          }
        `}</style>
      </div>
    </PrivateRoute>
  );
}
