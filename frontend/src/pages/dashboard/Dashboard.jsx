import { useAuth } from "@/context/AuthContext";
import AdminDashboard from "@/pages/dashboard/AdminDashboard";
import VendorDashboard from "@/pages/dashboard/VendorDashboard";
import CustomerDashboard from "@/pages/dashboard/CustomerDashboard";
import ContractorDashboard from "@/pages/dashboard/ContractorDashboard";
import FreelancerWorkspace from "@/pages/dashboard/FreelancerWorkspace";

const FREELANCER_TYPES = ["freelancer", "architect", "engineer", "ca", "service_provider"];

export default function Dashboard() {
  const { user } = useAuth();
  if (!user) return null;
  if (user.role === "super_admin") return <AdminDashboard />;
  if (FREELANCER_TYPES.includes(user.user_type)) return <FreelancerWorkspace />;
  if (user.role === "vendor") return <VendorDashboard />;
  if (user.role === "contractor") return <ContractorDashboard />;
  return <CustomerDashboard />;
}
