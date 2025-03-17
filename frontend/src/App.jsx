import { useState } from 'react'
import './App.css'
import "flowbite";
import "./index.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RegisterAdmin from "./Authentification/RegisterAdmin";
import Login from './Authentification/Login';
import UserManagement from './Authentification/UserManagement';
import CompleteRegistration from './Authentification/CompleteRegistration';

function App() {
  const [count, setCount] = useState(0)

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
