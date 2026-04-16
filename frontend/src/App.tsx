// File: frontend/src/App.tsx
import { Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import LoadingSpinner from "./components/LoadingSpinner";
import EMICalculatorPage from "./pages/EMICalculatorPage";
import CalculatorsIndexPage from "./pages/CalculatorsIndexPage";
import BankPage from "./pages/BankPage";
import StatePage from "./pages/StatePage";
import CityPage from "./pages/CityPage";
import CreditCards from "./pages/CreditCards";
import CreditCardDetail from "./pages/CreditCardDetail";
import CreditCardCompare from "./pages/CreditCardCompare";
import BankAccounts from "./pages/BankAccounts";
import SalaryCalculatorPage from "./pages/SalaryCalculatorPage";
import HRACalculatorPage from "./pages/HRACalculatorPage";
import BlogListingPage from "./pages/BlogListingPage";
import BlogDetailPage from "./pages/BlogDetailPage";

// Admin imports
import Login from "./admin/pages/Login";
import AdminLayout from "./admin/layout/AdminLayout";
import ProtectedRoute from "./admin/components/ProtectedRoute";
import AdminDashboard from "./admin/pages/Dashboard";
import CreditCardsPage from "./admin/pages/CreditCardsPage";
import CardDetailPage from "./admin/pages/CardDetailPage";
import AddEditCardPage from "./admin/pages/AddEditCardPage";
import IncomeTaxCalculator from "./pages/IncomeTaxCalculator";
import CalculatorLayout from "./components/CalculatorLayout";

const HomePage = lazy(() => import("./pages/HomePage"));
const IFSCFinderPage = lazy(() => import("./pages/IFSCFinderPage"));
const IFSCDetailPage = lazy(() => import("./pages/IFSCDetailPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const SIPCalculatorPage = lazy(() => import("./pages/SIPCalculatorPage"));
const FDCalculatorPage = lazy(() => import("./pages/FDCalculatorPage"));
const GSTCalculatorPage = lazy(() => import("./pages/GSTCalculatorPage"));
const EligibilityPage = lazy(() => import("./pages/EligibilityCalculatorPage"));
const PrepaymentPage = lazy(() => import("./pages/PrepaymentCalculatorPage"));
const SWPCalculatorPage = lazy(() => import("./pages/SWPCalculatorPage"));
const StepUpSIPPage = lazy(() => import("./pages/StepUpSIPPage"));
const MutualFundCalculatorPage = lazy(() => import("./pages/MutualFundCalculatorPage"));
const CAGRCalculatorPage = lazy(() => import("./pages/CAGRCalculatorPage"));
const XIRRCalculatorPage = lazy(() => import("./pages/XIRRCalculatorPage"));
const Loans = lazy(() => import("./pages/Loans"));

function App() {
  return (
    <Routes>
      {/* ─── Admin Routes (no Navbar / Footer) ─── */}
      <Route path="/admin/login" element={<Login />} />
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute>
            <AdminRoutes />
          </ProtectedRoute>
        }
      />

      {/* ─── Public Routes (with Navbar / Footer) ─── */}
      <Route path="/*" element={<PublicLayout />} />
    </Routes>
  );
}

function AdminComingSoon({ title, description }: { title: string; description: string }) {
  return (
    <AdminLayout>
      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-5">
          <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">{title}</h2>
        <p className="text-gray-500 text-sm mb-1">{description}</p>
        <p className="text-gray-400 text-xs">This module is under development and will be available soon.</p>
      </div>
    </AdminLayout>
  );
}

function AdminRoutes() {
  return (
    <Routes>
      <Route path="/" element={<AdminDashboard />} />
      <Route path="/dashboard" element={<AdminDashboard />} />
      <Route path="/credit-cards" element={<CreditCardsPage />} />
      <Route path="/credit-cards/new" element={<AddEditCardPage />} />
      <Route path="/credit-cards/:slug" element={<CardDetailPage />} />
      <Route path="/credit-cards/:slug/edit" element={<AddEditCardPage />} />
      <Route path="/banks" element={<AdminComingSoon title="Banks" description="Manage bank profiles, logos, and card issuer settings." />} />
      <Route path="/users" element={<AdminComingSoon title="Users" description="Manage admin users, roles, and access permissions." />} />
    </Routes>
  );
}

function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            {/* <Route path="/loans" element={<Loans />} /> */}
            <Route path="/accounts" element={<BankAccounts />} />
            <Route path="/salary-calculator" element={<SalaryCalculatorPage />} />
            <Route path="/hra-calculator" element={<HRACalculatorPage />} />
            <Route path="/ifsc" element={<IFSCFinderPage />} />
            <Route path="/ifsc-finder" element={<IFSCFinderPage />} />
            <Route path="/ifsc/:ifsc" element={<IFSCDetailPage />} />
            <Route path="/bank/:bank" element={<BankPage />} />
            <Route path="/state/:state" element={<StatePage />} />
            <Route path="/city/:city" element={<CityPage />} />
            <Route path="/state/:bank/:state" element={<StatePage />} />
            <Route path="/city/:bank/:state/:city" element={<CityPage />} />
            <Route path="/money-guides" element={<BlogListingPage />} />
            <Route path="/money-guides/:slug" element={<BlogDetailPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/credit-cards" element={<CreditCards />} />
            <Route path="/credit-cards/compare" element={<CreditCardCompare />} />
            <Route path="/credit-cards/:slug" element={<CreditCardDetail />} />

            {/* Calculator Index (no sidebar) */}
            <Route path="/calculators" element={<CalculatorsIndexPage />} />

            {/* All calculator pages with sidebar */}
            <Route element={<CalculatorLayout />}>
              {/* EMI Calculators */}
              <Route path="/calculators/emi" element={<EMICalculatorPage key="emi" defaultLoan="home" />} />
              <Route path="/calculators/home-loan-emi" element={<EMICalculatorPage key="home" defaultLoan="home" />} />
              <Route path="/calculators/personal-loan-emi" element={<EMICalculatorPage key="personal" defaultLoan="personal" />} />
              <Route path="/calculators/car-loan-emi" element={<EMICalculatorPage key="car" defaultLoan="car" />} />
              <Route path="/calculators/education-loan-emi" element={<EMICalculatorPage key="education" defaultLoan="education" />} />
              <Route path="/calculators/business-loan-emi" element={<EMICalculatorPage key="business" defaultLoan="business" />} />
              <Route path="/calculators/lap-emi" element={<EMICalculatorPage key="lap" defaultLoan="home" />} />
              <Route path="/emi-calculator" element={<EMICalculatorPage />} />

              {/* SIP family */}
              <Route path="/calculators/sip" element={<SIPCalculatorPage key="sip" defaultTab="sip" />} />
              <Route path="/calculators/lumpsum" element={<SIPCalculatorPage key="lumpsum" defaultTab="lumpsum" />} />
              <Route path="/calculators/goal-sip" element={<SIPCalculatorPage key="goal" defaultTab="goal" />} />

              {/* Investment Calculators */}
              <Route path="/calculators/swp" element={<SWPCalculatorPage key="swp" />} />
              <Route path="/calculators/step-up-sip" element={<StepUpSIPPage key="stepup" />} />
              <Route path="/calculators/mutual-fund" element={<MutualFundCalculatorPage key="mf" />} />
              <Route path="/calculators/cagr" element={<CAGRCalculatorPage key="cagr" />} />
              <Route path="/calculators/xirr" element={<XIRRCalculatorPage key="xirr" />} />
              <Route path="/calculators/fd" element={<FDCalculatorPage key="fd" type="fd" />} />
              <Route path="/calculators/rd" element={<FDCalculatorPage key="rd" type="rd" />} />
              <Route path="/calculators/ppf" element={<FDCalculatorPage key="ppf" type="ppf" />} />
              <Route path="/calculators/nps" element={<FDCalculatorPage key="nps" type="nps" />} />

              {/* Eligibility Calculators */}
              <Route path="/calculators/home-loan-eligibility" element={<EligibilityPage key="elig-home" type="home" />} />
              <Route path="/calculators/personal-loan-eligibility" element={<EligibilityPage key="elig-personal" type="personal" />} />

              {/* Prepayment Calculators */}
              <Route path="/calculators/home-prepayment" element={<PrepaymentPage key="prep-home" type="home" />} />
              <Route path="/calculators/personal-prepayment" element={<PrepaymentPage key="prep-personal" type="personal" />} />

              {/* GST */}
              <Route path="/calculators/gst" element={<GSTCalculatorPage key="gst" />} />

              {/* Tax & Salary */}
              <Route path="/calculators/salary-calculator" element={<SalaryCalculatorPage />} />
              <Route path="/calculators/hra-calculator" element={<HRACalculatorPage />} />
              <Route path="/calculators/income-tax" element={<IncomeTaxCalculator />} />
            </Route>

            {/* Standalone salary/hra shortcuts (also with sidebar) */}
            <Route element={<CalculatorLayout />}>
              <Route path="/salary-calculator" element={<SalaryCalculatorPage />} />
              <Route path="/hra-calculator" element={<HRACalculatorPage />} />
            </Route>
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

export default App;
