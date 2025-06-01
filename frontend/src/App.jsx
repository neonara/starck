import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AppLayout from './components/layout/AppLayout';
import './App.css'
import "flowbite";
import "./index.css";
import 'leaflet/dist/leaflet.css';


// Authentification
import RegisterAdmin from "./components/Authentification/RegisterAdmin";
import Login from './components/Authentification/Login';
import UserManagement from './components/Authentification/UserManagement';
import CompleteRegistration from './components/Authentification/CompleteRegistration';
import ForgotPassword from './components/Authentification/ForgotPassword';
import ResetPassword from'./components/Authentification/ResetPassword';

import UpdateProfile from './components/Authentification/UpdateProfile';

// Admin 
import Dashboard from './components/Admin-dashboard/Dashboard';
import ClientDashboard from"./components/Client-dashboard/ClientDashboard";

//Insttalation
import ListeInstallationPage from "./components/Installations/liste-installations";
import AjouterInstallation from "./components/Installations/ajouter-installation";
import DashboardInstallation from "./components/Installations/DashboardInstallation";
import EditInstallation from "./components/Installations/modifier-installation";
//Clients
import ListeClientsPage from "./components/Utilisateurs/Clients/Liste-Client";
import ModifierClientPage from "./components/Utilisateurs/Clients/modifier-client";
import CalendrierEntretiensClient from "./components/Entretien/CalendrierEntretiensClient.jsx";


//notifications
import NotificationsPage from "./components/notifications/notifications";
//historique
//Alarmes
import ListeCodesAlarmes from "./components/Alarmes/Code-alarmes/ListeCodesAlarmes";
import AjouterCodeAlarmePage from "./components/Alarmes/Code-alarmes/AjouterCodeAlarmePage";
import ListeAlarmesDeclenchees from "./components/Alarmes/AlarmesDeclenche/ListeAlarmesDeclenchees";

//intervention
import ListeInterventions from "./components/Intervention/ListeInterventions";

import AjouterInterventionPage from "./components/Intervention/AjouterInterventionPage"; 
import ModifierInterventionPage from "./components/Intervention/ModifierInterventionPage";
import DetailleIntervention from "./components/Intervention/DetailleIntervention";
//entretien
import ListeEntretiensPage from "./components/Entretien/ListeEntretiensPage";
import FormulaireEntretien from "./components/Entretien/FormulaireEntretien";
import EntretienDetailModal from "./components/Entretien/EtretienDetailModal";
import ModifierEntretienPage from "./components/Entretien/ModifierEntretienPage";
import CalendrierEntretiens from "./components/Entretien/CalendrierEntretiens";

import ListeEntretiensClient from "./components/Entretien/ListeEntretiensClient.jsx";
import DetailleEntretienClient from "./components/Entretien/DetailleEntretienClient.jsx";

 
//Reclamations
import ListeReclamationsPage from "./components/Reclamation/ListeReclamationPage";
import ModifierReclamationPage from "./components/Reclamation/ModifierReclamationPage";
import ReclamationClient from "./components/Client-dashboard/ReclamationClient";

//Rapports
import RapportProductionPage from "./components/Rapports/RapportProductionPage";
import RapportConsommationPage from"./components/Rapports/RapportConsommationPage";
import InstallationMap from "./components/Installations/InstallationMap";
//client
import HistoriqueReclamationsClient from "./components/Client-dashboard/HistoriqueReclamationsClient";
import RapportAlarmesPage from "./components/Rapports/RapportAlarmesPage";
import RapportProductionClientPage from "./components/Rapports/RapportProductionClientPage";
import RapportConsommationClientPage from "./components/Rapports/RapportConsommationClientPage";
import RapportAlarmesClientPage from "./components/Rapports/RapportAlarmesClientPage";
//Technicien 
import ListeInterventionsClient from "./components/Intervention/ListeInterventionsClient";
import DetailleInterventionClient from "./components/Intervention/DetailleInterventionClient";
import ListEntretienTechnicien from "./Technicien/ListEntretienTechnicien.jsx";
import ModalModifierStatutEntretien from "./Technicien/ModalModifierStatutEntretien.jsx";
import MesEntretiens from "./Technicien/MesEntretiens";
import DashboardTechnicien from "./Technicien/DashboardTechnicien.jsx";

import CalendrierEntretiensTechnicien from"./Technicien/CalendrierEntretiensTechnicien.jsx";
import ListeInterventionsTechnicien from "./Technicien/ListeInterventionsTechnicien.jsx";
import ModalModifierStatutIntervention from "./Technicien/ModalModifierStatutIntervention.jsx";
import RapportTechniqueTechnicien from "./Technicien/RapportTechniqueTechnicien.jsx";


