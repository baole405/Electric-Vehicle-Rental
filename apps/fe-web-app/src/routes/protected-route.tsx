import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuthContext } from "@/contexts/auth-context";
import { ROUTES } from "@/routes/route.constants";

const LoadingFallback = () => (
  <div className="flex min-h-screen items-center justify-center bg-gray-50">
    <div className="rounded-md border border-gray-200 bg-white px-4 py-2 text-sm text-gray-600 shadow-sm">
      Checking permissions...
    </div>
  </div>
);

type ProtectedRouteProps = {
  children: ReactNode;
  allowedRoles?: Array<"admin" | "staff" | "renter">;
  redirectTo?: string;
};

export const ProtectedRoute = ({ children, allowedRoles, redirectTo = ROUTES.LOGIN }: ProtectedRouteProps) => {
  const { currentUser, role, isLoading } = useAuthContext();

  if (isLoading) {
    return <LoadingFallback />;
  }

  if (!currentUser) {
    return <Navigate to={redirectTo} replace />;
  }

  const effectiveRole = role ?? currentUser.role;

  if (allowedRoles && !allowedRoles.includes(effectiveRole)) {
    const fallback = effectiveRole === "admin" || effectiveRole === "staff" ? ROUTES.DASHBOARD : ROUTES.ROOT;
    return <Navigate to={fallback} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
