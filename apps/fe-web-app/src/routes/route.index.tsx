import BrandsByStationPage from "@/pages/home/BrandsByStationPage";
import { AdminDashboard } from "@/pages/dashboard/admin";
import About from "@/pages/static/about";
import { ROUTES } from "@/routes/route.constants";
import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "@/routes/protected-route";
import ListVehiclesPage from "@/pages/vehicles/list-vehicles";
import VehicleDetailPage from "@/pages/vehicles/vehicle-detail";
import CreateBookingPage from "@/pages/booking/CreateBookingPage";
import ProfilePage from "@/pages/profile/ProfilePage";
import RegisterPage from "@/pages/auth/RegisterPage";
import LoginPage from "@/pages/auth/LoginPage";
import ListBrandPage from "@/pages/brands/list-brands";
import BrandDetailPage from "@/pages/brands/BrandDetailPage";

export function AppRoutes() {
  return (
    <Routes>
      {/* Default route - Brands by Station */}
      <Route path={ROUTES.ROOT} element={<BrandsByStationPage />} />
      <Route path={ROUTES.HOME} element={<BrandsByStationPage />} />

      {/* Brand Detail Route */}
      <Route path="/brands/:id" element={<BrandDetailPage />} />

      <Route
        path={ROUTES.DASHBOARD}
        element={
          <ProtectedRoute allowedRoles={["admin", "staff"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />


      <Route path={ROUTES.VEHICLE} element={<ListVehiclesPage />} />
      {/* <Route path={ROUTES.VEHICLE} element={<ListBrandPage />} /> */}
      <Route path={ROUTES.BOOKING} element={<CreateBookingPage />} />
      <Route path={ROUTES.VEHICLE_DETAIL} element={<VehicleDetailPage />} />
      <Route path={ROUTES.BRAND} element={<ListBrandPage />} />


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
      <Route path="*" element={<BrandsByStationPage />} />
    </Routes>
  );
}

