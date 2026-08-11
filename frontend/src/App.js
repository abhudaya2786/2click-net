import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { PermissionProvider } from "@/context/PermissionContext";
import { BrandingProvider } from "@/context/BrandingContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { CatalogProvider } from "@/context/CatalogContext";
import { CartProvider } from "@/context/CartContext";
import { DemoModeProvider } from "@/context/DemoModeContext";
import DemoPanel from "@/components/demo/PlatformDemo";
import ProtectedRoute from "@/components/ProtectedRoute";
import ErrorBoundary from "@/components/ErrorBoundary";
import MarketingLayout from "@/components/marketing/MarketingLayout";

import Home from "@/pages/Home";
import Services from "@/pages/Services";
import Pricing from "@/pages/Pricing";
import Contact from "@/pages/Contact";
import Marketplace from "@/pages/Marketplace";
import Mart from "@/pages/Mart";
import Solar from "@/pages/Solar";
import TenderHub from "@/pages/TenderHub";
import TenderDetail from "@/pages/TenderDetail";
import Freelancers from "@/pages/Freelancers";
import Login from "@/pages/Login";
import AdminLogin from "@/pages/AdminLogin";
import Enrollment from "@/pages/Enrollment";
import { TermsPage, PrivacyPage, ClientAgreementPage, FreelancerAgreementPage } from "@/pages/Legal";
import Register from "@/pages/Register";
import AuthCallback from "@/pages/AuthCallback";
import ResetPassword from "@/pages/ResetPassword";
import PaymentSuccess from "@/pages/PaymentSuccess";
import AdsPortal from "@/pages/AdsPortal";
import BecomeVendor from "@/pages/BecomeVendor";
import Dashboard from "@/pages/dashboard/Dashboard";
import DownloadApp from "@/pages/DownloadApp";
import InteriorBOQ from "@/pages/InteriorBOQ";
import Consultants from "@/pages/Consultants";
import Store from "@/pages/Store";
import StoreProduct from "@/pages/StoreProduct";
import Cart from "@/pages/Cart";
import FullBOQBuilder from "@/pages/FullBOQBuilder";
import UpcomingProjects from "@/pages/UpcomingProjects";
import PropertyAdvisory from "@/pages/PropertyAdvisory";
import EquipmentRental from "@/pages/EquipmentRental";
import Build from "@/pages/Build";
import Estimate from "@/pages/Estimate";
import ProjectPlanner from "@/pages/ProjectPlanner";
import DesignStudio from "@/pages/DesignStudio";
import Technology from "@/pages/Technology";
import About from "@/pages/About";
import ProfessionalsHub from "@/pages/ProfessionalsHub";

const M = (C) => <MarketingLayout>{C}</MarketingLayout>;

function AppRouter() {
  const location = useLocation();
  if (location.hash?.includes("session_id=")) return <AuthCallback />;
  return (
    <Routes>
      <Route path="/" element={M(<Home />)} />
      <Route path="/build" element={M(<Build />)} />
      <Route path="/estimate" element={M(<Estimate />)} />
      <Route path="/projects" element={M(<ProjectPlanner />)} />
      <Route path="/design" element={M(<DesignStudio />)} />
      <Route path="/technology" element={M(<Technology />)} />
      <Route path="/about" element={M(<About />)} />
      <Route path="/professionals" element={M(<ProfessionalsHub />)} />
      <Route path="/services" element={M(<Services />)} />
      <Route path="/pricing" element={M(<Pricing />)} />
      <Route path="/contact" element={M(<Contact />)} />
      <Route path="/marketplace" element={M(<Marketplace />)} />
      <Route path="/store" element={M(<Store />)} />
      <Route path="/store/product/:id" element={M(<StoreProduct />)} />
      <Route path="/cart" element={M(<Cart />)} />
      <Route path="/mart" element={M(<Mart />)} />
      <Route path="/interior-boq" element={M(<InteriorBOQ />)} />
      <Route path="/interior-boq/:verticalId" element={M(<InteriorBOQ />)} />
      <Route path="/boq-builder" element={M(<FullBOQBuilder />)} />
      <Route path="/upcoming-projects" element={M(<UpcomingProjects />)} />
      <Route path="/property-advisory" element={M(<PropertyAdvisory />)} />
      <Route path="/equipment-rental" element={M(<EquipmentRental />)} />
      <Route path="/solar" element={M(<Solar />)} />
      <Route path="/tenders" element={M(<TenderHub />)} />
      <Route path="/tenders/:id" element={M(<TenderDetail />)} />
      <Route path="/freelancers" element={M(<Freelancers />)} />
      <Route path="/consultants" element={M(<Consultants />)} />
      <Route path="/download-app" element={M(<DownloadApp />)} />
      <Route path="/become-vendor" element={M(<BecomeVendor />)} />
      <Route path="/login" element={<Login />} />
      <Route path="/sys/console" element={<AdminLogin />} />
      <Route path="/enroll" element={<Enrollment />} />
      <Route path="/terms" element={M(<TermsPage />)} />
      <Route path="/privacy" element={M(<PrivacyPage />)} />
      <Route path="/client-agreement" element={M(<ClientAgreementPage />)} />
      <Route path="/freelancer-agreement" element={M(<FreelancerAgreementPage />)} />
      <Route path="/register" element={<Register />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/payment/success" element={<PaymentSuccess />} />
      <Route path="/payment/cancel" element={<PaymentSuccess />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/ads" element={<ProtectedRoute><AdsPortal /></ProtectedRoute>} />
    </Routes>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <BrandingProvider>
          <ThemeProvider>
            <BrowserRouter>
              <AuthProvider>
                <PermissionProvider>
                      <DemoModeProvider>
                        <CatalogProvider>
                          <CartProvider>
                            <AppRouter />
                            <DemoPanel />
                          </CartProvider>
                        </CatalogProvider>
                      </DemoModeProvider>
                </PermissionProvider>
              </AuthProvider>
              <Toaster position="top-right" />
            </BrowserRouter>
          </ThemeProvider>
        </BrandingProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}
