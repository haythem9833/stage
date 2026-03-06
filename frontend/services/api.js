import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

export const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// Intercepteur pour ajouter le token JWT à chaque requête
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Erreur interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/auth/login";
    }
    return Promise.reject(error);
  }
);

// --- AUTHENTIFICATION ---
export const login = (data) => api.post("/login", data);
export const register = (data) => api.post("/register", data);
export const logout = () => api.post("/logout");
export const getProfile = () => api.get("/profile");
export const changePassword = (data) => api.post("/change-password", data);

// --- FORMATIONS ---
export const getFormations = () => api.get("/formations");
export const getFormation = (id) => api.get(`/formations/${id}`);
export const createFormation = (data) => api.post("/formations", data);
export const updateFormation = (id, data) => api.put(`/formations/${id}`, data);
export const deleteFormation = (id) => api.delete(`/formations/${id}`);
export const startFormation = (id) => api.post(`/formations/${id}/start`);
export const completeFormation = (id) => api.post(`/formations/${id}/complete-all`);

// --- SESSIONS ---
export const getSessions = () => api.get("/sessions");
export const getSession = (id) => api.get(`/sessions/${id}`);
export const createSession = (data) => api.post("/sessions", data);
export const updateSession = (id, data) => api.put(`/sessions/${id}`, data);
export const deleteSession = (id) => api.delete(`/sessions/${id}`);
export const validateSession = (id) => api.post(`/sessions/${id}/validate`);
export const terminateSession = (id) => api.post(`/sessions/${id}/terminate`);

// --- INSCRIPTIONS ---
export const getInscriptions = () => api.get("/inscriptions");
export const getInscription = (id) => api.get(`/inscriptions/${id}`);
export const createInscription = (data) => api.post("/inscriptions", data);
export const updateInscription = (id, data) => api.put(`/inscriptions/${id}`, data);
export const deleteInscription = (id) => api.delete(`/inscriptions/${id}`);
export const validateInscription = (id) => api.post(`/inscriptions/${id}/validate`);
export const cancelInscription = (id) => api.post(`/inscriptions/${id}/cancel`);
export const completerInscription = (id) => api.post(`/inscriptions/${id}/completer`);
export const getMyInscriptions = () => api.get("/my-inscriptions");

// --- CERTIFICATS ---
export const getCertificats = () => api.get("/certificats");
export const getCertificat = (id) => api.get(`/certificats/${id}`);
export const generateCertificat = (id) => api.post(`/certificats/${id}/generate`);
export const downloadCertificat = (id) => api.get(`/certificats/${id}/download`);
export const getMyCertificats = () => api.get("/my-certificats");

// --- UTILISATEURS ---
export const getUsers = () => api.get("/users");
export const getUser = (id) => api.get(`/users/${id}`);
export const createUser = (data) => api.post("/users", data);
export const updateUser = (id, data) => api.put(`/users/${id}`, data);
export const deleteUser = (id) => api.delete(`/users/${id}`);

// --- APPROVALS (ADMIN) ---
export const getRoleRequests = () => api.get("/admin/role-requests");
export const approveRoleRequest = (id) => api.post(`/admin/role-requests/${id}/approve`);
export const rejectRoleRequest = (id) => api.post(`/admin/role-requests/${id}/reject`);

// --- STATISTIQUES ---
export const getStats = () => api.get("/stats");
export const getDashboard = () => api.get("/admin/dashboard");

// --- FORMATEUR ENDPOINTS ---
export const getFormationsSessions = () => api.get("/formateur/sessions");
export const getFormateursInscriptions = () => api.get("/formateur/inscriptions");
export const getFormateurssCertificats = () => api.get("/formateur/certificats");

// --- PRESENCES (now linked to formations, not sessions) ---
export const getPresences = (formationId) => api.get(`/formations/${formationId}/presences`);
export const getPresence = (id) => api.get(`/presences/${id}`);
export const batchRecordPresences = (formationId, data) => 
  api.post(`/formations/${formationId}/presences/batch`, data);
export const getPresenceSynthese = (formationId) => api.get(`/formations/${formationId}/presences/synthese`);
export const getAbsentByDate = (formationId, date) => 
  api.get(`/formations/${formationId}/presences/absents-par-date?date=${date}`);
export const getAbsentTotal = (formationId) => api.get(`/formations/${formationId}/presences/absents-total`);
export const justifyAbsence = (presenceId, data) => api.put(`/presences/${presenceId}/justifier`, data);

// --- V2.0 DASHBOARD (ADMIN) ---
export const getDashboardStats = () => api.get("/admin/dashboard-v2/stats");
export const getFormationsStats = () => api.get("/admin/dashboard-v2/formations-stats");
export const getPresencesStats = () => api.get("/admin/dashboard-v2/presences-stats");

// --- V2.0 RAPPORTS & HISTORIQUE (PRIORITY 2) ---
export const getMyHistory = () => api.get("/rapports/historique");
export const getParticipantHistory = (id) => api.get(`/rapports/participants/${id}/historique`);
export const getAllParticipantsHistory = (role = 'etudiant') => 
  api.get(`/rapports/admin/participants-historique?role=${role}`);
export const exportPresencesCSV = (formationId) => api.get(`/rapports/presences/export-csv?formation_id=${formationId}`);
export const exportFormationsCSV = () => api.get("/rapports/formations/export-csv");
export const exportInscriptionsCSV = (sessionId = null) => 
  api.get(`/rapports/inscriptions/export-csv${sessionId ? `?session_id=${sessionId}` : ""}`);
export const getSessionBilan = (id) => api.get(`/rapports/bilan-session/${id}`);
export const getPeriodBilan = (dateDebut, dateFin) => 
  api.get(`/rapports/bilan-periode?date_debut=${dateDebut}&date_fin=${dateFin}`);

export default api;
