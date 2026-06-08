import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";

const MainLayout = () => {
  const location = useLocation();
  
  // Detect if we are on a specific problem's workspace page (e.g., /problems/:id)
  // but not the general /problems listing page.
  const isWorkspace = /^\/problems\/[a-f0-9]{24}$/i.test(location.pathname) || 
                      (/^\/problems\/[a-zA-Z0-9_-]+$/.test(location.pathname) && location.pathname !== "/problems");

  return (
    <div className="app-shell">
      <Navbar />
      <main className={isWorkspace ? "workspace-main-content" : "main-content"}>
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
