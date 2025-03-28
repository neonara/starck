import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../Admin-dashboard/Navbar';
import Sidebar from '../Admin-dashboard/Sidebar';

const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-100">

      <Sidebar  />

      <div className="flex-1 min-h-screen pl-64">
        <Navbar />
        <main className="flex-1 bg-gray-100">
      
          <Outlet />
          </main>
        
      </div>
    </div>
  );
};

export default AppLayout;
