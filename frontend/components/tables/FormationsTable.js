export default function FormationsTable({ formations, onEdit, onDelete, onComplete, completingId }) {
  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Titre</th>
            <th>Description</th>
            <th>Durée</th>
            <th>Formateur</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {formations.length === 0 ? (
            <tr>
              <td colSpan="6" style={{ textAlign: "center" }}>
                Aucune formation trouvée
              </td>
            </tr>
          ) : (
            formations.map((formation) => (
              <tr key={formation.id}>
                <td>{formation.id}</td>
                <td>{formation.titre}</td>
                <td>{formation.description ? `${formation.description.substring(0, 50)}...` : "-"}</td>
                <td>{formation.duree}h</td>
                <td>
                  {formation.formateur && typeof formation.formateur === 'object'
                    ? `${formation.formateur.prenom ?? ""} ${formation.formateur.nom ?? ""}`.trim() || "-"
                    : formation.formateur_id
                      ? `#${formation.formateur_id}`
                      : "-"}
                </td>
                <td>
                  <button
                    className="btn-edit"
                    onClick={() => onEdit(formation)}
                    title="Modifier"
                  >
                    ✏️
                  </button>
                  <button
                    className="btn-complete"
                    onClick={() => onComplete(formation.id)}
                    title="Terminer la formation"
                    disabled={completingId === formation.id}
                  >
                    {completingId === formation.id ? "..." : "✓"}
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => onDelete(formation.id)}
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
        .btn-delete,
        .btn-complete {
          background: none;
          border: none;
          font-size: 18px;
          cursor: pointer;
          margin-right: 10px;
        }
        .btn-edit:hover {
          transform: scale(1.2);
        }
        .btn-complete:hover:not(:disabled) {
          transform: scale(1.2);
        }
        .btn-delete:hover {
          transform: scale(1.2);
        }
        .btn-complete:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
