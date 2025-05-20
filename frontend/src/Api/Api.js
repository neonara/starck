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
      console.log("Nouveau token d'accès: ", resp.data.access);
      localStorage.setItem("accessToken", resp.data.access);
      req.headers.Authorization = `Bearer ${resp.data.access}`;
    } catch (err) {
      console.error("Erreur lors du rafraîchissement du token", err);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      window.location.href = "/";  
    }
  }

  return req;
});

const ApiService = {
  // Utilisateur
  
  addUser: (userData) => api.post("users/register/", userData),
  getProfile: () => api.get("users/profile/"),
  updateProfile: (userData) => api.patch("users/update-profile/", userData),
  getAllUsers: (params = {}) => api.get("users/", { params }),
  deleteUser: (id) => api.delete(`users/usersdetail/${id}/`),
  getUserById: (id) => api.get(`users/usersdetail/${id}/`),
  updateUser: (id, userData) => api.patch(`users/usersdetail/${id}/`, userData),
  getClients: () => api.get("users/clients/"),
  getInstallateurs: () => api.get("users/installateurs/"),
  getTechnicien: () => api.get("users/techniciens/"),
resendRegistrationLink: (email) => api.post("users/resend-registration-link/", { email }),

//dashboard

getUserStats: () => api.get("users/stats/"),
getInstallationStats: () => api.get("installations/statistiques/"),


  // Déconnexion
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

  // Installation
  ajouterInstallation: (data) =>
    api.post("installations/ajouter-installation/", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

    getInstallations: (params = {}) => api.get("installations/installations/", { params }),
    deleteInstallation: (id) => api.delete(`installations/supprimer-installation/${id}/`),
    getInstallationById: (id) => api.get(`installations/detail-installation/${id}/`),
    updateInstallation: (id, data) =>
      api.put(`installations/modifier-installation/${id}/`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }),


    
    updateInstallation: (id, data) => api.put(`installations/modifier-installation/${id}/`, data),
    getInstallationStats: () => api.get("installations/statistiques/"),

    getInstallationsGeoData: () => api.get("installations/geodata/"),

  // Notifications
  getNotifications: () => api.get("notification/get-my-notifications/"),
  markAsRead: (id) => api.patch(`notification/mark-read/${id}/`),
  markAllAsRead: () => api.patch("notification/mark-all-read/"),
  deleteNotification: (id) => api.delete(`notification/delete/${id}/`),


  //code alarme
  getAlarmeCodes: (params = {}) => api.get("alarme/codes/liste/", { params }),
addAlarmeCode: (data) => api.post("alarme/codes/ajouter/", data),
updateAlarmeCode: (id, data) => api.put(`alarme/codes/modifier/${id}/`, data),
deleteAlarmeCode: (id) => api.delete(`alarme/codes/supprimer/${id}/`),
getAlarmeCodeById: (id) => api.get(`alarme/codes/detail/${id}/`),
//Alarme décleché
getAlarmesDeclenchees: (params = {}) =>
  api.get("alarme/liste/", { params }),

getAlarmeDeclencheeById: (id) =>
  api.get(`alarme/detail/${id}/`),

ajouterAlarmeDeclenchee: (data) =>
  api.post("alarme/ajouter/", data),

modifierAlarmeDeclenchee: (id, data) => api.patch(`alarme/modifier/${id}/`, data),

supprimerAlarmeDeclenchee: (id) =>
  api.delete(`alarme/supprimer/${id}/`),



getStatistiquesAlarmes: (id) => api.get(`alarme/stats/${id}/`),

getStatistiquesAlarmesglobale: () => api.get(`alarme/stats/`),

  // Historique
  exportHistorique: {
    getExports: () => api.get("historique/liste/"),
    creerExport: (format = "csv", installationId) =>
      api.post("historique/creer-export/", { format, installation_id: installationId }),
    creerExportGlobal: (params) =>
      api.post("historique/export-global/", params),
    exportAlarmeCodes: (format = "csv") =>
      api.post("historique/export-alarmecodes/", { format }),
    exportAlarmesDeclenchees: (format = "csv") =>
      api.post("historique/export-alarmes-declenchees/", { format }),
    deleteExport: (id) => api.delete(`historique/supprimer/${id}/`),
    creerExportGlobalUtilisateurs: (params) =>
      api.post("historique/export-utilisateurs/", params),


exportInterventions: (data) => api.post("historique/exports/interventions/", data),
  exportEntretiens: (format) =>
    api.post("/historique/exports/entretiens/", { format }),
  exportReclamations: (format) => api.post("historique/export/reclamations/", { format }),
exportInstallationsGlobal: (format = "csv") =>
  api.post("historique/export-global/", { format }),


  },


// Production
ajouterDonnees: (prodData) => api.post("ajouter_prod/", prodData), 
listeProduction: () => api.get("list_prod/"), 
statistiquesProduction: (installationId) => api.get(`production/statistiques/${installationId}/`),  // Statistiques pour une installation
statistiquesGlobales: () => api.get("production/statistiques/globales/"),  // Statistiques globales


// Interventions
getInterventions: (params = {}) => api.get("intervention/interventions/", { params }),
createIntervention: (data) => api.post("intervention/interventions/creer/", data),
getInterventionDetail: (id) => api.get(`intervention/interventions/${id}/`),
updateIntervention: (id, data) => api.put(`intervention/interventions/${id}/modifier/`, data),
deleteIntervention: (id) => api.delete(`intervention/interventions/${id}/supprimer/`),
changeInterventionStatus: (id, status) => api.patch(`intervention/interventions/${id}/changer-statut/`, { status }),
getInterventionsClient: () => {
  return api.get("intervention/client/interventions/");
},
getInterventionDetailClient: (id) => {
  return api.get(`intervention/client/interventions/${id}/`);
},
exportInterventionsCSV: (params = {}) =>
  api.get("intervention/interventions/export/csv/", {
    params,
    responseType: 'blob'
  }),

exportEquipements: (format = "csv") =>
  api.post("historique/export-equipements/", { format }),




//Entretien
getAllEntretiens: (params = {}) => api.get("entretien/entretiens/", { params }),
createEntretien: (data) => api.post("entretien/entretiens/", data),
getEntretien: (id) => api.get(`entretien/entretiens/${id}/`),
updateEntretien: (id, data) => api.put(`entretien/entretiens/${id}/`, data),
deleteEntretien: (id) => api.delete(`entretien/entretiens/${id}/`),
getEntretienCalendar: (params) => api.get("entretien/entretiens/calendar/", { params }),
getEntretienStats: () => api.get("entretien/entretien/statistiques/"),

//technicien
ajouterRappelEntretien: (entretienId, rappel_datetime) =>
  api.post(`entretien/entretiens/${entretienId}/rappel/`, { rappel_datetime }),
getMesEntretiens: () => api.get("entretien/entretiens/mes-entretiens/"),
getEntretiensTechnicien: () =>
  api.get("entretien/technicien/entretiens/"),
updateStatutEntretien: (id, statut) =>
  api.patch(`entretien/entretien/modifier-statut-technicien/${id}/`, { statut }),

getEntretiensClient: () => {
  return api.get("entretien/client/entretiens/");
},
getEntretienDetail: (id) => {
  return api.get(`entretien/client/entretiens/${id}/`);
},

getMesEntretiens7Jours: () => api.get("entretien/mes-entretiens-7-jours/"),


getActivitesMensuellesTechnicien: () => {
  return api.get("entretien/dashboard/technicien/activites-mensuelles/");
},
//Reclamation
getReclamations: (params = {}) => api.get("reclamation/reclamations/", { params }),
updateReclamation: (id, data) =>
  api.put(`reclamation/reclamations/${id}/`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  }),
