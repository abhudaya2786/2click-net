import { useAuth } from "@/context/AuthContext";
import AdminDashboard from "@/pages/dashboard/AdminDashboard";
import VendorDashboard from "@/pages/dashboard/VendorDashboard";
import CustomerDashboard from "@/pages/dashboard/CustomerDashboard";
import ContractorDashboard from "@/pages/dashboard/ContractorDashboard";

export default function Dashboard() {
  const { user } = useAuth();
  if (!user) return null;
  if (user.role === "super_admin") return <AdminDashboard />;
  if (user.role === "vendor") return <VendorDashboard />;
  if (user.role === "contractor") return <ContractorDashboard />;
  return <CustomerDashboard />;
}
