export default function InscriptionsTable({ inscriptions, onValidate, onCancel }) {
  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Étudiant</th>
            <th>Formation</th>
            <th>Session</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {inscriptions.length === 0 ? (
            <tr>
              <td colSpan="6" style={{ textAlign: "center" }}>
                Aucune inscription trouvée
              </td>
            </tr>
          ) : (
            inscriptions.map((inscription) => (
              <tr key={inscription.id}>
                <td>{inscription.id}</td>
                <td>{inscription.utilisateur_nom}</td>
                <td>{inscription.formation_nom}</td>
                <td>{new Date(inscription.session_date).toLocaleDateString("fr-FR")}</td>
                <td>
                  <span className={`badge badge-${inscription.statut}`}>
                    {inscription.statut}
                  </span>
                </td>
                <td>
                  {inscription.statut === "en_attente" && (
                    <>
                      <button
                        className="btn-validate"
                        onClick={() => onValidate(inscription.id)}
                        title="Valider"
                      >
                        ✓
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => onCancel(inscription.id)}
                        title="Annuler"
                      >
                        ✕
                      </button>
                    </>
                  )}
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
        .btn-validate,
        .btn-delete {
          background: none;
          border: none;
          font-size: 18px;
          cursor: pointer;
          margin-right: 8px;
        }
        .btn-validate:hover,
        .btn-delete:hover {
          transform: scale(1.2);
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
        .badge-en_attente {
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
