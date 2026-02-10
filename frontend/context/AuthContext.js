import { createContext, useState } from "react";
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Fonction helper pour décoder un token en toute sécurité
  const decodeToken = (token) => {
    try {
      // Les tokens Sanctum ne sont pas des JWT (pas 3 parties)
      // Ils sont juste des chaînes aléatoires
      // On les accepte comme valides sans les décoder
      if (token && typeof token === "string" && token.length > 0) {
        // Vérifier si c'est un JWT (3 parties séparées par des points)
        if (token.split(".").length === 3) {
          return jwtDecode(token);
        }
        // Sinon c'est un token Sanctum, retourner un objet vide
        // car on recuperera l'user depuis le backend
        return { token: token };
      }
    } catch (error) {
      console.error("Erreur décodage token:", error);
      return null;
    }
    return null;
  };

  const [user, setUser] = useState(() => {
    if (typeof window !== "undefined") {
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        try {
          return JSON.parse(savedUser);
        } catch (e) {
          return null;
        }
      }
    }
    return null;
  });

  const [token, setToken] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token");
    }
    return null;
  });

  // Fonction pour connecter un utilisateur
  const loginUser = (authToken, userData = null) => {
    if (authToken && typeof authToken === "string") {
      localStorage.setItem("token", authToken);
      setToken(authToken);
      
      // Si userData est fourni, l'utiliser et le sauvegarder
      if (userData) {
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
      } else {
        // Sinon, essayer de décoder le token
        const decoded = decodeToken(authToken);
        if (decoded) {
          setUser(decoded);
        }
      }
    }
  };

  // Fonction pour déconnecter un utilisateur
  const logoutUser = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};
