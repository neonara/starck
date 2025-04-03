import { useState } from 'react';
import {
  Bell, ChevronDown, User, LogOut, Settings, Info, Pencil
} from 'lucide-react';
import { Link } from 'react-router-dom';
import logo from "/assets/logo.jpg";

const Navbar = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
<nav className="fixed top-0 left-64 right-0 z-50 bg-white shadow-sm px-6 py-3 flex justify-between items-center">
<div className="flex items-center gap-2">

      </div>

      <div className="flex items-center gap-4 relative">
        <button className="relative rounded-full border p-2 text-gray-500 hover:bg-gray-100">
          <Bell className="w-5 h-5" />
        </button>

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
                <p className="font-medium text-gray-800">Admin</p>
                <p className="text-gray-500 text-sm">admin@gmail.com</p>
              </div>

              <ul className="text-gray-700 divide-y">
                <li>
                  <Link to="/update-profile" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100">
                    <Pencil className="w-4 h-4" /> Mon profile
                  </Link>
                </li>
                <li>
                  <Link to="/update-profile" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100">
                    <Settings className="w-4 h-4" /> Modifier Profile
                  </Link>
                </li>
                
              </ul>

              <div className="border-t">
                <Link
                  to="/logout"
                  className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-red-600"
                >
                  <LogOut className="w-4 h-4" /> Déconnexion
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
