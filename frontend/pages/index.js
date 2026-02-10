import Link from "next/link";
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Home() {
  const { user } = useContext(AuthContext);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const getDashboardLink = () => {
    if (!user) return "/auth/login";
    if (user.role === "admin") return "/admin/dashboard";
    if (user.role === "formateur") return "/formateur/dashboard";
    if (user.role === "etudiant") return "/etudiant/dashboard";
    return "/";
  };

  // Ne pas rendre le contenu conditionnel jusqu'à l'hydratation
  const isUserLoggedIn = isHydrated && user;

  return (
    <div className="home-container">
      <main id="main-content">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-container">
            <div className="hero-content">
              <h1 className="hero-title">Plateforme de Gestion de Formations CNI</h1>
              <p className="hero-subtitle">
                Gérez vos formations, inscriptions et certificats en toute simplicité. 
                Une solution complète pour étudiants, formateurs et administrateurs.
              </p>
              {!isUserLoggedIn ? (
                <div className="hero-cta">
                  <Link href="/auth/login" className="btn btn-primary-large">
                    Se Connecter
                  </Link>
                  <Link href="/auth/register" className="btn btn-secondary-large">
                    Créer un Compte
                  </Link>
                </div>
              ) : (
                <div className="hero-cta">
                  <Link href={getDashboardLink()} className="btn btn-primary-large">
                    Accéder au Tableau de Bord
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Introduction Section */}
        <section className="intro-section">
          <div className="container">
            <div className="intro-content">
              <h2 className="section-title">Bienvenue sur CNI Formations</h2>
              <p className="section-description">
                Notre plateforme offre une expérience complète pour la gestion de formations professionnelles. 
                Que vous soyez étudiant cherchant à développer vos compétences, formateur souhaitant partager 
                votre expertise, ou administrateur gérant l&apos;ensemble du système, nous avons les outils 
                qu&apos;il vous faut.
              </p>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="features-section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Nos Fonctionnalités</h2>
              <p className="section-description">
                Découvrez les outils puissants qui facilitent votre parcours de formation
              </p>
            </div>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon-wrapper">
                  <span className="feature-icon">📚</span>
                </div>
                <h3 className="feature-title">Catalogue de Formations</h3>
                <p className="feature-description">
                  Accédez à un large éventail de formations professionnelles adaptées à vos besoins
                </p>
              </div>
              <div className="feature-card">
                <div className="feature-icon-wrapper">
                  <span className="feature-icon">📝</span>
                </div>
                <h3 className="feature-title">Inscriptions Simplifiées</h3>
                <p className="feature-description">
                  Inscrivez-vous facilement aux formations qui vous intéressent en quelques clics
                </p>
              </div>
              <div className="feature-card">
                <div className="feature-icon-wrapper">
                  <span className="feature-icon">🎓</span>
                </div>
                <h3 className="feature-title">Certificats Numériques</h3>
                <p className="feature-description">
                  Obtenez des certificats officiels et vérifiables à la fin de vos formations
                </p>
              </div>
              <div className="feature-card">
                <div className="feature-icon-wrapper">
                  <span className="feature-icon">📊</span>
                </div>
                <h3 className="feature-title">Suivi en Temps Réel</h3>
                <p className="feature-description">
                  Suivez votre progression et vos résultats tout au long de votre parcours
                </p>
              </div>
              <div className="feature-card">
                <div className="feature-icon-wrapper">
                  <span className="feature-icon">👨‍🏫</span>
                </div>
                <h3 className="feature-title">Gestion de Sessions</h3>
                <p className="feature-description">
                  Créez et gérez vos sessions de formation avec des outils intuitifs
                </p>
              </div>
              <div className="feature-card">
                <div className="feature-icon-wrapper">
                  <span className="feature-icon">🔒</span>
                </div>
                <h3 className="feature-title">Sécurité Avancée</h3>
                <p className="feature-description">
                  Vos données sont protégées par des mesures de sécurité de pointe
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Roles Section */}
        <section className="roles-section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Pour Qui ?</h2>
              <p className="section-description">
                Une plateforme adaptée à chaque profil utilisateur
              </p>
            </div>
            <div className="roles-grid">
              <div className="role-card">
                <div className="role-icon">👨‍🎓</div>
                <h3 className="role-title">Étudiants</h3>
                <p className="role-description">
                  Explorez notre catalogue de formations, inscrivez-vous aux sessions qui vous intéressent, 
                  suivez votre progression et obtenez vos certificats.
                </p>
                {!isUserLoggedIn && (
                  <Link href="/auth/register" className="role-link">
                    Devenir étudiant →
                  </Link>
                )}
              </div>
              <div className="role-card">
                <div className="role-icon">👨‍🏫</div>
                <h3 className="role-title">Formateurs</h3>
                <p className="role-description">
                  Créez et gérez vos sessions de formation, suivez les inscriptions, 
                  évaluez les participants et délivrez les certificats.
                </p>
                {!isUserLoggedIn && (
                  <Link href="/auth/register" className="role-link">
                    Devenir formateur →
                  </Link>
                )}
              </div>
              <div className="role-card">
                <div className="role-icon">👨‍💼</div>
                <h3 className="role-title">Administrateurs</h3>
                <p className="role-description">
                  Administrez l&apos;ensemble de la plateforme, gérez les utilisateurs, 
                  les formations et supervisez toutes les activités.
                </p>
                {!isUserLoggedIn && (
                  <Link href="/auth/login" className="role-link">
                    Accès administrateur →
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Process Section */}
        <section className="process-section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Comment ça fonctionne ?</h2>
              <p className="section-description">
                Un processus simple en quelques étapes
              </p>
            </div>
            <div className="process-steps">
              <div className="process-step">
                <div className="step-number">1</div>
                <h3 className="step-title">Inscription</h3>
                <p className="step-description">Créez votre compte en quelques minutes</p>
              </div>
              <div className="process-step">
                <div className="step-number">2</div>
                <h3 className="step-title">Exploration</h3>
                <p className="step-description">Parcourez le catalogue de formations disponibles</p>
              </div>
              <div className="process-step">
                <div className="step-number">3</div>
                <h3 className="step-title">Inscription</h3>
                <p className="step-description">Inscrivez-vous aux formations qui vous intéressent</p>
              </div>
              <div className="process-step">
                <div className="step-number">4</div>
                <h3 className="step-title">Formation</h3>
                <p className="step-description">Suivez vos cours et complétez les évaluations</p>
              </div>
              <div className="process-step">
                <div className="step-number">5</div>
                <h3 className="step-title">Certification</h3>
                <p className="step-description">Obtenez votre certificat de réussite</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
          <div className="container">
            <div className="cta-content">
              <h2 className="cta-title">Prêt à commencer votre parcours de formation ?</h2>
              <p className="cta-description">
                Rejoignez notre communauté et développez vos compétences dès aujourd&apos;hui
              </p>
              {!isUserLoggedIn ? (
                <div className="cta-buttons">
                  <Link href="/auth/register" className="btn btn-primary-large">
                    Créer un Compte
                  </Link>
                  <Link href="/auth/login" className="btn btn-outline-large">
                    Se Connecter
                  </Link>
                </div>
              ) : (
                <Link href={getDashboardLink()} className="btn btn-primary-large">
                  Accéder à Mon Tableau de Bord
                </Link>
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-main">
          <div className="container">
            <div className="footer-content">
              <div className="footer-section">
                <h3 className="footer-title">CNI Formations</h3>
                <p className="footer-description">
                  Plateforme de gestion de formations professionnelles. 
                  Développez vos compétences et obtenez des certifications reconnues.
                </p>
              </div>
              <div className="footer-section">
                <h4 className="footer-heading">Navigation</h4>
                <nav className="footer-nav">
                  <Link href="/">Accueil</Link>
                  {isUserLoggedIn && (
                    <>
                      <Link href={getDashboardLink()}>Tableau de bord</Link>
                      <Link href="/profil">Mon Profil</Link>
                    </>
                  )}
                  <Link href="/aide">Aide</Link>
                </nav>
              </div>
              <div className="footer-section">
                <h4 className="footer-heading">Ressources</h4>
                <nav className="footer-nav">
                  <Link href="/aide">Documentation</Link>
                  <Link href="/aide">Support</Link>
                  <Link href="/aide">FAQ</Link>
                </nav>
              </div>
              <div className="footer-section">
                <h4 className="footer-heading">Contact</h4>
                <div className="footer-contact">
                  <p>Email: contact@cniformations.com</p>
                  <p>Téléphone: +33 1 23 45 67 89</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="container">
            <div className="footer-bottom-content">
              <p className="footer-copyright">
                © {new Date().getFullYear()} CNI Formations. Tous droits réservés.
              </p>
              <nav className="footer-legal">
                <Link href="/aide">Mentions légales</Link>
                <Link href="/aide">Confidentialité</Link>
                <Link href="/aide">CGU</Link>
              </nav>
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        .home-container {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }
        /* Le header est maintenant global (components/Header) */
        main {
          flex: 1;
        }
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }
        /* Hero Section */
        .hero-section {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 100px 20px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .hero-section::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
          opacity: 0.1;
        }
        .hero-container {
          position: relative;
          z-index: 1;
        }
        .hero-content {
          max-width: 800px;
          margin: 0 auto;
        }
        .hero-title {
          font-size: 3rem;
          font-weight: 700;
          margin: 0 0 20px 0;
          line-height: 1.2;
        }
        .hero-subtitle {
          font-size: 1.25rem;
          margin: 0 0 40px 0;
          opacity: 0.95;
          line-height: 1.6;
        }
        .hero-cta {
          display: flex;
          gap: 20px;
          justify-content: center;
          flex-wrap: wrap;
        }
        /* Buttons */
        .btn {
          padding: 14px 32px;
          border-radius: 8px;
          font-weight: 600;
          text-decoration: none;
          display: inline-block;
          transition: all 0.3s ease;
          border: 2px solid transparent;
          cursor: pointer;
          font-size: 16px;
        }
        .btn-primary-large {
          background-color: white;
          color: #667eea;
        }
        .btn-primary-large:hover {
          background-color: #f8f9fa;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
        }
        .btn-secondary-large {
          background-color: transparent;
          color: white;
          border-color: white;
        }
        .btn-secondary-large:hover {
          background-color: rgba(255, 255, 255, 0.1);
          transform: translateY(-2px);
        }
        .btn-outline-large {
          background-color: transparent;
          color: white;
          border-color: white;
        }
        .btn-outline-large:hover {
          background-color: rgba(255, 255, 255, 0.1);
        }
        /* Section Styles */
        .intro-section,
        .features-section,
        .roles-section,
        .process-section {
          padding: 80px 0;
        }
        .intro-section {
          background-color: #f8f9fa;
        }
        .roles-section {
          background-color: #f8f9fa;
        }
        .section-header {
          text-align: center;
          margin-bottom: 60px;
        }
        .section-title {
          font-size: 2.5rem;
          font-weight: 700;
          color: #1a1a1a;
          margin: 0 0 20px 0;
        }
        .section-description {
          font-size: 1.125rem;
          color: #6b7280;
          max-width: 700px;
          margin: 0 auto;
          line-height: 1.7;
        }
        .intro-content {
          text-align: center;
          max-width: 900px;
          margin: 0 auto;
        }
        /* Features Grid */
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 30px;
        }
        .feature-card {
          background: white;
          padding: 40px 30px;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
          text-align: center;
          transition: all 0.3s ease;
          border: 1px solid #e5e7eb;
        }
        .feature-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
        }
        .feature-icon-wrapper {
          margin-bottom: 20px;
        }
        .feature-icon {
          font-size: 48px;
          display: inline-block;
        }
        .feature-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0 0 12px 0;
        }
        .feature-description {
          font-size: 1rem;
          color: #6b7280;
          line-height: 1.6;
          margin: 0;
        }
        /* Roles Grid */
        .roles-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 30px;
        }
        .role-card {
          background: white;
          padding: 40px 30px;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
          text-align: center;
          transition: all 0.3s ease;
          border: 1px solid #e5e7eb;
        }
        .role-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
        }
        .role-icon {
          font-size: 64px;
          margin-bottom: 20px;
        }
        .role-title {
          font-size: 1.75rem;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0 0 16px 0;
        }
        .role-description {
          font-size: 1rem;
          color: #6b7280;
          line-height: 1.7;
          margin: 0 0 24px 0;
        }
        .role-link {
          color: #667eea;
          text-decoration: none;
          font-weight: 600;
          transition: color 0.2s ease;
        }
        .role-link:hover {
          color: #764ba2;
        }
        /* Process Steps */
        .process-steps {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 30px;
          max-width: 1000px;
          margin: 0 auto;
        }
        .process-step {
          text-align: center;
          position: relative;
        }
        .step-number {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0 auto 20px;
        }
        .step-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0 0 12px 0;
        }
        .step-description {
          font-size: 0.95rem;
          color: #6b7280;
          line-height: 1.6;
          margin: 0;
        }
        /* CTA Section */
        .cta-section {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 100px 20px;
          text-align: center;
        }
        .cta-content {
          max-width: 700px;
          margin: 0 auto;
        }
        .cta-title {
          font-size: 2.5rem;
          font-weight: 700;
          margin: 0 0 20px 0;
        }
        .cta-description {
          font-size: 1.25rem;
          margin: 0 0 40px 0;
          opacity: 0.95;
        }
        .cta-buttons {
          display: flex;
          gap: 20px;
          justify-content: center;
          flex-wrap: wrap;
        }
        /* Footer */
        .footer {
          background-color: #1a1a1a;
          color: #e5e7eb;
          margin-top: 80px;
        }
        .footer-main {
          padding: 60px 0 40px;
        }
        .footer-content {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 40px;
        }
        .footer-section {
          display: flex;
          flex-direction: column;
        }
        .footer-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: white;
          margin: 0 0 16px 0;
        }
        .footer-heading {
          font-size: 1.125rem;
          font-weight: 600;
          color: white;
          margin: 0 0 16px 0;
        }
        .footer-description {
          font-size: 0.95rem;
          color: #9ca3af;
          line-height: 1.6;
          margin: 0;
        }
        .footer-nav {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .footer-nav a {
          color: #9ca3af;
          text-decoration: none;
          transition: color 0.2s ease;
          font-size: 0.95rem;
        }
        .footer-nav a:hover {
          color: white;
        }
        .footer-contact {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .footer-contact p {
          margin: 0;
          font-size: 0.95rem;
          color: #9ca3af;
        }
        .footer-bottom {
          border-top: 1px solid #374151;
          padding: 30px 0;
        }
        .footer-bottom-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 20px;
        }
        .footer-copyright {
          margin: 0;
          color: #9ca3af;
          font-size: 0.9rem;
        }
        .footer-legal {
          display: flex;
          gap: 24px;
          flex-wrap: wrap;
        }
        .footer-legal a {
          color: #9ca3af;
          text-decoration: none;
          font-size: 0.9rem;
          transition: color 0.2s ease;
        }
        .footer-legal a:hover {
          color: white;
        }
        /* Responsive */
        @media (max-width: 768px) {
          .hero-title {
            font-size: 2rem;
          }
          .hero-subtitle {
            font-size: 1.125rem;
          }
          .section-title {
            font-size: 2rem;
          }
          .cta-title {
            font-size: 2rem;
          }
          .features-grid,
          .roles-grid {
            grid-template-columns: 1fr;
          }
          .process-steps {
            grid-template-columns: 1fr;
          }
          .footer-bottom-content {
            flex-direction: column;
            text-align: center;
          }
          .footer-legal {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}
