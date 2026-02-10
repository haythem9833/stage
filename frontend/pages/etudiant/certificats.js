import { useEffect, useState } from "react";
import PrivateRoute from "../../components/PrivateRoute";
import { getMyCertificats } from "../../services/api";

export default function EtudiantCertificats() {
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

  const handleDownloadPDF = async (certificatId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://127.0.0.1:8000/api/certificats/${certificatId}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors du téléchargement');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Certificat.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Erreur téléchargement certificat:", err);
      alert("Impossible de télécharger le certificat");
    }
  };

  return (
    <PrivateRoute roles={["etudiant"]}>
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
                  <h3>{certificat.formation?.nom || 'Formation'}</h3>
                  <p className="numero">
                    <strong>N° Certificat:</strong> {certificat.numero_certificat}
                  </p>
                  <p className="date">
                    <strong>Date d'émission:</strong>{" "}
                    {new Date(certificat.date_emission).toLocaleDateString("fr-FR")}
                  </p>
                  <p className="etudiant">
                    <strong>Étudiant:</strong> {certificat.etudiant?.prenom} {certificat.etudiant?.nom}
                  </p>
                  <button
                    className="btn-download"
                    onClick={() => handleDownloadPDF(certificat.id)}
                  >
                    📄 Télécharger
                  </button>
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
        .certificat-card .session {
          color: #666;
          font-size: 14px;
          margin-bottom: 15px;
        }
        .certificat-card strong {
          color: #333;
        }
        .btn-download {
          width: 100%;
          padding: 10px;
          background-color: #28a745;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 600;
        }
        .btn-download:hover {
          background-color: #218838;
        }
      `}</style>
    </PrivateRoute>
  );
}
