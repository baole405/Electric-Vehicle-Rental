import HomePage from "@/pages/home/HomePage";
import AdminDashboard from "@/pages/dashboard/AdminDashboard";
import About from "@/pages/static/about";
import { ROUTES } from "@/routes/route.constants";
import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "@/routes/protected-route";
import ListVehiclesPage from "@/pages/vehicles/list-vehicles";
import VehicleDetailPage from "@/pages/vehicles/vehicle-detail";
import CreateBookingPage from "@/pages/booking/create-booking-page";
import ProfilePage from "@/pages/home/ProfilePage";
import RegisterPage from "@/pages/auth/RegisterPage";
import LoginPage from "@/pages/auth/LoginPage";

export function AppRoutes() {
  return (
    <Routes>
      <Route path={ROUTES.ROOT} element={<HomePage />} />
      <Route path={ROUTES.HOME} element={<HomePage />} />
      <Route
        path={ROUTES.DASHBOARD}
        element={
          <ProtectedRoute allowedRoles={["admin", "staff"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route path={ROUTES.VEHICLE} element={<ListVehiclesPage />} />
      <Route path={ROUTES.BOOKING} element={<CreateBookingPage />} />
      <Route path={ROUTES.VEHICLE_DETAIL} element={<VehicleDetailPage />} />

      <Route
        path={ROUTES.PROFILE}
        element={
          <ProtectedRoute allowedRoles={["admin", "staff", "renter"]}>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
      <Route path={ROUTES.ABOUT} element={<About />} />
      <Route path="*" element={<HomePage />} />
    </Routes>
  );
}

