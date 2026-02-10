import { Clock, Users, BookOpen, ArrowRight } from "lucide-react";

export default function FormationCard({ formation, onVoirPlus }) {
  return (
    <div className="formation-card">
      <div className="card-image">
        <img src={formation.image || "/default-formation.jpg"} alt={formation.titre} />
        <span className={`badge badge-${formation.categorie || "default"}`}>
          {formation.categorie || "Général"}
        </span>
      </div>

      <div className="card-content">
        <h3 className="card-title">{formation.titre}</h3>
        <p className="card-description">{formation.description}</p>

        <div className="card-meta">
          <div className="meta-item">
            <Clock className="meta-icon" />
            <span>{formation.duree || "Non spécifié"}</span>
          </div>
          <div className="meta-item">
            <Users className="meta-icon" />
            <span>{formation.inscrits || 0} inscrits</span>
          </div>
          <div className="meta-item">
            <BookOpen className="meta-icon" />
            <span>{formation.modules || 0} modules</span>
          </div>
        </div>

        <div className="card-footer">
          <div className="card-price">
            {formation.prix ? (
              <>
                <span className="price-amount">{formation.prix} €</span>
                {formation.prix_original && (
                  <span className="price-original">{formation.prix_original} €</span>
                )}
              </>
            ) : (
              <span className="price-free">Gratuit</span>
            )}
          </div>
          <button 
            className="btn-action" 
            onClick={() => onVoirPlus && onVoirPlus(formation)}
          >
            <span className="btn-text">Voir plus</span>
            <ArrowRight className="btn-icon" />
          </button>
        </div>
      </div>

      <style jsx>{`
        .formation-card {
          background: white;
          border-radius: 16px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          overflow: hidden;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .formation-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        }

        .card-image {
          position: relative;
          height: 180px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          overflow: hidden;
        }

        .card-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .badge {
          position: absolute;
          top: 12px;
          right: 12px;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
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

        .card-content {
          padding: 20px;
        }

        .card-title {
          font-size: 1.125rem;
          font-weight: 700;
          color: #1a1a2e;
          margin: 0 0 8px 0;
        }

        .card-description {
          font-size: 0.875rem;
          color: #6b7280;
          margin: 0 0 16px 0;
          line-height: 1.6;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .card-meta {
          display: flex;
          gap: 16px;
          margin-bottom: 16px;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.875rem;
          color: #6b7280;
        }

        .meta-icon {
          width: 16px;
          height: 16px;
          color: #9ca3af;
          flex-shrink: 0;
        }

        .card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 16px;
          border-top: 1px solid #e5e7eb;
        }

        .card-price {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .price-amount {
          font-size: 1.25rem;
          font-weight: 700;
          color: #667eea;
        }

        .price-original {
          font-size: 0.875rem;
          color: #9ca3af;
          text-decoration: line-through;
        }

        .price-free {
          font-size: 1rem;
          font-weight: 600;
          color: #059669;
        }

        .btn-action {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-action:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .btn-text {
          font-size: 0.875rem;
        }

        .btn-icon {
          width: 16px;
          height: 16px;
          transition: transform 0.3s ease;
        }

        .btn-action:hover .btn-icon {
          transform: translateX(4px);
        }
      `}</style>
    </div>
  );
}