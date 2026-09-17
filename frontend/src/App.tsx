import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/lib/auth-context";
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
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/credit-profile" element={<CreditProfilePage />} />
          <Route path="/fraud-alerts" element={<FraudAlertsPage />} />
          <Route path="/loan" element={<LoanPage />} />
          <Route path="/loan/simulator" element={<LoanSimulatorPage />} />
          <Route path="/schemes" element={<SchemesPage />} />
          <Route path="/financial-coach" element={<FinancialCoachPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
