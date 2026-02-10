import { useEffect, useState } from "react";
import PrivateRoute from "../../components/PrivateRoute";
import InscriptionsTable from "../../components/tables/InscriptionsTable";
import { getMyInscriptions } from "../../services/api";

export default function EtudiantInscriptions() {
  const [inscriptions, setInscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInscriptions();
  }, []);

  const fetchInscriptions = async () => {
    try {
      const response = await getMyInscriptions();
      setInscriptions(response.data);
    } catch (err) {
      console.error("Erreur chargement inscriptions:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PrivateRoute roles={["etudiant"]}>
      <div className="page-container">
        <h1>Mes Inscriptions</h1>

        {loading ? (
          <p>Chargement...</p>
        ) : (
          <InscriptionsTable
            inscriptions={inscriptions}
            onValidate={() => {}}
            onCancel={() => {}}
          />
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
      `}</style>
    </PrivateRoute>
  );
}
