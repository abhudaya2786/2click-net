import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/** Legacy marketplace URL → unified Myntra-style store */
export default function Marketplace() {
  const nav = useNavigate();
  useEffect(() => {
    nav("/store", { replace: true });
  }, [nav]);
  return null;
}
