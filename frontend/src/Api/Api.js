import axios from "axios";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import dayjs from "dayjs";

const baseURL = "http://localhost:8000/";

const getAccessToken = () => localStorage.getItem("accessToken") || "";
const getRefreshToken = () => localStorage.getItem("refreshToken") || "";

const api = axios.create({
  baseURL,
  withCredentials: true,  
  headers: {
    Authorization: getAccessToken() ? `Bearer ${getAccessToken()}` : "",
    "Content-Type": "application/json",
    "X-CSRFToken": Cookies.get("csrftoken") || "",  
  },
});

api.interceptors.request.use(async (req) => {
  const accessToken = getAccessToken();
  const refreshToken = getRefreshToken();

  if (accessToken) {
    req.headers.Authorization = `Bearer ${accessToken}`;
    const user = jwtDecode(accessToken);
    const isExpired = dayjs.unix(user.exp).diff(dayjs()) < 1;

    if (!isExpired) return req;

    try {
      const resp = await axios.post(`${baseURL}token/refresh/`, { refresh: refreshToken });
      console.log(" Nouveau token d'accès: ", resp.data.access);
      localStorage.setItem("accessToken", resp.data.access);
      req.headers.Authorization = `Bearer ${resp.data.access}`;
    } catch (err) {
      console.error(" Erreur lors du rafraîchissement du token", err);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      window.location.href = "/";  
    }
  }

  return req;
});


const ApiService = {
 

  addUser: (userData) => api.post("users/register/", userData),
  getProfile: () => api.get("users/profile/"),

  updateProfile: (userData) => api.patch("users/update-profile/", userData),
  getAllUsers: (params = {}) => api.get("users/", { params }),
  deleteUser: (id) => api.delete(`users/usersdetail/${id}/`),
  getUserById: (id) => api.get(`users/usersdetail/${id}/`),
  updateUser: (id, userData) => api.patch(`users/usersdetail/${id}/`, userData),
  getClients: () => api.get("users/clients/"),
  getInstallateurs: () => api.get("users/installateurs/"),
  logout: async () => {
    const refreshToken = getRefreshToken();

    if (!refreshToken) {
      console.error("Aucun token de rafraîchissement trouvé !");
      return;
    }

    try {
      await api.post("users/logout/", { refresh_token: refreshToken });

      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      console.log("Déconnexion réussie !");
      
      window.location.href = "/";  
    } catch (error) {
      console.error("Erreur lors de la déconnexion :", error);
    }
  },
  //Insttalation
  ajouterInstallation: (data) => api.post("installations/ajouter-installation/", data),


  //notification
  getNotifications: () => api.get("notification/get-my-notifications/"),
  markAsRead: (id) => api.patch(`notification/mark-read/${id}/`),
  markAllAsRead: () => api.patch("notification/mark-all-read/"),
  deleteNotification: (id) => api.delete(`notification/delete/${id}/`),


  // historique
  exportHistorique: {
    getExports: () => api.get("historique/liste/"),
    creerExport: (format = "csv", installationId) =>
      api.post("historique/creer-export/", {format, installation_id: installationId, }),
    creerExportGlobal: (params) =>
      api.post("historique/export-global/", params),
      deleteExport: (id) => api.delete(`historique/supprimer/${id}/`),
      creerExportGlobalUtilisateurs: (params) =>
        api.post("historique/export-utilisateurs/", params),
  }
  
};

export default ApiService;
