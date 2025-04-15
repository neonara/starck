import { useState } from 'react';
import {
  LayoutGrid, Users, Server, ChevronLeft, ChevronRight
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [openMenus, setOpenMenus] = useState({});
  const location = useLocation();

  const toggleMenu = (label) => {
    setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const menuItems = [
    {
      label: "Tableaux de bord",
      icon: LayoutGrid,
      path: "/admin-dashboard"
    },
    {
      label: "Gestion des utilisateurs",
      icon: Users,
      children: [
        { label: "Ajout Utilisateur", path: "/user-management" },
        { label: "Utilisateurs", path: "/liste-clients" },
       
      ]
    },
    {
      label: "Gestion des installations",
      icon: Server,
      children: [
        { label: "Installations", path: "/liste-installations" },
        { label: "Appareil", path: "" },
      ]
    },
    {
      label: "Gestion des Alarmes",
      icon: Server,
      children: [
        { label: "Redéfinir l'alarme", path: "/codes-alarmes/ajouter" },
        { label: "Code Alarme", path: "/ListeCodesAlarmes" },
        { label: "Alarme Active", path: "/ListeAlarmesDeclenchees" },
      ]
    }
  ];

  return (
    <div
      className={`${
        isSidebarOpen ? 'w-64' : 'w-16'
      } bg-white dark:bg-gray-800 border-r dark:border-gray-700 
      transition-all duration-300 ease-in-out h-screen fixed top-0 left-0 z-40 overflow-x-hidden`}
    >
      <div className="flex items-center gap-2 px-4 pt-6">
        <img src="/assets/logo.jpg" alt="Logo" className="w-6 h-6" />
        {isSidebarOpen && (
          <span className="text-lg font-semibold text-gray-800">Starck</span>
        )}
      </div>

     <div className="pt-6 px-2">
        <ul className="space-y-2">
          {menuItems.map(({ label, icon: Icon, path, children }) => (
            <li key={label}>
              {children ? (
                <>
                  <button
                    onClick={() => toggleMenu(label)}
                    className={`flex items-center w-full px-3 py-2 rounded-md text-sm font-medium transition ${
                      location.pathname.includes(label.toLowerCase())
                        ? 'bg-blue-100 text-blue-600'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon size={18} />
                    {isSidebarOpen && (
                      <span className="ml-3">{label}</span>
                    )}
                    {isSidebarOpen && (
                      <span className="ml-auto">{openMenus[label] ? "▲" : "▼"}</span>
                    )}
                  </button>

                  {openMenus[label] && isSidebarOpen && (
                    <ul className="ml-8 mt-1 space-y-1 text-sm text-gray-600">
                      {children.map((child) => (
                        <li key={child.label}>
                          <Link
                            to={child.path}
                            className={`block px-2 py-1 rounded hover:text-blue-600 ${
                              location.pathname === child.path ? 'text-blue-600' : ''
                            }`}
                          >
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                <Link
                  to={path}
                  className={`flex items-center w-full px-3 py-2 rounded-md text-sm font-medium transition ${
                    location.pathname === path
                      ? 'bg-blue-100 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={18} />
                  {isSidebarOpen && (
                    <span className="ml-3">{label}</span>
                  )}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="absolute top-1/2 -right-3 transform -translate-y-1/2 z-50 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-full px-1.5 py-1 shadow-md"
      >
        {isSidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
      </button>
    </div>
  );
};

export default Sidebar;
