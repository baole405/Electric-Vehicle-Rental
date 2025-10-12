import HomePage from "@/pages/home/HomePage";
import AdminDashboard from "@/pages/dashboard/AdminDashboard";
import About from "@/pages/static/about";
import { ROUTES } from "@/routes/route.constants";
import { Route, Routes } from "react-router-dom";

export function AppRoutes() {
  return (
    <Routes>
      <Route path={ROUTES.ROOT} element={<HomePage />} />
      <Route path={ROUTES.HOME} element={<HomePage />} />
      <Route path={ROUTES.DASHBOARD} element={<AdminDashboard />} />
      <Route path={ROUTES.ABOUT} element={<About />} />
      <Route path="*" element={<HomePage />} />
    </Routes>
  );
}
