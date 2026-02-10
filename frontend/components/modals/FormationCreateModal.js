import { useState, useEffect } from "react";
import { X, AlertCircle, Check, RefreshCw } from "lucide-react";

export default function FormationCreateModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isSubmitting,
  error: externalError,
}) {
  console.log('[FormationCreateModal] isOpen:', isOpen); // DEBUG
  const [formData, setFormData] = useState({
    titre: "",
    description: "",
    duree: "",
    categorie: "",
    objectifs: "",
    contenu: "",
  });

  const [localError, setLocalError] = useState(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        titre: initialData.titre || "",
        description: initialData.description || "",
        duree: initialData.duree || "",
        categorie: initialData.categorie || "",
        objectifs: initialData.objectifs || "",
        contenu: initialData.contenu || "",
      });
    } else {
      setFormData({
        titre: "",
        description: "",
        duree: "",
        categorie: "",
        objectifs: "",
        contenu: "",
      });
    }
    setLocalError(null);
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setLocalError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.titre.trim()) {
      setLocalError("Le titre est requis");
      return;
    }

    if (!formData.description.trim()) {
      setLocalError("La description est requise");
      return;
    }

    if (!formData.duree || formData.duree <= 0) {
      setLocalError("La durée doit être un nombre positif");
      return;
    }

    await onSubmit(formData);
  };

  if (!isOpen) {
    console.log('[FormationCreateModal] Returning null, isOpen=false'); // DEBUG
    return null;
  }

  console.log('[FormationCreateModal] Rendering modal'); // DEBUG

  const error = externalError || localError;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content formation-create-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header-section">
          <h2>{initialData ? "Modifier formation" : "Créer une formation"}</h2>
          <button className="modal-close-btn" onClick={onClose} disabled={isSubmitting}>
            <X size={24} />
          </button>
        </div>

        {error && (
          <div className="modal-alert alert-error">
            <AlertCircle />
            <span>{error}</span>
          </div>
        )}

        <form className="formation-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Titre *</label>
            <input
              type="text"
              name="titre"
              value={formData.titre}
              onChange={handleChange}
              placeholder="Titre de la formation"
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Description détaillée de la formation"
              rows={4}
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Durée (heures) *</label>
              <input
                type="number"
                name="duree"
                value={formData.duree}
                onChange={handleChange}
                placeholder="Ex: 40"
                min="1"
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="form-group">
              <label>Catégorie</label>
              <select
                name="categorie"
                value={formData.categorie}
                onChange={handleChange}
                disabled={isSubmitting}
              >
                <option value="">Sélectionner une catégorie</option>
                <option value="developpement">Développement</option>
                <option value="design">Design</option>
                <option value="marketing">Marketing</option>
                <option value="data">Data Science</option>
                <option value="business">Business</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Objectifs</label>
            <textarea
              name="objectifs"
              value={formData.objectifs}
              onChange={handleChange}
              placeholder="Objectifs pédagogiques"
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group">
            <label>Contenu du programme</label>
            <textarea
              name="contenu"
              value={formData.contenu}
              onChange={handleChange}
              placeholder="Détails du contenu"
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn-cancel"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw size={16} className="spinning" />
                  Envoi...
                </>
              ) : (
                <>
                  <Check size={16} />
                  {initialData ? "Modifier" : "Créer"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .formation-create-modal {
          background: white;
          border-radius: 12px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          max-width: 600px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          animation: modalSlideIn 0.3s ease;
        }

        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translateY(-50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .modal-header-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px;
          border-bottom: 1px solid #e5e7eb;
          sticky-position: top;
          background: white;
          z-index: 10;
        }

        .modal-header-section h2 {
          margin: 0;
          font-size: 20px;
          font-weight: 600;
          color: #1f2937;
        }

        .modal-close-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: #6b7280;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          transition: all 0.2s;
        }

        .modal-close-btn:hover:not(:disabled) {
          background: #f3f4f6;
          color: #1f2937;
        }

        .modal-close-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .modal-alert {
          margin: 16px 24px 0;
          padding: 12px 16px;
          border-radius: 8px;
          display: flex;
          gap: 12px;
          align-items: center;
          font-size: 14px;
        }

        .alert-error {
          background: #fee2e2;
          color: #991b1b;
          border: 1px solid #fca5a5;
        }

        .formation-form {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group label {
          font-size: 14px;
          font-weight: 500;
          color: #374151;
        }

        .form-group input,
        .form-group textarea,
        .form-group select {
          padding: 10px 12px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
          font-family: inherit;
          transition: all 0.2s;
        }

        .form-group input:focus,
        .form-group textarea:focus,
        .form-group select:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .form-group input:disabled,
        .form-group textarea:disabled,
        .form-group select:disabled {
          background: #f9fafb;
          color: #9ca3af;
          cursor: not-allowed;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .modal-footer {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          padding-top: 16px;
          border-top: 1px solid #e5e7eb;
        }

        .btn-cancel,
        .btn-submit {
          padding: 10px 24px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s;
        }

        .btn-cancel {
          background: #f3f4f6;
          color: #374151;
        }

        .btn-cancel:hover:not(:disabled) {
          background: #e5e7eb;
        }

        .btn-cancel:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-submit {
          background: #3b82f6;
          color: white;
        }

        .btn-submit:hover:not(:disabled) {
          background: #2563eb;
        }

        .btn-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .spinning {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