//Installateur
import ListeUtilisateursPage from "./Installateur/ListeUtilisateursPage";
import ListeMesInstallationsPage from "./Installateur/ListeMesInstallationsPage.jsx";
import InstallationMapInstallateur from "./Installateur/InstallationMapInstallateur.jsx";
import ListeMesInterventionsPage from "./Installateur/ListeMesInterventionsPage.jsx";
import ListeMesEntretiensInstallateurPage from "./Installateur/ListeMesEntretiensInstallateur.jsx";
import CalendrierEntretiensInstallateur from "./Installateur/CalendrierEntretiensInstallateur.jsx";
import ListeAlarmesInstallateur from "./Installateur/ListeAlarmesInstallateur.jsx";
import ListeReclamationsInstallateur from "./Installateur/ListeReclamationsInstallateur.jsx";
import DashboardInstallateur from "./Installateur/Dashboard-installateur.jsx";
//equipement
import EquipmentSection from "./components/équipements/EquipmentSection.jsx";
import ClientEquipmentPage from "./components/Client-dashboard/ClientEquipmentPage.jsx";
import ScanEquipementPage from "./components/équipements/ScanEquipementPage.jsx";
import DetailEntretienInstallateurPage from "./Installateur/DetailEntretienInstallateurPage.jsx";


