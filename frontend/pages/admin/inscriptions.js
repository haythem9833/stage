import { useEffect, useState } from "react";
import PrivateRoute from "../../components/PrivateRoute";
import InscriptionsTable from "../../components/tables/InscriptionsTable";
import { getInscriptions } from "../../services/api";

export default function AdminInscriptions() {
  const [inscriptions, setInscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
    fetchInscriptions();
  }, []);

  const fetchInscriptions = async () => {
    try {
      const response = await getInscriptions();
      setInscriptions(response.data);
    } catch (err) {
      console.error("Erreur chargement inscriptions:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = (id) => {
    console.log("Validate inscription:", id);
    // TODO: Appel API
  };

  const handleCancel = (id) => {
    if (confirm("Êtes-vous sûr ?")) {
      console.log("Cancel inscription:", id);
      // TODO: Appel API
    }
  };

  if (!isHydrated) {
    return (
      <PrivateRoute roles={["admin"]}>
        <div className="page-container">
          <div className="page-header">
            <h1>Gestion des Inscriptions</h1>
          </div>
          <p>Chargement...</p>
        </div>
      </PrivateRoute>
    );
  }

  return (
    <PrivateRoute roles={["admin"]}>
      <div className="page-container">
        <h1>Gestion des Inscriptions</h1>

        {loading ? (
          <p>Chargement...</p>
        ) : (
          <InscriptionsTable
            inscriptions={inscriptions}
            onValidate={handleValidate}
            onCancel={handleCancel}
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
