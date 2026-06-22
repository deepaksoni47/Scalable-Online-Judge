import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth.js";

const AdminRoute = () => {
  const { isAuthenticated, isAuthLoading, user } = useAuth();
  const location = useLocation();

  if (isAuthLoading) {
    return <div className="page-status">Checking authorization...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (user?.role !== "admin") {
    return (
      <div className="detail-page" style={{ padding: "4rem 2rem", textAlign: "center" }}>
        <h1 style={{ fontSize: "2rem", color: "#ef4444" }}>Access Denied</h1>
        <p style={{ marginTop: "1rem", color: "#64748b" }}>
          You do not have the required administrator permissions to view this page.
        </p>
        <Navigate to="/problems" replace />
      </div>
    );
  }

  return <Outlet />;
};

export default AdminRoute;