function App() {
  return (
    <Router>
  <Routes>
    <Route path="/" element={<Login />} />
    <Route path="/forgot-password" element={<ForgotPassword />} />
    <Route path="/register-admin" element={<RegisterAdmin />} />
    <Route path="/complete-registration" element={<CompleteRegistration />} />

    <Route path="/" element={<AppLayout />}>
      
      <Route path="/admin-dashboard" element={<Dashboard />} />
      <Route path="/client-dashboard" element={<ClientDashboard />} />

      
      <Route path="user-management" element={<UserManagement />} />
      <Route path="update-profile" element={<UpdateProfile />} />
      <Route path="liste-installations" element={<ListeInstallationPage />} />
      <Route path="ajouter-installation" element={<AjouterInstallation />} />
      <Route path="dashboard-installation/:id" element={<DashboardInstallation />} />
      <Route path="modifier-installation/:id" element={< EditInstallation/>} />
       <Route path="liste-clients" element={<ListeClientsPage/>}/>
       <Route path="modifier-client/:id" element={<ModifierClientPage />} />
       <Route path="/reset-password" element={<ResetPassword />} />
       <Route path="/notification" element={<NotificationsPage/>}/>

       <Route path="/ListeCodesAlarmes" element={<ListeCodesAlarmes/>}/>
       <Route path="/codes-alarmes/ajouter" element={<AjouterCodeAlarmePage />} />
       <Route path="/ListeAlarmesDeclenchees" element={<ListeAlarmesDeclenchees/>} />
       
       <Route path="/installationMap" element={<InstallationMap/>} />

       

       
       <Route path="/liste-interventions" element={<ListeInterventions/>} />
       <Route path="/ajouter-intervention" element={<AjouterInterventionPage />} />
       <Route path="/modifier-intervention/:id" element={<ModifierInterventionPage />} />
       <Route path="/detaille-intervention/:id" element={<DetailleIntervention />} />
       

       <Route path="/liste-entretiens" element={<ListeEntretiensPage />} />
       <Route path="/ajouter-entretien" element={<FormulaireEntretien />} />
       <Route path="/details-entretien/:id" element={<EntretienDetailModal />} />
       <Route path="/modifier-entretien/:id" element={<ModifierEntretienPage />} />
       <Route path="/calendrier-entretiens" element={<CalendrierEntretiens />} />


       <Route path="/list_reclamations" element={<ListeReclamationsPage />} />
       <Route path="/reclamations/:id/edit" element={<ModifierReclamationPage />} />
       
       
       <Route path="/rapport_production" element={<RapportProductionPage />} />
       <Route path="/rapport_consommation" element={<RapportConsommationPage />} />
       <Route path="/rapport_alarme" element={<RapportAlarmesPage />} />
       
       
       <Route path="/client-reclamations" element={<ReclamationClient />} />
       <Route path="/liste-reclamations" element={<HistoriqueReclamationsClient />} />
       
       
       <Route path="/rapports-production" element={<RapportProductionClientPage />} />
       <Route path="/rapports-consommation" element={<RapportConsommationClientPage />} />
       <Route path="/rapports-alarme" element={<RapportAlarmesClientPage />} />
       
       
       <Route path="/client-mes-interventions" element={<ListeInterventionsClient />} />
       <Route path="/client/details-interventions/:id" element={<DetailleInterventionClient />} />       
       
       <Route path="/rapports-alarme" element={<RapportAlarmesClientPage />} />
       
       
       <Route path="/client-mes-interventions" element={<ListeInterventionsClient />} />
       <Route path="/client/details-interventions/:id" element={<DetailleInterventionClient />} />
       
       
       <Route path="/client/mes-entretien" element={<ListeEntretiensClient />} />
       <Route path="/detail_entretien_installateur/:id" element={<DetailEntretienInstallateurPage />} />
       <Route path="//rapports-alarme" element={<RapportAlarmesClientPage />} />
       
       <Route path="/client/details-interventions/:id" element={<DetailleInterventionClient />} />       
       
       <Route path="/rapports-alarme" element={<RapportAlarmesClientPage />} />
       
       
       <Route path="/client-mes-interventions" element={<ListeInterventionsClient />} />
       <Route path="/client/details-interventions/:id" element={<DetailleInterventionClient />} />
       
       
       <Route path="/client/mes-entretien" element={<ListeEntretiensClient />} />
       
       <Route path="//rapports-alarme" element={<RapportAlarmesClientPage />} />
       
       <Route path="/client/details-interventions/:id" element={<DetailleInterventionClient />} />       
       
       <Route path="/rapports-alarme" element={<RapportAlarmesClientPage />} />
       
       
       <Route path="/client-mes-interventions" element={<ListeInterventionsClient />} />
       <Route path="/client/details-interventions/:id" element={<DetailleInterventionClient />} />
       
       
       <Route path="/client/mes-entretien" element={<ListeEntretiensClient />} />
       <Route path="/client/clanddar" element={<CalendrierEntretiensClient />} />
       <Route path="/client/entretiens/:id" element={<DetailleEntretienClient />} />       
       <Route path="/client/entretiens/:id" element={<DetailleEntretienClient />} />       
     
       
       <Route path="/MesEntretiens" element={<MesEntretiens />} />
       <Route path="/liste-entretien-technicien" element={<ListEntretienTechnicien />} />
       <Route path="/modifier-entretien-technicien" element={<ModalModifierStatutEntretien />} />
       <Route path="/technicien/calendrier" element={<CalendrierEntretiensTechnicien />} />
       <Route path="/liste-intervention-technicien" element={<ListeInterventionsTechnicien />} />
       <Route path="/modifier-intervention-technicien" element={<ModalModifierStatutIntervention />} />
       <Route path="/technicien/rapport" element={<RapportTechniqueTechnicien />} />



       <Route path="/technicien/calendrier" element={<CalendrierEntretiensTechnicien />} />
       <Route path="/liste-intervention-technicien" element={<ListeInterventionsTechnicien />} />
       <Route path="/modifier-intervention-technicien" element={<ModalModifierStatutIntervention />} />
       <Route path="/technicien/rapport" element={<RapportTechniqueTechnicien />} />



       <Route path="/ListeUtilisateurs" element={<ListeUtilisateursPage />} />
       <Route path="/MesInstallation" element={<ListeMesInstallationsPage />} />
       
       <Route path="/MapInstallateur" element={<InstallationMapInstallateur />} />
       <Route path="/MesEntrentientinstallateur" element={<ListeMesEntretiensInstallateurPage/>} />
       <Route path="/Calendrier-En-Insta" element={<CalendrierEntretiensInstallateur/>} />
       <Route path="/ListeAlarmesInstallateur" element={<ListeAlarmesInstallateur/>} />
       
       <Route path="/ListeReclamationsInstallateur" element={<ListeReclamationsInstallateur/>} />
       
       <Route path="/DashboardInstallateur" element={<DashboardInstallateur/>} />

      <Route path="/equipements" element={<EquipmentSection />} />
      <Route path="/client/equipements" element={<ClientEquipmentPage />} />
      <Route path="/equipements/equipements/scan/:code" element={<ScanEquipementPage />} />
      <Route path="/equipements" element={<EquipmentSection />} />
      <Route path="/client/equipements" element={<ClientEquipmentPage />} />
      <Route path="/equipements/equipements/scan/:code" element={<ScanEquipementPage />} />

       <Route path="/Mesintervention" element={<ListeMesInterventionsPage />} />
       <Route path="/DashboardInstallateur" element={<DashboardInstallateur/>} />

      <Route path="/equipements" element={<EquipmentSection />} />
      <Route path="/client/equipements" element={<ClientEquipmentPage />} />
      <Route path="/equipements/equipements/scan/:code" element={<ScanEquipementPage />} />

       <Route path="/dashboard-technicien" element={<DashboardTechnicien  />} />
       <Route path="/DashboardInstallateur" element={<DashboardInstallateur/>} />

      <Route path="/equipements" element={<EquipmentSection />} />
      <Route path="/client/equipements" element={<ClientEquipmentPage />} />
      <Route path="/equipements/equipements/scan/:code" element={<ScanEquipementPage />} />

       <Route path="/dashboard-technicien" element={<DashboardTechnicien  />} />
       <Route path="/Mesintervention" element={<ListeMesInterventionsPage />} />
       <Route path="/dashboard-technicien" element={<DashboardTechnicien  />} />


       </Route>
  </Routes>
</Router>
  );
}

export default App;
