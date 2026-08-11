import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { PermissionProvider } from "@/context/PermissionContext";
import { BrandingProvider } from "@/context/BrandingContext";
import { LanguageProvider } from "@/context/LanguageContext";
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
import Enrollment from "@/pages/Enrollment";
import { TermsPage, PrivacyPage } from "@/pages/Legal";
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

const M = (C) => <MarketingLayout>{C}</MarketingLayout>;

function AppRouter() {
  const location = useLocation();
  if (location.hash?.includes("session_id=")) return <AuthCallback />;
  return (
    <Routes>
      <Route path="/" element={M(<Home />)} />
      <Route path="/services" element={M(<Services />)} />
      <Route path="/pricing" element={M(<Pricing />)} />
      <Route path="/contact" element={M(<Contact />)} />
      <Route path="/marketplace" element={M(<Marketplace />)} />
      <Route path="/mart" element={M(<Mart />)} />
      <Route path="/interior-boq" element={M(<InteriorBOQ />)} />
      <Route path="/interior-boq/:verticalId" element={M(<InteriorBOQ />)} />
      <Route path="/solar" element={M(<Solar />)} />
      <Route path="/tenders" element={M(<TenderHub />)} />
      <Route path="/tenders/:id" element={M(<TenderDetail />)} />
      <Route path="/freelancers" element={M(<Freelancers />)} />
      <Route path="/consultants" element={M(<Consultants />)} />
      <Route path="/download-app" element={M(<DownloadApp />)} />
      <Route path="/become-vendor" element={M(<BecomeVendor />)} />
      <Route path="/login" element={<Login />} />
      <Route path="/enroll" element={<Enrollment />} />
      <Route path="/terms" element={M(<TermsPage />)} />
      <Route path="/privacy" element={M(<PrivacyPage />)} />
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
            <AuthProvider>
              <PermissionProvider>
                <BrowserRouter>
                  <AppRouter />
                  <Toaster position="top-right" />
                </BrowserRouter>
              </PermissionProvider>
            </AuthProvider>
          </ThemeProvider>
        </BrandingProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}
