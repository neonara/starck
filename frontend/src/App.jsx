import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AppLayout from './components/layout/AppLayout';

// Authentification
import RegisterAdmin from "./components/Authentification/RegisterAdmin";
import Login from './components/Authentification/Login';
import UserManagement from './components/Authentification/UserManagement';
import CompleteRegistration from './components/Authentification/CompleteRegistration';
import UpdateProfile from './components/Authentification/UpdateProfile';

// Admin 
import Dashboard from './components/Admin-dashboard/Dashboard';

//Insttalation
import ListeInstallationPage from "./components/Installations/liste-installations";
import AjouterInstallation from "./components/Installations/ajouter-installation";
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

      </Route>
  </Routes>
</Router>
  );
}

export default App;
