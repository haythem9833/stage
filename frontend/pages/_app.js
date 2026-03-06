import { AuthProvider } from '../context/AuthContext';
import '../styles/globals.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import Header from "../components/Header";
import { useRouter } from "next/router";

function MyAppContent({ Component, pageProps }) {
  const router = useRouter();
  const pathname = router?.pathname || "";
  
  const isDashboardRoute =
    pathname === "/admin/dashboard" ||
    pathname === "/formateur/dashboard" ||
    pathname === "/etudiant/dashboard";

  return (
    <>
      {!isDashboardRoute && <Header />}
      <Component {...pageProps} />
    </>
  );
}

export default function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <MyAppContent Component={Component} pageProps={pageProps} />
    </AuthProvider>
  );
}
