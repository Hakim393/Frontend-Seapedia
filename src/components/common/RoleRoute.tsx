import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { getDashboardPathByRole } from "../../utils/getDashboardPathByRole";

interface RoleRouteProps {
  allowedRoles: ("USER" | "SELLER" | "ADMIN")[];
}

export default function RoleRoute({ allowedRoles }: RoleRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-sm text-gray-500 font-medium select-none">Memeriksa hak akses...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // If user opens links outside their direct permission role level, redirect them to their permitted dashboard!
    const fallbackPath = getDashboardPathByRole(user.role);
    return <Navigate to={fallbackPath} replace />;
  }

  return <Outlet />;
}
