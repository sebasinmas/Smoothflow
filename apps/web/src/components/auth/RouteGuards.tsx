import { Navigate, Outlet, useLocation } from "react-router-dom";
import type { Role } from "@smoothflow/shared";
import { useAuth } from "@/contexts/AuthContext";
import { ROLE_HOME } from "@/lib/utils";

export function RequireAuth({ roles }: { roles?: Role[] }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <p className="text-text-muted">Cargando sesión…</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to={ROLE_HOME[user.role]} replace />;
  }

  return <Outlet />;
}

export function GuestOnly() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to={ROLE_HOME[user.role]} replace />;
  return <Outlet />;
}
