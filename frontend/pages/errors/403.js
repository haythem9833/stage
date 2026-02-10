import Link from "next/link";

export default function Custom403() {
  return (
    <div className="error-container">
      <div className="error-content">
        <h1 className="error-code">403</h1>
        <h2>Accès Refusé</h2>
        <p>Vous n&apos;avez pas les permissions nécessaires pour accéder à cette page.</p>
        <div className="error-actions">
          <Link href="/" className="btn-primary">
            Accueil
          </Link>
          <Link href="/auth/login" className="btn-secondary">
            Se connecter
          </Link>
        </div>
      </div>

      <style jsx>{`
        .error-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .error-content {
          text-align: center;
          background: white;
          padding: 60px 40px;
          border-radius: 8px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }
        .error-code {
          font-size: 72px;
          font-weight: bold;
          color: #dc3545;
          margin: 0 0 10px 0;
        }
        h2 {
          color: #333;
          margin: 0 0 15px 0;
        }
        p {
          color: #666;
          margin: 0 0 30px 0;
          font-size: 16px;
        }
        .error-actions {
          display: flex;
          gap: 10px;
          justify-content: center;
        }
        .btn-primary,
        .btn-secondary {
          padding: 10px 30px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 600;
          text-decoration: none;
          display: inline-block;
        }
        .btn-primary {
          background-color: #007bff;
          color: white;
        }
        .btn-primary:hover {
          background-color: #0056b3;
        }
        .btn-secondary {
          background-color: #6c757d;
          color: white;
        }
        .btn-secondary:hover {
          background-color: #5a6268;
        }
      `}</style>
    </div>
  );
}
