import { Outlet } from "react-router-dom";
import Sidebar from "../Admin-dashboard/Sidebar";
import Navbar from "../Admin-dashboard/Navbar";

const AppLayout = () => {
  return (
    <div className="min-h-screen bg-white">
      <Sidebar />

      <div className="pl-64 bg-white">
        <Navbar />

        <main className="w-full px-6 py-8 bg-white">
          <div className="max-w-6xl w-full mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
