import { useAuthContext } from '@/contexts/auth-context';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import CreateBookingPage from '@/pages/booking/CreateBookingPage';
import BrandDetailPage from '@/pages/brands/BrandDetailPage';
import ListBrandPage from '@/pages/brands/list-brands';
import { AdminDashboard } from '@/pages/dashboard/admin';
import StaffDashboard from '@/pages/dashboard/staff/StaffDashboard';
import BrandsByStationPage from '@/pages/home/BrandsByStationPage';
import PayOSCancelPage from '@/pages/payment/PayOSCancelPage';
import PayOSReturnPage from '@/pages/payment/PayOSReturnPage';
import ProfilePage from '@/pages/profile/ProfilePage';
import About from '@/pages/static/about';
import ListVehiclesPage from '@/pages/vehicles/list-vehicles';
import VehicleDetailPage from '@/pages/vehicles/vehicle-detail';
import ProtectedRoute from '@/routes/protected-route';
import { ROUTES } from '@/routes/route.constants';
import { Route, Routes } from 'react-router-dom';

export function AppRoutes() {
  const { currentUser } = useAuthContext();
  const isAdmin = currentUser?.role === 'admin';

  return (
    <Routes>
      {/* Default route - Brands by Station */}
      <Route path={ROUTES.ROOT} element={<BrandsByStationPage />} />
      <Route path={ROUTES.HOME} element={<BrandsByStationPage />} />

      {/* Brand Detail Route */}
      <Route path="/brands/:id" element={<BrandDetailPage />} />

      {/* Admin Dashboard */}
      <Route
        path={ROUTES.DASHBOARD}
        element={
          <ProtectedRoute allowedRoles={['admin', 'staff']}>
            {isAdmin ? <AdminDashboard /> : <StaffDashboard />}
          </ProtectedRoute>
        }
      />

      <Route path={ROUTES.VEHICLE} element={<ListVehiclesPage />} />
      {/* <Route path={ROUTES.VEHICLE} element={<ListBrandPage />} /> */}
      <Route path={ROUTES.BOOKING} element={<CreateBookingPage />} />
      <Route path={ROUTES.VEHICLE_DETAIL} element={<VehicleDetailPage />} />
      <Route path={ROUTES.BRAND} element={<ListBrandPage />} />

      {/* PayOS Payment Routes */}
      <Route path="/payos/return" element={<PayOSReturnPage />} />
      <Route path="/payos/cancel" element={<PayOSCancelPage />} />

      <Route
        path={ROUTES.PROFILE}
        element={
          <ProtectedRoute allowedRoles={['admin', 'staff', 'renter']}>
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
