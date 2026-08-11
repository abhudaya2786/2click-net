import { useAuth } from "@/context/AuthContext";
import AdminDashboard from "@/pages/dashboard/AdminDashboard";
import VendorDashboard from "@/pages/dashboard/VendorDashboard";
import CustomerDashboard from "@/pages/dashboard/CustomerDashboard";
import ContractorDashboard from "@/pages/dashboard/ContractorDashboard";
import FreelancerWorkspace from "@/pages/dashboard/FreelancerWorkspace";
import ConsultantWorkspace from "@/pages/dashboard/ConsultantWorkspace";

const FREELANCER_TYPES = ["freelancer", "engineer", "ca", "service_provider"];
const CONSULTANT_PANEL_TYPES = ["architect", "interior_consultant", "exterior_consultant", "vastu_consultant"];

export default function Dashboard() {
  const { user } = useAuth();
  if (!user) return null;
  if (user.role === "super_admin") return <AdminDashboard />;
  if (CONSULTANT_PANEL_TYPES.includes(user.user_type)) return <ConsultantWorkspace />;
  if (FREELANCER_TYPES.includes(user.user_type)) return <FreelancerWorkspace />;
  if (user.role === "vendor") return <VendorDashboard />;
  if (user.role === "contractor") return <ContractorDashboard />;
  return <CustomerDashboard />;
}
