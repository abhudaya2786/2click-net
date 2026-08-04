import React, { useState, useEffect } from 'react';
import { 
  Store, 
  PlusCircle, 
  Search, 
  Tag, 
  ShieldCheck, 
  PhoneCall, 
  Building2, 
  Star, 
  Package, 
  CheckCircle2, 
  X,
  Sparkles,
  Filter,
  ShoppingCart,
  Image as ImageIcon,
  Upload,
  Camera,
  Trash2,
  Plus,
  Minus,
  Truck,
  CreditCard,
  FileText,
  Clock,
  Zap,
  Percent,
  Download,
  Share2,
  MapPin,
  Check,
  ChevronRight,
  HelpCircle,
  Award
} from 'lucide-react';
import { ShopProduct, User, EmpanelledBrand } from '../types';
import { SAMPLE_SHOP_PRODUCTS, INDIAN_CITIES, SAMPLE_EMPANELLED_BRANDS } from '../data/initialData';

const PRESET_PRODUCT_PHOTOS = [
  { label: '⚡ Copper Cable Roll', url: 'https://images.unsplash.com/photo-1558441719-6705166e03c0?auto=format&fit=crop&w=800&q=80' },
  { label: '☀️ Solar PV Module', url: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80' },
  { label: '🏗️ TMT Steel Rebars', url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?auto=format&fit=crop&w=800&q=80' },
  { label: '🎨 Emulsion Wall Paint', url: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=800&q=80' },
  { label: '💧 Plumbing CPVC Pipes', url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80' },
  { label: '🧱 Cement Bags & Blocks', url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80' },
  { label: '🔋 Lithium Battery Wall', url: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80' },
  { label: '🚽 Tiles & Sanitaryware', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80' },
];

const PRESET_BRAND_LOGOS = [
  { label: 'Electrical Wiring', url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80' },
  { label: 'Cable & Electronics', url: 'https://images.unsplash.com/photo-1558441719-6705166e03c0?auto=format&fit=crop&w=400&q=80' },
  { label: 'Plumbing & Fittings', url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=400&q=80' },
  { label: 'Water Tanks & Civil', url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=400&q=80' },
  { label: 'Cement & Concrete', url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?auto=format&fit=crop&w=400&q=80' },
  { label: 'Paints & Coatings', url: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=400&q=80' },
];

export interface CartItem {
  product: ShopProduct;
  qty: number;
}

interface DukandarMarketplaceProps {
  currentUser: User | null;
  onOpenAuth: () => void;
}

export const DukandarMarketplace: React.FC<DukandarMarketplaceProps> = ({ currentUser, onOpenAuth }) => {
  const [products, setProducts] = useState<ShopProduct[]>(SAMPLE_SHOP_PRODUCTS);
  const [brandsList, setBrandsList] = useState<EmpanelledBrand[]>(SAMPLE_EMPANELLED_BRANDS);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCityFilter, setSelectedCityFilter] = useState<string>('All');
  const [selectedBrandFilter, setSelectedBrandFilter] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'compare' | 'brands'>('grid');
  const [sortBy, setSortBy] = useState<'featured' | 'price_low' | 'price_high' | 'discount' | 'rating'>('featured');

  // Cart State
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('2click_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Checkout Modal State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [checkoutStep, setCheckoutStep] = useState<'DETAILS' | 'CONFIRMED'>('DETAILS');
  const [customerName, setCustomerName] = useState<string>(currentUser?.name || 'Rajesh Sharma');
  const [customerPhone, setCustomerPhone] = useState<string>(currentUser?.phone || '+91 98765 43210');
  const [customerEmail, setCustomerEmail] = useState<string>(currentUser?.email || 'rajesh.sharma@2click.in');
  const [deliveryAddress, setDeliveryAddress] = useState<string>('Plot No. 42, Sector 12, Site A');
  const [deliveryCity, setDeliveryCity] = useState<string>(currentUser?.city || 'Bengaluru');
  const [deliveryPincode, setDeliveryPincode] = useState<string>('560001');
  const [customerGstin, setCustomerGstin] = useState<string>(currentUser?.gstinNumber || '29AAACR1234F1Z5');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'NEFT' | 'CREDIT_15DAY'>('COD');
  const [placedOrderDetails, setPlacedOrderDetails] = useState<any>(null);

  // Sync cart to local storage
  useEffect(() => {
    try {
      localStorage.setItem('2click_cart', JSON.stringify(cart));
    } catch (e) {}
  }, [cart]);

  // Toast notification helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Cart Management
  const addToCart = (product: ShopProduct, qtyToAdd = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => item.product.id === product.id ? { ...item, qty: item.qty + qtyToAdd } : item);
      } else {
        return [...prev, { product, qty: qtyToAdd }];
      }
    });
    showToast(`🛒 "${product.brand} - ${product.title.slice(0, 24)}..." added to cart!`);
  };

  const updateCartQty = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        const nextQty = item.qty + delta;
        return nextQty > 0 ? { ...item, qty: nextQty } : null;
      }
      return item;
    }).filter(Boolean) as CartItem[]);
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
    showToast('🗑️ Item removed from cart');
  };

  const clearCart = () => {
    setCart([]);
  };

  // Cart Financial Calculations
  const cartSubtotal = cart.reduce((sum, item) => sum + (item.product.priceINR * item.qty), 0);
  const cartGst18 = Math.round(cartSubtotal * 0.18);
  const bulkDiscountINR = cartSubtotal > 10000 ? Math.round(cartSubtotal * 0.05) : 0;
  const deliveryFeeINR = cartSubtotal > 5000 || cartSubtotal === 0 ? 0 : 250;
  const grandTotalINR = cartSubtotal + cartGst18 - bulkDiscountINR + deliveryFeeINR;
  const totalCartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  // Instant Buy Now
  const handleBuyNow = (product: ShopProduct) => {
    addToCart(product, 1);
    setIsCartOpen(true);
  };

  // Handle Place Order
  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    const orderNo = `2MART-${Date.now().toString().slice(-6)}`;
    const orderData = {
      orderNo,
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      items: [...cart],
      customerName,
      customerPhone,
      customerEmail,
      deliveryAddress: `${deliveryAddress}, ${deliveryCity} - ${deliveryPincode}`,
      customerGstin,
      paymentMethod,
      subtotal: cartSubtotal,
      gst: cartGst18,
      bulkDiscount: bulkDiscountINR,
      deliveryFee: deliveryFeeINR,
      grandTotal: grandTotalINR
    };

    setPlacedOrderDetails(orderData);
    setCheckoutStep('CONFIRMED');
    clearCart();
  };

  // Brand Empanelling Modal state
  const [showAddBrandModal, setShowAddBrandModal] = useState<boolean>(false);
  const [bName, setBName] = useState<string>('');
  const [bLegalName, setBLegalName] = useState<string>('');
  const [bCategory, setBCategory] = useState<string>('Electrical Wiring & Switchgear');
  const [bHq, setBHq] = useState<string>('Mumbai, Maharashtra');
  const [bGstin, setBGstin] = useState<string>('27AAAC123451Z9');
  const [bStandards, setBStandards] = useState<string>('IS 694 / IS 456 / BIS Approved');
  const [bDiscount, setBDiscount] = useState<number>(25);
  const [bWarranty, setBWarranty] = useState<string>('10 Year Manufacturer Replacement Guarantee');
  const [bPhone, setBPhone] = useState<string>('+91 1800 123 4567');
  const [bLogoUrl, setBLogoUrl] = useState<string>('');

  // Modal state for Shopkeeper Product Upload / Edit
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<ShopProduct | null>(null);

  const [newTitle, setNewTitle] = useState<string>('');
  const [newBrand, setNewBrand] = useState<string>('');
  const [newCategory, setNewCategory] = useState<ShopProduct['category']>('Electrical Wiring & Switches');
  const [newSubcategory, setNewSubcategory] = useState<string>('Copper Wires');
  const [newMrpINR, setNewMrpINR] = useState<number>(2400);
  const [newPriceINR, setNewPriceINR] = useState<number>(1720);
  const [newDiscountPercent, setNewDiscountPercent] = useState<number>(28);
  const [newWarrantyPeriod, setNewWarrantyPeriod] = useState<string>('Lifetime Brand Guarantee');
  const [newGuaranteeNotes, setNewGuaranteeNotes] = useState<string>('100% Electrolytic Bare Copper, IS 694 certified.');
  const [newUnit, setNewUnit] = useState<string>('Per 90m Roll');
  const [newStockQty, setNewStockQty] = useState<number>(100);
  const [newSpecs, setNewSpecs] = useState<string>('');
  const [newImage, setNewImage] = useState<string>('');

  // Photo File Upload Handlers
  const handleProductPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setNewImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBrandLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setBLogoUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Quote modal
  const [quoteProduct, setQuoteProduct] = useState<ShopProduct | null>(null);
  const [quoteQty, setQuoteQty] = useState<number>(10);
  const [quoteNotes, setQuoteNotes] = useState<string>('');
  const [quoteSent, setQuoteSent] = useState<boolean>(false);

  const categories = [
    'All',
    'Cement & AAC Blocks',
    'Bricks & Red Clay',
    'TMT Steel Rebars',
    'Paints & Wall Putty',
    'Boundary Wall & Fencing',
    'SS & Glass Railings',
    'Kitchen & Bathroom Upgrades',
    'Custom Interiors & Panels',
    'Shop (Dukan) Renovation',
    'Office Renovation',
    'Electrical Wiring & Switches',
    'Plumbing & Pipes',
    'Solar PV & Inverters',
    'Batteries & Energy Storage',
    'Water Pumps & ETP Equipment',
    'Civil Building Materials',
    'Interior & Exterior Renovation',
    'Structures & Hardware'
  ];

  const topBrands = [
    { name: 'UltraTech Cement', logo: '🏗️', category: 'Cement' },
    { name: 'Tata Tiscon', logo: '🔩', category: 'Steel' },
    { name: 'Polycab', logo: '⚡', category: 'Electrical' },
    { name: 'Havells', logo: '💡', category: 'Lighting' },
    { name: 'Finolex Cables', logo: '🔌', category: 'Wires' },
    { name: 'Waaree Solar', logo: '☀️', category: 'Solar' },
    { name: 'Astral Pipes', logo: '💧', category: 'Plumbing' },
    { name: 'Jaquar', logo: '🚽', category: 'Sanitary' },
    { name: 'Asian Paints', logo: '🎨', category: 'Paints' },
    { name: 'Bosch Tools', logo: '🛠️', category: 'Hardware' }
  ];

  const handleOpenEditModal = (prod: ShopProduct) => {
    setEditingProduct(prod);
    setNewTitle(prod.title);
    setNewBrand(prod.brand);
    setNewCategory(prod.category);
    setNewSubcategory(prod.subcategory || '');
    setNewMrpINR(prod.mrpINR || prod.priceINR * 1.3);
    setNewPriceINR(prod.priceINR);
    setNewDiscountPercent(prod.discountPercent || 25);
    setNewWarrantyPeriod(prod.warrantyPeriod || '1 Year Warranty');
    setNewGuaranteeNotes(prod.guaranteeNotes || '');
    setNewUnit(prod.unit);
    setNewStockQty(prod.stockQty);
    setNewSpecs(prod.specs);
    setNewImage(prod.imageUrl);
    setShowAddModal(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth();
      return;
    }

    const calculatedDiscount = newMrpINR > 0 ? Math.round(((newMrpINR - newPriceINR) / newMrpINR) * 100) : newDiscountPercent;

    if (editingProduct) {
      setProducts(products.map(p => p.id === editingProduct.id ? {
        ...p,
        title: newTitle,
        brand: newBrand,
        category: newCategory,
        subcategory: newSubcategory,
        mrpINR: Number(newMrpINR),
        priceINR: Number(newPriceINR),
        discountPercent: calculatedDiscount,
        warrantyPeriod: newWarrantyPeriod,
        guaranteeNotes: newGuaranteeNotes,
        unit: newUnit,
        stockQty: Number(newStockQty),
        specs: newSpecs,
        imageUrl: newImage || p.imageUrl
      } : p));
      showToast('Dukandar item price & trade discount updated!');
    } else {
      const newProd: ShopProduct = {
        id: `PROD-${Date.now()}`,
        vendorId: currentUser.id,
        vendorName: currentUser.companyName || currentUser.name || 'Dukandar Merchant',
        vendorCity: currentUser.city || 'Delhi NCR',
        vendorPhone: currentUser.phone || '+91 98765 43210',
        title: newTitle || 'Brand Item',
        brand: newBrand || 'Tier-1 Brand',
        category: newCategory,
        subcategory: newSubcategory,
        mrpINR: Number(newMrpINR),
        priceINR: Number(newPriceINR),
        discountPercent: calculatedDiscount,
        warrantyPeriod: newWarrantyPeriod,
        guaranteeNotes: newGuaranteeNotes,
        unit: newUnit,
        stockQty: Number(newStockQty),
        specs: newSpecs || 'High durability IS standard product.',
        rating: 5.0,
        imageUrl: newImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
        isApproved: true
      };
      setProducts([newProd, ...products]);
      showToast('Product listed in 2click Mart!');
    }

    setShowAddModal(false);
    setEditingProduct(null);
  };

  const handleSaveBrand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bName.trim()) return;

    const newB: EmpanelledBrand = {
      id: `BRD-${Date.now()}`,
      brandName: bName,
      companyLegalName: bLegalName || bName,
      category: bCategory,
      headquarters: bHq,
      gstin: bGstin,
      isEmpanelled: true,
      approvedStandards: bStandards,
      defaultDiscountPct: Number(bDiscount),
      warrantyPolicy: bWarranty,
      itemCount: 1,
      contactPhone: bPhone,
      logoUrl: bLogoUrl || 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?auto=format&fit=crop&w=400&q=80'
    };

    setBrandsList([newB, ...brandsList]);
    setShowAddBrandModal(false);
    setBName('');
    setBLegalName('');
    showToast(`Brand "${newB.brandName}" registered in Master Catalog!`);
  };

  // Filter & Sort Products
  const filteredProducts = products.filter(p => {
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesCity = selectedCityFilter === 'All' || p.vendorCity === selectedCityFilter;
    const matchesBrand = selectedBrandFilter === 'All' || p.brand.toLowerCase().includes(selectedBrandFilter.toLowerCase());
    const matchesQuery = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         p.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (p.subcategory && p.subcategory.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesCity && matchesBrand && matchesQuery;
  }).sort((a, b) => {
    if (sortBy === 'price_low') return a.priceINR - b.priceINR;
    if (sortBy === 'price_high') return b.priceINR - a.priceINR;
    if (sortBy === 'discount') return (b.discountPercent || 0) - (a.discountPercent || 0);
    if (sortBy === 'rating') return b.rating - a.rating;
    return 0;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 selection:bg-orange-500 selection:text-white">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-[9999] bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-amber-500/50 flex items-center gap-3 animate-in slide-in-from-top-4">
          <Sparkles className="w-5 h-5 text-amber-400 animate-spin" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Floating Cart Button */}
      <button
        onClick={() => setIsCartOpen(true)}
        className="fixed bottom-20 right-6 z-[999] bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 p-3.5 sm:px-5 sm:py-3.5 rounded-full shadow-2xl border-2 border-white/40 flex items-center gap-2.5 transition-all hover:scale-105 active:scale-95 group"
      >
        <div className="relative">
          <ShoppingCart className="w-6 h-6 text-slate-950" />
          {totalCartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-rose-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-slate-950 animate-bounce">
              {totalCartCount}
            </span>
          )}
        </div>
        <div className="hidden sm:block text-left">
          <div className="text-[10px] font-black uppercase text-slate-900/80 tracking-wider">2click Mart Cart</div>
          <div className="text-xs font-extrabold text-slate-950">₹{grandTotalINR.toLocaleString('en-IN')}</div>
        </div>
      </button>

      {/* FLIPKART / AMAZON / MYNTRA STYLE B2B MART HEADER BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-8 border border-slate-800 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 text-amber-300 text-xs font-black tracking-wide">
              <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-pulse" />
              <span>2CLICK MART • B2B SUPER WHOLESALE SALE</span>
            </div>
            
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
              India's #1 Construction &amp; Building Materials <span className="text-amber-400 underline decoration-amber-500 decoration-wavy">Mart</span>
            </h1>
            
            <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
              Buy direct from verified Dukandars, Manufacturers &amp; Brands. Guaranteed GST Invoice, 24-48 Hour Site Unloading &amp; Direct Factory Rates.
            </p>

            {/* Flipkart style Trust Chips */}
            <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] font-bold text-slate-300">
              <span className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-lg border border-white/10">
                <Truck className="w-3.5 h-3.5 text-emerald-400" /> 24h Express Delivery
              </span>
              <span className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-lg border border-white/10">
                <FileText className="w-3.5 h-3.5 text-blue-400" /> 100% GST Invoice Ready
              </span>
              <span className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-lg border border-white/10">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> Original Brand Warranty
              </span>
            </div>
          </div>

          {/* Quick Actions & Cart Stats Box */}
          <div className="w-full lg:w-auto flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <div className="p-4 bg-slate-900/90 rounded-2xl border border-amber-500/30 flex items-center justify-between gap-4">
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">Your Cart Status</div>
                <div className="text-sm font-extrabold text-amber-400">{totalCartCount} Items (₹{grandTotalINR.toLocaleString('en-IN')})</div>
              </div>
              <button
                onClick={() => setIsCartOpen(true)}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-xs rounded-xl hover:brightness-110 shadow-lg transition"
              >
                Open Cart 🛒
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (!currentUser) onOpenAuth();
                  else {
                    setEditingProduct(null);
                    setShowAddModal(true);
                  }
                }}
                className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 transition flex items-center justify-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4 text-emerald-400" />
                <span>+ Sell on 2click Mart</span>
              </button>

              <button
                onClick={() => {
                  if (!currentUser) onOpenAuth();
                  else setShowAddBrandModal(true);
                }}
                className="flex-1 px-4 py-2.5 bg-indigo-600/90 hover:bg-indigo-600 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
              >
                <Award className="w-4 h-4 text-amber-300" />
                <span>+ Register Brand</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* TOP BRANDS QUICK FILTER RIBBON (FLIPKART / AMAZON STYLE) */}
      <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
        <div className="flex items-center justify-between text-xs font-black text-slate-800 dark:text-slate-200">
          <span className="flex items-center gap-1.5 text-amber-500">
            <Award className="w-4 h-4 text-amber-500" />
            <span>Top Featured Construction &amp; MEP Brands</span>
          </span>
          <button
            onClick={() => setViewMode('brands')}
            className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5"
          >
            <span>View All ({brandsList.length} Brands)</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedBrandFilter('All')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition border ${
              selectedBrandFilter === 'All'
                ? 'bg-amber-500 text-slate-950 border-amber-500 font-extrabold shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
            }`}
          >
            🌟 All Brands
          </button>
          {topBrands.map(b => (
            <button
              key={b.name}
              onClick={() => setSelectedBrandFilter(b.name)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition border flex items-center gap-1.5 ${
                selectedBrandFilter === b.name
                  ? 'bg-amber-500 text-slate-950 border-amber-500 font-extrabold shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>{b.logo}</span>
              <span>{b.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* SEARCH, SORT & CATEGORIES CONTROL BAR */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row gap-3 items-center justify-between">
          
          {/* Main Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search 2click Mart for Polycab wires, Astral pipes, UltraTech cement, Waaree solar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-3 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full lg:w-auto">
            {/* City Filter */}
            <select
              value={selectedCityFilter}
              onChange={(e) => setSelectedCityFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 flex-1 sm:flex-initial"
            >
              <option value="All">📍 All India (Verified Suppliers)</option>
              {INDIAN_CITIES.map(c => <option key={c} value={c}>📍 {c}</option>)}
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 flex-1 sm:flex-initial"
            >
              <option value="featured">🔥 Sort: Featured Deals</option>
              <option value="price_low">💰 Price: Low to High</option>
              <option value="price_high">💎 Price: High to Low</option>
              <option value="discount">🏷️ Highest Discount %</option>
              <option value="rating">⭐ Highest Rated</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${viewMode === 'grid' ? 'bg-amber-500 text-slate-950 font-extrabold shadow-xs' : 'text-slate-500'}`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('compare')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${viewMode === 'compare' ? 'bg-amber-500 text-slate-950 font-extrabold shadow-xs' : 'text-slate-500'}`}
              >
                Table
              </button>
            </div>
          </div>
        </div>

        {/* Categories Horizontal Carousel */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-t border-slate-100 dark:border-slate-800 pt-3">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition border ${
                selectedCategory === cat
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-900 dark:border-slate-100 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* MAIN PRODUCTS CATALOG GRID */}
      {viewMode === 'grid' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-extrabold text-slate-500 dark:text-slate-400 px-1">
            <span>Showing {filteredProducts.length} Wholesale Items in 2click Mart</span>
            {selectedCategory !== 'All' && <span className="text-amber-500">Filtered by: {selectedCategory}</span>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredProducts.map((product) => {
              const mrp = product.mrpINR || Math.round(product.priceINR * 1.3);
              const savings = mrp - product.priceINR;
              const discountPct = product.discountPercent || Math.round((savings / mrp) * 100);

              return (
                <div 
                  key={product.id}
                  className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col justify-between hover:border-amber-500/50"
                >
                  <div>
                    {/* Item Image with Badges */}
                    <div className="relative aspect-video sm:aspect-[4/3] bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <img 
                        src={product.imageUrl} 
                        alt={product.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />

                      {/* Savings Badge Top Left */}
                      {discountPct > 0 && (
                        <div className="absolute top-2.5 left-2.5 bg-gradient-to-r from-orange-600 to-rose-600 text-white font-black text-[10px] px-2 py-0.5 rounded-lg shadow-md uppercase tracking-wider flex items-center gap-1">
                          <Zap className="w-3 h-3 fill-current" />
                          <span>{discountPct}% OFF</span>
                        </div>
                      )}

                      {/* Rating Top Right */}
                      <div className="absolute top-2.5 right-2.5 bg-slate-950/80 backdrop-blur-md text-amber-400 text-[11px] font-black px-2 py-0.5 rounded-lg border border-amber-500/30 flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-400" />
                        <span>{product.rating}</span>
                      </div>

                      {/* Brand Tag Bottom Left */}
                      <div className="absolute bottom-2.5 left-2.5 text-white text-xs font-black drop-shadow-md flex items-center gap-1.5">
                        <span className="bg-slate-900/90 px-2 py-0.5 rounded-md border border-slate-700 text-amber-300 text-[11px]">
                          {product.brand}
                        </span>
                      </div>
                    </div>

                    {/* Product Details */}
                    <div className="p-4 space-y-2.5">
                      <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center justify-between">
                        <span>{product.category}</span>
                        <span className="text-emerald-500 font-bold">In Stock ({product.stockQty})</span>
                      </div>

                      <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white line-clamp-2 group-hover:text-amber-500 transition-colors">
                        {product.title}
                      </h3>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                        {product.specs}
                      </p>

                      {/* Seller & Warranty Info */}
                      <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-[11px] space-y-1">
                        <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 font-bold">
                          <span className="flex items-center gap-1 truncate max-w-[150px]">
                            <Store className="w-3 h-3 text-blue-500 shrink-0" /> {product.vendorName}
                          </span>
                          <span className="text-[10px] text-slate-400">📍 {product.vendorCity}</span>
                        </div>
                        {product.warrantyPeriod && (
                          <div className="text-[10px] text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 shrink-0" /> {product.warrantyPeriod}
                          </div>
                        )}
                      </div>

                      {/* Pricing Section */}
                      <div className="pt-1">
                        <div className="flex items-baseline gap-2">
                          <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                            ₹{product.priceINR.toLocaleString('en-IN')}
                          </span>
                          <span className="text-xs text-slate-400 line-through">
                            ₹{mrp.toLocaleString('en-IN')}
                          </span>
                          <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400">
                            Save ₹{savings.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div className="text-[10px] font-semibold text-slate-400">
                          Unit: <span className="text-slate-700 dark:text-slate-300 font-bold">{product.unit}</span> (GST Billing Extra @18%)
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Flipkart / Amazon Style Quick Buttons */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => addToCart(product, 1)}
                      className="px-3 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-900 dark:text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1"
                    >
                      <ShoppingCart className="w-3.5 h-3.5 text-amber-500" />
                      <span>Add Cart</span>
                    </button>

                    <button
                      onClick={() => handleBuyNow(product)}
                      className="px-3 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 text-slate-950 text-xs font-black rounded-xl shadow-md transition flex items-center justify-center gap-1"
                    >
                      <Zap className="w-3.5 h-3.5 fill-current" />
                      <span>Buy Now</span>
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* RATE & WARRANTY COMPARISON TABLE VIEW */}
      {viewMode === 'compare' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl">
          <div className="p-4 bg-slate-950 text-white flex items-center justify-between">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-400" /> 
              <span>2click Mart Rate &amp; Warranty Comparison Ledger</span>
            </h3>
            <span className="text-xs text-slate-400">Showing {filteredProducts.length} Items</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Item / Brand</th>
                  <th className="p-3">Dukandar / City</th>
                  <th className="p-3">MRP</th>
                  <th className="p-3 text-emerald-600 dark:text-emerald-400">B2B Mart Rate</th>
                  <th className="p-3">Discount</th>
                  <th className="p-3">Warranty &amp; Standards</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                {filteredProducts.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    <td className="p-3">
                      <div className="font-extrabold text-slate-900 dark:text-white">{p.title}</div>
                      <div className="text-[10px] text-amber-500 font-bold">{p.brand} • {p.unit}</div>
                    </td>
                    <td className="p-3 font-semibold">
                      <div>{p.vendorName}</div>
                      <div className="text-[10px] text-slate-400">📍 {p.vendorCity}</div>
                    </td>
                    <td className="p-3 line-through text-slate-400">₹{p.mrpINR?.toLocaleString('en-IN')}</td>
                    <td className="p-3 font-black text-amber-600 dark:text-amber-400 text-sm">
                      ₹{p.priceINR.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-black text-[10px]">
                        {p.discountPercent}% OFF
                      </span>
                    </td>
                    <td className="p-3 text-[11px]">
                      <div className="font-bold text-slate-700 dark:text-slate-300">{p.warrantyPeriod || 'Standard Warranty'}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-xs">{p.guaranteeNotes || p.specs}</div>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => addToCart(p, 1)}
                        className="px-3 py-1.5 bg-amber-500 text-slate-950 font-black text-[11px] rounded-lg shadow hover:bg-amber-400 transition"
                      >
                        + Add Cart
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* EMPANELLED BRANDS MASTER DIRECTORY VIEW */}
      {viewMode === 'brands' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-3xl border border-indigo-900/80 shadow-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-amber-400" />
                <h2 className="text-xl font-black">Empanelled Brand Master Mart Directory</h2>
              </div>
              <p className="text-xs text-indigo-200 mt-1">
                National Tier-1 brands with item-wise &amp; work-wise trade discounts, IS/BIS certifications &amp; warranties
              </p>
            </div>
            <button
              onClick={() => {
                if (!currentUser) onOpenAuth();
                else setShowAddBrandModal(true);
              }}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition shrink-0"
            >
              + Empanel / Register Brand
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {brandsList.map((brand) => (
              <div key={brand.id} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700 flex items-center justify-center p-1">
                    <img src={brand.logoUrl} alt={brand.brandName} referrerPolicy="no-referrer" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>{brand.brandName}</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{brand.companyLegalName}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Trade Discount</span>
                    <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">{brand.defaultDiscountPct}% OFF</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Standards</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300 text-[11px] truncate block">{brand.approvedStandards}</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
                  <div><strong>HQ:</strong> {brand.headquarters}</div>
                  <div><strong>GSTIN:</strong> <span className="font-mono">{brand.gstin}</span></div>
                  <div><strong>Warranty:</strong> {brand.warrantyPolicy}</div>
                </div>

                <button
                  onClick={() => {
                    setSelectedBrandFilter(brand.brandName);
                    setViewMode('grid');
                  }}
                  className="w-full py-2 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 font-extrabold text-xs rounded-xl transition"
                >
                  View Brand Items in Mart →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SHOPPING CART SLIDE-OVER DRAWER */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex justify-end animate-in fade-in">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col justify-between border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-200">
            
            {/* Header */}
            <div className="p-4 bg-slate-950 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-amber-400" />
                <h2 className="font-extrabold text-sm">Your 2click Mart Cart ({totalCartCount})</h2>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-400">
                    <ShoppingCart className="w-8 h-8" />
                  </div>
                  <h3 className="font-extrabold text-slate-800 dark:text-slate-200 text-sm">Your Cart is Empty</h3>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    Add building materials, wires, solar panels, or plumbing items to generate GST quote &amp; place order!
                  </p>
                </div>
              ) : (
                cart.map(({ product, qty }) => (
                  <div 
                    key={product.id}
                    className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 flex gap-3 items-center justify-between"
                  >
                    <img src={product.imageUrl} alt={product.title} referrerPolicy="no-referrer" className="w-14 h-14 object-cover rounded-xl shrink-0" />
                    
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-bold text-amber-500 uppercase">{product.brand}</div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{product.title}</h4>
                      <div className="text-xs font-black text-slate-900 dark:text-amber-400 mt-0.5">
                        ₹{product.priceINR.toLocaleString('en-IN')} <span className="text-[10px] font-normal text-slate-400">/ {product.unit}</span>
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-1.5 shrink-0 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                      <button 
                        onClick={() => updateCartQty(product.id, -1)}
                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-300"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-black w-5 text-center">{qty}</span>
                      <button 
                        onClick={() => updateCartQty(product.id, 1)}
                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-300"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(product.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 transition"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Cart Financial Breakdown Footer */}
            {cart.length > 0 && (
              <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 space-y-3">
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Subtotal</span>
                    <span className="font-bold">₹{cartSubtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>GST (18% Input Credit)</span>
                    <span className="font-bold">₹{cartGst18.toLocaleString('en-IN')}</span>
                  </div>
                  {bulkDiscountINR > 0 && (
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                      <span>B2B Volume Discount (5%)</span>
                      <span>-₹{bulkDiscountINR.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Site Delivery Fee</span>
                    <span className="font-bold text-emerald-500">{deliveryFeeINR === 0 ? 'FREE' : `₹${deliveryFeeINR}`}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between text-sm font-black text-slate-900 dark:text-white">
                    <span>Total Payable</span>
                    <span className="text-amber-500">₹{grandTotalINR.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={clearCart}
                    className="py-2.5 px-3 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl hover:bg-slate-300 transition"
                  >
                    Clear Cart
                  </button>
                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                      setIsCheckoutOpen(true);
                      setCheckoutStep('DETAILS');
                    }}
                    className="py-2.5 px-3 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-xs rounded-xl hover:brightness-110 shadow-lg transition flex items-center justify-center gap-1"
                  >
                    <span>Checkout GST Invoice</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* CHECKOUT & ORDER CONFIRMATION MODAL */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-xl bg-slate-900 text-slate-100 rounded-3xl border border-slate-800 shadow-2xl p-6 overflow-hidden">
            
            <button
              onClick={() => setIsCheckoutOpen(false)}
              className="absolute right-4 top-4 p-1.5 rounded-full text-slate-400 hover:bg-slate-800 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>

            {checkoutStep === 'DETAILS' ? (
              <form onSubmit={handlePlaceOrder} className="space-y-4">
                <div className="text-center space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold border border-amber-500/20">
                    <ShieldCheck className="w-3.5 h-3.5" /> 2click Mart Official GST B2B Checkout
                  </div>
                  <h2 className="text-xl font-black text-white">Order &amp; Delivery Details</h2>
                  <p className="text-xs text-slate-400">Fill delivery location &amp; GSTIN for input tax credit invoice</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Buyer / Company Name:</label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Phone Number:</label>
                    <input
                      type="text"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-300 mb-1">Site Delivery Address:</label>
                    <input
                      type="text"
                      required
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                      placeholder="e.g. Plot No 42, Metro Pillar 110"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">City / District:</label>
                    <select
                      value={deliveryCity}
                      onChange={(e) => setDeliveryCity(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                    >
                      {INDIAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Pincode:</label>
                    <input
                      type="text"
                      required
                      value={deliveryPincode}
                      onChange={(e) => setDeliveryPincode(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-300 mb-1">GSTIN Number (For 18% Input Credit):</label>
                    <input
                      type="text"
                      value={customerGstin}
                      onChange={(e) => setCustomerGstin(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white uppercase font-mono"
                      placeholder="e.g. 29AAACR1234F1Z5"
                    />
                  </div>
                </div>

                {/* Payment Method Selection */}
                <div className="space-y-1.5 pt-2 border-t border-slate-800">
                  <label className="block text-xs font-semibold text-slate-300">Payment Option:</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('COD')}
                      className={`p-2.5 rounded-xl border text-left transition ${
                        paymentMethod === 'COD' 
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold' 
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div className="font-bold flex items-center gap-1"><Truck className="w-3.5 h-3.5" /> Site Unloading COD</div>
                      <div className="text-[10px] text-slate-500">Pay cash/UPI on truck arrival</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('NEFT')}
                      className={`p-2.5 rounded-xl border text-left transition ${
                        paymentMethod === 'NEFT' 
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold' 
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div className="font-bold flex items-center gap-1"><CreditCard className="w-3.5 h-3.5" /> Bank NEFT / RTGS</div>
                      <div className="text-[10px] text-slate-500">Direct current account transfer</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('CREDIT_15DAY')}
                      className={`p-2.5 rounded-xl border text-left transition ${
                        paymentMethod === 'CREDIT_15DAY' 
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold' 
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div className="font-bold flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> 15-Day Escrow Credit</div>
                      <div className="text-[10px] text-slate-500">B2B credit limit for contractors</div>
                    </button>
                  </div>
                </div>

                {/* Total Summary Bar */}
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div className="text-xs">
                    <span className="text-slate-400 block">Grand Total ({cart.length} Items)</span>
                    <span className="font-black text-amber-400 text-base">₹{grandTotalINR.toLocaleString('en-IN')}</span>
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-xs rounded-xl shadow-lg hover:brightness-110 transition"
                  >
                    Confirm &amp; Place Order 🚀
                  </button>
                </div>
              </form>
            ) : (
              /* ORDER CONFIRMATION & OFFICIAL RECEIPT SCREEN */
              <div className="space-y-4 text-center">
                <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/40">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div>
                  <h2 className="text-2xl font-black text-white">Order Confirmed!</h2>
                  <p className="text-xs text-emerald-400 font-bold mt-0.5">Order ID: {placedOrderDetails?.orderNo}</p>
                  <p className="text-xs text-slate-400">Dispatch in progress. Delivery expected within 24-48 Hours.</p>
                </div>

                {/* Printable GST Invoice Receipt */}
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-left space-y-3 text-xs">
                  <div className="flex justify-between border-b border-slate-800 pb-2">
                    <div>
                      <div className="font-extrabold text-white text-sm">2CLICK B2B MART OFFICIAL INVOICE</div>
                      <div className="text-[10px] text-slate-400">Date: {placedOrderDetails?.date} • {placedOrderDetails?.time}</div>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 font-bold rounded text-[10px]">GST INVOICE READY</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                    <div>
                      <span className="text-slate-500 block text-[10px]">CUSTOMER DETAILS</span>
                      <strong className="text-white">{placedOrderDetails?.customerName}</strong>
                      <div>{placedOrderDetails?.customerPhone}</div>
                      <div>GSTIN: <span className="font-mono text-amber-300">{placedOrderDetails?.customerGstin || 'N/A'}</span></div>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">DELIVERY SITE</span>
                      <div className="text-slate-300 line-clamp-2">{placedOrderDetails?.deliveryAddress}</div>
                      <div className="text-amber-400 font-bold mt-0.5">Pay Mode: {placedOrderDetails?.paymentMethod}</div>
                    </div>
                  </div>

                  {/* Items Table Summary */}
                  <div className="border-t border-slate-800 pt-2 space-y-1">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Ordered Items ({placedOrderDetails?.items.length})</div>
                    {placedOrderDetails?.items.map((it: CartItem) => (
                      <div key={it.product.id} className="flex justify-between text-[11px]">
                        <span className="text-slate-300 truncate max-w-[200px]">{it.product.brand} - {it.product.title}</span>
                        <span className="font-bold text-white">{it.qty} x ₹{it.product.priceINR.toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-slate-800 pt-2 space-y-1 text-slate-300">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>₹{placedOrderDetails?.subtotal.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>GST (18% Input Tax Credit):</span>
                      <span>₹{placedOrderDetails?.gst.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-amber-400 font-black text-sm pt-1 border-t border-slate-800">
                      <span>Grand Total Paid / Payable:</span>
                      <span>₹{placedOrderDetails?.grandTotal.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    onClick={() => {
                      alert(`📄 Downloading Official GST Receipt for Order ${placedOrderDetails?.orderNo}...`);
                    }}
                    className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition"
                  >
                    <Download className="w-4 h-4 text-amber-400" />
                    <span>Download Invoice (PDF)</span>
                  </button>

                  <button
                    onClick={() => {
                      const text = `Hello 2click Mart, I have placed Order ${placedOrderDetails?.orderNo} for ₹${placedOrderDetails?.grandTotal}. Please confirm dispatch!`;
                      window.open(`https://wa.me/919876543210?text=${encodeURIComponent(text)}`, '_blank');
                    }}
                    className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-lg transition"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Share on WhatsApp</span>
                  </button>
                </div>

                <button
                  onClick={() => setIsCheckoutOpen(false)}
                  className="w-full py-2 text-slate-400 hover:text-white text-xs font-bold"
                >
                  Close &amp; Return to Mart
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* SHOPKEEPER / DUKANDAR LIST PRODUCT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-xl bg-slate-900 text-slate-100 rounded-3xl border border-slate-800 shadow-2xl p-6 my-8">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute right-4 top-4 p-1.5 rounded-full text-slate-400 hover:bg-slate-800 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20 mb-1">
                <Store className="w-3.5 h-3.5" /> Dukandar &amp; Wholesale Merchant Portal
              </div>
              <h2 className="text-xl font-black text-white">
                {editingProduct ? 'Edit Dukandar Item Rate' : 'List Item on 2click Mart'}
              </h2>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Item Title / Name:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Polycab 2.5 sqmm Wire Roll 90m"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Brand Name:</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Polycab"
                    value={newBrand}
                    onChange={(e) => setNewBrand(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Category:</label>
                  <select
                    value={newCategory}
                    onChange={(e: any) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  >
                    {categories.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">MRP (₹):</label>
                  <input
                    type="number"
                    value={newMrpINR}
                    onChange={(e) => setNewMrpINR(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Sell Price (₹):</label>
                  <input
                    type="number"
                    required
                    value={newPriceINR}
                    onChange={(e) => setNewPriceINR(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-bold text-amber-400"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Unit:</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Per Roll"
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Warranty &amp; Guarantee:</label>
                <input
                  type="text"
                  placeholder="e.g. 10 Year Brand Guarantee"
                  value={newWarrantyPeriod}
                  onChange={(e) => setNewWarrantyPeriod(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                />
              </div>

              {/* Photo Upload Box */}
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <label className="block font-bold text-slate-200 text-xs flex justify-between">
                  <span>Product Photo</span>
                  <span className="text-amber-400 text-[10px]">Upload or select sample</span>
                </label>
                
                <div className="grid grid-cols-2 gap-2">
                  <label className="cursor-pointer flex items-center justify-center gap-1.5 p-2 bg-slate-900 border border-dashed border-amber-500 rounded-xl text-amber-400 font-bold text-xs hover:bg-slate-800 transition">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Image</span>
                    <input type="file" accept="image/*" onChange={handleProductPhotoUpload} className="hidden" />
                  </label>
                  <input
                    type="url"
                    placeholder="Or Paste URL"
                    value={newImage}
                    onChange={(e) => setNewImage(e.target.value)}
                    className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono text-[11px]"
                  />
                </div>

                {/* Preset Photos */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-1">
                  {PRESET_PRODUCT_PHOTOS.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setNewImage(p.url)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap border ${
                        newImage === p.url ? 'bg-amber-500 text-slate-950 border-amber-500' : 'bg-slate-900 text-slate-400 border-slate-800'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                {newImage && (
                  <div className="relative mt-1 h-20 rounded-xl overflow-hidden border border-amber-500/40">
                    <img src={newImage} alt="Preview" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 text-slate-950 font-black rounded-xl shadow-lg hover:bg-amber-400 transition"
                >
                  Save Item on 2click Mart
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BRAND EMPANEL MODAL */}
      {showAddBrandModal && (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-xl bg-slate-900 text-slate-100 rounded-3xl border border-slate-800 shadow-2xl p-6 my-8">
            <button
              onClick={() => setShowAddBrandModal(false)}
              className="absolute right-4 top-4 p-1.5 rounded-full text-slate-400 hover:bg-slate-800 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold border border-indigo-500/20 mb-1">
                <Award className="w-3.5 h-3.5 text-amber-400" /> Brand Empanelling Portal
              </div>
              <h2 className="text-xl font-black text-white">Empanel Brand in 2click Mart Master Directory</h2>
            </div>

            <form onSubmit={handleSaveBrand} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Brand Name:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Havells India Ltd"
                  value={bName}
                  onChange={(e) => setBName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Category:</label>
                  <input
                    type="text"
                    value={bCategory}
                    onChange={(e) => setBCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Default Discount (%):</label>
                  <input
                    type="number"
                    value={bDiscount}
                    onChange={(e) => setBDiscount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-bold text-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">GSTIN Number:</label>
                  <input
                    type="text"
                    value={bGstin}
                    onChange={(e) => setBGstin(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Standards / Certifications:</label>
                  <input
                    type="text"
                    value={bStandards}
                    onChange={(e) => setBStandards(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <label className="block font-bold text-slate-200 text-xs">Brand Logo</label>
                <div className="grid grid-cols-2 gap-2">
                  <label className="cursor-pointer flex items-center justify-center gap-1.5 p-2 bg-slate-900 border border-dashed border-indigo-500 rounded-xl text-indigo-400 font-bold text-xs hover:bg-slate-800 transition">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Logo</span>
                    <input type="file" accept="image/*" onChange={handleBrandLogoUpload} className="hidden" />
                  </label>
                  <input
                    type="url"
                    placeholder="Or Paste Logo URL"
                    value={bLogoUrl}
                    onChange={(e) => setBLogoUrl(e.target.value)}
                    className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono text-[11px]"
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-1">
                  {PRESET_BRAND_LOGOS.map((b, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setBLogoUrl(b.url)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap border ${
                        bLogoUrl === b.url ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-900 text-slate-400 border-slate-800'
                      }`}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddBrandModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white font-extrabold rounded-xl shadow-lg hover:bg-indigo-500 transition"
                >
                  Empanel Brand
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
