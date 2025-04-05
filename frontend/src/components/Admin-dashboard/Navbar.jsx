import { useEffect, useState } from 'react';
import {
  Bell, ChevronDown, User, LogOut, Settings, Pencil
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast, Toaster } from 'react-hot-toast';
import ApiService from "../../Api/Api";

const Navbar = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [hasNewNotif, setHasNewNotif] = useState(false);
  const [user, setUser] = useState({ name: "", email: "" });

  // 🔄 Charger le profil utilisateur
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await ApiService.getProfile();
        setUser({
          name: response.data.first_name + " " + response.data.last_name,
          email: response.data.email,
        });
      } catch (err) {
        console.error("Erreur chargement profil :", err);
      }
    };
    fetchProfile();
  }, []);

  // 🔌 Connexion WebSocket
  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      console.warn("❌ Aucun token trouvé dans localStorage");
      return;
    }

    const socket = new WebSocket(`ws://localhost:8000/ws/notifications/?token=${token}`);

    socket.onopen = () => {
      console.log("🟢 WebSocket connecté");
    };

    socket.onmessage = (e) => {
      const data = JSON.parse(e.data);
      console.log("🧪 Donnée WebSocket reçue :", data);

      // ✅ Le message vient directement sans wrapper "message"
      const message = data;

      toast.success(message.content || "🔔 Notification reçue !");
      setNotifications((prev) => [...prev, message]);
      setHasNewNotif(true);
    };

    socket.onclose = () => {
      console.log("🔌 WebSocket fermé");
    };

    return () => socket.close();
  }, [user.email]);

  return (
    <nav className="fixed top-0 left-64 right-0 z-50 bg-white shadow-sm px-6 py-3 flex justify-between items-center">
      <div className="flex items-center gap-2" />

      <div className="flex items-center gap-4 relative">
        {/* Cloche notifications */}
        <div className="relative">
          <button
            className="relative rounded-full border p-2 text-gray-500 hover:bg-gray-100"
            onClick={() => {
              setNotifOpen(!notifOpen);
              setHasNewNotif(false);
            }}
          >
            <Bell className="w-5 h-5" />
            {hasNewNotif && (
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 animate-ping"></span>
            )}
          </button>

          {/* Liste notifications */}
          {notifOpen && notifications.length > 0 && (
            <div className="absolute right-0 mt-2 w-80 bg-white border rounded-md shadow-md z-50 text-sm">
              <div className="px-4 py-2 font-semibold border-b">Notifications</div>
              <ul className="max-h-60 overflow-y-auto divide-y">
                {notifications.map((notif, index) => (
                  <li key={index} className="px-4 py-2 hover:bg-gray-50">
                    <p className="font-medium">{notif.title}</p>
                    <p className="text-gray-500 text-sm">{notif.content}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Menu utilisateur */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-1 focus:outline-none"
          >
            <User className="w-6 h-6 text-gray-700 border rounded-full p-1" />
            <ChevronDown className="w-4 h-4 text-gray-600" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white border rounded-md shadow-md z-50 text-sm">
              <div className="px-4 py-3 border-b">
                <p className="font-medium text-gray-800">{user.name || "Utilisateur"}</p>
                <p className="text-gray-500 text-sm">{user.email || "email inconnu"}</p>
              </div>

              <ul className="text-gray-700 divide-y">
                <li>
                  <Link to="/update-profile" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100">
                    <Pencil className="w-4 h-4" /> Mon profil
                  </Link>
                </li>
                <li>
                  <Link to="/update-profile" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100">
                    <Settings className="w-4 h-4" /> Modifier Profil
                  </Link>
                </li>
              </ul>

              <div className="border-t">
                <button
                  onClick={ApiService.logout}
                  className="w-full text-left flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-red-600"
                >
                  <LogOut className="w-4 h-4" /> Déconnexion
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Toaster position="top-right" />
    </nav>
  );
};

export default Navbar;
