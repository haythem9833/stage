import { AuthProvider } from '../context/AuthContext';
import '../styles/globals.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import Header from "../components/Header";
import { useRouter } from "next/router";

export default function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const pathname = router?.pathname || "";
  const isDashboardRoute =
    pathname === "/admin/dashboard" ||
    pathname === "/formateur/dashboard" ||
    pathname === "/etudiant/dashboard";

  return (
    <AuthProvider>
      {!isDashboardRoute && <Header />}
      <Component {...pageProps} />
    </AuthProvider>
  );
}
