export default function SessionsTable({ sessions, onEdit, onDelete, onValidate }) {
  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Formation</th>
            <th>Date</th>
            <th>Inscriptions</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sessions.length === 0 ? (
            <tr>
              <td colSpan="6" style={{ textAlign: "center" }}>
                Aucune session trouvée
              </td>
            </tr>
          ) : (
            sessions.map((session) => (
              <tr key={session.id}>
                <td>{session.id}</td>
                <td>{session.formation_nom}</td>
                <td>{new Date(session.date).toLocaleDateString("fr-FR")}</td>
                <td>{session.nombre_inscriptions}</td>
                <td>
                  <span className={`badge badge-${session.statut}`}>
                    {session.statut}
                  </span>
                </td>
                <td>
                  <button
                    className="btn-edit"
                    onClick={() => onEdit(session)}
                    title="Modifier"
                  >
                    ✏️
                  </button>
                  {session.statut !== "validee" && (
                    <button
                      className="btn-validate"
                      onClick={() => onValidate(session.id)}
                      title="Valider"
                      disabled={session.nombre_inscriptions < 17}
                    >
                      ✓
                    </button>
                  )}
                  <button
                    className="btn-delete"
                    onClick={() => onDelete(session.id)}
                    title="Supprimer"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <style jsx>{`
        .table-container {
          overflow-x: auto;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          background: white;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        th {
          background-color: #f8f9fa;
          padding: 12px;
          text-align: left;
          font-weight: 600;
          border-bottom: 2px solid #dee2e6;
        }
        td {
          padding: 12px;
          border-bottom: 1px solid #dee2e6;
        }
        tr:hover {
          background-color: #f8f9fa;
        }
        .btn-edit,
        .btn-validate,
        .btn-delete {
          background: none;
          border: none;
          font-size: 18px;
          cursor: pointer;
          margin-right: 8px;
        }
        .btn-edit:hover,
        .btn-validate:hover {
          transform: scale(1.2);
        }
        .btn-delete:hover {
          transform: scale(1.2);
        }
        .btn-validate:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
        }
        .badge-validee {
          background-color: #d4edda;
          color: #155724;
        }
        .badge-en_cours {
          background-color: #fff3cd;
          color: #856404;
        }
        .badge-annulee {
          background-color: #f8d7da;
          color: #721c24;
        }
      `}</style>
    </div>
  );
}
