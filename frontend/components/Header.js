import { useContext, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { 
  Search, 
  Menu, 
  X, 
  Bell, 
  User, 
  Settings, 
  LogOut,
  BookOpen,
  Home,
  ChevronDown,
  HelpCircle
} from "lucide-react";
import { AuthContext } from "../context/AuthContext";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { user, logoutUser } = useContext(AuthContext);
  const router = useRouter();

  const displayName = useMemo(() => {
    if (!user) return "Compte";
    return user.nom || user.name || user.email?.split("@")?.[0] || "Compte";
  }, [user]);

  const displayEmail = useMemo(() => {
    if (!user) return "Connectez-vous pour accéder à votre espace";
    return user.email || "";
  }, [user]);

  const displayRole = useMemo(() => {
    if (!user?.role) return "";
    const map = { admin: "Administrateur", formateur: "Formateur", etudiant: "Étudiant" };
    return map[user.role] || user.role;
  }, [user]);

  const isActive = (href) => router.pathname === href;

  const formationsHref = useMemo(() => {
    if (!user) return "/etudiant/formations";
    if (user.role === "admin") return "/admin/formations";
    if (user.role === "formateur") return "/formateur/formations";
    return "/etudiant/formations";
  }, [user]);

  const profilHref = useMemo(() => (user ? "/profil" : "/auth/login"), [user]);

  const handleLogout = () => {
    logoutUser();
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    router.push("/auth/login");
  };

  const handleSearch = (e) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      const formationsHref = user?.role === "admin" 
        ? "/admin/formations" 
        : user?.role === "formateur" 
        ? "/formateur/formations" 
        : "/etudiant/formations";
      
      router.push(`${formationsHref}?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
      setSearchOpen(false);
    }
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      const formationsHref = user?.role === "admin" 
        ? "/admin/formations" 
        : user?.role === "formateur" 
        ? "/formateur/formations" 
        : "/etudiant/formations";
      
      router.push(`${formationsHref}?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
      setSearchOpen(false);
    }
  };

  return (
    <header className="header">
      <div className="container">
        {/* Logo */}
        <div className="logo-section">
          <Link href="/" className="logo" onClick={() => setMobileMenuOpen(false)}>
            <BookOpen className="logo-icon" />
            <span className="logo-text">CNI Formations</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="nav-desktop">
          <Link href="/" className={`nav-link ${isActive("/") ? "nav-link-active" : ""}`}>
            <Home className="nav-icon" />
            <span>Accueil</span>
          </Link>
          <Link href={formationsHref} className={`nav-link ${isActive(formationsHref) ? "nav-link-active" : ""}`}>
            <BookOpen className="nav-icon" />
            <span>Formations</span>
          </Link>
          <Link href={profilHref} className={`nav-link ${isActive("/profil") ? "nav-link-active" : ""}`}>
            <User className="nav-icon" />
            <span>Profil</span>
          </Link>
          <Link href="/aide" className={`nav-link ${isActive("/aide") ? "nav-link-active" : ""}`}>
            <HelpCircle className="nav-icon" />
            <span>Aide</span>
          </Link>
        </nav>

        {/* Right Actions */}
        <div className="header-actions">
          {/* Search - Only for students and non-authenticated users */}
          {(!user || user.role === "etudiant") && (
            <div className={`search-wrapper ${searchOpen ? 'search-open' : ''}`}>
              <button 
                className="search-toggle"
                onClick={() => setSearchOpen(!searchOpen)}
                aria-label="Rechercher"
              >
                <Search className="search-icon" />
              </button>
              <input 
                type="text" 
                placeholder="Rechercher une formation..." 
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleSearch}
              />
            </div>
          )}

          {/* User Menu */}
          <div className="user-menu-container">
            <button 
              className="action-btn user-btn"
              onClick={() => setUserMenuOpen(!userMenuOpen)} // juste ouvrir/fermer
              aria-label="Menu utilisateur"
            >
              <div className="user-avatar">
                <User className="user-icon" />
              </div>
              <ChevronDown className={`dropdown-icon ${userMenuOpen ? 'dropdown-open' : ''}`} />
            </button>

            {userMenuOpen && (
              <div className="user-dropdown">
                <div className="dropdown-header">
                  <div className="dropdown-avatar">
                    <User className="dropdown-avatar-icon" />
                  </div>
                  <div className="dropdown-user-info">
                    <span className="dropdown-name">{displayName}</span>
                    <span className="dropdown-email">{displayEmail}</span>
                    {displayRole && <span className="dropdown-email">{displayRole}</span>}
                  </div>
                </div>
                <div className="dropdown-divider"></div>

                {user ? (
                  <Link href="/profil" className="dropdown-item" onClick={() => setUserMenuOpen(false)}>
                    <User className="dropdown-item-icon" />
                    <span>Mon Profil</span>
                  </Link>
                ) : null}

                <div className="dropdown-divider"></div>
                {user ? (
                  <button className="dropdown-item dropdown-logout" onClick={handleLogout} type="button">
                    <LogOut className="dropdown-item-icon" />
                    <span>Se déconnecter</span>
                  </button>
                ) : (
                  <Link href="/auth/login" className="dropdown-item" onClick={() => setUserMenuOpen(false)}>
                    <LogOut className="dropdown-item-icon" />
                    <span>Se connecter</span>
                  </Link>
                )}
              </div>
            )}
          </div>


          {/* Mobile Menu Toggle */}
          <button 
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu mobile"
          >
            {mobileMenuOpen ? (
              <X className="mobile-menu-icon" />
            ) : (
              <Menu className="mobile-menu-icon" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu">
          <nav className="mobile-nav">
            <Link href="/" className={`mobile-nav-link ${isActive("/") ? "mobile-nav-link-active" : ""}`} onClick={() => setMobileMenuOpen(false)}>
              <Home className="mobile-nav-icon" />
              <span>Accueil</span>
            </Link>
            <Link href={formationsHref} className={`mobile-nav-link ${isActive(formationsHref) ? "mobile-nav-link-active" : ""}`} onClick={() => setMobileMenuOpen(false)}>
              <BookOpen className="mobile-nav-icon" />
              <span>Formations</span>
            </Link>
            {user?.role === 'etudiant' && (
              <Link href="/etudiant/mes-formations" className={`mobile-nav-link ${isActive("/etudiant/mes-formations") ? "mobile-nav-link-active" : ""}`} onClick={() => setMobileMenuOpen(false)}>
                <BookOpen className="mobile-nav-icon" />
                <span>Mes Formations</span>
              </Link>
            )}
            <Link href={profilHref} className={`mobile-nav-link ${isActive("/profil") ? "mobile-nav-link-active" : ""}`} onClick={() => setMobileMenuOpen(false)}>
              <span>Profil</span>
            </Link>
            <Link href="/aide" className={`mobile-nav-link ${isActive("/aide") ? "mobile-nav-link-active" : ""}`} onClick={() => setMobileMenuOpen(false)}>
              <span>Aide</span>
            </Link>
          </nav>
          {(!user || user.role === "etudiant") && (
            <div className="mobile-search">
              <Search className="mobile-search-icon" />
              <input 
                type="text" 
                placeholder="Rechercher une formation..." 
                className="mobile-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleSearch}
              />
            </div>
          )}
          <div className="mobile-user-section">
            <div className="mobile-user-info">
              <div className="mobile-user-avatar">
                <User className="mobile-user-avatar-icon" />
              </div>
              <div className="mobile-user-text">
                <span className="mobile-user-name">{displayName}</span>
                <span className="mobile-user-role">{displayRole || "Invité"}</span>
              </div>
            </div>
            {user ? (
              <button className="mobile-logout-btn" onClick={handleLogout} type="button">
                <LogOut className="mobile-logout-icon" />
                Se déconnecter
              </button>
            ) : (
              <Link href="/auth/login" className="mobile-logout-btn" onClick={() => setMobileMenuOpen(false)}>
                <LogOut className="mobile-logout-icon" />
                Se connecter
              </Link>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .header {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(229, 231, 235, 0.9);
          position: sticky;
          top: 0;
          z-index: 1000;
          box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
        }

        .container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 72px;
        }

        /* Logo */
        .logo-section {
          flex-shrink: 0;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          padding: 8px 10px;
          border-radius: 12px;
          transition: background 0.2s ease;
        }

        .logo:hover {
          background: rgba(102, 126, 234, 0.08);
        }

        .logo-icon {
          width: 36px;
          height: 36px;
          color: #667eea;
        }

        .logo-text {
          font-size: 1.5rem;
          font-weight: 800;
          color: #1a1a2e;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Desktop Navigation */
        .nav-desktop {
          display: none;
          align-items: center;
          gap: 6px;
          padding: 6px;
          border-radius: 14px;
          background: rgba(243, 244, 246, 0.7);
          border: 1px solid rgba(229, 231, 235, 0.9);
        }

        @media (min-width: 1024px) {
          .nav-desktop {
            display: flex;
          }
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          border-radius: 12px;
          font-size: 0.9375rem;
          font-weight: 600;
          color: #475569;
          text-decoration: none;
          transition: all 0.3s ease;
          position: relative;
        }

        .nav-link:hover {
          color: #0f172a;
          background: rgba(255, 255, 255, 0.75);
          box-shadow: 0 6px 16px rgba(15, 23, 42, 0.06);
        }

        .nav-link-active {
          color: #1d4ed8;
          background: rgba(255, 255, 255, 0.95);
          box-shadow: 0 8px 20px rgba(29, 78, 216, 0.10);
        }

        .nav-link-active::after {
          content: "";
          position: absolute;
          left: 12px;
          right: 12px;
          bottom: 6px;
          height: 2px;
          border-radius: 2px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .nav-icon {
          width: 18px;
          height: 18px;
        }

        /* Header Actions */
        .header-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        /* Search */
        .search-wrapper {
          display: flex;
          align-items: center;
          background: #f3f4f6;
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.3s ease;
          min-width: 44px;
          height: 44px;
          border: 1px solid rgba(229, 231, 235, 0.9);
        }

        .search-wrapper.search-open {
          background: rgba(255, 255, 255, 0.95);
          border: 2px solid rgba(102, 126, 234, 0.6);
          min-width: 300px;
          box-shadow: 0 12px 26px rgba(102, 126, 234, 0.18);
        }

        .search-toggle {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          background: transparent;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          color: #6b7280;
        }

        .search-toggle:hover {
          color: #667eea;
        }

        .search-icon {
          width: 20px;
          height: 20px;
        }

        .search-input {
          flex: 1;
          height: 100%;
          padding: 0 12px;
          border: none;
          background: transparent;
          font-size: 0.9375rem;
          color: #1a1a2e;
          opacity: 0;
          visibility: hidden;
          transition: all 0.3s ease;
          width: 0;
        }

        .search-wrapper.search-open .search-input {
          opacity: 1;
          visibility: visible;
          width: auto;
        }

        .search-input:focus {
          outline: none;
        }

        .search-input::placeholder {
          color: #9ca3af;
        }

        /* Action Buttons */
        .action-btn {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          background: #f3f4f6;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          color: #6b7280;
          border: 1px solid rgba(229, 231, 235, 0.9);
        }

        .action-btn:hover {
          background: #e5e7eb;
          color: #0f172a;
          transform: translateY(-1px);
        }

        .action-icon {
          width: 20px;
          height: 20px;
        }

        .notification-badge {
          position: absolute;
          top: 4px;
          right: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 20px;
          height: 20px;
          padding: 0 6px;
          background: #ef4444;
          color: white;
          font-size: 0.6875rem;
          font-weight: 600;
          border-radius: 10px;
          border: 2px solid white;
        }

        /* User Menu */
        .user-menu-container {
          position: relative;
        }

        .user-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          width: auto;
          box-shadow: 0 10px 24px rgba(102, 126, 234, 0.20);
          border: 1px solid rgba(255, 255, 255, 0.18);
        }

        .user-btn:hover {
          background: linear-gradient(135deg, #5568d3 0%, #65408f 100%);
          transform: translateY(-1px);
          box-shadow: 0 14px 30px rgba(102, 126, 234, 0.26);
        }

        .user-avatar {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 6px;
        }

        .user-icon {
          width: 18px;
          height: 18px;
        }

        .dropdown-icon {
          width: 16px;
          height: 16px;
          transition: transform 0.3s ease;
        }

        .dropdown-icon.dropdown-open {
          transform: rotate(180deg);
        }

        .user-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          min-width: 260px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 24px 60px rgba(15, 23, 42, 0.18);
          border: 1px solid rgba(226, 232, 240, 0.9);
          overflow: hidden;
          z-index: 1001;
          animation: slideDown 0.2s ease;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .dropdown-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border-bottom: 1px solid rgba(226, 232, 240, 0.9);
        }

        .dropdown-avatar {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 12px;
        }

        .dropdown-avatar-icon {
          width: 24px;
          height: 24px;
        }

        .dropdown-user-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .dropdown-name {
          font-size: 0.9375rem;
          font-weight: 600;
          color: #1a1a2e;
        }

        .dropdown-email {
          font-size: 0.8125rem;
          color: #6b7280;
        }

        .dropdown-divider {
          height: 1px;
          background: #e5e7eb;
          margin: 0;
        }

        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 12px 16px;
          background: transparent;
          border: none;
          font-size: 0.9375rem;
          font-weight: 500;
          color: #334155;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s ease;
          text-decoration: none;
        }

        .dropdown-item:hover {
          background: #f8fafc;
          color: #0f172a;
        }

        .dropdown-item-icon {
          width: 18px;
          height: 18px;
          color: #9ca3af;
        }

        .dropdown-item:hover .dropdown-item-icon {
          color: #667eea;
        }

        .dropdown-logout {
          color: #ef4444;
        }

        .dropdown-logout:hover {
          background: #fef2f2;
        }

        .dropdown-logout .dropdown-item-icon {
          color: #ef4444;
        }

        /* Mobile Menu Button */
        .mobile-menu-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          background: #f3f4f6;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          color: #64748b;
          transition: all 0.3s ease;
          border: 1px solid rgba(229, 231, 235, 0.9);
        }

        .mobile-menu-btn:hover {
          background: #e5e7eb;
          color: #0f172a;
          transform: translateY(-1px);
        }

        .mobile-menu-icon {
          width: 24px;
          height: 24px;
        }

        @media (min-width: 1024px) {
          .mobile-menu-btn {
            display: none;
          }
        }

        /* Mobile Menu */
        .mobile-menu {
          display: flex;
          flex-direction: column;
          padding: 20px 24px;
          border-top: 1px solid rgba(226, 232, 240, 0.9);
          background: rgba(255, 255, 255, 0.95);
          animation: slideDown 0.3s ease;
        }

        @media (min-width: 1024px) {
          .mobile-menu {
            display: none;
          }
        }

        .mobile-nav {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-bottom: 20px;
        }

        .mobile-nav-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          border-radius: 10px;
          font-size: 1rem;
          font-weight: 600;
          color: #475569;
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .mobile-nav-link:hover {
          background: #f8fafc;
          color: #0f172a;
        }

        .mobile-nav-link-active {
          background: linear-gradient(135deg, #eff6ff 0%, #ede9fe 100%);
          color: #667eea;
        }

        .mobile-nav-icon {
          width: 20px;
          height: 20px;
        }

        .mobile-search {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          background: rgba(243, 244, 246, 0.85);
          border-radius: 10px;
          margin-bottom: 20px;
          border: 1px solid rgba(229, 231, 235, 0.9);
        }

        .mobile-search-icon {
          width: 20px;
          height: 20px;
          color: #9ca3af;
        }

        .mobile-search-input {
          flex: 1;
          background: transparent;
          border: none;
          font-size: 1rem;
          color: #1a1a2e;
        }

        .mobile-search-input:focus {
          outline: none;
        }

        .mobile-search-input::placeholder {
          color: #9ca3af;
        }

        .mobile-user-section {
          padding-top: 20px;
          border-top: 1px solid rgba(226, 232, 240, 0.9);
        }

        .mobile-user-info {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }

        .mobile-user-avatar {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 12px;
        }

        .mobile-user-avatar-icon {
          width: 24px;
          height: 24px;
        }

        .mobile-user-text {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .mobile-user-name {
          font-size: 1rem;
          font-weight: 600;
          color: #1a1a2e;
        }

        .mobile-user-role {
          font-size: 0.875rem;
          color: #6b7280;
        }

        .mobile-logout-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          width: 100%;
          padding: 14px;
          background: #fef2f2;
          border: none;
          border-radius: 10px;
          color: #ef4444;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .mobile-logout-btn:hover {
          background: #fee2e2;
        }

        .mobile-logout-icon {
          width: 20px;
          height: 20px;
        }
      `}</style>
    </header>
  );
}
