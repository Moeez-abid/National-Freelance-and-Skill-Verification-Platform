import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#001736] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-[#89f5e7] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#89f5e7] text-sm font-bold tracking-widest uppercase">
            Verifying session...
          </p>
        </div>
      </div>
    );
  }

  return token ? children : <Navigate to="/login" replace />;
}