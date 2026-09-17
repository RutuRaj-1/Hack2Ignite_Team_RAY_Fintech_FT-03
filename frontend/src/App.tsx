import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/lib/auth-context";
import { ProtectedRoute, PublicOnlyRoute } from "@/components/RouteGuards";
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import DashboardPage from "@/pages/DashboardPage";
import OnboardingPage from "@/pages/OnboardingPage";
import AnalyticsPage from "@/pages/AnalyticsPage";
import TransactionsPage from "@/pages/TransactionsPage";
import CreditProfilePage from "@/pages/CreditProfilePage";
import FraudAlertsPage from "@/pages/FraudAlertsPage";
import LoanPage from "@/pages/LoanPage";
import LoanSimulatorPage from "@/pages/LoanSimulatorPage";
import SchemesPage from "@/pages/SchemesPage";
import FinancialCoachPage from "@/pages/FinancialCoachPage";
import NotFoundPage from "@/pages/NotFoundPage";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Landing */}
          <Route path="/" element={<HomePage />} />

          {/* Guest Only Auth Pages */}
          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <LoginPage />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicOnlyRoute>
                <RegisterPage />
              </PublicOnlyRoute>
            }
          />

          {/* Protected Application Workflows */}
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <OnboardingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <AnalyticsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transactions"
            element={
              <ProtectedRoute>
                <TransactionsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/credit-profile"
            element={
              <ProtectedRoute>
                <CreditProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/fraud-alerts"
            element={
              <ProtectedRoute>
                <FraudAlertsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/loan"
            element={
              <ProtectedRoute>
                <LoanPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/loan/simulator"
            element={
              <ProtectedRoute>
                <LoanSimulatorPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/schemes"
            element={
              <ProtectedRoute>
                <SchemesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/financial-coach"
            element={
              <ProtectedRoute>
                <FinancialCoachPage />
              </ProtectedRoute>
            }
          />

          {/* 404 Fallback */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
