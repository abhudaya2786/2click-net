import { Link, useNavigate } from "react-router-dom";
import { Star, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useDemoMode } from "@/context/DemoModeContext";
import { toast } from "sonner";

const fmt = (n) => `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

export default function StoreProductCard({ item, className = "" }) {
  const { add } = useCart();
  const { user } = useAuth();
  const { demoMode } = useDemoMode();
  const nav = useNavigate();

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user && !demoMode) {
      toast.error("Login to add to bag");
      nav("/login");
      return;
    }
    add({
      id: item.id,
      name: item.name,
      price: item.price,
      unit: item.unit,
      image: item.image,
      brand: item.brand,
      category: item.category,
      source: item.source,
    });
    toast.success("Added to bag");
  };

  return (
    <Link
      to={`/store/product/${item.id}`}
      data-testid={`store-card-${item.id}`}
      className={`group block bg-card rounded-xl overflow-hidden border border-border hover:shadow-lg hover:border-primary/30 transition-all ${className}`}
    >
      <div className="relative aspect-[3/4] bg-muted overflow-hidden">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            loading="lazy"
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="h-full w-full bg-muted flex items-center justify-center text-muted-foreground text-xs">No image</div>
        )}
        <button
          type="button"
          onClick={handleAdd}
          data-testid={`store-add-${item.id}`}
          className="absolute bottom-3 right-3 h-10 w-10 rounded-full bg-primary text-white shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all"
          aria-label="Add to bag"
        >
          <ShoppingBag className="h-4 w-4" />
        </button>
        {item.source === "material" && (
          <span className="absolute top-2 left-2 text-[9px] font-mono uppercase bg-black/55 text-white px-1.5 py-0.5 rounded">
            Live rate
          </span>
        )}
      </div>
      <div className="p-3">
        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide truncate">{item.brand}</div>
        <h3 className="text-sm font-medium leading-snug line-clamp-2 mt-0.5 min-h-[2.5rem]">{item.name}</h3>
        <div className="flex items-center gap-1 mt-1.5">
          <Star className="h-3 w-3 fill-primary text-primary" />
          <span className="text-[10px] text-muted-foreground">{item.rating || 4.5}</span>
        </div>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="font-display font-extrabold text-base">{fmt(item.price)}</span>
          <span className="text-[10px] text-muted-foreground">/{item.unit}</span>
        </div>
      </div>
    </Link>
  );
}