envoyerReclamation: (data) =>
  api.post("reclamation/reclamations/envoyer/", data, {
    headers: { "Content-Type": "multipart/form-data" },
  }),
getMesReclamations: () => api.get("reclamation/mes-reclamations/"),
deleteReclamation: (id) => api.delete(`reclamation/reclamations/${id}/supprimer/`),



//client
getInstallationClient:(params = {}) => api.get("installations/installation-client/", { params }),
statistiquesInstallationClient: () => api.get("production/statistiques-installation-client/"),
getStatistiquesAlarmesClient: () => api.get("alarme/stats-client/"),



//Rapports
rapports: {
  getRapportProductionMensuelle: (installationId, mois) =>
    api.get(`rapports/rapports/production-mensuelle/?installation_id=${installationId}&mois=${mois}`),
 
  exportRapportProduction: (params) =>
    api.post("rapports/rapports/export-production/", params),

  exportRapportProductionPDF: (params) =>
    api.post("rapports/rapports/export-production-pdf/", params, {
      responseType: "blob",
    }),

  getRapportConsommationMensuelle: (installationId, mois) =>
    api.get(`rapports/rapports/consommation-mensuelle/?installation_id=${installationId}&mois=${mois}`),
  
  exportRapportConsommation: (params) =>
    api.post("rapports/rapports/export-consommation/", params, {
      responseType: "blob",
    }),

  exportRapportConsommationPDF: (params) =>
    api.post("rapports/rapports/export-consommation-pdf/", params, {
      responseType: "blob",
    }),

  getRapportAlarmesMensuelles: (installationId, mois) =>
    api.get(`rapports/rapports/alarme-mensuelle/`, {
    params: { installation_id: installationId, mois },
  }),

  exportRapportAlarmesExcel: (params) =>
    api.post("rapports/rapports/export-alarmes-excel/", params, {
      responseType: "blob"
    }),
  
  exportRapportAlarmesPDF: (params) =>
    api.post("rapports/rapports/export-alarmes-pdf/", params, { responseType: "blob" }),

  getProductionClient: (mois) => api.get(`rapports/client/rapport/production?mois=${mois}`),
  getConsommation: (mois) => api.get(`rapports/client/rapport/consommation?mois=${mois}`),
  getAlarmes: (mois) => api.get(`rapports/client/rapport/alarmes?mois=${mois}`),

  exportProductionExcel: (mois) => api.post(`rapports/client/export/production/excel`, { mois }, { responseType: "blob" }),
  exportConsommationExcel: (mois) => api.post(`rapports/client/export/consommation/excel`, { mois }, { responseType: "blob" }),
  exportAlarmesExcel: (mois) => api.post(`rapports/client/export/alarmes/excel`, { mois }, { responseType: "blob" }),

  exportProductionPDF: (mois) => api.post(`rapports/client/export/production/pdf`, { mois }, { responseType: "blob" }),
  exportConsommationPDF: (mois) => api.post(`rapports/client/export/consommation/pdf`, { mois }, { responseType: "blob" }),
  exportAlarmesPDF: (mois) => api.post(`rapports/client/export/alarmes/pdf`, { mois }, { responseType: "blob" }),
    
},

