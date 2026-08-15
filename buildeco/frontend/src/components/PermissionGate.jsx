import { usePermissions } from "@/context/PermissionContext";

// Hook: usePermission("tender", "APPROVE") -> boolean
export function usePermission(module, action) {
  const { has } = usePermissions();
  return has(module, action);
}

// Component gate. Renders children only if permitted.
// <PermissionGate module="tender" action="APPROVE">...</PermissionGate>
export default function PermissionGate({ module, action, children, fallback = null }) {
  const { has } = usePermissions();
  return has(module, action) ? children : fallback;
}
