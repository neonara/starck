import { useState } from 'react';
import {
  LayoutGrid, Users, Server, ChevronLeft, ChevronRight
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const SidebarLayout = ({ children }) => {
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
        { label: "Clients", path: "" },
        { label: "Insttalateurs", path: "" },
        { label: "Techniciens", path: "" },
      ]
      
    },
    {
      label: "Gestion des installations",
      icon: Server,
      children: [
        { label: "Installations", path: "liste-installations" },
        { label: "Appareil", path: "" },
      ]
    }
  ];

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 relative">
      <div
        className={`${
          isSidebarOpen ? 'w-64' : 'w-16'
        } bg-white dark:bg-gray-800 border-r dark:border-gray-700 
        transition-all duration-300 ease-in-out h-screen fixed top-0 left-0 z-40 overflow-x-hidden`}
      >
        <div className="pt-20 px-2">
          <ul className="space-y-2">
            {menuItems.map(({ label, icon: Icon, path, children }) => (
              <li key={label}>
                <button
                  onClick={() => {
                    if (children) toggleMenu(label);
                  }}
                  className={`flex items-center w-full px-3 py-2 rounded-md text-sm font-medium transition ${
                    location.pathname.includes(path)
                      ? 'bg-blue-100 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon size={18} />
                  {isSidebarOpen && (
                    <span className="ml-3 whitespace-nowrap overflow-hidden">
                      {label}
                    </span>
                  )}
                  {children && isSidebarOpen && (
                    <span className="ml-auto">{openMenus[label] ? "▲" : "▼"}</span>
                  )}
                </button>
                {children && openMenus[label] && isSidebarOpen && (
                  <ul className="ml-8 mt-1 space-y-1 text-gray-500 text-sm">
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

      <div
  className="transition-all duration-300 flex-1"
  style={{ marginLeft: isSidebarOpen ? '1rem' : '4rem' }} 
>
  <div className="pt-4 pr-0 pl-0"> 
    {children}
  </div>
</div>

    </div>
  );
};

export default SidebarLayout;
