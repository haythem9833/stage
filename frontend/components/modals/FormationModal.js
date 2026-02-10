import { X, Clock, Users, BookOpen, MapPin, Calendar, Award, Check, AlertCircle, RefreshCw } from "lucide-react";
import { useState } from "react";
import { api } from "../../services/api";

export default function FormationModal({ formation, isOpen, onClose, onInscription }) {
  const [actionLoading, setActionLoading] = useState(null);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  if (!isOpen || !formation) return null;

  const handleInscription = async () => {
    try {
      setActionLoading("formation");
      setError(null);
      
      // Si onInscription est fourni (fonction parent), l'utiliser
      if (onInscription) {
        await onInscription(formation.id);
        // Fermer le modal après succès - le parent affiche le message
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        // Sinon, faire l'appel API directement
        await api.post("/inscriptions", { 
          formation_id: formation.id
        });
        
        setSuccess("Inscription réussie!");
        setTimeout(() => {
          setSuccess(null);
          onClose();
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'inscription");
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          {/* Alerts */}
          {error && (
            <div className="modal-alert alert-error">
              <AlertCircle />
              <span>{error}</span>
              <button onClick={() => setError(null)} className="alert-close">×</button>
            </div>
          )}
          {success && (
            <div className="modal-alert alert-success">
              <Check />
              <span>{success}</span>
            </div>
          )}

          {/* Header */}
          <div className="modal-header">
            <img 
              src={formation.image || "/default-formation.jpg"} 
              alt={formation.titre}
              className="modal-image"
            />
            <button className="modal-close" onClick={onClose}>
              <X />
            </button>
            <span className={`badge badge-${formation.categorie || "default"}`}>
              {formation.categorie || "Général"}
            </span>
          </div>

          {/* Body */}
          <div className="modal-body">
            <h1 className="modal-title">{formation.titre}</h1>
            
            <p className="modal-description">{formation.description}</p>

            {/* Metadata Grid */}
            <div className="metadata-grid">
              <div className="metadata-item">
                <div className="metadata-icon">
                  <Clock />
                </div>
                <div>
                  <div className="metadata-label">Durée</div>
                  <div className="metadata-value">{formation.duree || "Non spécifié"}</div>
                </div>
              </div>

              <div className="metadata-item">
                <div className="metadata-icon">
                  <Users />
                </div>
                <div>
                  <div className="metadata-label">Inscrits</div>
                  <div className="metadata-value">{formation.inscrits || 0}</div>
                </div>
              </div>

              <div className="metadata-item">
                <div className="metadata-icon">
                  <BookOpen />
                </div>
                <div>
                  <div className="metadata-label">Modules</div>
                  <div className="metadata-value">{formation.modules || 0}</div>
                </div>
              </div>

              {formation.lieu && (
                <div className="metadata-item">
                  <div className="metadata-icon">
                    <MapPin />
                  </div>
                  <div>
                    <div className="metadata-label">Lieu</div>
                    <div className="metadata-value">{formation.lieu}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Objectives Section */}
            {formation.objectifs && (
              <div className="section">
                <h3 className="section-title">
                  <Award className="section-icon" />
                  Objectifs
                </h3>
                <p className="section-content">{formation.objectifs}</p>
              </div>
            )}

            {/* Detailed Description Section */}
            {formation.description_longue && (
              <div className="section">
                <h3 className="section-title">Description détaillée</h3>
                <p className="section-content">{formation.description_longue}</p>
              </div>
            )}

            {/* Contenu/Programme Section */}
            {formation.contenu && (
              <div className="section">
                <h3 className="section-title">Contenu du programme</h3>
                <p className="section-content">{formation.contenu}</p>
              </div>
            )}

            {/* Formateur Info */}
            {formation.formateur && (
              <div className="section">
                <h3 className="section-title">Formateur</h3>
                <div className="formateur-card">
                  <div className="formateur-avatar">
                    {formation.formateur.prenom?.charAt(0)}{formation.formateur.nom?.charAt(0)}
                  </div>
                  <div>
                    <div className="formateur-name">
                      {formation.formateur.prenom} {formation.formateur.nom}
                    </div>
                    {formation.formateur.specialite && (
                      <div className="formateur-specialite">{formation.formateur.specialite}</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Status Section */}
            <div className="section">
              <div className="status-box">
                <div className="status-item">
                  <Users className="status-icon" />
                  <div>
                    <div className="status-label">Statut</div>
                    <div className="status-value">
                      {formation.statut_formation === "commencee" ? (
                        <span className="status-badge status-started">En cours</span>
                      ) : (
                        <span className="status-badge status-open">Ouvert</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
  <div className="modal-footer">
  <div className="footer-price">
    {formation.prix ? (
      <>
        <span className="price-label">Prix</span>
        <span className="price-amount">{formation.prix} €</span>
        {formation.prix_original && (
          <span className="price-original">{formation.prix_original} €</span>
        )}
      </>
    ) : (
      <>
        <span className="price-label">Prix</span>
        <span className="price-free">Gratuit</span>
      </>
    )}
  </div>
  <div className="footer-actions">
    <button className="btn-inscrire-formation"
      onClick={() => handleInscription()}
      disabled={actionLoading === "formation"}>
      {actionLoading === "formation" ? (
        <RefreshCw className="spinning" />
      ) : "S'inscrire à la formation"}
    </button>
    <button className="btn-close-modal" onClick={onClose}>
      Fermer
    </button>
  </div>
</div>
        </div>
      </div>

      <style jsx>{`
      .btn-inscrire-formation {
  padding: 10px 24px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-inscrire-formation:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

.btn-inscrire-formation:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .modal-content {
          background: white;
          border-radius: 20px;
          width: 100%;
          max-width: 700px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          animation: slideUp 0.3s ease;
          position: relative;
        }

        @keyframes slideUp {
          from {
            transform: translateY(30px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        /* Alerts */
        .modal-alert {
          position: sticky;
          top: 0;
          z-index: 10;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 20px;
          border-radius: 0;
          margin-bottom: 0;
          position: relative;
        }

        .modal-alert.alert-error {
          background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
          border-bottom: 2px solid #fecaca;
          color: #991b1b;
        }

        .modal-alert.alert-success {
          background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
          border-bottom: 2px solid #bbf7d0;
          color: #166534;
        }

        .modal-alert svg {
          width: 20px;
          height: 20px;
          flex-shrink: 0;
        }

        .alert-close {
          margin-left: auto;
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
          color: inherit;
          opacity: 0.7;
          padding: 0;
        }

        .alert-close:hover {
          opacity: 1;
        }

        .modal-header {
          position: relative;
          height: 250px;
          overflow: hidden;
        }

        .modal-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .modal-close {
          position: absolute;
          top: 16px;
          right: 16px;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.95);
          border: none;
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          z-index: 10;
        }

        .modal-close:hover {
          transform: scale(1.1);
          background: white;
        }

        .modal-close svg {
          width: 24px;
          height: 24px;
          color: #1a1a2e;
        }

        .badge {
          position: absolute;
          bottom: 16px;
          left: 16px;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          z-index: 5;
        }

        .badge-developpement {
          color: #dc2626;
        }

        .badge-design {
          color: #7c3aed;
        }

        .badge-marketing {
          color: #0891b2;
        }

        .badge-data {
          color: #059669;
        }

        .badge-business {
          color: #d97706;
        }

        .badge-default {
          color: #6b7280;
        }

        .modal-body {
          padding: 32px;
        }

        .modal-title {
          font-size: 2rem;
          font-weight: 700;
          color: #1a1a2e;
          margin: 0 0 16px 0;
          line-height: 1.3;
        }

        .modal-description {
          font-size: 1rem;
          color: #6b7280;
          margin: 0 0 24px 0;
          line-height: 1.6;
        }

        .metadata-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 16px;
          padding: 20px;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border-radius: 12px;
          margin-bottom: 24px;
        }

        .metadata-item {
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }

        .metadata-icon {
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

        .metadata-icon svg {
          width: 20px;
          height: 20px;
        }

        .metadata-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: #9ca3af;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .metadata-value {
          font-size: 1rem;
          font-weight: 600;
          color: #1a1a2e;
          margin-top: 4px;
        }

        .section {
          margin-bottom: 24px;
        }

        .section-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1a1a2e;
          margin: 0 0 12px 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .section-icon {
          width: 24px;
          height: 24px;
          color: #667eea;
        }

        .section-content {
          font-size: 0.9375rem;
          color: #6b7280;
          line-height: 1.6;
          margin: 0;
        }

        .formateur-card {
          display: flex;
          gap: 16px;
          padding: 16px;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border-radius: 12px;
          align-items: center;
        }

        .formateur-avatar {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 50%;
          font-weight: 700;
          font-size: 1rem;
          flex-shrink: 0;
        }

        .formateur-name {
          font-weight: 600;
          color: #1a1a2e;
          font-size: 0.9375rem;
        }

        .formateur-specialite {
          font-size: 0.875rem;
          color: #9ca3af;
          margin-top: 2px;
        }

        .sessions-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .session-item {
          padding: 16px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          transition: all 0.3s ease;
          display: flex;
          gap: 16px;
          align-items: flex-start;
          justify-content: space-between;
        }

        .session-item:hover {
          border-color: #667eea;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        }

        .session-date {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          color: #1a1a2e;
          flex: 1;
          flex-wrap: wrap;
          width: 100%;
        }

        .session-icon {
          width: 20px;
          height: 20px;
          color: #667eea;
          flex-shrink: 0;
        }

        .session-info {
          display: flex;
          gap: 16px;
          font-size: 0.875rem;
          color: #6b7280;
          flex-wrap: wrap;
          width: 100%;
          margin-bottom: 12px;
        }

        .session-lieu {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 8px;
          background: white;
          border-radius: 6px;
        }

        .session-places {
          padding: 4px 8px;
          background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
          border-radius: 6px;
          color: #166534;
          font-weight: 600;
        }

        .btn-inscrire-session {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px 16px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .btn-inscrire-session:hover:not(:disabled) {
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .btn-inscrire-session:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .btn-inscrire-session.btn-inscrit {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        }

        .btn-inscrire-session.btn-complet {
          background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
        }

        .btn-inscrire-session svg {
          width: 16px;
          height: 16px;
        }

        .modal-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          padding: 20px 32px;
          border-top: 1px solid #e5e7eb;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        }

        .footer-price {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .footer-actions {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .price-label {
          font-size: 0.875rem;
          font-weight: 600;
          color: #9ca3af;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .price-amount {
          font-size: 1.5rem;
          font-weight: 700;
          color: #667eea;
        }

        .price-original {
          font-size: 0.9375rem;
          color: #9ca3af;
          text-decoration: line-through;
          margin-left: 8px;
        }

        .price-free {
          font-size: 1.25rem;
          font-weight: 700;
          color: #059669;
        }

        .btn-close-modal {
          padding: 10px 24px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 0.9375rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-close-modal:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        /* Scrollbar styling */
        .modal-content::-webkit-scrollbar {
          width: 8px;
        }

        .modal-content::-webkit-scrollbar-track {
          background: #f1f5f9;
        }

        .modal-content::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }

        .modal-content::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .spinning {
          animation: spin 1s linear infinite;
        }

        @media (max-width: 640px) {
          .modal-content {
            max-width: 100%;
            border-radius: 16px 16px 0 0;
            max-height: 95vh;
          }

          .modal-body {
            padding: 24px;
          }

          .modal-title {
            font-size: 1.5rem;
          }

          .metadata-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .modal-footer {
            flex-direction: column;
            gap: 16px;
            padding: 16px 24px;
          }

          .footer-price {
            width: 100%;
            justify-content: center;
          }

          .footer-actions {
            width: 100%;
            flex-direction: column;
          }

          .btn-close-modal {
            width: 100%;
          }

          .session-item {
            flex-direction: column;
            align-items: stretch;
          }

          .btn-inscrire-session {
            width: 100%;
          }
        }
      `}</style>
    </>
  );
}