//Installateur
getMyClients: () => api.get("users/myclients/"),
getInstallationsByInstallateur: () => api.get("installations/mes-installations/"),
getInstallationsGeoDataInstallateur: () => api.get("installations/mes-installations-geo/"),
getMesInterventions: (params) => api.get("intervention/interventions/mes-interventions/", { params }),
getMesEntretiensInstallateur: () => api.get("entretien/entretiens/mes-entretiens-installateur/"),
getCalendarEntretiensInstallateur: (params) => api.get("entretien/entretiens/calendar-installateur/", { params }),
getAlarmesInstallateur: () => api.get("alarme/statistiques-installateur/"),
getReclamationsInstallateur: () =>api.get("reclamation/reclamations/installateur/"),

getStatistiquesInstallateurProduction: () => api.get("production/statistiques-installateur/"),

//equipement

  ajouterEquipement: (data) => api.post("equipements/ajouter/", data),
  modifierEquipement: (id, data) => api.put(`equipements/modifier/${id}/`, data),
  supprimerEquipement: (id) => api.delete(`equipements/supprimer/${id}/`),
  getEquipementsParInstallation: (installationId) => api.get(`equipements/installation/${installationId}/`),
  getDetailsEquipement: (id) => api.get(`equipements/details/${id}/`),
getEquipementParQRCode: (code) =>
  api.get(`/equipements/qrcode/${code}/`),


};

export default ApiService;
