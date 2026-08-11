import { Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function CartNavButton() {
  const { count } = useCart();

  return (
    <Link
      to="/cart"
      data-testid="nav-cart"
      className="relative h-9 w-9 flex items-center justify-center border border-border hover:bg-accent transition-colors rounded-lg"
      title="My bag"
    >
      <ShoppingBag className="h-4 w-4" strokeWidth={1.5} />
      {count > 0 && (
        <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
