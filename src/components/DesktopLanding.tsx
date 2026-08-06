"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Star,
  Plus,
  ArrowRight,
  Flame,
  Sparkles,
  Truck,
  Gift,
  MapPin,
  Clock,
  Phone,
  ShoppingCart,
  CheckCircle2,
} from "lucide-react";
import { useMenu } from "@/lib/menu-store";
import { menu as defaultMenu, MenuItem } from "@/lib/menu-data";
import { useCart, cart } from "@/lib/cart-store";
import { useFlyToCart } from "@/components/FlyToCartProvider";
import { ProductDetailModal } from "@/components/ProductDetailModal";
import { auth, useAuth } from "@/lib/auth-store";
import { toast } from "sonner";

const categoryList = [
  { key: "all", label: "All Items", emoji: "✨" },
  { key: "Burgers", label: "Burgers", emoji: "🍔" },
  { key: "Sides", label: "Sides", emoji: "🍟" },
  { key: "Drinks", label: "Drinks", emoji: "🥤" },
  { key: "Desserts", label: "Desserts", emoji: "🍰" },
  { key: "Combos", label: "Combos", emoji: "🎁" },
];

export function DesktopLanding() {
  const storeMenu = useMenu((s) => s.menu);
  const allItems = storeMenu && storeMenu.length > 0 ? storeMenu : defaultMenu;

  const cartItemCount = useCart((s) => s.itemCount);
  const cartSubtotal = useCart((s) => s.subtotal);
  const isAuthenticated = useAuth((s) => s.isAuthenticated);
  const { flyToCart } = useFlyToCart();

  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedDetailItem, setSelectedDetailItem] = useState<MenuItem | null>(null);

  const filteredItems =
    activeCategory === "all"
      ? allItems
      : allItems.filter(
          (item) => item.category?.toLowerCase() === activeCategory.toLowerCase()
        );

  const popularItems = allItems.slice(0, 3);

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>, item: MenuItem) => {
    e.stopPropagation();
    flyToCart(e, item);
    cart.add({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
    });
    toast.success(`Added ${item.name} to cart`);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-brand selection:text-brand-foreground">
      {/* 1. Header Navigation */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo & Brand Badge */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 via-brand to-red-600 flex items-center justify-center font-black text-slate-950 text-2xl shadow-lg shadow-brand/20 group-hover:scale-105 transition-transform">
              K
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-brand tracking-wider text-[#ECEAB4] flex items-center gap-1.5">
                kaivu <span className="w-2 h-2 rounded-full bg-[#ECEAB4] animate-pulse" />
              </span>
              <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase -mt-1">
                Artisanal Kitchen
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold text-slate-300">
            <button
              onClick={() => scrollToSection("hero")}
              className="hover:text-brand transition-colors cursor-pointer"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection("features")}
              className="hover:text-brand transition-colors cursor-pointer"
            >
              Why Kaivu
            </button>
            <button
              onClick={() => scrollToSection("menu")}
              className="hover:text-brand transition-colors cursor-pointer"
            >
              Menu
            </button>
            <button
              onClick={() => scrollToSection("story")}
              className="hover:text-brand transition-colors cursor-pointer"
            >
              Our Story
            </button>
            <button
              onClick={() => scrollToSection("locations")}
              className="hover:text-brand transition-colors cursor-pointer"
            >
              Locations
            </button>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-4">
            <Link
              href="/cart"
              className="relative flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 font-bold text-sm transition-all hover:scale-[1.02]"
            >
              <ShoppingCart className="h-4 w-4 text-brand" />
              <span>Cart</span>
              {cartItemCount > 0 && (
                <span className="bg-brand text-slate-950 px-2 py-0.5 rounded-full text-xs font-extrabold ml-1">
                  {cartItemCount} (₹{cartSubtotal})
                </span>
              )}
            </Link>

            <button
              onClick={() => {
                if (!isAuthenticated) {
                  auth.openModal();
                } else {
                  scrollToSection("menu");
                }
              }}
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-brand to-amber-500 text-slate-950 font-extrabold text-sm shadow-lg shadow-brand/25 hover:shadow-brand/40 hover:scale-[1.03] active:scale-[0.98] transition-all cursor-pointer flex items-center gap-2"
            >
              <span>{isAuthenticated ? "Order Online" : "Sign In / Join"}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section id="hero" className="relative py-24 overflow-hidden border-b border-slate-900">
        {/* Decorative Background Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-brand/10 blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute top-10 right-10 w-[400px] h-[400px] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-12 items-center relative z-10">
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand/10 border border-brand/20 text-brand text-xs font-bold uppercase tracking-wider">
              <Sparkles className="h-4 w-4" />
              <span>Gourmet Burgers & Fresh Artisanal Eats</span>
            </div>

            <h1 className="text-5xl lg:text-7xl font-black tracking-tight leading-[1.08] text-white">
              Crafted to Perfection. <br />
              <span className="bg-gradient-to-r from-amber-400 via-brand to-amber-500 bg-clip-text text-transparent">
                Delivered Piping Hot.
              </span>
            </h1>

            <p className="text-lg text-slate-400 max-w-2xl leading-relaxed">
              Welcome to Kaivu. We craft gourmet burgers, crispy sides, and handcrafted drinks using 100% fresh, never-frozen ingredients. Fast delivery to your doorstep in under 30 minutes.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => scrollToSection("menu")}
                className="px-8 py-4 rounded-2xl bg-brand text-slate-950 font-black text-base shadow-xl shadow-brand/30 hover:bg-brand/90 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center gap-3"
              >
                <span>Explore Full Menu</span>
                <ArrowRight className="h-5 w-5" />
              </button>

              <Link
                href="/cart"
                className="px-8 py-4 rounded-2xl bg-slate-900 border border-slate-800 text-slate-200 hover:text-white hover:border-slate-700 font-bold text-base transition-all hover:scale-[1.02] flex items-center gap-2"
              >
                <ShoppingCart className="h-5 w-5 text-brand" />
                <span>View Cart ({cartItemCount})</span>
              </Link>
            </div>

            {/* Quick Metrics Bar */}
            <div className="pt-8 border-t border-slate-900 grid grid-cols-3 gap-6 max-w-lg">
              <div>
                <div className="text-2xl lg:text-3xl font-black text-white flex items-center gap-1">
                  4.9 <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
                </div>
                <div className="text-xs text-slate-400 font-semibold mt-1">2,500+ Reviews</div>
              </div>
              <div>
                <div className="text-2xl lg:text-3xl font-black text-white">&lt; 30m</div>
                <div className="text-xs text-slate-400 font-semibold mt-1">Avg. Delivery</div>
              </div>
              <div>
                <div className="text-2xl lg:text-3xl font-black text-white">100%</div>
                <div className="text-xs text-slate-400 font-semibold mt-1">Fresh Patties</div>
              </div>
            </div>
          </div>

          {/* Right Visual Showcase Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-[36px] p-3 bg-gradient-to-b from-slate-800/80 to-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-2xl">
              <div className="relative rounded-[28px] overflow-hidden aspect-[4/5]">
                <img
                  src={popularItems[0]?.image || "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80"}
                  alt="Kaivu Signature Burger"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                {/* Floating Badges */}
                <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md border border-slate-800 px-3.5 py-1.5 rounded-full text-xs font-extrabold text-amber-400 flex items-center gap-1.5">
                  <Flame className="h-4 w-4 fill-amber-400" />
                  <span>#1 Bestseller</span>
                </div>

                <div className="absolute bottom-6 left-6 right-6 p-5 rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-slate-800 text-white space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black">{popularItems[0]?.name || "Truffle Smash Burger"}</h3>
                    <span className="text-xl font-black text-brand">₹{popularItems[0]?.price || 299}</span>
                  </div>
                  <p className="text-xs text-slate-300 line-clamp-2">
                    {popularItems[0]?.desc || popularItems[0]?.description || "Double smashed artisanal patty, caramelised onions, truffle mayo & aged cheddar."}
                  </p>
                  <button
                    onClick={(e) => handleAddToCart(e, popularItems[0] || defaultMenu[0])}
                    className="w-full py-3 rounded-xl bg-brand text-slate-950 font-extrabold text-sm hover:bg-brand/90 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Plus className="h-4 w-4 stroke-[3]" />
                    <span>Add to Order</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Why Kaivu (Features Grid) */}
      <section id="features" className="py-20 border-b border-slate-900 bg-slate-950/50">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-brand text-xs font-black uppercase tracking-widest">
              The Kaivu Standard
            </span>
            <h2 className="text-3xl lg:text-4xl font-black tracking-tight text-white">
              Why Food Lovers Choose Kaivu
            </h2>
            <p className="text-slate-400 text-sm">
              Every burger, side, and drink is prepared fresh to order in our artisanal kitchen.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800/80 hover:border-slate-700 transition-all space-y-4 hover:-translate-y-1">
              <div className="w-12 h-12 rounded-2xl bg-brand/10 text-brand flex items-center justify-center">
                <Flame className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Artisanal Smash Patties</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Hand-pressed 100% fresh meat and veggie patties seared on hot flat-tops for maximum crust and juiciness.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800/80 hover:border-slate-700 transition-all space-y-4 hover:-translate-y-1">
              <div className="w-12 h-12 rounded-2xl bg-amber-400/10 text-amber-400 flex items-center justify-center">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Zero Frozen Shortcuts</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Fresh produce sourced daily from local growers. Zero artificial preservatives or frozen pre-made patties.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800/80 hover:border-slate-700 transition-all space-y-4 hover:-translate-y-1">
              <div className="w-12 h-12 rounded-2xl bg-emerald-400/10 text-emerald-400 flex items-center justify-center">
                <Truck className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Express Thermal Delivery</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Custom ventilated thermal packaging ensures your burgers stay hot and your fries stay perfectly crisp.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800/80 hover:border-slate-700 transition-all space-y-4 hover:-translate-y-1">
              <div className="w-12 h-12 rounded-2xl bg-indigo-400/10 text-indigo-400 flex items-center justify-center">
                <Gift className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Kaivu Coin Loyalty</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Earn Kaivu Coins on every single order and redeem them for free burgers, sides, and exclusive rewards.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Interactive Menu Showcase */}
      <section id="menu" className="py-20 max-w-7xl mx-auto px-6 space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="text-brand text-xs font-black uppercase tracking-widest">
              Artisanal Menu
            </span>
            <h2 className="text-3xl lg:text-4xl font-black tracking-tight text-white mt-1">
              Explore Kaivu Specialties
            </h2>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categoryList.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`px-5 py-2.5 rounded-2xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer border ${
                  activeCategory === cat.key
                    ? "bg-brand text-slate-950 border-brand shadow-lg shadow-brand/20"
                    : "bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700"
                }`}
              >
                <span>{cat.emoji}</span> {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedDetailItem(item)}
              className="group relative rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-[16/10] overflow-hidden bg-slate-850">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60" />

                  {(item.badge || item.tag) && (
                    <div className="absolute top-3 left-3 bg-brand text-slate-950 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                      {item.badge || item.tag}
                    </div>
                  )}

                  <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-md border border-slate-800 text-amber-400 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-amber-400" />
                    <span>{item.rating || "4.8"}</span>
                  </div>
                </div>

                <div className="p-6 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-xl font-extrabold text-white group-hover:text-brand transition-colors">
                      {item.name}
                    </h3>
                    <span className="text-lg font-black text-brand whitespace-nowrap">
                      ₹{item.price}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {item.desc || item.description || "Prepared with fresh premium ingredients and signature Kaivu seasonings."}
                  </p>
                </div>
              </div>

              <div className="px-6 pb-6 pt-2">
                <button
                  onClick={(e) => handleAddToCart(e, item)}
                  className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-brand text-slate-200 hover:text-slate-950 font-extrabold text-xs tracking-wide uppercase transition-all flex items-center justify-center gap-2 cursor-pointer group-hover:bg-brand group-hover:text-slate-950 shadow-md"
                >
                  <Plus className="h-4 w-4 stroke-[3]" />
                  <span>Add to Order</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Our Story / Brand Philosophy */}
      <section id="story" className="py-24 border-t border-slate-900 bg-slate-950/80 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <span className="text-brand text-xs font-black uppercase tracking-widest">
              Our Culinary Philosophy
            </span>
            <h2 className="text-4xl font-black tracking-tight text-white leading-tight">
              Real Food. Real Passion. <br />
              No Frozen Compromises.
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Kaivu was born out of a simple obsession: creating burgers that taste as genuine as artisanal craft food should taste. We grind our meats, hand-roll our buns, and simmer signature sauces in-house every single morning.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-slate-200 text-sm font-semibold">
                <CheckCircle2 className="h-5 w-5 text-brand" />
                <span>100% Sourced from Verified Regional Farms</span>
              </div>
              <div className="flex items-center gap-3 text-slate-200 text-sm font-semibold">
                <CheckCircle2 className="h-5 w-5 text-brand" />
                <span>Signature Secret-Recipe Mayo & Hot Glaze</span>
              </div>
              <div className="flex items-center gap-3 text-slate-200 text-sm font-semibold">
                <CheckCircle2 className="h-5 w-5 text-brand" />
                <span>Zero Plastic Single-Use Packaging</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 relative">
            <div className="rounded-3xl border border-slate-800 p-8 bg-slate-900/60 backdrop-blur-xl space-y-6">
              <div className="text-3xl font-black text-white">
                &ldquo;We don&apos;t make fast food. We make fresh food as fast as possible.&rdquo;
              </div>
              <div className="flex items-center gap-4 pt-4 border-t border-slate-800">
                <div className="w-12 h-12 rounded-full bg-brand/20 text-brand font-black text-xl flex items-center justify-center">
                  K
                </div>
                <div>
                  <div className="font-bold text-white text-sm">Chef Culinary Team</div>
                  <div className="text-xs text-slate-400">Kaivu Kitchen Founders</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Locations & Hours */}
      <section id="locations" className="py-20 max-w-7xl mx-auto px-6 border-t border-slate-900">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-8 rounded-3xl bg-slate-900/40 border border-slate-800 space-y-4">
            <MapPin className="h-8 w-8 text-brand" />
            <h3 className="text-xl font-bold text-white">Store Location</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Main Kitchen Outlet, Food Hub St., Sector 4, City Center.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-slate-900/40 border border-slate-800 space-y-4">
            <Clock className="h-8 w-8 text-amber-400" />
            <h3 className="text-xl font-bold text-white">Operating Hours</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Open Daily: 11:00 AM – 11:30 PM <br />
              Late Night Orders via Web App.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-slate-900/40 border border-slate-800 space-y-4">
            <Phone className="h-8 w-8 text-emerald-400" />
            <h3 className="text-xl font-bold text-white">Direct Hotline</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Support & Bulk Orders: <br />
              <span className="font-bold text-white">+91 98765 43210</span>
            </p>
          </div>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="py-12 border-t border-slate-900 bg-slate-950 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-brand text-slate-950 font-black flex items-center justify-center">
              K
            </div>
            <span className="font-bold text-slate-300 text-sm">KAIVU ARTISANAL KITCHEN</span>
          </div>

          <div>
            © {new Date().getFullYear()} Kaivu Inc. All rights reserved. Crafted with passion.
          </div>

          <div className="flex items-center gap-6 font-semibold">
            <Link href="/menu" className="hover:text-brand transition-colors">Menu</Link>
            <Link href="/cart" className="hover:text-brand transition-colors">Cart</Link>
            <button onClick={() => auth.openModal()} className="hover:text-brand transition-colors cursor-pointer">
              Account
            </button>
          </div>
        </div>
      </footer>

      {/* Detail Modal */}
      {selectedDetailItem && (
        <ProductDetailModal
          item={selectedDetailItem}
          onClose={() => setSelectedDetailItem(null)}
        />
      )}
    </div>
  );
}
