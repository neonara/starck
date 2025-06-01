import { useState } from "react";

import { useNavigate } from "react-router-dom";

import { FaUser, FaLock } from "react-icons/fa";

import { useUser } from "../../context/UserContext";

import PublicApiService from "../../Api/APIpublic";
 
export default function LoginPage() {

  const [loginData, setLoginData] = useState({ identifier: "", password: "" });

  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const { updateRole } = useUser();

 
  const handleChange = (e) => {

    setLoginData({ ...loginData, [e.target.name]: e.target.value });

  };
 
  const handleLogin = async (e) => {

    e.preventDefault();

    setError(null);
 
    try {

      console.log("📦 Données envoyées :", loginData); 
 
      const response = await PublicApiService.login(loginData);
 
      localStorage.clear();

      localStorage.setItem("accessToken", response.data.access);

      localStorage.setItem("refreshToken", response.data.refresh);

      localStorage.setItem("role", response.data.user.role);

      localStorage.setItem("email", response.data.user.email);

      localStorage.setItem("firstName", response.data.user.first_name);
 
      updateRole(response.data.user.role);
 
      const roleRedirects = {

        admin: "/admin-dashboard",

        installateur: "/DashboardInstallateur",

        technicien: "/dashboard-technicien",

        client: "/client-dashboard",

      };
 
      const redirectUrl = roleRedirects[response.data.user.role] || "/dashboard";

      navigate(redirectUrl);
 
    } catch (err) {

      console.log("❌ Erreur login :", err.response?.data);

      setError(err.response?.data?.error || "Email ou mot de passe incorrect.");

    }

  };
 
  return (
<div className="fixed top-0 left-0 w-screen h-screen flex items-center justify-center bg-cover bg-center overflow-hidden"

         style={{ backgroundImage: "url('/assets/panneau-solaire.jpeg')" }}>
<div className="absolute inset-0 bg-black bg-opacity-30 backdrop-blur-md"></div>
 
      <div className="relative text-center w-auto">
<div className="flex items-center justify-center gap-2 mb-10">
<img src="/assets/logo.jpg" alt="Starck Logo" className="h-10 w-auto rounded-lg" />
<h1 className="text-4xl font-semibold text-blue-600">Stark</h1>
</div>
 
        {error && <p className="text-red-500 text-center">{error}</p>}
 
        <form onSubmit={handleLogin}>
<div className="flex items-center gap-4 justify-center">
 
<div className="flex items-center bg-white border border-transparent rounded-full px-5 py-1 w-50">
<FaUser className="text-gray-500" />
<input

                type="text"

                name="identifier"

                value={loginData.identifier}

                onChange={handleChange}

                placeholder="Email ou Nom d'utilisateur"
  className="bg-transparent outline-none border-none focus:ring-0 text-black placeholder-gray-500 px-2 flex-grow"

                required

              />
</div>
 
            <div className="flex items-center bg-white border border-gray-300 rounded-full px-5 py-1 w-50">
<FaLock className="text-gray-500" />
<input

                type="password"

                name="password"

                value={loginData.password}

                onChange={handleChange}

                placeholder="Mot de passe"

                required

                className="bg-transparent outline-none border-none text-black placeholder-gray-500 px-2 flex-grow"

              />
</div>
 
            <button type="submit" className="bg-blue-600 text-white font-semibold py-2 px-6 rounded-full hover:bg-blue-700 transition">

              Se connecter
</button>
</div>
</form>
 
        <div className="flex justify-center mt-6 space-x-4">
<a href="/register-admin" className="text-blue-600 font-semibold hover:underline">

            Enregistrement de l'admin
</a>
<a href="/forgot-password" className="text-blue-600 font-semibold hover:underline">

            Mot de passe oublié ?
</a>
</div>
</div>
</div>

  );

}

 