import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { isAdminAuthenticated } from "../utils/adminApi";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  if (!isAdminAuthenticated()) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}
