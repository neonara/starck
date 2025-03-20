import { useState } from 'react'
import './App.css'
import "flowbite";
import "./index.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
//Authentification//
import RegisterAdmin from "./components/Authentification/RegisterAdmin";
import Login from './components/Authentification/Login';
import UserManagement from './components/Authentification/UserManagement';
import CompleteRegistration from './components/Authentification/CompleteRegistration';
import UpdateProfile from './components/Authentification/UpdateProfile';
function App() {
  const [count, setCount] = useState(0)

  return (
    <Router>
      <Routes>


        <Route path="/register-admin" element={<RegisterAdmin />} />
        <Route path="/" element={<Login />} />
        <Route path="/user-management" element={<UserManagement />} />
        <Route path="/complete-registration" element={<CompleteRegistration />} />
        <Route path="/update-profile" element={<UpdateProfile />} />

      </Routes>
    </Router>
  )
}

export default App
