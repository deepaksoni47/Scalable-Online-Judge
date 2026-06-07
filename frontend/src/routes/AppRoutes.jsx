import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute.jsx";
import MainLayout from "../layouts/MainLayout.jsx";
import Home from "../pages/Home.jsx";
import Login from "../pages/Login.jsx";
import Register from "../pages/Register.jsx";
import Profile from "../pages/Profile.jsx";
import ProblemsPage from "../pages/ProblemsPage.jsx";
import ProblemDetailPage from "../pages/ProblemDetailPage.jsx";

const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/problems" element={<ProblemsPage />} />
        <Route path="/problems/:id" element={<ProblemDetailPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
