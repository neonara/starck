import { useState } from 'react';
import {LayoutGrid, Users, Server, ChevronLeft, ChevronRight, CalendarCheck, Zap, AlertCircle, BarChart3} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useUser } from '../../context/UserContext'; 

const Sidebar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [openMenus, setOpenMenus] = useState({});
  const location = useLocation();
  const { role: userRole } = useUser(); 

  if (!userRole) return null;

  const toggleMenu = (label) => {
    setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  //  Menu Admin
  const adminMenuItems = [
    { label: "Tableaux de bord", icon: LayoutGrid, path: "/admin-dashboard" },
    { label: "Gestion des utilisateurs", icon: Users, children: [
        { label: "Ajout Utilisateur", path: "/user-management" },
        { label: "Utilisateurs", path: "/liste-clients" },
      ]
    },
    { label: "Gestion des installations", icon: Server, children: [
        { label: "Installations", path: "/liste-installations" },
      ]
    },
    { label: "Gestion des Alarmes", icon: Server, children: [
        { label: "Redéfinir l'alarme", path: "/codes-alarmes/ajouter" },
        { label: "Code Alarme", path: "/ListeCodesAlarmes" },
        { label: "Alarme Active", path: "/ListeAlarmesDeclenchees" },
      ]
    },
    { label: "Gestion des interventions", icon: Server, children: [
        { label: "Liste des Interventions", path: "/liste-interventions" },
      ]
    },
    { label: "Gestion des Entretiens", icon: CalendarCheck, children: [
        { label: "Liste des Entretiens", path: "/liste-entretiens" },
        { label: "Calendrier des Entretiens", path: "/calendrier-entretiens" },
        { label: "Statistiques des Entretiens", path: "/statistiques-entretiens" },
      ]
    },
    { label: "Reclamations", icon: CalendarCheck, children: [
        { label: "Liste des reclamations", path: "/list_reclamations" },
      ]
    },
    { label: "Rapports", icon: CalendarCheck, children: [
        { label: "Rapport de production", path: "/rapport_production" },
        { label: "Rapport de consommation", path: "/rapport_consommation" },
      ]
    },
  ];

  // Menu Client
  const clientMenuItems = [
    {
      label: "Mon tableau de bord",
      icon: LayoutGrid,
      path: "/client-dashboard",
    },
 
    {
      label: "Mes interventions",
      icon: CalendarCheck,
      path: "/client-mes-interventions",
    },
    {
      label: "Mes entretiens",
      icon: CalendarCheck,
      path: "/client-mes-entretien",
    },
    {
      label: "Réclamations",
      icon: AlertCircle,
      children: [
        { label: "Créer réclamations", path: "/client-reclamations" },
        { label: "Mes réclamations", path: "/liste-reclamations" },
      ],
    },
    {
      label: "Rapports",
      icon: BarChart3,
      children: [
        { label: "Rapport de production", path: "/rapport_production_client" },
        { label: "Rapport de consommation", path: "/rapport_consommation_client" },
      ],
    },
  ];
    

  // Menu Installateur
  const installateurMenuItems = [
    { label: "Tableaux de bord", icon: LayoutGrid, path: "/installateur-dashboard" },
    { label: "Gestion des utilisateurs", icon: Users, children: [
        { label: "Utilisateurs ", path: "/ListeUtilisateurs" },
      ]
    },
    { label: "Gestion des installations", icon: Server, children: [
        { label: "Mes Installations", path: "/MesInstallation" },
      ]
    },
    { label: "Gestion des Entretiens", icon: CalendarCheck, children: [
        { label: "Liste des Entretiens", path: "/MesEntrentientinstallateur" },
        { label: "Calendrier des Entretiens", path: "/Calendrier-En-Insta" },

        { label: "Rapports d’historique des alarmes", path: "/rapport_alarme" },

      ]
    },
    { label: "Gestion des interventions", icon: Server, children: [
      { label: "Liste des Interventions", path: "/Mesintervention" },
    ]
  },
  { label: "Gestion des Alarmes", icon: Server, children: [
    { label: "Redéfinir l'alarme", path: "/codes-alarmes/ajouter" },
    { label: "Code Alarme", path: "/ListeCodesAlarmes" },
    { label: "Alarme Active", path: "/ListeAlarmesInstallateur" },
  ]
},
{ label: "Reclamations", icon: CalendarCheck, children: [
  { label: "Liste des reclamations", path: "/ListeReclamationsInstallateur" },
]
},
  ];
  const menuItems =
    userRole === "admin" ? adminMenuItems :
    userRole === "client" ? clientMenuItems :
    userRole === "installateur" ? installateurMenuItems :
    [];

  return (
    <div className={` ${isSidebarOpen ? 'w-64' : 'w-16'} bg-white border-r border-gray-200 transition-all duration-300 ease-in-out h-screen fixed top-0 left-0 z-40 overflow-x-hidden`}>
      <div className="flex items-center gap-2 px-4 pt-6">
        <img src="/assets/logo.jpg" alt="Logo" className="w-6 h-6" />
        {isSidebarOpen && <span className="text-lg font-semibold text-gray-800">Starck</span>}
      </div>

      <div className="pt-6 px-2">
        <ul className="space-y-2">
          {menuItems.map(({ label, path, children }) => (
            <li key={label}>
              {children ? (
                <>
                  <button
                    onClick={() => toggleMenu(label)}
                    className={`flex items-center w-full px-3 py-2 rounded-md text-sm font-medium transition ${location.pathname.includes(label.toLowerCase()) ? 'bg-blue-100 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}
                  >
                    <Icon size={18} />
                    {isSidebarOpen && <span className="ml-3">{label}</span>}
                    {isSidebarOpen && <span className="ml-auto">{openMenus[label] ? "▲" : "▼"}</span>}
                  </button>

                  {openMenus[label] && isSidebarOpen && (
                    <ul className="ml-8 mt-1 space-y-1 text-sm text-gray-600">
                      {children.map((child) => (
                        <li key={child.label}>
                          <Link
                            to={child.path}
                            className={`block px-2 py-1 rounded hover:text-blue-600 ${location.pathname === child.path ? 'text-blue-600' : ''}`}
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
                  className={`flex items-center w-full px-3 py-2 rounded-md text-sm font-medium transition ${location.pathname === path ? 'bg-blue-100 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  <Icon size={18} />
                  {isSidebarOpen && <span className="ml-3">{label}</span>}
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
