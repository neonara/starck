import { useEffect, useState } from 'react';
import {
  Bell, ChevronDown, User, LogOut, Pencil, Globe
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast, Toaster } from 'react-hot-toast';
import ApiService from "../../Api/Api";
const Navbar = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [hasNewNotif, setHasNewNotif] = useState(false);
  const [user, setUser] = useState({ name: "", email: "", role: "" });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await ApiService.getProfile();
        setUser({
          name: `${res.data.first_name} ${res.data.last_name}`,
          email: res.data.email,
          role: res.data.role,
        });
      } catch (err) {
        console.error("Erreur chargement profil :", err);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    const socket = new WebSocket(`ws://${window.location.hostname}:8000/ws/notifications/?token=${token}`);


    socket.onopen = () => console.log("WebSocket connecté");
    socket.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        const message = data.message || { title: "❓", content: "Notification inconnue" };

        console.log("Nouvelle notification reçue ✅", message);

        toast.success(message.content || "🔔 Nouvelle notification !");
        setNotifications((prev) => [...prev, { ...message, is_read: false }]);
        setHasNewNotif(true);
      } catch (err) {
        console.error("Erreur de parsing :", err);
      }
    };

    socket.onerror = (err) => console.error("Erreur WebSocket :", err);
    socket.onclose = () => console.log("WebSocket fermé");

    return () => socket.close();
  }, [user.email]);
  useEffect(() => {
    setHasNewNotif(true);
  }, []);
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <nav className="fixed top-0 left-64 right-0 z-50 bg-white shadow-sm px-6 py-3 flex justify-between items-center">
      <div className="flex items-center gap-2" />
 
      <div className="flex items-center gap-4 relative">
        {/* Bouton notifications */}
        <div className="relative">
        <button
    onClick={() => {
      setHasNewNotif(false);
      navigate("/notification");
    }}
    className="relative rounded-full border p-2 text-gray-500 hover:bg-gray-100"
  >
    <Bell className="w-5 h-5" />

    {unreadCount > 0 && (
      <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] leading-none font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
        {unreadCount > 99 ? "99+" : unreadCount}
      </span>
    )}
  </button>


          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white border rounded-md shadow-md z-50 text-sm">
              <div className="px-4 py-2 font-semibold border-b">Notifications</div>
              {notifications.length > 0 ? (
                <ul className="max-h-60 overflow-y-auto divide-y">
                  {notifications.map((notif, index) => (
                    <li key={index} className="px-4 py-2 hover:bg-gray-50">
                      <p className="font-medium">{notif.title}</p>
                      <p className="text-gray-500 text-sm">{notif.content}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="px-4 py-2 text-gray-500">Aucune notification.</div>
              )}
            </div>
          )}
        </div>

        {user && user.role && (
          <button
            onClick={() => {
              if (user.role === "admin") {
                navigate("/installationMap");
              } else if (user.role === "installateur") {
                navigate("/MapInstallateur");
              } else {
                toast.error("Accès non autorisé à la carte 🌐");
              }
            }}
            className="relative rounded-full border p-2 text-gray-500 hover:bg-gray-100"
            title="Carte des installations"
          >
            <Globe className="w-5 h-5" />
          </button>
        )}

        {/* Dropdown utilisateur */}
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