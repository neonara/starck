import './App.css'
import "flowbite";
import "./index.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RegisterAdmin from './components/Authentification/RegisterAdmin';
import Login from './components/Authentification/Login';
import UserManagement from './components/Authentification/UserManagement';
import CompleteRegistration from './components/Authentification/CompleteRegistration';

function App() {

  return (
    <Router>
      <Routes>


        <Route path="/register-admin" element={<RegisterAdmin />} />
        <Route path="/" element={<Login />} />
        <Route path="/user-management" element={<UserManagement />} />
        <Route path="/complete-registration" element={<CompleteRegistration />} />

      </Routes>
    </Router>
  )
}

export default App
