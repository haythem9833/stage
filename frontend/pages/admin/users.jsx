import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import PrivateRoute from "../../components/PrivateRoute";
import {
  getUsers,
  getRoleRequests,
  approveRoleRequest,
  rejectRoleRequest,
  deleteUser,
} from "../../services/api";
import {
  Users,
  ShieldCheck,
  ShieldX,
  Trash2,
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  User as UserIcon,
  Mail,
  MoreVertical,
  EyeOff,
} from "lucide-react";

export default function AdminUsers() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [usersRes, pendingRes] = await Promise.all([
        getUsers(),
        getRoleRequests(),
      ]);
      setUsers(usersRes.data || []);
      setFilteredUsers(usersRes.data || []);
      setPendingRequests(pendingRes.data || []);
    } catch (err) {
      console.error(err);
      setError("Erreur lors du chargement des utilisateurs");
      setUsers([]);
      setFilteredUsers([]);
      setPendingRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter users
  useEffect(() => {
    let filtered = users;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.prenom?.toLowerCase().includes(query) ||
          user.nom?.toLowerCase().includes(query) ||
          user.email?.toLowerCase().includes(query)
      );
    }

    // Role filter
    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  }, [searchQuery, roleFilter, users]);

  const handleApprove = async (id) => {
    if (!confirm("Approuver cette demande de changement de rôle ?")) return;
    try {
      setActionLoading(id);
      await approveRoleRequest(id);
      setSuccess("Demande approuvée avec succès");
      fetchData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error(err);
      setError("Erreur lors de l'approbation de la demande");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    if (!confirm("Rejeter cette demande de changement de rôle ?")) return;
    try {
      setActionLoading(id);
      await rejectRoleRequest(id);
      setSuccess("Demande rejetée avec succès");
      fetchData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error(err);
      setError("Erreur lors du rejet de la demande");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Supprimer cet utilisateur ? Cette action est irréversible.")) return;
    try {
      setActionLoading(id);
      await deleteUser(id);
      setSuccess("Utilisateur supprimé avec succès");
      fetchData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error(err);
      setError("Erreur lors de la suppression de l'utilisateur");
    } finally {
      setActionLoading(null);
    }
  };

  const getRoleBadge = (role) => {
    const badges = {
      admin: { color: "#dc3545", bg: "#ffe6e6", label: "Administrateur" },
      formateur: { color: "#0d6efd", bg: "#e7f0ff", label: "Formateur" },
      etudiant: { color: "#6c757d", bg: "#e9ecef", label: "Étudiant" },
    };
    return badges[role] || { color: "#6c757d", bg: "#e9ecef", label: role };
  };

  const getRequestedRoleBadge = (role) => {
    const badges = {
      admin: { color: "#dc3545", bg: "#ffe6e6", label: "Admin" },
      formateur: { color: "#0d6efd", bg: "#e7f0ff", label: "Formateur" },
    };
    return badges[role] || { color: "#6c757d", bg: "#e9ecef", label: role };
  };

  return (
    <PrivateRoute roles={["admin"]}>
      <div className="admin-users-page">
        {/* Page Header */}
        <div className="page-header">
          <div className="header-content">
            <div className="header-icon">
              <Users />
            </div>
            <div>
              <h1>Gestion des utilisateurs</h1>
              <p>Gérez les utilisateurs et les demandes de changement de rôle</p>
            </div>
          </div>
          <button className="btn-refresh" onClick={fetchData} disabled={loading}>
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

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon stat-icon-blue">
              <Users />
            </div>
            <div className="stat-content">
              <span className="stat-value">{users.length}</span>
              <span className="stat-label">Total utilisateurs</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon-orange">
              <Clock />
            </div>
            <div className="stat-content">
              <span className="stat-value">{pendingRequests.length}</span>
              <span className="stat-label">Demandes en attente</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon-red">
              <ShieldCheck />
            </div>
            <div className="stat-content">
              <span className="stat-value">
                {users.filter((u) => u.role === "admin").length}
              </span>
              <span className="stat-label">Administrateurs</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon-purple">
              <UserIcon />
            </div>
            <div className="stat-content">
              <span className="stat-value">
                {users.filter((u) => u.role === "formateur").length}
              </span>
              <span className="stat-label">Formateurs</span>
            </div>
          </div>
        </div>

        {/* Pending Requests */}
        <div className="requests-section">
          <div className="section-header">
            <div className="section-title">
              <Clock className="section-icon" />
              <h2>Demandes en attente</h2>
            </div>
            <span className="badge badge-orange">
              {pendingRequests.length} demandes
            </span>
          </div>

          {loading ? (
            <div className="loading-state">
              <RefreshCw className="spinning" />
              <span>Chargement des demandes...</span>
            </div>
          ) : pendingRequests.length === 0 ? (
            <div className="empty-state">
              <Clock className="empty-icon" />
              <h3>Aucune demande en attente</h3>
              <p>Toutes les demandes ont été traitées</p>
            </div>
          ) : (
            <div className="requests-list">
              {pendingRequests.map((request) => {
                const requestedBadge = getRequestedRoleBadge(request.requested_role);
                return (
                  <div key={request.id} className="request-card">
                    <div className="request-avatar">
                      <UserIcon />
                    </div>
                    <div className="request-info">
                      <div className="request-name">
                        {request.prenom} {request.nom}
                      </div>
                      <div className="request-email">
                        <Mail />
                        {request.email}
                      </div>
                      <div className="request-meta">
                        <span className="request-label">Rôle actuel</span>
                        <span
                          className="request-role"
                          style={{ color: "#6c757d", background: "#e9ecef" }}
                        >
                          {request.current_role}
                        </span>
                        <span className="request-arrow">→</span>
                        <span
                          className="request-role requested-role"
                          style={{ color: requestedBadge.color, background: requestedBadge.bg }}
                        >
                          {requestedBadge.label}
                        </span>
                      </div>
                    </div>
                    <div className="request-actions">
                      <button
                        className="btn-approve"
                        onClick={() => handleApprove(request.id)}
                        disabled={actionLoading === request.id}
                        title="Approuver"
                      >
                        <ShieldCheck />
                      </button>
                      <button
                        className="btn-reject"
                        onClick={() => handleReject(request.id)}
                        disabled={actionLoading === request.id}
                        title="Rejeter"
                      >
                        <ShieldX />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Users List */}
        <div className="users-section">
          <div className="section-header">
            <div className="section-title">
              <Users className="section-icon" />
              <h2>Tous les utilisateurs</h2>
            </div>
            <span className="badge badge-blue">
              {filteredUsers.length} / {users.length}
            </span>
          </div>

          {/* Filters */}
          <div className="filters-bar">
            <div className="search-box">
              <Search />
              <input
                type="text"
                placeholder="Rechercher par nom, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="filter-select">
              <Filter />
              <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                <option value="all">Tous les rôles</option>
                <option value="admin">Administrateurs</option>
                <option value="formateur">Formateurs</option>
                <option value="etudiant">Étudiants</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="loading-state">
              <RefreshCw className="spinning" />
              <span>Chargement des utilisateurs...</span>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="empty-state">
              <Users className="empty-icon" />
              <h3>Aucun utilisateur trouvé</h3>
              <p>Ajustez vos filtres de recherche</p>
            </div>
          ) : (
            <div className="users-table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Utilisateur</th>
                    <th>Email</th>
                    <th>Rôle</th>
                    <th>Date de création</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => {
                    const roleBadge = getRoleBadge(user.role);
                    return (
                      <tr key={user.id}>
                        <td>
                          <div className="user-cell">
                            <div className="user-table-avatar">
                              <UserIcon />
                            </div>
                            <div>
                              <div className="user-name">
                                {user.prenom} {user.nom}
                              </div>
                              {user.bio && (
                                <div className="user-bio">{user.bio}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="email-cell">
                            <Mail />
                            {user.email}
                          </div>
                        </td>
                        <td>
                          <span
                            className="role-badge"
                            style={{ color: roleBadge.color, background: roleBadge.bg }}
                          >
                            {roleBadge.label}
                          </span>
                        </td>
                        <td>
                          <div className="date-cell">
                            {user.created_at
                              ? new Date(user.created_at).toLocaleDateString("fr-FR", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })
                              : "-"}
                          </div>
                        </td>
                        <td>
                          <div className="actions-cell">
                            <button
                              className="btn-view-password"
                              onClick={() =>
                                alert(
                                  "Pour des raisons de sécurité, les mots de passe ne sont pas visibles. Veuillez utiliser la fonction 'Mot de passe oublié'."
                                )
                              }
                              title="Mot de passe"
                            >
                              <EyeOff />
                              <span>Mot de passe</span>
                            </button>
                            <button
                              className="btn-delete"
                              onClick={() => handleDelete(user.id)}
                              disabled={actionLoading === user.id}
                              title="Supprimer"
                            >
                              <Trash2 />
                              <span>Supprimer</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .admin-users-page {
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

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
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
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
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

        .stat-icon-blue {
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          color: white;
        }

        .stat-icon-orange {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          color: white;
        }

        .stat-icon-red {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
        }

        .stat-icon-purple {
          background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
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

        /* Sections */
        .requests-section,
        .users-section {
          background: white;
          border-radius: 16px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
          padding: 24px;
          margin-bottom: 32px;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 2px solid #f3f4f6;
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .section-icon {
          width: 28px;
          height: 28px;
          color: #667eea;
        }

        .section-title h2 {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1a1a2e;
          margin: 0;
        }

        .badge {
          display: inline-flex;
          align-items: center;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.8125rem;
          font-weight: 600;
        }

        .badge-blue {
          background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
          color: #1d4ed8;
        }

        .badge-orange {
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          color: #d97706;
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

        /* Requests List */
        .requests-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .request-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          background: #f8fafc;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          transition: all 0.3s ease;
        }

        .request-card:hover {
          border-color: #667eea;
          background: #f1f5f9;
          transform: translateX(4px);
        }

        .request-avatar {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 12px;
          flex-shrink: 0;
        }

        .request-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .request-name {
          font-size: 1.0625rem;
          font-weight: 600;
          color: #1a1a2e;
        }

        .request-email {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.875rem;
          color: #6b7280;
        }

        .request-email svg {
          width: 14px;
          height: 14px;
          color: #9ca3af;
        }

        .request-meta {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .request-label {
          font-size: 0.8125rem;
          color: #9ca3af;
        }

        .request-role {
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 0.8125rem;
          font-weight: 600;
          text-transform: capitalize;
        }

        .request-arrow {
          color: #9ca3af;
          font-size: 0.875rem;
        }

        .requested-role {
          font-weight: 700;
        }

        .request-actions {
          display: flex;
          gap: 8px;
        }

        .btn-approve,
        .btn-reject {
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-approve {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
        }

        .btn-approve:hover:not(:disabled) {
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
        }

        .btn-reject {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
        }

        .btn-reject:hover:not(:disabled) {
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
        }

        .btn-approve:disabled,
        .btn-reject:disabled {
          opacity: 0.5;
          cursor: not-allowed;
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
          background: #f8fafc;
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
          background: white;
        }

        .search-box svg {
          width: 20px;
          height: 20px;
          color: #9ca3af;
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

        /* Users Table */
        .users-table-container {
          overflow-x: auto;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
        }

        .users-table {
          width: 100%;
          border-collapse: collapse;
          background: white;
        }

        .users-table thead {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        }

        .users-table th {
          padding: 16px;
          text-align: left;
          font-size: 0.8125rem;
          font-weight: 700;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 2px solid #e2e8f0;
        }

        .users-table td {
          padding: 16px;
          border-bottom: 1px solid #f1f5f9;
        }

        .users-table tbody tr {
          transition: all 0.2s ease;
        }

        .users-table tbody:hover {
          background: #f8fafc;
        }

        .user-cell {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .user-table-avatar {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 10px;
          flex-shrink: 0;
        }

        .user-name {
          font-size: 0.9375rem;
          font-weight: 600;
          color: #1a1a2e;
        }

        .user-bio {
          font-size: 0.8125rem;
          color: #9ca3af;
          margin-top: 2px;
        }

        .email-cell {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.875rem;
          color: #6b7280;
        }

        .email-cell svg {
          width: 16px;
          height: 16px;
          color: #9ca3af;
          flex-shrink: 0;
        }

        .role-badge {
          display: inline-flex;
          align-items: center;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.8125rem;
          font-weight: 600;
          text-transform: capitalize;
        }

        .date-cell {
          font-size: 0.875rem;
          color: #6b7280;
        }

        .actions-cell {
          display: flex;
          gap: 8px;
        }

        .btn-view-password,
        .btn-delete {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          border: none;
          border-radius: 8px;
          font-size: 0.8125rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-view-password {
          background: #f8fafc;
          color: #6b7280;
        }

        .btn-view-password:hover:not(:disabled) {
          background: #e2e8f0;
          color: #1a1a2e;
        }

        .btn-delete {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
        }

        .btn-delete:hover:not(:disabled) {
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
        }

        .btn-view-password:disabled,
        .btn-delete:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Loading & Empty States */
        .loading-state,
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          gap: 16px;
        }

        .loading-state svg,
        .empty-state svg {
          width: 48px;
          height: 48px;
          color: #9ca3af;
        }

        .loading-state span,
        .empty-state span {
          font-size: 1rem;
          color: #6b7280;
        }

        .empty-state h3 {
          font-size: 1.125rem;
          font-weight: 600;
          color: #1a1a2e;
          margin: 0;
        }

        .empty-state p {
          font-size: 0.875rem;
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

        @media (max-width: 1024px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 640px) {
          .admin-users-page {
            padding: 16px;
          }

          .page-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .filters-bar {
            flex-direction: column;
          }

          .search-box,
          .filter-select {
            width: 100%;
          }

          .users-table-container {
            overflow-x: auto;
          }

          .actions-cell {
            flex-direction: column;
          }

          .request-card {
            flex-direction: column;
            align-items: flex-start;
          }

          .request-actions {
            width: 100%;
            justify-content: flex-end;
          }
        }
      `}</style>
    </PrivateRoute>
  );
}
