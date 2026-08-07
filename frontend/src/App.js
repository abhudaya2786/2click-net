import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import MarketingLayout from "@/components/marketing/MarketingLayout";

import Home from "@/pages/Home";
import Services from "@/pages/Services";
import Pricing from "@/pages/Pricing";
import Contact from "@/pages/Contact";
import Marketplace from "@/pages/Marketplace";
import Solar from "@/pages/Solar";
import TenderHub from "@/pages/TenderHub";
import TenderDetail from "@/pages/TenderDetail";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import AuthCallback from "@/pages/AuthCallback";
import Dashboard from "@/pages/dashboard/Dashboard";

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
      <Route path="/solar" element={M(<Solar />)} />
      <Route path="/tenders" element={M(<TenderHub />)} />
      <Route path="/tenders/:id" element={M(<TenderDetail />)} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRouter />
          <Toaster position="top-right" />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
