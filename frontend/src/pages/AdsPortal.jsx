import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { LayoutDashboard, PlusSquare, Megaphone, BarChart3, Receipt, ShieldCheck } from "lucide-react";
import AdOverview from "@/components/ads/AdOverview";
import CreateAd from "@/components/ads/CreateAd";
import MyCampaigns from "@/components/ads/MyCampaigns";
import AdAnalytics from "@/components/ads/AdAnalytics";
import AdsBilling from "@/components/ads/AdsBilling";
import AdminAds from "@/components/ads/AdminAds";

export default function AdsPortal() {
  const { user } = useAuth();
  const [active, setActive] = useState("overview");
  const isAdmin = user?.role === "super_admin";

  const NAV = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "create", label: "Create Ad", icon: PlusSquare },
    { id: "campaigns", label: "My Campaigns", icon: Megaphone },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "billing", label: "Billing & Invoices", icon: Receipt },
    ...(isAdmin ? [{ id: "admin", label: "Admin Panel", icon: ShieldCheck }] : []),
  ];

  return (
    <DashboardLayout nav={NAV} active={active} setActive={setActive} title="Advertising Portal">
      {active === "overview" && <AdOverview onCreate={() => setActive("create")} />}
      {active === "create" && <CreateAd onDone={() => setActive("campaigns")} />}
      {active === "campaigns" && <MyCampaigns onCreate={() => setActive("create")} />}
      {active === "analytics" && <AdAnalytics />}
      {active === "billing" && <AdsBilling />}
      {active === "admin" && isAdmin && <AdminAds />}
    </DashboardLayout>
  );
}
