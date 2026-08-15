import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PageSEO from "@/components/marketing/PageSEO";
import StoreProductCard from "@/components/store/StoreProductCard";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useLang } from "@/context/LanguageContext";
import { ArrowLeft, ShoppingBag, Star, Loader2, Minus, Plus } from "lucide-react";
import { toast } from "sonner";

const fmt = (n) => `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

export default function StoreProduct() {
  const { id } = useParams();
  const nav = useNavigate();
  const { add } = useCart();
  const { user } = useAuth();
  const { lang } = useLang();
  const hi = lang === "hi";

  const [item, setItem] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.get(`/store/product/${id}`)
      .then(({ data }) => {
        setItem(data);
        return api.get("/store/browse", { params: { category: data.category, limit: 8 } });
      })
      .then((res) => {
        if (res?.data) {
          setSimilar((res.data.items || []).filter((x) => x.id !== id).slice(0, 4));
        }
      })
      .catch(() => setItem(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAdd = () => {
    if (!user) {
      toast.error(hi ? "लॉगिन करें" : "Please login");
      nav("/login");
      return;
    }
    if (!item) return;
    add({
      id: item.id,
      name: item.name,
      price: item.price,
      unit: item.unit,
      image: item.image,
      brand: item.brand,
      category: item.category,
      source: item.source,
      qty,
    });
    toast.success(hi ? "बैग में जोड़ा" : "Added to bag");
  };

  if (loading) {
    return (
      <div className="flex justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="text-center py-32 text-muted-foreground">
        {hi ? "प्रोडक्ट नहीं मिला" : "Product not found"}
        <Link to="/store" className="text-primary block mt-4">{hi ? "स्टोर पर वापस" : "Back to store"}</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] px-4 md:px-10 py-8" data-testid="store-product-page">
      <PageSEO title={item.name} description={item.description || item.name} path={`/store/product/${id}`} />

      <Link to="/store" className="text-sm text-primary hover:underline flex items-center gap-1 mb-6">
        <ArrowLeft className="h-4 w-4" />{hi ? "स्टोर" : "Store"}
      </Link>

      <div className="grid lg:grid-cols-2 gap-10">
        <div className="aspect-square max-h-[560px] rounded-2xl overflow-hidden bg-muted border border-border">
          {item.image ? (
            <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">No image</div>
          )}
        </div>

        <div>
          <div className="text-sm font-bold text-muted-foreground uppercase tracking-wide">{item.brand}</div>
          <h1 className="font-display font-extrabold text-2xl md:text-3xl tracking-tight mt-2">{item.name}</h1>
          <div className="flex items-center gap-2 mt-3">
            <Star className="h-4 w-4 fill-primary text-primary" />
            <span className="text-sm text-muted-foreground">{item.rating} · {item.category}</span>
          </div>
          <div className="mt-6 flex items-baseline gap-2">
            <span className="font-display font-extrabold text-3xl">{fmt(item.price)}</span>
            <span className="text-muted-foreground">/ {item.unit}</span>
          </div>
          {item.source === "material" && (
            <p className="text-xs text-solar mt-2 font-mono">{hi ? "लाइव मार्केट रेट" : "Live market rate"}</p>
          )}
          <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{item.description}</p>

          <div className="mt-8 flex items-center gap-4">
            <div className="flex items-center border border-border rounded-lg">
              <button type="button" onClick={() => setQty((n) => Math.max(1, n - 1))} className="h-10 w-10 flex items-center justify-center">
                <Minus className="h-4 w-4" />
              </button>
              <Input
                type="number"
                min={1}
                value={qty}
                onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
                className="w-16 text-center border-0 h-10"
              />
              <button type="button" onClick={() => setQty((n) => n + 1)} className="h-10 w-10 flex items-center justify-center">
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <span className="text-sm font-mono text-muted-foreground">
              {hi ? "अनुमान" : "Est."} {fmt(item.price * qty)}
            </span>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button data-testid="pdp-add-bag" size="lg" className="rounded-full px-8" onClick={handleAdd}>
              <ShoppingBag className="h-4 w-4 mr-2" />{hi ? "बैग में डालें" : "Add to bag"}
            </Button>
            <Button size="lg" variant="outline" className="rounded-full" onClick={() => nav("/cart")}>
              {hi ? "बैग देखें" : "View bag"}
            </Button>
          </div>
        </div>
      </div>

      {similar.length > 0 && (
        <div className="mt-16 border-t border-border pt-12">
          <h2 className="font-display font-bold text-lg mb-6">{hi ? "इसी कैटेगरी में" : "More in this category"}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {similar.map((s) => (
              <StoreProductCard key={s.id} item={s} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
