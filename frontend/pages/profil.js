import { useContext, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { AuthContext } from "../context/AuthContext";
import { changePassword as changePasswordAPI } from "../services/api";
import { User, Shield, Settings, Activity, Mail, MapPin, Calendar, Phone, Bell, Globe, Lock, LogOut, CheckCircle, XCircle, Clock, X } from "lucide-react";


export default function Profil() {
  const { user, logoutUser } = useContext(AuthContext);
  const [messageType, setMessageType] = useState(""); // 'success' or 'error'

   const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Password change state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    newPassword_confirmation: "",
  });
  const [message, setMessage] = useState({ text: "", type: "" });
  const [errors, setErrors] = useState({});

  // Preferences state
  const [preferences, setPreferences] = useState(
    user.preferences || {
      emailNotifications: true,
      pushNotifications: false,
      weeklyDigest: true,
      language: "fr",
    }
  );

  // Mock activity data
  const mockActivities = [
    {
      id: 1,
      type: "login",
      description: "Connexion réussie",
      timestamp: "2025-01-20 14:32",
      icon: <Lock className="h-4 w-4" />,
    },
    {
      id: 2,
      type: "password",
      description: "Mot de passe modifié",
      timestamp: "2025-01-18 09:15",
      icon: <Shield className="h-4 w-4" />,
    },
    {
      id: 3,
      type: "profile",
      description: "Profil mis à jour",
      timestamp: "2025-01-15 11:45",
      icon: <User className="h-4 w-4" />,
    },
    {
      id: 4,
      type: "settings",
      description: "Préférences modifiées",
      timestamp: "2025-01-10 16:20",
      icon: <Settings className="h-4 w-4" />,
    },
  ];

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated || !user) {
    return (
      <div className="auth-container">
        <h1>Accès refusé</h1>
        <p>
          Veuillez vous <Link href="/auth/login">connecter</Link>
        </p>
        <style jsx>{`
          .auth-container {
            text-align: center;
            padding: 40px 20px;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);
          }
          .auth-container h1 {
            color: #333;
            margin-bottom: 20px;
            font-size: 2rem;
          }
          .auth-container a {
            color: #667eea;
            text-decoration: none;
            font-weight: 600;
          }
          .auth-container a:hover {
            text-decoration: underline;
          }
        `}</style>
      </div>
    );
  }

  const validatePassword = (password) => {
    // Doit correspondre aux exigences du backend
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });
    setErrors({});
    setLoading(true);

    // Validation côté client
    if (formData.newPassword !== formData.newPassword_confirmation) {
      setMessage("Les mots de passe ne correspondent pas");
      setMessageType("error");
      setLoading(false);
      return;
    }

    if (!validatePassword(formData.newPassword)) {
      setMessage(
        "Le nouveau mot de passe doit contenir: au moins 8 caractères, majuscules, minuscules, chiffres et caractères spéciaux (@$!%*?&)"
      );
      setMessageType("error");
      setLoading(false);
      return;
    }

    if (formData.currentPassword === formData.newPassword) {
      setMessage("Le nouveau mot de passe doit être différent de l'actuel");
      setMessageType("error");
      setLoading(false);
      return;
    }

    try {
      console.log("📤 Envoi de la demande de changement de mot de passe...");

      // Remplacez ceci par votre véritable appel API
      // const response = await changePasswordAPI({
      //   current_password: formData.currentPassword,
      //   new_password: formData.newPassword,
      //   new_password_confirmation: formData.newPassword_confirmation,
      // });

      // Simulation pour l'exemple
      await new Promise((resolve) => setTimeout(resolve, 1500));

      console.log("✅ Mot de passe changé avec succès");
      setMessage("Mot de passe changé avec succès!");
      setMessageType("success");

      // Clear form after success
      setFormData({
        currentPassword: "",
        newPassword: "",
        newPassword_confirmation: "",
      });

      // Close form after 2 seconds
      setTimeout(() => {
        setShowPasswordForm(false);
      }, 2000);
    } catch (err) {
      console.error("❌ Erreur lors du changement de mot de passe:", err);
      console.error("Réponse du serveur:", err.response?.data);

      // Handle 422 validation errors
      if (err.response?.status === 422) {
        const validationErrors = err.response.data.errors || {};
        console.error("Erreurs de validation:", validationErrors);
        setErrors(validationErrors);

        const errorMessages = Object.entries(validationErrors)
          .map(([field, messages]) => {
            const displayField = field
              .replace("current_password", "mot de passe actuel")
              .replace("new_password", "nouveau mot de passe");
            return `${displayField}: ${messages.join(", ")}`;
          })
          .join("\n");

        setMessage(errorMessages || "Les données soumises sont invalides");
      } else {
        setMessage(
          err.response?.data?.message || "Erreur lors du changement de mot de passe"
        );
      }
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

 

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const handleLogout = () => {
    // Remplacez par votre fonction de déconnexion
    // logoutUser();
    router.push("/auth/login");
  };

  const getRoleVariant = (role) => {
    switch (role) {
      case "admin":
        return "variant-admin";
      case "formateur":
        return "variant-formateur";
      case "etudiant":
        return "variant-etudiant";
      default:
        return "variant-default";
    }
  };

  const getRoleLabel = (role) => {
    const labels = {
      admin: "Administrateur",
      formateur: "Formateur",
      etudiant: "Étudiant",
    };
    return labels[role] || role;
  };

  return (
    <div className="page-container">
      <div className="container">
        {/* Header */}
        <div className="page-header">
          <h1>Mon Profil</h1>
          <p className="header-subtitle">
            Gérez vos informations personnelles et vos préférences de compte
          </p>
        </div>

        {/* Main Content */}
        <div className="main-content">
          {/* Profile Card - Sidebar */}
          <div className="profile-sidebar">
            <div className="profile-card">
              <div className="avatar-section">
                <div className="avatar">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.prenom} />
                  ) : (
                    <span className="avatar-initials">
                      {user.prenom?.[0]}
                      {user.nom?.[0]}
                    </span>
                  )}
                </div>

                <div className="user-info">
                  <h2 className="user-name">
                    {user.prenom} {user.nom}
                  </h2>
                  <p className="user-email">{user.email}</p>
                  <span className={`badge ${getRoleVariant(user.role)}`}>
                    {getRoleLabel(user.role)}
                  </span>
                </div>
              </div>

              <div className="divider"></div>

              <div className="user-details">
                <div className="detail-item">
                  <MapPin className="detail-icon" />
                  <span>{user.location}</span>
                </div>
                <div className="detail-item">
                  <Phone className="detail-icon" />
                  <span>{user.telephone}</span>
                </div>
                <div className="detail-item">
                  <Calendar className="detail-icon" />
                  <span>
                    Membre depuis{" "}
                    {new Date(user.joinedDate).toLocaleDateString("fr-FR", {
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="detail-item">
                  <Globe className="detail-icon" />
                  <span>{user.department}</span>
                </div>
              </div>

              <div className="divider"></div>

              <button
                className="btn-logout"
                onClick={handleLogout}
                disabled={loading}
              >
                <LogOut className="btn-icon" />
                Se déconnecter
              </button>
            </div>
          </div>

          {/* Tabs Content */}
          <div className="tabs-content">
            {/* Tabs List */}
            <div className="tabs-list">
              {[
                { id: "overview", label: "Profil", icon: <User className="tab-icon" /> },
                { id: "security", label: "Sécurité", icon: <Shield className="tab-icon" /> },
                { id: "settings", label: "Paramètres", icon: <Settings className="tab-icon" /> },
                { id: "activity", label: "Activité", icon: <Activity className="tab-icon" /> },
              ].map((tab) => (
                <button
                  key={tab.id}
                  className={`tab-button ${activeTab === tab.id ? "tab-active" : ""}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.icon}
                  <span className="tab-label">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="tab-panel">
                <div className="card">
                  <div className="card-header">
                    <h3>Informations personnelles</h3>
                    <p className="card-description">
                      Gérez vos informations de base et votre biographie
                    </p>
                  </div>
                  <div className="card-content">
                    <div className="form-row">
                      <div className="form-group">
                        <label>Prénom</label>
                        <input
                          type="text"
                          defaultValue={user.prenom}
                          disabled
                          className="input-disabled"
                        />
                      </div>
                      <div className="form-group">
                        <label>Nom</label>
                        <input
                          type="text"
                          defaultValue={user.nom}
                          disabled
                          className="input-disabled"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Email</label>
                      <div className="input-with-icon">
                        <input
                          type="email"
                          defaultValue={user.email}
                          disabled
                          className="input-disabled"
                        />
                        <Mail className="input-icon" />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Téléphone</label>
                        <input
                          type="tel"
                          defaultValue={user.telephone}
                          disabled
                          className="input-disabled"
                        />
                      </div>
                      <div className="form-group">
                        <label>Département</label>
                        <input
                          type="text"
                          defaultValue={user.department}
                          disabled
                          className="input-disabled"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Biographie</label>
                      <textarea
                        defaultValue={user.bio}
                        disabled
                        className="input-disabled textarea"
                        rows={3}
                      />
                      <p className="field-hint">
                        Une brève description professionnelle
                      </p>
                    </div>
                  </div>
                  <div className="card-footer">
                    <p className="footer-note">
                      Contactez l'administrateur pour modifier ces informations
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <div className="tab-panel">
                <div className="card">
                  <div className="card-header">
                    <h3 className="header-with-icon">
                      <Lock className="header-icon" />
                      Mot de passe
                    </h3>
                    <p className="card-description">
                      Modifiez votre mot de passe pour sécuriser votre compte
                    </p>
                  </div>
                  <div className="card-content">
                    {!showPasswordForm ? (
                      <div className="security-info">
                        <div className="security-card">
                          <Shield className="security-icon" />
                          <div className="security-details">
                            <h4>Sécurité du compte</h4>
                            <p>
                              Dernière modification:{" "}
                              {new Date("2025-01-18").toLocaleDateString("fr-FR")}
                            </p>
                            <p>
                              Il est recommandé de changer votre mot de passe
                              régulièrement
                            </p>
                          </div>
                        </div>
                        <button
                          className="btn-primary"
                          onClick={() => setShowPasswordForm(true)}
                        >
                          <Shield className="btn-icon" />
                          Changer le mot de passe
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handleChangePassword} className="password-form">
                        {message.text && (
                          <div
                            className={`alert ${message.type === "success" ? "alert-success" : "alert-error"}`}
                          >
                            {message.type === "success" ? (
                              <CheckCircle className="alert-icon" />
                            ) : (
                              <XCircle className="alert-icon" />
                            )}
                            <span style={{ whiteSpace: "pre-wrap", fontSize: "12px" }}>
                              {message.text}
                            </span>
                          </div>
                        )}

                        <div className="form-group">
                          <label>Mot de passe actuel</label>
                          <input
                            type="password"
                            name="currentPassword"
                            value={formData.currentPassword}
                            onChange={handleInputChange}
                            placeholder="Entrez votre mot de passe actuel"
                            required
                            disabled={loading}
                            className={errors.current_password ? "input-error" : ""}
                          />
                          {errors.current_password && (
                            <span className="error-text">{errors.current_password}</span>
                          )}
                        </div>

                        <div className="form-group">
                          <label>Nouveau mot de passe</label>
                          <input
                            type="password"
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleInputChange}
                            placeholder="Entrez le nouveau mot de passe"
                            required
                            disabled={loading}
                            className={errors.new_password ? "input-error" : ""}
                          />
                          {errors.new_password && (
                            <span className="error-text">{errors.new_password}</span>
                          )}
                          <div className="password-requirements">
                            <p className="requirements-title">Exigences:</p>
                            <ul>
                              <li>Au moins 8 caractères</li>
                              <li>Majuscules et minuscules</li>
                              <li>Chiffres (0-9)</li>
                              <li>Caractères spéciaux (@$!%*?&)</li>
                            </ul>
                          </div>
                        </div>

                        <div className="form-group">
                          <label>Confirmer le mot de passe</label>
                          <input
                            type="password"
                            name="newPassword_confirmation"
                            value={formData.newPassword_confirmation}
                            onChange={handleInputChange}
                            placeholder="Confirmez le nouveau mot de passe"
                            required
                            disabled={loading}
                            className={errors.newPassword_confirmation ? "input-error" : ""}
                          />
                          {errors.newPassword_confirmation && (
                            <span className="error-text">{errors.newPassword_confirmation}</span>
                          )}
                        </div>

                        <div className="form-actions">
                          <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => {
                              setShowPasswordForm(false);
                              setFormData({
                                currentPassword: "",
                                newPassword: "",
                                newPassword_confirmation: "",
                              });
                              setErrors({});
                              setMessage({ text: "", type: "" });
                            }}
                            disabled={loading}
                          >
                            Annuler
                          </button>
                          <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? "Mise à jour..." : "Mettre à jour le mot de passe"}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>

                <div className="card">
                  <div className="card-header">
                    <h3>Session active</h3>
                    <p className="card-description">
                      Informations sur votre session actuelle
                    </p>
                  </div>
                  <div className="card-content">
                    <div className="session-info">
                      <div className="session-item">
                        <Clock className="session-icon" />
                        <div className="session-details">
                          <p className="session-label">Dernière connexion</p>
                          <p className="session-value">{user.lastLogin}</p>
                        </div>
                        <span className="status-badge status-active">Actif</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === "settings" && (
              <div className="tab-panel">
                <div className="card">
                  <div className="card-header">
                    <h3 className="header-with-icon">
                      <Bell className="header-icon" />
                      Notifications
                    </h3>
                    <p className="card-description">
                      Gérez vos préférences de notification
                    </p>
                  </div>
                  <div className="card-content">
                    <div className="setting-item">
                      <div className="setting-info">
                        <label>Notifications par email</label>
                        <p className="setting-description">
                          Recevez des mises à jour importantes par email
                        </p>
                      </div>
                      <button
                        className={`toggle-btn ${preferences.emailNotifications ? "toggle-on" : "toggle-off"}`}
                        onClick={() =>
                          setPreferences({
                            ...preferences,
                            emailNotifications: !preferences.emailNotifications,
                          })
                        }
                      >
                        {preferences.emailNotifications ? "Activé" : "Désactivé"}
                      </button>
                    </div>

                    <div className="setting-divider"></div>

                    <div className="setting-item">
                      <div className="setting-info">
                        <label>Notifications push</label>
                        <p className="setting-description">
                          Recevez des notifications en temps réel
                        </p>
                      </div>
                      <button
                        className={`toggle-btn ${preferences.pushNotifications ? "toggle-on" : "toggle-off"}`}
                        onClick={() =>
                          setPreferences({
                            ...preferences,
                            pushNotifications: !preferences.pushNotifications,
                          })
                        }
                      >
                        {preferences.pushNotifications ? "Activé" : "Désactivé"}
                      </button>
                    </div>

                    <div className="setting-divider"></div>

                    <div className="setting-item">
                      <div className="setting-info">
                        <label>Résumé hebdomadaire</label>
                        <p className="setting-description">
                          Recevez un récapitulatif de votre activité
                        </p>
                      </div>
                      <button
                        className={`toggle-btn ${preferences.weeklyDigest ? "toggle-on" : "toggle-off"}`}
                        onClick={() =>
                          setPreferences({
                            ...preferences,
                            weeklyDigest: !preferences.weeklyDigest,
                          })
                        }
                      >
                        {preferences.weeklyDigest ? "Activé" : "Désactivé"}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="card-header">
                    <h3 className="header-with-icon">
                      <Globe className="header-icon" />
                      Préférences régionales
                    </h3>
                    <p className="card-description">Langue et paramètres régionaux</p>
                  </div>
                  <div className="card-content">
                    <div className="form-group">
                      <label>Langue</label>
                      <select
                        className="select-input"
                        value={preferences.language}
                        onChange={(e) =>
                          setPreferences({ ...preferences, language: e.target.value })
                        }
                      >
                        <option value="fr">Français</option>
                        <option value="en">English</option>
                        <option value="es">Español</option>
                        <option value="de">Deutsch</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Activity Tab */}
            {activeTab === "activity" && (
              <div className="tab-panel">
                <div className="card">
                  <div className="card-header">
                    <h3>Historique des activités</h3>
                    <p className="card-description">
                      Suivez vos actions récentes sur le compte
                    </p>
                  </div>
                  <div className="card-content">
                    <div className="activity-list">
                      {mockActivities.map((activity) => (
                        <div key={activity.id} className="activity-item">
                          <div className="activity-icon">{activity.icon}</div>
                          <div className="activity-details">
                            <p className="activity-title">{activity.description}</p>
                            <p className="activity-time">
                              {new Date(activity.timestamp).toLocaleString("fr-FR", {
                                day: "2-digit",
                                month: "long",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="card-footer">
                    <button className="btn-outline w-full">Voir tout l'historique</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .page-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 20px;
        }

        .page-header {
          margin-bottom: 40px;
        }

        .page-header h1 {
          font-size: 2.5rem;
          font-weight: 700;
          color: #1a1a2e;
          margin: 0 0 10px 0;
        }

        .header-subtitle {
          font-size: 1rem;
          color: #666;
          margin: 0;
        }

        .main-content {
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 30px;
        }

        @media (max-width: 1024px) {
          .main-content {
            grid-template-columns: 1fr;
          }
        }

        /* Profile Card */
        .profile-card {
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          padding: 30px;
          height: fit-content;
          position: sticky;
          top: 20px;
        }

        .avatar-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 15px;
          margin-bottom: 10px;
        }

        .avatar {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
          overflow: hidden;
        }

        .avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .avatar-initials {
          color: white;
          font-size: 2rem;
          font-weight: 700;
        }

        .user-info {
          text-align: center;
        }

        .user-name {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1a1a2e;
          margin: 0 0 5px 0;
        }

        .user-email {
          font-size: 0.875rem;
          color: #666;
          margin: 0 0 10px 0;
        }

        .badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .badge.variant-admin {
          background: linear-gradient(135deg, #f87171 0%, #dc2626 100%);
          color: white;
        }

        .badge.variant-formateur {
          background: linear-gradient(135deg, #60a5fa 0%, #2563eb 100%);
          color: white;
        }

        .badge.variant-etudiant {
          background: linear-gradient(135deg, #4ade80 0%, #16a34a 100%);
          color: white;
        }

        .badge.variant-default {
          background: #e5e7eb;
          color: #374151;
        }

        .divider {
          height: 1px;
          background: #e5e7eb;
          margin: 20px 0;
        }

        .user-details {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .detail-item {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 0.875rem;
          color: #666;
        }

        .detail-icon {
          width: 18px;
          height: 18px;
          color: #9ca3af;
          flex-shrink: 0;
        }

        .btn-logout {
          width: 100%;
          padding: 12px 20px;
          background: linear-gradient(135deg, #f87171 0%, #dc2626 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.3s ease;
          margin-top: 10px;
        }

        .btn-logout:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4);
        }

        .btn-logout:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Tabs */
        .tabs-content {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .tabs-list {
          display: flex;
          background: #e5e7eb;
          border-radius: 12px;
          padding: 4px;
          gap: 4px;
        }

        .tab-button {
          flex: 1;
          padding: 10px 16px;
          border: none;
          background: transparent;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 500;
          color: #666;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.3s ease;
        }

        .tab-button:hover {
          background: rgba(255, 255, 255, 0.5);
        }

        .tab-button.tab-active {
          background: white;
          color: #1a1a2e;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .tab-icon {
          width: 18px;
          height: 18px;
        }

        @media (max-width: 640px) {
          .tab-label {
            display: none;
          }
        }

        /* Card */
        .card {
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          overflow: hidden;
        }

        .card-header {
          padding: 24px;
          border-bottom: 1px solid #e5e7eb;
        }

        .card-header h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1a1a2e;
          margin: 0 0 8px 0;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .header-with-icon {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .header-icon {
          width: 22px;
          height: 22px;
          color: #666;
        }

        .card-description {
          font-size: 0.875rem;
          color: #666;
          margin: 0;
        }

        .card-content {
          padding: 24px;
        }

        .card-footer {
          padding: 16px 24px;
          background: #f9fafb;
          border-top: 1px solid #e5e7eb;
        }

        .footer-note {
          font-size: 0.875rem;
          color: #666;
          margin: 0;
        }

        /* Form */
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 20px;
        }

        @media (max-width: 640px) {
          .form-row {
            grid-template-columns: 1fr;
          }
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
          margin-bottom: 8px;
        }

        .form-group input,
        .form-group textarea,
        .form-group select {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 0.875rem;
          transition: all 0.3s ease;
          box-sizing: border-box;
          font-family: inherit;
        }

        .form-group input:focus,
        .form-group textarea:focus,
        .form-group select:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .input-disabled {
          background: #f9fafb;
          color: #666;
          cursor: not-allowed;
        }

        .input-error {
          border-color: #dc2626 !important;
          background: #fff5f5;
        }

        .textarea {
          resize: vertical;
          min-height: 80px;
        }

        .select-input {
          cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
          background-size: 16px;
        }

        .input-with-icon {
          position: relative;
        }

        .input-icon {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          width: 20px;
          height: 20px;
          color: #9ca3af;
        }

        .field-hint {
          font-size: 0.75rem;
          color: #9ca3af;
          margin: 6px 0 0 0;
        }

        .error-text {
          display: block;
          font-size: 0.75rem;
          color: #dc2626;
          margin: 6px 0 0 0;
        }

        /* Buttons */
        .btn-primary,
        .btn-secondary,
        .btn-outline {
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-secondary {
          background: #e5e7eb;
          color: #374151;
        }

        .btn-secondary:hover:not(:disabled) {
          background: #d1d5db;
        }

        .btn-outline {
          background: transparent;
          border: 2px solid #e5e7eb;
          color: #374151;
          width: 100%;
        }

        .btn-outline:hover {
          border-color: #667eea;
          color: #667eea;
        }

        .btn-icon {
          width: 18px;
          height: 18px;
        }

        .form-actions {
          display: flex;
          gap: 12px;
          margin-top: 24px;
        }

        .w-full {
          width: 100%;
        }

        /* Alert */
        .alert {
          padding: 16px;
          border-radius: 8px;
          margin-bottom: 24px;
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .alert-success {
          background: #d1fae5;
          border: 1px solid #6ee7b7;
          color: #065f46;
        }

        .alert-error {
          background: #fee2e2;
          border: 1px solid #fca5a5;
          color: #991b1b;
        }

        .alert-icon {
          width: 20px;
          height: 20px;
          flex-shrink: 0;
        }

        /* Security */
        .security-info {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .security-card {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          padding: 20px;
          background: #f9fafb;
          border-radius: 12px;
        }

        .security-icon {
          width: 40px;
          height: 40px;
          color: #9ca3af;
          flex-shrink: 0;
        }

        .security-details h4 {
          font-size: 1rem;
          font-weight: 600;
          color: #1a1a2e;
          margin: 0 0 8px 0;
        }

        .security-details p {
          font-size: 0.875rem;
          color: #666;
          margin: 0 0 4px 0;
        }

        .password-requirements {
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          padding: 16px;
          border-radius: 8px;
          margin-top: 12px;
        }

        .requirements-title {
          font-size: 0.875rem;
          font-weight: 600;
          color: #1e40af;
          margin: 0 0 8px 0;
        }

        .password-requirements ul {
          margin: 0;
          padding-left: 20px;
          font-size: 0.75rem;
          color: #1e40af;
        }

        .password-requirements li {
          margin-bottom: 4px;
        }

        /* Session */
        .session-info {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .session-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          background: #f9fafb;
          border-radius: 12px;
        }

        .session-icon {
          width: 20px;
          height: 20px;
          color: #9ca3af;
          flex-shrink: 0;
        }

        .session-details {
          flex: 1;
        }

        .session-label {
          font-size: 0.875rem;
          font-weight: 600;
          color: #1a1a2e;
          margin: 0 0 4px 0;
        }

        .session-value {
          font-size: 0.875rem;
          color: #666;
          margin: 0;
        }

        .status-badge {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .status-badge.status-active {
          background: #d1fae5;
          color: #059669;
        }

        /* Settings */
        .setting-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 0;
        }

        .setting-info {
          flex: 1;
        }

        .setting-info label {
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
          margin: 0 0 4px 0;
          display: block;
        }

        .setting-description {
          font-size: 0.875rem;
          color: #666;
          margin: 0;
        }

        .setting-divider {
          height: 1px;
          background: #e5e7eb;
          margin: 0;
        }

        .toggle-btn {
          padding: 8px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          background: white;
          color: #666;
        }

        .toggle-btn.toggle-on {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-color: transparent;
          color: white;
        }

        .toggle-btn:hover {
          transform: scale(1.05);
        }

        /* Activity */
        .activity-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .activity-item {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          padding: 16px;
          background: #f9fafb;
          border-radius: 12px;
          transition: all 0.3s ease;
        }

        .activity-item:hover {
          background: #f3f4f6;
          transform: translateX(4px);
        }

        .activity-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .activity-details {
          flex: 1;
        }

        .activity-title {
          font-size: 0.875rem;
          font-weight: 600;
          color: #1a1a2e;
          margin: 0 0 4px 0;
        }

        .activity-time {
          font-size: 0.75rem;
          color: #666;
          margin: 0;
        }

        /* Tab Panel Animation */
        .tab-panel {
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
