import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import ApiService from "../../Api/Api";
import { CheckCircle, Trash2, Bell, AlertTriangle, Settings, Info } from "lucide-react";

const typeIcons = {
  alarme: <AlertTriangle className="text-red-500 w-5 h-5" />,
  intervention: <Settings className="text-orange-500 w-5 h-5" />,
  maintenance: <Settings className="text-blue-500 w-5 h-5" />,
  performance: <CheckCircle className="text-green-500 w-5 h-5" />,
  system: <Info className="text-gray-500 w-5 h-5" />,
  autre: <Bell className="text-black w-5 h-5" />,
  reclamation: <Bell className="text-purple-500 w-5 h-5" />,
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [filterUnread, setFilterUnread] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await ApiService.getNotifications();
      setNotifications(res.data);
    } catch (err) {
      console.error("Erreur chargement notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Connexion WebSocket
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    const socket = new WebSocket(`ws://localhost:8000/ws/notifications/user_${userId}/`);

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const notif = data.message;

      if (notif?.type === "alarme") {
        toast.error(`🚨 ${notif.title}: ${notif.content}`);
      } else {
        toast(notif.title || "Nouvelle notification");
      }

      setNotifications((prev) => [notif, ...prev]);
    };

    socket.onerror = (e) => {
      console.error("WebSocket error:", e);
    };

    return () => socket.close();
  }, []);

  const markAsRead = async (id) => {
    await ApiService.markAsRead(id);
    toast.success("Notification marquée comme lue ✅");
    fetchNotifications();
  };

  const markAllAsRead = async () => {
    await ApiService.markAllAsRead();
    toast.success("Toutes les notifications sont maintenant lues 👀");
    fetchNotifications();
  };

  const deleteNotification = async (id) => {
    await ApiService.deleteNotification(id);
    toast.success("Notification supprimée 🗑️");
    fetchNotifications();
  };

  const filtered = filterUnread ? notifications.filter(n => !n.lue_le) : notifications;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Mes notifications</h1>
        <div className="flex gap-2">
          <button onClick={markAllAsRead} className="px-3 py-1 text-sm bg-green-500 text-white rounded">Tout marquer comme lu</button>
          <button onClick={() => setFilterUnread(!filterUnread)} className="px-3 py-1 text-sm bg-gray-200 rounded">
            {filterUnread ? "Afficher tout" : "Non lues uniquement"}
          </button>
        </div>
      </div>

      <table className="w-full border rounded-md overflow-hidden">
        <thead className="bg-gray-100 text-sm text-gray-700">
          <tr>
            <th className="px-4 py-2 text-left">Type</th>
            <th className="px-4 py-2 text-left">Titre</th>
            <th className="px-4 py-2 text-left">Message</th>
            <th className="px-4 py-2 text-left">Date</th>
            <th className="px-4 py-2 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((notif) => (
            <tr key={notif.id} className={`text-sm ${notif.lue_le ? "bg-white" : "bg-yellow-50"}`}>
              <td className="px-4 py-2">{typeIcons[notif.type_notification]}</td>
              <td className="px-4 py-2 font-semibold">{notif.titre}</td>
              <td className="px-4 py-2 text-gray-600">{notif.message}</td>
              <td className="px-4 py-2">{new Date(notif.envoyee_le).toLocaleString()}</td>
              <td className="px-4 py-2 text-center flex gap-2 justify-center">
                {!notif.lue_le && (
                  <button onClick={() => markAsRead(notif.id)} className="text-blue-600 text-xs hover:underline">
                    Marquer lu
                  </button>
                )}
                <button onClick={() => deleteNotification(notif.id)} className="text-red-600 text-xs hover:underline">
                  Supprimer
                </button>
              </td>
            </tr>
          ))}
          {filtered.length === 0 && (
            <tr>
              <td colSpan="5" className="text-center py-4 text-gray-500">Aucune notification trouvée.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
