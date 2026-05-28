import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ChangePasswordPage from "./pages/ChangePasswordPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import ProfileEditPage from "./pages/ProfileEditPage";
import PublicProfilePage from "./pages/PublicProfilePage";
import SkillsPage from "./pages/SkillsPage";
import PortfolioPage from "./pages/PortfolioPage";
import WorkHistoryPage from "./pages/WorkHistoryPage";
import CertificationsPage from "./pages/CertificationsPage";
import ReviewsPage from "./pages/ReviewsPage";
import VerificationPage from "./pages/VerificationPage";
import BadgesPage from "./pages/BadgesPage";
import FreelancerListPage from "./pages/FreelancerListPage";
import AdminUserManagementPage from "./pages/AdminUserManagementPage";
import AdminVerificationQueuePage from "./pages/AdminVerificationQueuePage";
import AdminSystemHealthPage from "./pages/AdminSystemHealthPage";
import PlaceholderPage from "./pages/PlaceholderPage";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./components/layout/AppLayout";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          
          <Route path="/profile/:userId" element={<PublicProfilePage />} />

          {/* Protected Internal Routes */}
          <Route
            path="/dashboard"
            element={<ProtectedRoute><AppLayout><DashboardPage /></AppLayout></ProtectedRoute>}
          />
          <Route
            path="/profile/edit"
            element={<ProtectedRoute><AppLayout><ProfileEditPage /></AppLayout></ProtectedRoute>}
          />
          <Route
            path="/skills"
            element={<ProtectedRoute><AppLayout><SkillsPage /></AppLayout></ProtectedRoute>}
          />
          <Route
            path="/portfolio"
            element={<ProtectedRoute><AppLayout><PortfolioPage /></AppLayout></ProtectedRoute>}
          />
          <Route
            path="/work-history"
            element={<ProtectedRoute><AppLayout><WorkHistoryPage /></AppLayout></ProtectedRoute>}
          />
          <Route
            path="/certifications"
            element={<ProtectedRoute><AppLayout><CertificationsPage /></AppLayout></ProtectedRoute>}
          />
          <Route
            path="/reviews"
            element={<ProtectedRoute><AppLayout><ReviewsPage /></AppLayout></ProtectedRoute>}
          />
          <Route
            path="/verification"
            element={<ProtectedRoute><AppLayout><VerificationPage /></AppLayout></ProtectedRoute>}
          />
          <Route
            path="/badges"
            element={<ProtectedRoute><AppLayout><BadgesPage /></AppLayout></ProtectedRoute>}
          />
          <Route
            path="/change-password"
            element={<ProtectedRoute><AppLayout><ChangePasswordPage /></AppLayout></ProtectedRoute>}
          />
          <Route
            path="/freelancers"
            element={<ProtectedRoute><AppLayout><FreelancerListPage /></AppLayout></ProtectedRoute>}
          />
          <Route
            path="/admin/users"
            element={<ProtectedRoute><AppLayout><AdminUserManagementPage /></AppLayout></ProtectedRoute>}
          />
          <Route
            path="/admin/reviews"
            element={<ProtectedRoute><AppLayout><AdminVerificationQueuePage /></AppLayout></ProtectedRoute>}
          />
          <Route
            path="/admin/system"
            element={<ProtectedRoute><AppLayout><AdminSystemHealthPage /></AppLayout></ProtectedRoute>}
          />

          {/* External Module Placeholders */}
          <Route
            path="/hired-talent"
            element={<ProtectedRoute><AppLayout><PlaceholderPage /></AppLayout></ProtectedRoute>}
          />
          <Route
            path="/post-job"
            element={<ProtectedRoute><AppLayout><PlaceholderPage /></AppLayout></ProtectedRoute>}
          />
          <Route
            path="/projects"
            element={<ProtectedRoute><AppLayout><PlaceholderPage /></AppLayout></ProtectedRoute>}
          />
          <Route
            path="/payments"
            element={<ProtectedRoute><AppLayout><PlaceholderPage /></AppLayout></ProtectedRoute>}
          />
          <Route
            path="/messaging"
            element={<ProtectedRoute><AppLayout><PlaceholderPage /></AppLayout></ProtectedRoute>}
          />
          <Route
            path="/network"
            element={<ProtectedRoute><AppLayout><PlaceholderPage /></AppLayout></ProtectedRoute>}
          />
          
          <Route path="/settings" element={<Navigate to="/change-password" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}