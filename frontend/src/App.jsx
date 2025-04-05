import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AppLayout from './components/layout/AppLayout';
import './App.css'
import "flowbite";
import "./index.css";

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

//Insttalation
import ListeInstallationPage from "./components/Installations/liste-installations";
import AjouterInstallation from "./components/Installations/ajouter-installation";
import DashboardInstallation from "./components/Installations/DashboardInstallation";
import EditInstallation from "./components/Installations/modifier-installation";
//Clients
import ListeClientsPage from "./components/Utilisateurs/Clients/Liste-Client";
import ModifierClientPage from "./components/Utilisateurs/Clients/modifier-client";
function App() {
  return (
    <Router>
  <Routes>
    <Route path="/" element={<Login />} />
    <Route path="/register-admin" element={<RegisterAdmin />} />
    <Route path="/complete-registration" element={<CompleteRegistration />} />

    <Route path="/" element={<AppLayout />}>
      
      <Route path="admin-dashboard" element={<Dashboard />} />
      <Route path="user-management" element={<UserManagement />} />
      <Route path="update-profile" element={<UpdateProfile />} />
      <Route path="liste-installations" element={<ListeInstallationPage />} />
      <Route path="ajouter-installation" element={<AjouterInstallation />} />
      <Route path="dashboard-installation/:id" element={<DashboardInstallation />} />
      <Route path="modifier-installation/:id" element={< EditInstallation/>} />
       <Route path="liste-clients" element={<ListeClientsPage/>}/>
       <Route path="modifier-client/:id" element={<ModifierClientPage />} />
       <Route path="/forgot-password" element={<ForgotPassword />} />
       <Route path="/reset-password" element={<ResetPassword />} />
       </Route>
  </Routes>
</Router>
  );
}

export default App;
