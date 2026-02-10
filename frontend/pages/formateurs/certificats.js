import { useEffect, useState } from "react";
import { getCertificats, api } from "../../services/api";
import PrivateRoute from "../../components/PrivateRoute";

export default function Certificats() {
  const [certificats, setCertificats] = useState([]);

  useEffect(() => {
    getCertificats().then(res => setCertificats(res.data));
  }, []);

  const handleGenerate = async (sessionId) => {
    try {
      await api.post(`/certificats/generate`, { session_id: sessionId });
      alert("Certificats générés !");
    } catch {
      alert("Erreur génération certificat");
    }
  };

  return (
    <PrivateRoute roles={["formateur", "admin"]}>
      <h1>Certificats</h1>
      {certificats.map(c => (
        <div key={c.id} style={{ border: "1px solid #ccc", padding: "1rem", marginBottom: "0.5rem" }}>
          {c.session.formation.nom} - {c.session.date} 
          <a href={c.pdf_url} target="_blank">Télécharger</a>
        </div>
      ))}

      <button onClick={() => handleGenerate(certificats[0]?.session.id)}>Générer Certificats</button>
    </PrivateRoute>
  );
}
