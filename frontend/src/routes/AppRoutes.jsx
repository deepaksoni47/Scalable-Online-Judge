import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute.jsx";
import AdminRoute from "../components/AdminRoute.jsx";
import MainLayout from "../layouts/MainLayout.jsx";
import Home from "../pages/Home.jsx";
import Login from "../pages/Login.jsx";
import Register from "../pages/Register.jsx";
import Profile from "../pages/Profile.jsx";
import ProblemsPage from "../pages/ProblemsPage.jsx";
import ProblemDetailPage from "../pages/ProblemDetailPage.jsx";
import ReviewHistoryPage from "../pages/ReviewHistoryPage.jsx";
import LeaderboardPage from "../pages/LeaderboardPage.jsx";
import DashboardPage from "../pages/DashboardPage.jsx";
import AdminDashboard from "../pages/AdminDashboard.jsx";
import AdminProblemForm from "../pages/AdminProblemForm.jsx";
import AdminTestCaseManager from "../pages/AdminTestCaseManager.jsx";

const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/problems" element={<ProblemsPage />} />
        <Route path="/problems/:id" element={<ProblemDetailPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Regular authenticated user routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/ai-reviews" element={<ReviewHistoryPage />} />
        </Route>

        {/* Admin only routes */}
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/problems/new" element={<AdminProblemForm />} />
          <Route path="/admin/problems/:id/edit" element={<AdminProblemForm />} />
          <Route path="/admin/problems/:id/testcases" element={<AdminTestCaseManager />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
