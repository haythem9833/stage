import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { getFormations, api } from "../../services/api";
import PrivateRoute from "../../components/PrivateRoute";
import FormationCard from "../../components/cards/FormationCard";
import FormationModal from "../../components/modals/FormationModal";
import {
  BookOpen,
  Search,
  Filter,
  Calendar,
  Users,
  Clock,
  Check,
  AlertCircle,
  RefreshCw,
  Star,
} from "lucide-react";

export default function Formations() {
  const router = useRouter();
  const [formations, setFormations] = useState([]);
  const [filteredFormations, setFilteredFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState(null);
  const [selectedFormation, setSelectedFormation] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const categories = [
    { id: "all", label: "Toutes les catégories" },
    { id: "developpement", label: "Développement" },
    { id: "design", label: "Design" },
    { id: "marketing", label: "Marketing" },
    { id: "data", label: "Data Science" },
    { id: "business", label: "Business" },
  ];

  useEffect(() => {
    fetchFormations();
    // Récupérer le paramètre search de l'URL
    if (router.query.search) {
      setSearchQuery(router.query.search);
    }
  }, [router.query.search]);

  useEffect(() => {
    let filtered = formations;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (f) =>
          f.titre?.toLowerCase().includes(query) ||
          f.description?.toLowerCase().includes(query) ||
          f.categorie?.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter((f) => f.categorie === categoryFilter);
    }

    setFilteredFormations(filtered);
  }, [searchQuery, categoryFilter, formations]);

  const fetchFormations = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getFormations();
      setFormations(res.data || []);
      setFilteredFormations(res.data || []);
    } catch (err) {
      console.error(err);
      setError("Erreur lors du chargement des formations");
      setFormations([]);
      setFilteredFormations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleVoirPlus = async (formation) => {
    try {
      // Récupérer les données fraîches de la formation
      const res = await getFormations();
      const updatedFormation = res.data.find(f => f.id === formation.id) || formation;
      setSelectedFormation(updatedFormation);
      setModalOpen(true);
    } catch (err) {
      // Si erreur, utiliser la version locale
      setSelectedFormation(formation);
      setModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedFormation(null);
  };

  const handleInscription = async (formationId) => {
    try {
      setActionLoading(formationId);
      await api.post("/inscriptions", { formation_id: formationId });
      setSuccess("Inscription réussie !");
      // Recharger les formations pour mettre à jour dynamiquement
      await fetchFormations();
      // Rafraîchir le modal aussi si ouvert
      if (selectedFormation) {
        const updatedFormation = filteredFormations.find(f => f.id === selectedFormation.id) || selectedFormation;
        setSelectedFormation(updatedFormation);
      }
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Erreur lors de l'inscription");
      setTimeout(() => setError(null), 3000);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <PrivateRoute roles={["etudiant"]}>
      <div className="formations-page">
        {/* Page Header */}
        <div className="page-header">
          <div className="header-content">
            <div className="header-icon">
              <BookOpen />
            </div>
            <div>
              <h1>Formations disponibles</h1>
              <p>Découvrez nos formations et améliorez vos compétences professionnelles</p>
            </div>
          </div>
          <div className="header-actions">
            <button className="btn-refresh" onClick={fetchFormations} disabled={loading}>
              <RefreshCw className={loading ? "spinning" : ""} />
              <span>Actualiser</span>
            </button>
            <Link href="/etudiant/mes-formations" className="btn-mes-formations">
              <Star />
              <span>Mes Formations</span>
            </Link>
          </div>
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
            <Check />
            <span>{success}</span>
            <button onClick={() => setSuccess(null)} className="alert-close">
              ×
            </button>
          </div>
        )}

        {/* Filters Bar */}
        <div className="filters-bar">
          <div className="search-box">
            <Search />
            <input
              type="text"
              placeholder="Rechercher une formation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="filter-select">
            <Filter />
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-bar">
          <div className="stat-item">
            <BookOpen className="stat-icon" />
            <span>{filteredFormations.length} formations</span>
          </div>
          <div className="stat-item">
            <Users className="stat-icon" />
            <span>
              {formations.reduce((acc, f) => acc + (f.inscrits || 0), 0)} inscrits
            </span>
          </div>
          <div className="stat-item">
            <Clock className="stat-icon" />
            <span>
              {formations.reduce((acc, f) => acc + (f.sessions?.length || 0), 0)} sessions
            </span>
          </div>
        </div>

        {/* Formations Grid */}
        {loading ? (
          <div className="loading-state">
            <RefreshCw className="spinning" />
            <span>Chargement des formations...</span>
          </div>
        ) : filteredFormations.length === 0 ? (
          <div className="empty-state">
            <BookOpen className="empty-icon" />
            <h3>Aucune formation trouvée</h3>
            <p>Ajustez vos filtres de recherche</p>
          </div>
        ) : (
          <div className="formations-grid">
            {filteredFormations.map((formation) => (
              <div key={formation.id} className="formation-wrapper">
                <FormationCard 
                  formation={formation}
                  onVoirPlus={handleVoirPlus}
                />

                {/* Sessions */}
                {formation.sessions && formation.sessions.length > 0 && (
                  <div className="sessions-section">
                    <div className="sessions-header">
                      <Calendar className="sessions-icon" />
                      <h3>Sessions disponibles</h3>
                    </div>
                    <div className="sessions-list">
                      {formation.sessions.map((session) => {
                        const alreadyInscrit = session.inscrit === true;
                        const sessionFull = session.places_restantes === 0;
                        return (
                          <div key={session.id} className="session-card">
                            <div className="session-info">
                              <div className="session-date">
                                <Calendar />
                                <span>{session.date}</span>
                              </div>
                              <div className="session-details">
                                <div className="session-detail-item">
                                  <Clock />
                                  <span>Durée: {session.duree || "Non spécifié"}</span>
                                </div>
                                <div className="session-detail-item">
                                  <Users />
                                  <span>
                                    {session.places_restantes || 0} places restantes
                                  </span>
                                </div>
                              </div>
                              {session.lieu && (
                                <div className="session-location">
                                  <span>📍 {session.lieu}</span>
                                </div>
                              )}
                            </div>
                            <button
                              className={`btn-inscrire ${
                                alreadyInscrit ? "btn-inscrit" : ""
                              } ${sessionFull ? "btn-complet" : ""}`}
                              onClick={() => !alreadyInscrit && !sessionFull && handleInscription(formation.id, session.id)}
                              disabled={
                                actionLoading === session.id ||
                                alreadyInscrit ||
                                sessionFull
                              }
                            >
                              {actionLoading === session.id ? (
                                <RefreshCw className="spinning" />
                              ) : alreadyInscrit ? (
                                <>
                                  <Check />
                                  <span>Inscrit</span>
                                </>
                              ) : sessionFull ? (
                                <>
                                  <AlertCircle />
                                  <span>Complet</span>
                                </>
                              ) : (
                                "S'inscrire"
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Formation Modal */}
      <FormationModal
        formation={selectedFormation}
        isOpen={modalOpen}
        onClose={handleCloseModal}
        onInscription={handleInscription}
      />

      <style jsx>{`
        .formations-page {
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

        .header-actions {
          display: flex;
          gap: 12px;
          align-items: center;
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

        .btn-mes-formations {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 0.9375rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
        }

        .btn-mes-formations:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
        }

        .btn-mes-formations svg {
          width: 20px;
          height: 20px;
        }

        /* Alerts */
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

        .alert-close:hover {
          opacity: 1;
        }

        /* Filters Bar */
        .filters-bar {
          display: flex;
          gap: 16px;
          margin-bottom: 20px;
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

        /* Stats Bar */
        .stats-bar {
          display: flex;
          gap: 16px;
          padding: 20px;
          background: white;
          border-radius: 12px;
          margin-bottom: 32px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border-radius: 10px;
          font-size: 0.9375rem;
          font-weight: 600;
          color: #1a1a2e;
        }

        .stat-icon {
          width: 20px;
          height: 20px;
          color: #667eea;
        }

        /* Formations Grid */
        .formations-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
          gap: 24px;
        }

        @media (max-width: 1200px) {
          .formations-grid {
            grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          }
        }

        @media (max-width: 640px) {
          .formations-grid {
            grid-template-columns: 1fr;
          }
        }

        .formation-wrapper {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
          transition: all 0.3s ease;
        }

        .formation-wrapper:hover {
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        }

        /* Sessions Section */
        .sessions-section {
          padding: 20px;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border-top: 1px solid #e2e8f0;
        }

        .sessions-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 16px;
        }

        .sessions-icon {
          width: 24px;
          height: 24px;
          color: #667eea;
        }

        .sessions-header h3 {
          font-size: 1.0625rem;
          font-weight: 700;
          color: #1a1a2e;
          margin: 0;
        }

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
          background: white;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          transition: all 0.3s ease;
        }

        .session-card:hover {
          border-color: #667eea;
          transform: translateX(4px);
        }

        .session-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .session-date {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.9375rem;
          font-weight: 600;
          color: #1a1a2e;
        }

        .session-date svg {
          width: 16px;
          height: 16px;
          color: #667eea;
        }

        .session-details {
          display: flex;
          gap: 16px;
        }

        .session-detail-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.875rem;
          color: #6b7280;
        }

        .session-detail-item svg {
          width: 14px;
          height: 14px;
          color: #9ca3af;
        }

        .session-location {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.8125rem;
          color: #6b7280;
          padding: 4px 10px;
          background: #f8fafc;
          border-radius: 6px;
        }

        .btn-inscrire {
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
          white-space: nowrap;
        }

        .btn-inscrire:hover:not(:disabled) {
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .btn-inscrire:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .btn-inscrire.btn-inscrit {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        }

        .btn-inscrire.btn-complet {
          background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
        }

        /* Loading & Empty States */
        .loading-state,
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 80px 20px;
          gap: 16px;
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

          .filters-bar {
            flex-direction: column;
          }

          .search-box,
          .filter-select {
            width: 100%;
          }

          .stats-bar {
            flex-direction: column;
          }

          .stat-item {
            width: 100%;
            justify-content: center;
          }

          .session-card {
            flex-direction: column;
            align-items: flex-start;
          }

          .btn-inscrire {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </PrivateRoute>
  );
}