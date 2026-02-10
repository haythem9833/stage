import { useState, useContext } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { AuthContext } from "../../context/AuthContext";
import { login as loginAPI } from "../../services/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { loginUser } = useContext(AuthContext);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await loginAPI({ email, password });
      const { token, user } = response.data;

      // Stocke le token et l'utilisateur dans AuthContext
      loginUser(token, user);

      // Redirige selon le rôle de l'utilisateur
      if (user.role === "admin") {
        router.push("/admin/dashboard");
      } else if (user.role === "formateur") {
        router.push("/");
      } else if (user.role === "etudiant") {
        router.push("/");
      } else {
        router.push("/");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Erreur lors de la connexion"
      );
      console.error("Erreur login:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1>Connexion</h1>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label>Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "Connexion en cours..." : "Se connecter"}
          </button>
        </form>
        <p className="auth-link">
          Pas encore de compte ? <Link href="/auth/register">S&apos;inscrire</Link>
        </p>
      </div>

      <style jsx>{`
        .auth-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background-color: #f5f5f5;
        }
        .auth-box {
          background: white;
          padding: 40px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          width: 100%;
          max-width: 400px;
        }
        .auth-box h1 {
          text-align: center;
          margin-bottom: 30px;
          color: #333;
        }
        .form-group {
          margin-bottom: 20px;
        }
        .form-group label {
          display: block;
          margin-bottom: 8px;
          color: #555;
          font-weight: 500;
        }
        .form-group input {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }
        .form-group input:disabled {
          background-color: #f5f5f5;
          cursor: not-allowed;
        }
        .btn-primary {
          width: 100%;
          padding: 10px;
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 16px;
          cursor: pointer;
          font-weight: 600;
        }
        .btn-primary:hover:not(:disabled) {
          background-color: #0056b3;
        }
        .btn-primary:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }
        .error-message {
          background-color: #f8d7da;
          color: #721c24;
          padding: 12px;
          border-radius: 4px;
          margin-bottom: 20px;
          border: 1px solid #f5c6cb;
        }
        .auth-link {
          text-align: center;
          margin-top: 20px;
          color: #666;
        }
        .auth-link a {
          color: #007bff;
          text-decoration: none;
          font-weight: 600;
        }
        .auth-link a:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}
