import { useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { useRouter } from "next/router";

export default function PrivateRoute({ children, roles }) {
  const { user } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    // Si pas connecté ou rôle non autorisé → redirige vers 403
    if (!user || (roles && !roles.includes(user.role))) {
      router.push("/errors/403");
    }
  }, [user]);

  // Si utilisateur pas encore chargé ou non autorisé → rien n’affiche
  if (!user || (roles && !roles.includes(user.role))) return null;

  return children;
}
