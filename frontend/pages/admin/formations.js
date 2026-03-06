import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import PrivateRoute from "../../components/PrivateRoute";
import FormationsTable from "../../components/tables/FormationsTable";
import FormationModal from "../../components/modals/FormationModal";
import { getFormations, createFormation, updateFormation, deleteFormation, getUsers } from "../../services/api";
import {
  BookOpen,
  Plus,
  RefreshCw,
  AlertCircle,
  Check,
  BookText,
  Users,
  Clock,
  TrendingUp,
  Settings,
  Search,
  Filter,
  Shield,
  Trash2,
  Edit,
} from "lucide-react";

export default function AdminFormations() {
  const router = useRouter();
  const [formations, setFormations] = useState([]);
  const [filteredFormations, setFilteredFormations] = useState([]);
  const [formateurs, setFormateurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFormation, setEditingFormation] = useState(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    setIsHydrated(true);
    fetchFormations();
    fetchFormateurs();
    // Récupérer le paramètre search de l'URL
    if (router.query.search) {
      setSearchQuery(router.query.search);
    }
  }, [router.query.search]);

  // Filter formations
  useEffect(() => {
    let filtered = formations;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (f) =>
          f.nom?.toLowerCase().includes(query) ||
          f.description?.toLowerCase().includes(query) ||
          f.categorie?.toLowerCase().includes(query) ||
          f.formateur_name?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter === "active") {
      filtered = filtered.filter((f) => f.statut === "publie" || f.statut === "active");
    } else if (statusFilter === "draft") {
      filtered = filtered.filter((f) => f.statut === "brouillon" || f.statut === "draft");
    } else if (statusFilter === "archived") {
      filtered = filtered.filter((f) => f.statut === "archive" || f.statut === "archived");
    }

    setFilteredFormations(filtered);
  }, [searchQuery, statusFilter, formations]);

  const stats = {
    total: formations.length,
    totalInscrits: formations.reduce((acc, f) => acc + (f.inscriptions?.length || 0), 0),
    totalSessions: formations.reduce((acc, f) => acc + (f.inscriptions?.length || 0), 0),
    totalFormateurs: formateurs.length,
    published: formations.filter((f) => f.statut === "publie").length,
    drafts: formations.filter((f) => f.statut === "brouillon").length,
  };

  const fetchFormations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getFormations();
      setFormations(response.data || []);
      setFilteredFormations(response.data || []);
    } catch (err) {
      console.error("Erreur chargement formations:", err);
      setError(err.response?.data?.message || "Impossible de charger les formations");
      setFormations([]);
      setFilteredFormations([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchFormateurs = async () => {
    try {
      const res = await getUsers();
      const users = res.data || [];
      setFormateurs(users.filter((u) => u.role === "formateur"));
    } catch (err) {
      console.error("Erreur chargement formateurs:", err);
    }
  };

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

      if (err.response?.status === 422) {
        const validationErrors = err.response?.data?.errors;
        if (validationErrors) {
          const errorMessages = Object.entries(validationErrors)
            .map(([field, messages]) => `${field}: ${messages.join(", ")}`)
            .join("\n");
          setError(errorMessages);
        } else {
          setError(err.response?.data?.message || "Erreur de validation");
        }
      } else if (err.response?.status === 401) {
        setError("Non autorisé - Veuillez vous reconnecter");
      } else if (err.response?.status === 403) {
        setError("Accès refusé - Vous n'avez pas les droits");
      } else if (err.response?.status === 500) {
        setError("Erreur serveur - Veuillez contacter l'administrateur");
      } else {
        setError(err.response?.data?.message || "Une erreur est survenue");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteFormation = async (id) => {
    if (
      !confirm(
        "Êtes-vous sûr de vouloir supprimer cette formation ? Cette action est irréversible."
      )
    )
      return;
    try {
      setDeletingId(id);
      setError(null);
      await deleteFormation(id);
      setSuccess("Formation supprimée avec succès !");
      await fetchFormations();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Erreur suppression formation:", err);
      setError(err.response?.data?.message || "Impossible de supprimer la formation");
    } finally {
      setDeletingId(null);
    }
  };

  if (!isHydrated) {
    return (
      <PrivateRoute roles={["admin"]}>
        <div className="admin-formations-page">
          <div className="loading-state">
            <RefreshCw className="spinning" />
            <span>Chargement...</span>
          </div>

          <style jsx>{`
            .admin-formations-page {
              min-height: 100vh;
              background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);
              display: flex;
              align-items: center;
              justify-content: center;
            }

            .loading-state {
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 16px;
              padding: 40px;
            }

            .loading-state svg {
              width: 48px;
              height: 48px;
              color: #9ca3af;
            }

            .loading-state span {
              font-size: 1rem;
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
      <div className="admin-formations-page">
        {/* Page Header */}
        <div className="page-header">
          <div className="header-content">
            <div className="header-icon">
              <Settings />
            </div>
            <div>
              <h1>Gestion des Formations</h1>
              <p>Administrer et gérer toutes les formations de la plateforme</p>
            </div>
          </div>
          <button className="btn-create" onClick={handleOpenModal} disabled={loading}>
            <Plus />
            <span>Créer une formation</span>
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="alert alert-error">
            <AlertCircle />
            <div className="alert-content">
              {error.split("\n").map((line, i) => (
                <div key={i}>{line}</div>
              ))}
            </div>
            <button className="alert-close" onClick={() => setError(null)} type="button">
              ×
            </button>
          </div>
        )}
        {success && (
          <div className="alert alert-success">
            <Check />
            <span>{success}</span>
            <button className="alert-close" onClick={() => setSuccess(null)} type="button">
              ×
            </button>
          </div>
        )}

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card stat-card-blue">
            <div className="stat-icon">
              <BookOpen />
            </div>
            <div className="stat-content">
              <span className="stat-value">{stats.total}</span>
              <span className="stat-label">Total formations</span>
            </div>
          </div>
          <div className="stat-card stat-card-green">
            <div className="stat-icon">
              <Check />
            </div>
            <div className="stat-content">
              <span className="stat-value">{stats.published}</span>
              <span className="stat-label">Publiées</span>
            </div>
          </div>
          <div className="stat-card stat-card-orange">
            <div className="stat-icon">
              <BookText />
            </div>
            <div className="stat-content">
              <span className="stat-value">{stats.drafts}</span>
              <span className="stat-label">Brouillons</span>
            </div>
          </div>
          <div className="stat-card stat-card-purple">
            <div className="stat-icon">
              <Users />
            </div>
            <div className="stat-content">
              <span className="stat-value">{stats.totalInscrits}</span>
              <span className="stat-label">Inscrits</span>
            </div>
          </div>
          <div className="stat-card stat-card-pink">
            <div className="stat-icon">
              <Clock />
            </div>
            <div className="stat-content">
              <span className="stat-value">{stats.totalSessions}</span>
              <span className="stat-label">Inscrits</span>
            </div>
          </div>
          <div className="stat-card stat-card-indigo">
            <div className="stat-icon">
              <Shield />
            </div>
            <div className="stat-content">
              <span className="stat-value">{stats.totalFormateurs}</span>
              <span className="stat-label">Formateurs</span>
            </div>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="filters-bar">
          <div className="search-box">
            <Search />
            <input
              type="text"
              placeholder="Rechercher par nom, description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="filter-select">
            <Filter />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">Tous les statuts</option>
              <option value="active">Actives</option>
              <option value="draft">Brouillons</option>
              <option value="archived">Archivées</option>
            </select>
          </div>
          <button className="btn-refresh" onClick={fetchFormations} disabled={loading}>
            <RefreshCw className={loading ? "spinning" : ""} />
            <span>Actualiser</span>
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="loading-state">
            <RefreshCw className="spinning" />
            <span>Chargement des formations...</span>
          </div>
        ) : filteredFormations.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon-wrapper">
              <BookOpen className="empty-icon" />
            </div>
            <h3>Aucune formation trouvée</h3>
            <p>Ajustez vos filtres ou créez une nouvelle formation</p>
            <button className="btn-create-empty" onClick={handleOpenModal}>
              <Plus />
              <span>Créer ma première formation</span>
            </button>
          </div>
        ) : (
          <div className="table-wrapper">
            <div className="table-header-bar">
              <div className="table-info">
                <BookOpen />
                <span>
                  {filteredFormations.length} / {formations.length} formation
                  {formations.length > 1 ? "s" : ""}
                </span>
              </div>
              <div className="table-actions">
                <button className="btn-icon-action" title="Actualiser" onClick={fetchFormations}>
                  <RefreshCw />
                </button>
              </div>
            </div>
            <FormationsTable
              formations={filteredFormations}
              onEdit={handleEditFormation}
              onDelete={handleDeleteFormation}
              deletingId={deletingId}
              isAdmin={true}
            />
          </div>
        )}

        {/* Modal */}
        <FormationModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
          initialData={editingFormation}
          isSubmitting={submitting}
          formateurs={formateurs}
          isAdmin={true}
        />
      </div>

      <style jsx>{`
        .admin-formations-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);
          padding: 24px;
        }

        /* Page Header */
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

        .btn-create,
        .btn-create-empty {
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
          white-space: nowrap;
        }

        .btn-create:hover:not(:disabled),
        .btn-create-empty:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .btn-create:disabled {
          opacity: 0.6;
          cursor: not-allowed;
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

        .stat-card-blue .stat-icon {
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          color: white;
        }

        .stat-card-green .stat-icon {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
        }

        .stat-card-orange .stat-icon {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          color: white;
        }

        .stat-card-purple .stat-icon {
          background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
          color: white;
        }

        .stat-card-pink .stat-icon {
          background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);
          color: white;
        }

        .stat-card-indigo .stat-icon {
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
          color: white;
        }

        .stat-content {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 700;
          color: #1a1a2e;
          line-height: 1;
        }

        .stat-label {
          font-size: 0.875rem;
          color: #6b7280;
          font-weight: 500;
        }

        /* Filters Bar */
        .filters-bar {
          display: flex;
          gap: 16px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }

        .search-box,
        .filter-select {
          display: flex;
          align-items: center;
          gap: 10px;
          background: white;
          border: 2px solid #e2e8f0;
          border-radius: 10px;
          padding: 12px 16px;
          transition: all 0.3s ease;
          flex: 1;
          min-width: 200px;
        }

        .search-box:focus-within,
        .filter-select:focus-within {
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .search-box svg,
        .filter-select svg {
          width: 20px;
          height: 20px;
          color: #9ca3af;
          flex-shrink: 0;
        }

        .search-box input {
          flex: 1;
          background: transparent;
          border: none;
          font-size: 0.9375rem;
          color: #1a1a2e;
        }

        .search-box input:focus {
          outline: none;
        }

        .search-box input::placeholder {
          color: #9ca3af;
        }

        .filter-select select {
          flex: 1;
          background: transparent;
          border: none;
          font-size: 0.9375rem;
          color: #1a1a2e;
          font-weight: 500;
          cursor: pointer;
          appearance: none;
        }

        .filter-select select:focus {
          outline: none;
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
        }

        .btn-refresh:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Alerts */
        .alert {
          display: flex;
          align-items: flex-start;
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

        .alert-content {
          flex: 1;
          white-space: pre-wrap;
          word-break: break-word;
          font-size: 0.9375rem;
          line-height: 1.6;
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

        .alert-close:hover {
          opacity: 1;
        }

        /* Table Wrapper */
        .table-wrapper {
          background: white;
          border-radius: 16px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
          overflow: hidden;
        }

        .table-header-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border-bottom: 2px solid #e2e8f0;
        }

        .table-info {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.9375rem;
          font-weight: 600;
          color: #1a1a2e;
        }

        .table-info svg {
          width: 20px;
          height: 20px;
          color: #667eea;
        }

        .table-actions {
          display: flex;
          gap: 8px;
        }

        .btn-icon-action {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background: white;
          color: #667eea;
          border: 2px solid #667eea;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-icon-action:hover {
          background: #667eea;
          color: white;
          transform: scale(1.05);
        }

        /* Loading & Empty States */
        .loading-state,
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 80px 20px;
          gap: 20px;
          background: white;
          border-radius: 16px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        }

        .loading-state svg,
        .empty-state svg {
          width: 64px;
          height: 64px;
          color: #9ca3af;
        }

        .loading-state span,
        .empty-state span {
          font-size: 1.0625rem;
          color: #6b7280;
        }

        .empty-icon-wrapper {
          width: 100px;
          height: 100px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border-radius: 50%;
          margin-bottom: 8px;
        }

        .empty-state h3 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1a1a2e;
          margin: 0;
        }

        .empty-state p {
          font-size: 0.9375rem;
          color: #6b7280;
          margin: 0 0 24px 0;
          text-align: center;
          max-width: 400px;
        }

        .btn-create-empty {
          padding: 14px 32px;
          font-size: 1rem;
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
        @media (max-width: 1200px) {
          .stats-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 768px) {
          .admin-formations-page {
            padding: 16px;
          }

          .page-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }

          .page-header h1 {
            font-size: 1.5rem;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .filters-bar {
            flex-direction: column;
          }

          .search-box,
          .filter-select,
          .btn-refresh {
            width: 100%;
          }

          .table-header-bar {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }

          .btn-create,
          .btn-refresh {
            width: 100%;
            justify-content: center;
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
