// File: frontend/src/App.tsx
import { Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoadingSpinner from './components/LoadingSpinner';
import EMICalculatorPage from './pages/EMICalculatorPage';
import CalculatorsIndexPage from './pages/CalculatorsIndexPage';
import BankPage from './pages/BankPage';
import StatePage from './pages/StatePage';
import CityPage from './pages/CityPage';

const HomePage                 = lazy(() => import('./pages/HomePage'));
const IFSCFinderPage           = lazy(() => import('./pages/IFSCFinderPage'));
const IFSCDetailPage           = lazy(() => import('./pages/IFSCDetailPage'));
const AboutPage                = lazy(() => import('./pages/AboutPage'));
const SIPCalculatorPage        = lazy(() => import('./pages/SIPCalculatorPage'));
const FDCalculatorPage         = lazy(() => import('./pages/FDCalculatorPage'));
const GSTCalculatorPage        = lazy(() => import('./pages/GSTCalculatorPage'));
const EligibilityPage          = lazy(() => import('./pages/EligibilityCalculatorPage'));
const PrepaymentPage           = lazy(() => import('./pages/PrepaymentCalculatorPage'));
const SWPCalculatorPage        = lazy(() => import('./pages/SWPCalculatorPage'));
const StepUpSIPPage            = lazy(() => import('./pages/StepUpSIPPage'));
const MutualFundCalculatorPage = lazy(() => import('./pages/MutualFundCalculatorPage'));
const CAGRCalculatorPage       = lazy(() => import('./pages/CAGRCalculatorPage'));
const XIRRCalculatorPage       = lazy(() => import('./pages/XIRRCalculatorPage'));

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* Existing */}
            <Route path="/"            element={<HomePage />} />
            <Route path="/ifsc"        element={<IFSCFinderPage />} />
            <Route path="/ifsc-finder" element={<IFSCFinderPage />} />

            <Route path="/ifsc/:ifsc"  element={<IFSCDetailPage />} />
            <Route path="/bank/:bank" element={<BankPage />} />
            <Route path="/state/:state" element={<StatePage />} />
            <Route path="/city/:city" element={<CityPage />} />

            <Route path="/bank/:bank" element={<BankPage />} />
            <Route path="/state/:bank/:state" element={<StatePage />} />
            <Route path="/city/:bank/:state/:city" element={<CityPage />} />

            
            <Route path="/about"       element={<AboutPage />} />
          

            {/* Calculator Index */}
            <Route path="/calculators" element={<CalculatorsIndexPage />} />

            {/* EMI Calculators — key prop forces remount on tab switch */}
            <Route path="/calculators/emi"                element={<EMICalculatorPage key="emi"       defaultLoan="home" />} />
            <Route path="/calculators/home-loan-emi"      element={<EMICalculatorPage key="home"      defaultLoan="home" />} />
            <Route path="/calculators/personal-loan-emi"  element={<EMICalculatorPage key="personal"  defaultLoan="personal" />} />
            <Route path="/calculators/car-loan-emi"       element={<EMICalculatorPage key="car"       defaultLoan="car" />} />
            <Route path="/calculators/education-loan-emi" element={<EMICalculatorPage key="education" defaultLoan="education" />} />
            <Route path="/calculators/business-loan-emi"  element={<EMICalculatorPage key="business"  defaultLoan="business" />} />


            {/* SIP family — defaultTab prop + key forces correct tab */}
            <Route path="/calculators/sip"      element={<SIPCalculatorPage key="sip"     defaultTab="sip" />} />
            <Route path="/calculators/lumpsum"  element={<SIPCalculatorPage key="lumpsum" defaultTab="lumpsum" />} />
            <Route path="/calculators/goal-sip" element={<SIPCalculatorPage key="goal"    defaultTab="goal" />} />

            {/* Investment Calculators */}
            <Route path="/calculators/swp"          element={<SWPCalculatorPage key="swp" />} />
            <Route path="/calculators/step-up-sip"  element={<StepUpSIPPage key="stepup" />} />
            <Route path="/calculators/mutual-fund"  element={<MutualFundCalculatorPage key="mf" />} />
            <Route path="/calculators/cagr"         element={<CAGRCalculatorPage key="cagr" />} />
            <Route path="/calculators/xirr"         element={<XIRRCalculatorPage key="xirr" />} />
            <Route path="/calculators/fd"           element={<FDCalculatorPage key="fd"  type="fd" />} />
            <Route path="/calculators/rd"           element={<FDCalculatorPage key="rd"  type="rd" />} />
            <Route path="/calculators/ppf"          element={<FDCalculatorPage key="ppf" type="ppf" />} />
            <Route path="/calculators/nps"          element={<FDCalculatorPage key="nps" type="nps" />} />

            {/* Eligibility Calculators */}
            <Route path="/calculators/home-loan-eligibility"     element={<EligibilityPage key="elig-home"     type="home" />} />
            <Route path="/calculators/personal-loan-eligibility" element={<EligibilityPage key="elig-personal" type="personal" />} />

            {/* Prepayment Calculators */}
            <Route path="/calculators/home-prepayment"     element={<PrepaymentPage key="prep-home"     type="home" />} />
            <Route path="/calculators/personal-prepayment" element={<PrepaymentPage key="prep-personal" type="personal" />} />

            {/* GST */}
            <Route path="/calculators/gst" element={<GSTCalculatorPage key="gst" />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

export default App;
