import { useEffect, useState } from "react";
import PrivateRoute from "../../components/PrivateRoute";
import { approveRoleRequest, getRoleRequests, rejectRoleRequest } from "../../services/api";

export default function AdminRoleRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getRoleRequests();
      setRequests(res.data || []);
    } catch (e) {
      setError(e.response?.data?.message || "Impossible de charger les demandes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const onApprove = async (id) => {
    try {
      setActionLoadingId(id);
      await approveRoleRequest(id);
      await fetchRequests();
    } catch (e) {
      setError(e.response?.data?.message || "Erreur lors de l’approbation");
    } finally {
      setActionLoadingId(null);
    }
  };

  const onReject = async (id) => {
    try {
      setActionLoadingId(id);
      await rejectRoleRequest(id);
      await fetchRequests();
    } catch (e) {
      setError(e.response?.data?.message || "Erreur lors du refus");
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <PrivateRoute roles={["admin"]}>
      <div className="page">
        <div className="header">
          <h1>Demandes de rôles (Admin/Formateur)</h1>
          <button className="btn" onClick={fetchRequests} disabled={loading}>
            Rafraîchir
          </button>
        </div>

        {error ? <div className="alert">{error}</div> : null}

        {loading ? (
          <p>Chargement...</p>
        ) : requests.length === 0 ? (
          <p className="empty">Aucune demande en attente.</p>
        ) : (
          <div className="tableWrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nom</th>
                  <th>Email</th>
                  <th>Rôle demandé</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((u) => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td>
                      {u.prenom} {u.nom}
                    </td>
                    <td>{u.email}</td>
                    <td>{u.requested_role}</td>
                    <td>{u.created_at ? new Date(u.created_at).toLocaleString() : "-"}</td>
                    <td className="actions">
                      <button
                        className="btn approve"
                        onClick={() => onApprove(u.id)}
                        disabled={actionLoadingId === u.id}
                      >
                        Approuver
                      </button>
                      <button
                        className="btn reject"
                        onClick={() => onReject(u.id)}
                        disabled={actionLoadingId === u.id}
                      >
                        Refuser
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <style jsx>{`
          .page {
            max-width: 1200px;
            margin: 0 auto;
            padding: 24px;
          }
          .header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
            margin-bottom: 16px;
          }
          .btn {
            padding: 10px 14px;
            border-radius: 10px;
            border: 1px solid #e5e7eb;
            background: white;
            cursor: pointer;
            font-weight: 600;
          }
          .btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }
          .approve {
            border-color: #86efac;
            background: #dcfce7;
          }
          .reject {
            border-color: #fecaca;
            background: #fee2e2;
          }
          .alert {
            padding: 12px;
            border-radius: 10px;
            background: #fef2f2;
            border: 1px solid #fecaca;
            color: #991b1b;
            margin-bottom: 16px;
          }
          .empty {
            color: #6b7280;
          }
          .tableWrap {
            overflow-x: auto;
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th,
          td {
            padding: 12px;
            border-bottom: 1px solid #e5e7eb;
            text-align: left;
            font-size: 14px;
          }
          th {
            background: #f8fafc;
            font-weight: 700;
          }
          .actions {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
          }
        `}</style>
      </div>
    </PrivateRoute>
  );
}

