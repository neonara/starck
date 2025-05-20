import { useState } from 'react';
import {
  LayoutGrid,
  Users,
  Server,
  ChevronLeft,
  ChevronRight,
  CalendarCheck,
  Bell,
  Wrench,
  ClipboardCheck,
  StickyNote,
  AlertCircle,
  BarChart3,
  FileText
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { motion, AnimatePresence } from 'framer-motion';

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
    { label: "Gestion des Alarmes", icon: AlertCircle, children: [
        { label: "Redéfinir l'alarme", path: "/codes-alarmes/ajouter" },
        { label: "Code Alarme", path: "/ListeCodesAlarmes" },
        { label: "Alarme Active", path: "/ListeAlarmesDeclenchees" },
      ]
    },
    { label: "Gestion des interventions", icon: Server, children: [
        { label: "Liste des Interventions", path: "/liste-interventions" },
      ]
    },
    { label: "Plan d'action", icon: CalendarCheck, children: [
        { label: "Liste des Entretiens", path: "/liste-entretiens" },
        { label: "Calendrier des Entretiens", path: "/calendrier-entretiens" },
        { label: "Statistiques des Entretiens", path: "/statistiques-entretiens" },
      ]
    },
    { label: "Reclamations", icon:StickyNote, children: [
        { label: "Liste des reclamations", path: "/list_reclamations" },
      ]
    },
    { label: "Rapports", icon: FileText, children: [
        { label: "Rapport de production", path: "/rapport_production" },
        { label: "Rapport de consommation", path: "/rapport_consommation" },
 
        { label: "Rapports d’historique des alarmes", path: "/rapport_alarme" },
 
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
  
     { label: "Gestion d'installation", icon: Server, children: [
        { label: "Mon installation", path: "/client-dashboard" },
         { label: "Mes Equipements", path: "/client/equipements" },
      ]
    },
  
   
    {
      label: "Mes plan d'action",
      icon: LayoutGrid,
      path: "/client/mes-entretien",
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
      icon: FileText,
      children: [
        { label: "Rapport Production", path: "/rapports-production" },
        { label: "Rapport Consommation", path: "/rapports-consommation" },
        { label: "Rapport Historique Alarme", path: "/rapports-alarme" },
      ],
    },
  ];
   
 
  // Menu Installateur
  const installateurMenuItems = [
    { label: "Tableaux de bord", icon: LayoutGrid, path: "/DashboardInstallateur" },
    { label: "Gestion des utilisateurs", icon: Users, children: [
        { label: "Utilisateurs ", path: "/ListeUtilisateurs" },
      ]
    },
    { label: "Gestion des installations", icon: Server, children: [
        { label: "Mes Installations", path: "/MesInstallation" },
         { label: "Equipements", path: "/equipements" },
      ]
    },
    { label: "Plan d'action", icon: CalendarCheck, children: [
        { label: "Liste des Entretiens", path: "/MesEntrentientinstallateur" },
        { label: "Calendrier des Entretiens", path: "/Calendrier-En-Insta" },
 
      ]
    },
    { label: "Gestion des interventions", icon: Wrench, children: [
      { label: "Liste des Interventions", path: "/Mesintervention" },
    ]
  },
  { label: "Gestion des Alarmes", icon: AlertCircle, children: [
    { label: "Redéfinir l'alarme", path: "/codes-alarmes/ajouter" },
    { label: "Code Alarme", path: "/ListeCodesAlarmes" },
    { label: "Alarme Active", path: "/ListeAlarmesInstallateur" },
  ]
},
{ label: "Reclamations", icon: StickyNote, children: [
  { label: "Liste des reclamations", path: "/ListeReclamationsInstallateur" },
]
},
  ];
    // Menu Technicien
    const technicienMenuItems = [
      { label: "Tableaux de bord", icon: LayoutGrid, path: "/dashboard-technicien" },
      { label: "Equipements", icon: CalendarCheck, path: "/equipements" },
      { label: "Mes interventions", icon: Server, path: "/technicien-interventions" },
      { label: "Mes plan d'action", 
        icon: CalendarCheck, 
        children: [
          { label: "Rappel Entretien", path: "/MesEntretiens"},
          { label: "Liste Entretien", path: "/liste-entretien-technicien"},
        ]
      },

      {
        label: "Rapport Technique",
        icon: BarChart3,
        children: [
          { label: "Rapports interventions", path: "/rapports-interventions-technicien" },
          { label: "Documents techniques", path: "/docs-techniques-technicien" }
        ]
      },
    ];
    
  
  const menuItems =
    userRole === "admin" ? adminMenuItems :
    userRole === "client" ? clientMenuItems :
    userRole === "installateur" ? installateurMenuItems :
    userRole === "technicien" ? technicienMenuItems :
    [];
 
   return (
    <motion.div
      animate={{ width: isSidebarOpen ? 256 : 64 }} 
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="bg-white border-r border-gray-200 h-screen fixed top-0 left-0 z-40 overflow-hidden flex flex-col"
    >
      <div className="flex items-center gap-2 px-4 pt-6 h-16 shrink-0">
        <img src="/assets/logo.jpg" alt="Logo" className="w-6 h-6" />
        {isSidebarOpen && (
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="text-lg font-semibold text-gray-800"
          >
            Starck
          </motion.span>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto pt-6 px-2">
        <ul className="space-y-1">
          {menuItems.map(({ label, path, children, icon: Icon }) => (
            <li key={label}>
              {children ? (
                <>
                  <button
                    onClick={() => toggleMenu(label)}
                    className={`flex items-center w-full px-3 py-2 rounded-md text-sm font-medium transition-colors
                      ${
                        location.pathname.includes(label.toLowerCase())
                          ? 'bg-blue-100 text-blue-600'
                          : 'text-gray-700 hover:bg-gray-100'
                      }
                    `}
                  >
                    <Icon size={18} />
                    {isSidebarOpen && <span className="ml-3 flex-1 text-left">{label}</span>}
                    {isSidebarOpen && (
                      <motion.span
                        animate={{ rotate: openMenus[label] ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                        className="ml-auto"
                      >
                        ▼
                      </motion.span>
                    )}
                  </button>

                  <AnimatePresence initial={false}>
                    {openMenus[label] && isSidebarOpen && (
                      <motion.ul
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="ml-8 mt-1 overflow-hidden text-sm text-gray-600"
                      >
                        {children.map((child) => (
                          <li key={child.label}>
                            <Link
                              to={child.path}
                              className={`block px-2 py-1 rounded hover:text-blue-600 transition-colors
                                ${location.pathname === child.path ? 'text-blue-600 font-semibold' : ''}
                              `}
                            >
                              {child.label}
                            </Link>
                          </li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <Link
                  to={path}
                  className={`flex items-center w-full px-3 py-2 rounded-md text-sm font-medium transition-colors
                    ${location.pathname === path ? 'bg-blue-100 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}
                  `}
                >
                  <Icon size={18} />
                  {isSidebarOpen && <span className="ml-3">{label}</span>}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>

      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="absolute top-1/2 -right-3 transform -translate-y-1/2 z-50 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-full px-1.5 py-1 shadow-md transition-colors"
        aria-label={isSidebarOpen ? "Fermer la sidebar" : "Ouvrir la sidebar"}
      >
        {isSidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
      </button>
    </motion.div>
  );
};

export default Sidebar;