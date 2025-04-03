import { Outlet } from "react-router-dom";
import Sidebar from "../Admin-dashboard/Sidebar";
import Navbar from "../Admin-dashboard/Navbar";

const AppLayout = () => {
  return (
    <div className=" min-h-screen">
      <Sidebar />

      <div className="pl-64">
        <Navbar />

        <main className="w-full px-6 py-8">
          <div className="max-w-6xl w-full mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
