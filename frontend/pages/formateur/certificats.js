import { useEffect, useState } from "react";
import PrivateRoute from "../../components/PrivateRoute";
import { getMyCertificats } from "../../services/api";

export default function FormateurCertificats() {
  const [certificats, setCertificats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCertificats();
  }, []);

  const fetchCertificats = async () => {
    try {
      const response = await getMyCertificats();
      setCertificats(response.data);
    } catch (err) {
      console.error("Erreur chargement certificats:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePDF = (id) => {
    console.log("Generate PDF:", id);
  };

  const handleDownloadPDF = (pdfUrl) => {
    window.open(pdfUrl, "_blank");
  };

  return (
    <PrivateRoute roles={["formateur"]}>
      <div className="page-container">
        <h1>Mes Certificats</h1>

        {loading ? (
          <p>Chargement...</p>
        ) : (
          <div className="certificats-grid">
            {certificats.length === 0 ? (
              <p>Aucun certificat trouvé</p>
            ) : (
              certificats.map((certificat) => (
                <div key={certificat.id} className="certificat-card">
                  <h3>{certificat.utilisateur_nom}</h3>
                  <p className="formation">
                    <strong>Formation:</strong> {certificat.formation_nom}
                  </p>
                  <p className="session">
                    <strong>Session:</strong>{" "}
                    {new Date(certificat.session_date).toLocaleDateString("fr-FR")}
                  </p>
                  {certificat.pdf_url ? (
                    <button
                      className="btn-download"
                      onClick={() => handleDownloadPDF(certificat.pdf_url)}
                    >
                      📄 Télécharger
                    </button>
                  ) : (
                    <button
                      className="btn-generate"
                      onClick={() => handleGeneratePDF(certificat.id)}
                    >
                      🔄 Générer
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        .page-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }
        .page-container h1 {
          margin-bottom: 30px;
        }
        .certificats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }
        .certificat-card {
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        .certificat-card h3 {
          margin: 0 0 15px 0;
          color: #333;
        }
        .certificat-card p {
          margin: 8px 0;
          color: #666;
          font-size: 14px;
        }
        .certificat-card strong {
          color: #333;
        }
        .btn-download,
        .btn-generate {
          width: 100%;
          padding: 10px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 600;
          margin-top: 15px;
        }
        .btn-download {
          background-color: #28a745;
          color: white;
        }
        .btn-download:hover {
          background-color: #218838;
        }
        .btn-generate {
          background-color: #0d6efd;
          color: white;
        }
        .btn-generate:hover {
          background-color: #0b5ed7;
        }
      `}</style>
    </PrivateRoute>
  );
}
