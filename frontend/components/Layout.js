import Link from "next/link";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useRouter } from "next/router";

export default function Layout({ children, role }) {
  const { user, logoutUser } = useContext(AuthContext);
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
    
    // Toggle sidebar
    const sidebarToggle = document.querySelector("#sidebarToggle");
    if (sidebarToggle) {
      sidebarToggle.addEventListener("click", (e) => {
        e.preventDefault();
        document.body.classList.toggle("sb-sidenav-toggled");
      });
    }
  }, []);

  const handleLogout = () => {
    logoutUser();
    router.push("/auth/login");
  };

  if (!isHydrated) {
    return (
      <div id="layoutSidenav">
        <div id="layoutSidenav_nav">
          <nav className="sb-sidenav accordion sb-sidenav-dark" id="sidenavAccordion">
            <div className="sb-sidenav-menu">
              <div className="nav">
                <div className="sb-sidenav-menu-heading">Navigation</div>
              </div>
            </div>
          </nav>
        </div>
        <div id="layoutSidenav_content">
          <nav className="sb-topnav navbar navbar-expand navbar-dark bg-dark">
            <Link href="/" className="navbar-brand ps-3">
              CNI Formation
            </Link>
            <button
              className="btn btn-link btn-sm order-lg-0"
              id="sidebarToggle"
              href="#!"
            >
              <i className="fas fa-bars"></i>
            </button>
            <div className="ms-auto me-3">
              <span className="text-light">Chargement...</span>
            </div>
          </nav>
          <main>{children}</main>
          <footer className="py-4 bg-light mt-auto">
            <div className="container-fluid px-4">
              <div className="d-flex align-items-center justify-content-between small">
                <div className="text-muted">Copyright &copy; CNI Formations 2026</div>
              </div>
            </div>
          </footer>
        </div>
      </div>
    );
  }

  return (
    <div id="layoutSidenav">
      {/* Sidebar */}
      <div id="layoutSidenav_nav">
        <nav className="sb-sidenav accordion sb-sidenav-dark" id="sidenavAccordion">
          <div className="sb-sidenav-menu">
            <div className="nav">
              <div className="sb-sidenav-menu-heading">Navigation</div>
              
              {role === "admin" && (
                <>
                  <Link href="/admin/dashboard" className="nav-link">
                    <div className="sb-nav-link-icon">
                      <i className="fas fa-tachometer-alt"></i>
                    </div>
                    Dashboard
                  </Link>
                  <Link href="/admin/formations" className="nav-link">
                    <div className="sb-nav-link-icon">
                      <i className="fas fa-book"></i>
                    </div>
                    Formations
                  </Link>
                  <Link href="/admin/users" className="nav-link">
                    <div className="sb-nav-link-icon">
                      <i className="fas fa-users"></i>
                    </div>
                    Utilisateurs
                  </Link>
                </>
              )}

              {role === "formateur" && (
                <>
                  <Link href="/formateur/dashboard" className="nav-link">
                    <div className="sb-nav-link-icon">
                      <i className="fas fa-tachometer-alt"></i>
                    </div>
                    Dashboard
                  </Link>
                  <Link href="/formateur/mes-formations" className="nav-link">
                    <div className="sb-nav-link-icon">
                      <i className="fas fa-book"></i>
                    </div>
                    Mes Formations
                  </Link>
                  <Link href="/formateur/etudiants" className="nav-link">
                    <div className="sb-nav-link-icon">
                      <i className="fas fa-users"></i>
                    </div>
                    Étudiants
                  </Link>
                </>
              )}

              {role === "etudiant" && (
                <>
                  <Link href="/etudiant/dashboard" className="nav-link">
                    <div className="sb-nav-link-icon">
                      <i className="fas fa-tachometer-alt"></i>
                    </div>
                    Dashboard
                  </Link>
                  <Link href="/etudiant/mes-formations" className="nav-link">
                    <div className="sb-nav-link-icon">
                      <i className="fas fa-book"></i>
                    </div>
                    Mes Formations
                  </Link>
                  <Link href="/etudiant/formations" className="nav-link">
                    <div className="sb-nav-link-icon">
                      <i className="fas fa-plus-circle"></i>
                    </div>
                    Explorer Formations
                  </Link>
                  <Link href="/etudiant/certificats" className="nav-link">
                    <div className="sb-nav-link-icon">
                      <i className="fas fa-certificate"></i>
                    </div>
                    Certificats
                  </Link>
                </>
              )}

              <div className="sb-sidenav-menu-heading">Profil</div>
              <Link href="/profil" className="nav-link">
                <div className="sb-nav-link-icon">
                  <i className="fas fa-user"></i>
                </div>
                Mon Profil
              </Link>
              <a onClick={handleLogout} className="nav-link" style={{ cursor: "pointer" }}>
                <div className="sb-nav-link-icon">
                  <i className="fas fa-sign-out-alt"></i>
                </div>
                Déconnexion
              </a>
            </div>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div id="layoutSidenav_content">
        {/* Topnav */}
        <nav className="sb-topnav navbar navbar-expand navbar-dark bg-dark">
          <Link href="/" className="navbar-brand ps-3">
            CNI Formation
          </Link>
          <button
            className="btn btn-link btn-sm order-lg-0"
            id="sidebarToggle"
            href="#!"
          >
            <i className="fas fa-bars"></i>
          </button>
          <div className="ms-auto me-3">
            <span className="text-light">
              {user?.nom} {user?.prenom}
            </span>
          </div>
        </nav>

        {/* Page Content */}
        <main>{children}</main>

        {/* Footer */}
        <footer className="py-4 bg-light mt-auto">
          <div className="container-fluid px-4">
            <div className="d-flex align-items-center justify-content-between small">
              <div className="text-muted">Copyright &copy; CNI Formations 2026</div>
              <div>
                <a href="#!">Privacy Policy</a>
                &middot;
                <a href="#!">Terms &amp; Conditions</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
