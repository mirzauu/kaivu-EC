"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  LayoutDashboard,
  ShoppingBag,
  Utensils,
  Settings,
  LogOut,
  ArrowRight,
  Lock,
  Plus,
  Trash2,
  Edit2,
  X,
  ChevronRight,
  TrendingUp,
  DollarSign,
  AlertCircle,
  Sparkles,
  Check,
  User,
  Activity,
  MenuSquare,
  MapPin,
  ExternalLink,
  Camera,
  Gift,
  Smartphone,
  Clock,
  Percent,
  Flame,
  BellRing,
  Layers,
  Eye,
  EyeOff,
  Store,
  Timer,
  Power,
  Radio,
  ShieldAlert,
  Upload,
  Image as ImageIcon,
  Video,
  Loader2,
  CheckCircle2,
  Film,
  Star,
  Search,
  RotateCcw,
  CheckSquare,
  Square,
} from "lucide-react";
import { FullScreenInstallBanner } from "@/components/banners/FullScreenInstallBanner";
import { IdleNavBanner } from "@/components/banners/IdleNavBanner";
import { HalfScreenOfferBanner } from "@/components/banners/HalfScreenOfferBanner";
import { adminAuth, useAdminAuth } from "@/lib/admin-store";
import { ordersStore, useOrders, Order } from "@/lib/orders-store";
import { menuStore, useMenu } from "@/lib/menu-store";
import { MenuItem } from "@/lib/menu-data";
import { getStories, addDynamicStory, deleteDynamicStory, clearAllStories, isStoriesEnabled, setStoriesEnabled, KaivuStory } from "@/lib/stories-data";
import { NotificationBannersConfig, DEFAULT_NOTIFICATION_BANNERS_CONFIG, TargetAudience } from "@/lib/types/banners";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

export default function CSuiteRoot() {
  const isAuthenticated = useAdminAuth((s) => s.isAuthenticated);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  return <AdminConsole />;
}

// --- ADMIN LOGIN COMPONENT ---
function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const success = await adminAuth.login(username, password);
    setLoading(false);
    
    if (!success) {
      setError("Invalid username or password. Double check credentials.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[oklch(0.97_0.012_75)] px-4 font-sans selection:bg-brand/20">
      <div className="w-full max-w-md overflow-hidden rounded-[2rem] bg-white p-8 shadow-xl border border-[oklch(0.9_0.015_75)]">
        <div className="flex flex-col items-center text-center">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-brand/10 text-brand mb-4">
            <Lock className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-display font-extrabold text-[oklch(0.18_0.02_50)] tracking-tight">
            Kaivu <span className="text-brand">C-Suite</span>
          </h1>
          <p className="mt-2 text-sm text-[oklch(0.5_0.02_60)]">
            Authorized Personnel Only · Admin Console
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {error && (
            <div className="flex items-center gap-2 rounded-2xl bg-destructive/5 p-4 text-xs font-semibold text-destructive border border-destructive/10 animate-shake">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[oklch(0.18_0.02_50)] uppercase tracking-wider">
              Username
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-2xl border border-[oklch(0.9_0.015_75)] bg-[oklch(0.98_0.005_75)] px-4 py-3 text-sm focus:border-brand focus:outline-none transition-colors"
              placeholder="e.g. admin"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[oklch(0.18_0.02_50)] uppercase tracking-wider">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl border border-[oklch(0.9_0.015_75)] bg-[oklch(0.98_0.005_75)] px-4 py-3 text-sm focus:border-brand focus:outline-none transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-sm font-bold text-primary-foreground hover:bg-primary/95 transition-all disabled:opacity-75 cursor-pointer shadow-md"
          >
            {loading ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
            ) : (
              <>
                <span>Access Console</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
}

// --- ADMIN CONSOLE COMPONENT ---
function AdminConsole() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "orders" | "menu" | "users" | "settings" | "activity" | "instagram" | "manage-app">("dashboard");
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const orders = useOrders((s) => s.orders);
  const menuItems = useMenu((s) => s.menu);

  const activeOrdersCount = orders.filter((o) => o.status === "active").length;

  useEffect(() => {
    ordersStore.refresh();
    menuStore.refresh(true); // load all menu items including disabled ones
    const interval = setInterval(() => {
      ordersStore.refresh();
      menuStore.refresh(true);
    }, 15000); // refresh orders & menu every 15s for the admin panel
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    adminAuth.logout();
  };

  const handleSelectTab = (tab: "dashboard" | "orders" | "menu" | "users" | "settings" | "activity" | "instagram" | "manage-app") => {
    setActiveTab(tab);
    setIsMoreOpen(false);
    // Scroll to top when switching tab
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="flex min-h-screen bg-[oklch(0.97_0.012_75)] font-sans">
      {/* DESKTOP SIDEBAR */}
      <aside className="fixed inset-y-0 left-0 hidden lg:flex w-64 flex-col border-r border-[oklch(0.9_0.015_75)] bg-white z-30">
        <div className="flex h-20 items-center px-6 border-b border-[oklch(0.9_0.015_75)] gap-3">
          <img
            src="/images/brand/kaivu-logo-black.png"
            alt="kaivu."
            className="h-8 w-auto object-contain rounded-md"
          />
          <span className="text-xl font-display font-extrabold text-[oklch(0.18_0.02_50)] tracking-tight">
            C-Suite
          </span>
        </div>

        <nav className="flex-1 space-y-1.5 px-4 py-6">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-semibold transition-all cursor-pointer ${activeTab === "dashboard"
                ? "bg-brand text-brand-foreground shadow-lg shadow-brand/15"
                : "text-[oklch(0.5_0.02_60)] hover:bg-[oklch(0.94_0.018_75)] hover:text-[oklch(0.18_0.02_50)]"
              }`}
          >
            <LayoutDashboard className="h-5 w-5 shrink-0" />
            <span>Dashboard Overview</span>
          </button>

          <button
            onClick={() => setActiveTab("orders")}
            className={`flex w-full items-center justify-between rounded-2xl px-4 py-3.5 text-sm font-semibold transition-all cursor-pointer ${activeTab === "orders"
                ? "bg-brand text-brand-foreground shadow-lg shadow-brand/15"
                : "text-[oklch(0.5_0.02_60)] hover:bg-[oklch(0.94_0.018_75)] hover:text-[oklch(0.18_0.02_50)]"
              }`}
          >
            <div className="flex items-center gap-3">
              <ShoppingBag className="h-5 w-5 shrink-0" />
              <span>Order Management</span>
            </div>
            {activeOrdersCount > 0 && (
              <span className={`grid h-5 min-w-5 place-items-center rounded-full text-[10px] font-bold px-1.5 ${activeTab === "orders" ? "bg-white text-brand" : "bg-brand text-brand-foreground"
                }`}>
                {activeOrdersCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("manage-app")}
            className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-semibold transition-all cursor-pointer ${activeTab === "manage-app"
                ? "bg-brand text-brand-foreground shadow-lg shadow-brand/15"
                : "text-[oklch(0.5_0.02_60)] hover:bg-[oklch(0.94_0.018_75)] hover:text-[oklch(0.18_0.02_50)]"
              }`}
          >
            <Store className="h-5 w-5 shrink-0" />
            <span>Manage App</span>
          </button>

          <button
            onClick={() => setActiveTab("menu")}
            className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-semibold transition-all cursor-pointer ${activeTab === "menu"
                ? "bg-brand text-brand-foreground shadow-lg shadow-brand/15"
                : "text-[oklch(0.5_0.02_60)] hover:bg-[oklch(0.94_0.018_75)] hover:text-[oklch(0.18_0.02_50)]"
              }`}
          >
            <Utensils className="h-5 w-5 shrink-0" />
            <span>Menu Management</span>
          </button>

          <button
            onClick={() => setActiveTab("instagram")}
            className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-semibold transition-all cursor-pointer ${activeTab === "instagram"
                ? "bg-brand text-brand-foreground shadow-lg shadow-brand/15"
                : "text-[oklch(0.5_0.02_60)] hover:bg-[oklch(0.94_0.018_75)] hover:text-[oklch(0.18_0.02_50)]"
              }`}
          >
            <Camera className="h-5 w-5 shrink-0" />
            <span>Instagram Stories</span>
          </button>

          <button
            onClick={() => setActiveTab("users")}
            className={`flex w-full items-center justify-between rounded-2xl px-4 py-3.5 text-sm font-semibold transition-all cursor-pointer ${activeTab === "users"
                ? "bg-brand text-brand-foreground shadow-lg shadow-brand/15"
                : "text-[oklch(0.5_0.02_60)] hover:bg-[oklch(0.94_0.018_75)] hover:text-[oklch(0.18_0.02_50)]"
              }`}
          >
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 shrink-0" />
              <span>User Management</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-semibold transition-all cursor-pointer ${activeTab === "settings"
                ? "bg-brand text-brand-foreground shadow-lg shadow-brand/15"
                : "text-[oklch(0.5_0.02_60)] hover:bg-[oklch(0.94_0.018_75)] hover:text-[oklch(0.18_0.02_50)]"
              }`}
          >
            <Settings className="h-5 w-5 shrink-0" />
            <span>Settings & Tools</span>
          </button>

          <button
            onClick={() => setActiveTab("activity")}
            className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-semibold transition-all cursor-pointer ${activeTab === "activity"
                ? "bg-brand text-brand-foreground shadow-lg shadow-brand/15"
                : "text-[oklch(0.5_0.02_60)] hover:bg-[oklch(0.94_0.018_75)] hover:text-[oklch(0.18_0.02_50)]"
              }`}
          >
            <Activity className="h-5 w-5 shrink-0" />
            <span>User Activity Stream</span>
          </button>

          <a
            href="/csuite/whatsapp"
            className="flex w-full items-center justify-between rounded-2xl px-4 py-3.5 text-sm font-semibold transition-all cursor-pointer text-[oklch(0.5_0.02_60)] hover:bg-[oklch(0.94_0.018_75)] hover:text-[oklch(0.18_0.02_50)]"
          >
            <div className="flex items-center gap-3">
              <Smartphone className="h-5 w-5 shrink-0 text-emerald-600" />
              <span>WhatsApp Device</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              Baileys
            </span>
          </a>
        </nav>

        <div className="border-t border-[oklch(0.9_0.015_75)] p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-semibold text-destructive hover:bg-destructive/5 transition-colors cursor-pointer"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT CONTAINER */}
      <div className="flex flex-1 flex-col pl-0 lg:pl-64 min-w-0">
        {/* HEADER */}
        <header className="sticky top-0 z-20 flex h-16 sm:h-20 items-center justify-between bg-white/95 backdrop-blur-md px-4 sm:px-8 border-b border-[oklch(0.9_0.015_75)]">
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile Brand Logo */}
            <div className="flex items-center gap-2 lg:hidden shrink-0">
              <img
                src="/images/brand/kaivu-logo-black.png"
                alt="kaivu."
                className="h-6 w-auto object-contain rounded-md"
              />
              <span className="text-lg font-display font-extrabold text-[oklch(0.18_0.02_50)]">
                C-Suite
              </span>
              <div className="h-4 w-px bg-[oklch(0.9_0.015_75)] mx-1" />
            </div>

            <div className="min-w-0">
              <h2 className="text-sm sm:text-xl font-bold text-[oklch(0.18_0.02_50)] uppercase tracking-tight truncate">
                {activeTab === "dashboard" && "Dashboard"}
                {activeTab === "orders" && "Orders"}
                {activeTab === "manage-app" && "Manage App"}
                {activeTab === "menu" && "Menu Catalog"}
                {activeTab === "instagram" && "Stories"}
                {activeTab === "users" && "Users"}
                {activeTab === "settings" && "Settings"}
                {activeTab === "activity" && "Activity Stream"}
              </h2>
              <p className="hidden sm:block text-xs text-[oklch(0.5_0.02_60)] truncate">
                Welcome back, Admin · Systems operational.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
            <div className="flex items-center gap-1.5 sm:gap-2 rounded-full bg-[oklch(0.94_0.018_75)] px-2.5 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-xs text-[oklch(0.22_0.025_50)] font-semibold">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="hidden sm:inline">Live Synced</span>
              <span className="sm:hidden">Live</span>
            </div>

            <div className="hidden sm:block h-8 w-px bg-[oklch(0.9_0.015_75)]" />

            <div className="hidden sm:flex items-center gap-2.5">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-brand text-brand-foreground font-bold text-sm">
                A
              </div>
              <span className="text-sm font-bold text-[oklch(0.18_0.02_50)]">Admin</span>
            </div>

            {/* Mobile Signout Button in Header */}
            <button
              onClick={handleLogout}
              className="lg:hidden grid h-8 w-8 place-items-center rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* WORKSPACE */}
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 pb-24 lg:pb-8 overflow-y-auto min-w-0">
          {activeTab === "dashboard" && (
            <DashboardTab orders={orders} menuItems={menuItems} />
          )}
          {activeTab === "orders" && <OrdersTab orders={orders} />}
          {activeTab === "manage-app" && <ManageAppTab />}
          {activeTab === "menu" && <MenuTab menuItems={menuItems} />}
          {activeTab === "instagram" && <InstagramTab menuItems={menuItems} />}
          {activeTab === "users" && <UsersTab />}
          {activeTab === "settings" && <SettingsTab />}
          {activeTab === "activity" && <ActivityTab />}
        </main>
      </div>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-[oklch(0.9_0.015_75)] z-40 lg:hidden px-2 py-2 flex items-center justify-around shadow-2xl safe-area-bottom">
        <button
          onClick={() => handleSelectTab("orders")}
          className={`relative flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all cursor-pointer ${
            activeTab === "orders"
              ? "text-brand font-bold"
              : "text-[oklch(0.5_0.02_60)] hover:text-[oklch(0.18_0.02_50)] font-medium"
          }`}
        >
          <div className="relative">
            <ShoppingBag className={`h-5 w-5 ${activeTab === "orders" ? "stroke-[2.5]" : "stroke-2"}`} />
            {activeOrdersCount > 0 && (
              <span className="absolute -top-1.5 -right-2 grid h-4 min-w-4 place-items-center rounded-full bg-brand text-[9px] font-extrabold text-white px-1 shadow-sm">
                {activeOrdersCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight">Orders</span>
        </button>

        <button
          onClick={() => handleSelectTab("dashboard")}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all cursor-pointer ${
            activeTab === "dashboard"
              ? "text-brand font-bold"
              : "text-[oklch(0.5_0.02_60)] hover:text-[oklch(0.18_0.02_50)] font-medium"
          }`}
        >
          <LayoutDashboard className={`h-5 w-5 ${activeTab === "dashboard" ? "stroke-[2.5]" : "stroke-2"}`} />
          <span className="text-[10px] tracking-tight">Dashboard</span>
        </button>

        <button
          onClick={() => handleSelectTab("menu")}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all cursor-pointer ${
            activeTab === "menu"
              ? "text-brand font-bold"
              : "text-[oklch(0.5_0.02_60)] hover:text-[oklch(0.18_0.02_50)] font-medium"
          }`}
        >
          <Utensils className={`h-5 w-5 ${activeTab === "menu" ? "stroke-[2.5]" : "stroke-2"}`} />
          <span className="text-[10px] tracking-tight">Menu</span>
        </button>

        <button
          onClick={() => handleSelectTab("manage-app")}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all cursor-pointer ${
            activeTab === "manage-app"
              ? "text-brand font-bold"
              : "text-[oklch(0.5_0.02_60)] hover:text-[oklch(0.18_0.02_50)] font-medium"
          }`}
        >
          <Store className={`h-5 w-5 ${activeTab === "manage-app" ? "stroke-[2.5]" : "stroke-2"}`} />
          <span className="text-[10px] tracking-tight">Store</span>
        </button>

        <button
          onClick={() => setIsMoreOpen(true)}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all cursor-pointer ${
            isMoreOpen || ["instagram", "users", "settings", "activity"].includes(activeTab)
              ? "text-brand font-bold"
              : "text-[oklch(0.5_0.02_60)] hover:text-[oklch(0.18_0.02_50)] font-medium"
          }`}
        >
          <MenuSquare className={`h-5 w-5 ${["instagram", "users", "settings", "activity"].includes(activeTab) ? "stroke-[2.5]" : "stroke-2"}`} />
          <span className="text-[10px] tracking-tight">More</span>
        </button>
      </nav>

      {/* MOBILE "MORE" BOTTOM SHEET DRAWER */}
      {isMoreOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div
            className="absolute inset-0"
            onClick={() => setIsMoreOpen(false)}
          />
          <div className="relative bg-white rounded-t-[2rem] p-6 space-y-4 shadow-2xl border-t border-[oklch(0.9_0.015_75)] max-h-[80vh] overflow-y-auto">
            {/* Sheet Header */}
            <div className="flex items-center justify-between border-b border-[oklch(0.9_0.015_75)] pb-3">
              <div>
                <h3 className="text-base font-bold text-[oklch(0.18_0.02_50)]">More Controls</h3>
                <p className="text-xs text-[oklch(0.5_0.02_60)]">Additional admin tools & navigation</p>
              </div>
              <button
                onClick={() => setIsMoreOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-full bg-[oklch(0.94_0.018_75)] text-slate-600 hover:bg-[oklch(0.9_0.015_75)]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Menu List */}
            <div className="space-y-1.5 pt-1">
              <button
                onClick={() => handleSelectTab("instagram")}
                className={`flex w-full items-center gap-3.5 p-3.5 rounded-2xl text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === "instagram"
                    ? "bg-brand text-brand-foreground shadow-sm"
                    : "bg-[oklch(0.98_0.005_75)] text-[oklch(0.2_0.02_50)] hover:bg-[oklch(0.94_0.018_75)]"
                }`}
              >
                <Camera className="h-5 w-5 shrink-0 text-brand" />
                <div className="text-left flex-1">
                  <p className="font-bold">Instagram Stories</p>
                  <p className="text-[11px] opacity-75 font-normal">Manage top story feed & video highlights</p>
                </div>
                <ChevronRight className="h-4 w-4 opacity-50" />
              </button>

              <button
                onClick={() => handleSelectTab("users")}
                className={`flex w-full items-center gap-3.5 p-3.5 rounded-2xl text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === "users"
                    ? "bg-brand text-brand-foreground shadow-sm"
                    : "bg-[oklch(0.98_0.005_75)] text-[oklch(0.2_0.02_50)] hover:bg-[oklch(0.94_0.018_75)]"
                }`}
              >
                <User className="h-5 w-5 shrink-0 text-brand" />
                <div className="text-left flex-1">
                  <p className="font-bold">User Management</p>
                  <p className="text-[11px] opacity-75 font-normal">Customer accounts, notification banners</p>
                </div>
                <ChevronRight className="h-4 w-4 opacity-50" />
              </button>

              <button
                onClick={() => handleSelectTab("settings")}
                className={`flex w-full items-center gap-3.5 p-3.5 rounded-2xl text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === "settings"
                    ? "bg-brand text-brand-foreground shadow-sm"
                    : "bg-[oklch(0.98_0.005_75)] text-[oklch(0.2_0.02_50)] hover:bg-[oklch(0.94_0.018_75)]"
                }`}
              >
                <Settings className="h-5 w-5 shrink-0 text-brand" />
                <div className="text-left flex-1">
                  <p className="font-bold">Settings & Simulator</p>
                  <p className="text-[11px] opacity-75 font-normal">Simulate orders, configure store settings</p>
                </div>
                <ChevronRight className="h-4 w-4 opacity-50" />
              </button>

              <button
                onClick={() => handleSelectTab("activity")}
                className={`flex w-full items-center gap-3.5 p-3.5 rounded-2xl text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === "activity"
                    ? "bg-brand text-brand-foreground shadow-sm"
                    : "bg-[oklch(0.98_0.005_75)] text-[oklch(0.2_0.02_50)] hover:bg-[oklch(0.94_0.018_75)]"
                }`}
              >
                <Activity className="h-5 w-5 shrink-0 text-brand" />
                <div className="text-left flex-1">
                  <p className="font-bold">User Activity Stream</p>
                  <p className="text-[11px] opacity-75 font-normal">Real-time visitor telemetry and logs</p>
                </div>
                <ChevronRight className="h-4 w-4 opacity-50" />
              </button>

              <a
                href="/csuite/whatsapp"
                className="flex w-full items-center gap-3.5 p-3.5 rounded-2xl text-sm font-semibold transition-all cursor-pointer bg-[oklch(0.98_0.005_75)] text-[oklch(0.2_0.02_50)] hover:bg-[oklch(0.94_0.018_75)]"
              >
                <Smartphone className="h-5 w-5 shrink-0 text-emerald-600" />
                <div className="text-left flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-bold">WhatsApp Device</p>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Baileys
                    </span>
                  </div>
                  <p className="text-[11px] opacity-75 font-normal">QR pairing and bot messaging status</p>
                </div>
                <ChevronRight className="h-4 w-4 opacity-50" />
              </a>

              <div className="pt-2 border-t border-[oklch(0.9_0.015_75)]">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center justify-center gap-2 p-3 rounded-2xl text-sm font-bold text-destructive bg-destructive/5 hover:bg-destructive/10 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out of C-Suite</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// --- DASHBOARD TAB PANEL ---
// ==========================================
interface TabProps {
  orders: Order[];
  menuItems: MenuItem[];
}
function DashboardTab({ orders, menuItems }: TabProps) {
  // Compute Stats strictly from real database records (0 if clean database)
  const stats = useMemo(() => {
    const validOrders = orders.filter((o) => o.status !== "cancelled");
    const totalRevenue = validOrders.reduce((sum, o) => sum + (Number(o.price) || 0), 0);
    const totalOrdersCount = orders.length;
    const averageOrderValue = totalOrdersCount > 0 ? totalRevenue / totalOrdersCount : 0;
    const activeProductsCount = menuItems.filter((m) => m.isAvailable !== false).length;

    return {
      revenue: totalRevenue,
      ordersCount: totalOrdersCount,
      aov: averageOrderValue,
      productsCount: activeProductsCount,
    };
  }, [orders, menuItems]);

  // Recharts Sales Trend Data from actual orders
  const salesTrendData = useMemo(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const result = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dayName = days[d.getDay()];

      const daySales = orders
        .filter((o) => {
          if (o.status === "cancelled") return false;
          if (o.date?.startsWith("Today") && i === 0) return true;
          if (o.date?.startsWith("Yesterday") && i === 1) return true;
          return false;
        })
        .reduce((sum, o) => sum + (Number(o.price) || 0), 0);

      result.push({ day: dayName, sales: daySales });
    }
    return result;
  }, [orders]);

  // Recharts Category Sales Data strictly from orders or catalog
  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {
      Burgers: 0,
      Burrito: 0,
      Sides: 0,
      Drinks: 0,
      Combos: 0,
    };

    orders.forEach((o) => {
      const itemLower = (o.item || "").toLowerCase();
      if (itemLower.includes("burrito")) counts.Burrito += 1;
      else if (itemLower.includes("burger") || itemLower.includes("smash") || itemLower.includes("cluck")) counts.Burgers += 1;
      else if (itemLower.includes("tender") || itemLower.includes("loaded") || itemLower.includes("fries") || itemLower.includes("sides") || itemLower.includes("mac")) counts.Sides += 1;
      else if (itemLower.includes("drink") || itemLower.includes("shake") || itemLower.includes("beverage")) counts.Drinks += 1;
      else if (itemLower.includes("pack") || itemLower.includes("combo") || itemLower.includes("feast")) counts.Combos += 1;
      else counts.Burgers += 1;
    });

    const hasOrders = Object.values(counts).some((v) => v > 0);
    if (!hasOrders) {
      menuItems.forEach((m) => {
        if (m.category && counts[m.category] !== undefined) {
          counts[m.category] += 1;
        }
      });
    }

    const res = Object.entries(counts)
      .filter(([_, value]) => value > 0)
      .map(([name, value]) => ({ name, value }));

    return res.length > 0 ? res : [{ name: "Catalog", value: menuItems.length || 1 }];
  }, [orders, menuItems]);

  const COLORS = ["oklch(0.68 0.19 40)", "oklch(0.22 0.025 50)", "oklch(0.5 0.02 60)", "#f59e0b", "#3b82f6"];

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      {/* 4 STATS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <div className="rounded-[1.5rem] sm:rounded-[2rem] bg-white border border-[oklch(0.9_0.015_75)] p-3.5 sm:p-6 shadow-sm flex items-center gap-3 sm:gap-5 min-w-0">
          <div className="grid h-10 w-10 sm:h-12 sm:w-12 place-items-center rounded-xl sm:rounded-2xl bg-brand/10 text-brand shrink-0">
            <DollarSign className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] sm:text-xs font-bold text-[oklch(0.5_0.02_60)] uppercase tracking-wider truncate">
              Total Revenue
            </p>
            <h3 className="mt-0.5 sm:mt-1 text-base sm:text-2xl font-display font-extrabold text-[oklch(0.18_0.02_50)] truncate">
              ₹{stats.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
          </div>
        </div>

        <div className="rounded-[1.5rem] sm:rounded-[2rem] bg-white border border-[oklch(0.9_0.015_75)] p-3.5 sm:p-6 shadow-sm flex items-center gap-3 sm:gap-5 min-w-0">
          <div className="grid h-10 w-10 sm:h-12 sm:w-12 place-items-center rounded-xl sm:rounded-2xl bg-[oklch(0.22_0.025_50)]/5 text-[oklch(0.22_0.025_50)] shrink-0">
            <ShoppingBag className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] sm:text-xs font-bold text-[oklch(0.5_0.02_60)] uppercase tracking-wider truncate">
              Total Orders
            </p>
            <h3 className="mt-0.5 sm:mt-1 text-base sm:text-2xl font-display font-extrabold text-[oklch(0.18_0.02_50)] truncate">
              {stats.ordersCount}
            </h3>
          </div>
        </div>

        <div className="rounded-[1.5rem] sm:rounded-[2rem] bg-white border border-[oklch(0.9_0.015_75)] p-3.5 sm:p-6 shadow-sm flex items-center gap-3 sm:gap-5 min-w-0">
          <div className="grid h-10 w-10 sm:h-12 sm:w-12 place-items-center rounded-xl sm:rounded-2xl bg-[oklch(0.5_0.02_60)]/5 text-[oklch(0.5_0.02_60)] shrink-0">
            <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] sm:text-xs font-bold text-[oklch(0.5_0.02_60)] uppercase tracking-wider truncate">
              Average Ticket
            </p>
            <h3 className="mt-0.5 sm:mt-1 text-base sm:text-2xl font-display font-extrabold text-[oklch(0.18_0.02_50)] truncate">
              ₹{stats.aov.toFixed(2)}
            </h3>
          </div>
        </div>

        <div className="rounded-[1.5rem] sm:rounded-[2rem] bg-white border border-[oklch(0.9_0.015_75)] p-3.5 sm:p-6 shadow-sm flex items-center gap-3 sm:gap-5 min-w-0">
          <div className="grid h-10 w-10 sm:h-12 sm:w-12 place-items-center rounded-xl sm:rounded-2xl bg-brand/10 text-brand shrink-0">
            <Utensils className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] sm:text-xs font-bold text-[oklch(0.5_0.02_60)] uppercase tracking-wider truncate">
              Active Products
            </p>
            <h3 className="mt-0.5 sm:mt-1 text-base sm:text-2xl font-display font-extrabold text-[oklch(0.18_0.02_50)] truncate">
              {stats.productsCount}
            </h3>
          </div>
        </div>
      </div>

      {/* CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
        {/* Sales Area Chart */}
        <div className="col-span-1 lg:col-span-3 rounded-[1.5rem] sm:rounded-[2rem] bg-white border border-[oklch(0.9_0.015_75)] p-4 sm:p-6 shadow-sm flex flex-col">
          <div className="mb-4">
            <h4 className="text-sm sm:text-base font-bold text-[oklch(0.18_0.02_50)]">Sales Volume Trend</h4>
            <p className="text-xs text-[oklch(0.5_0.02_60)]">Daily performance across the last week.</p>
          </div>
          <div className="h-60 sm:h-80 w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesTrendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.68 0.19 40)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="oklch(0.68 0.19 40)" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tickLine={false} axisLine={false} className="text-xs text-muted-foreground" />
                <YAxis tickLine={false} axisLine={false} className="text-xs text-muted-foreground" />
                <Tooltip formatter={(value: any) => [`₹${value}`, "Sales"]} />
                <Area type="monotone" dataKey="sales" stroke="oklch(0.68 0.19 40)" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Pie Chart */}
        <div className="col-span-1 lg:col-span-2 rounded-[1.5rem] sm:rounded-[2rem] bg-white border border-[oklch(0.9_0.015_75)] p-4 sm:p-6 shadow-sm flex flex-col">
          <div className="mb-4">
            <h4 className="text-sm sm:text-base font-bold text-[oklch(0.18_0.02_50)]">Category Distribution</h4>
            <p className="text-xs text-[oklch(0.5_0.02_60)]">Popularity percentage of catalog categories.</p>
          </div>
          <div className="h-60 sm:h-80 w-full flex-1 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="45%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => [value, "Items Sold"]} />
                <Legend verticalAlign="bottom" height={36} className="text-xs" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* RECENT LIVE ORDERS GRID PREVIEW */}
      <div className="rounded-[1.5rem] sm:rounded-[2rem] bg-white border border-[oklch(0.9_0.015_75)] p-4 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-sm sm:text-base font-bold text-[oklch(0.18_0.02_50)]">Active Live Orders</h4>
            <p className="text-xs text-[oklch(0.5_0.02_60)]">Real-time status of orders currently in the kitchen or delivery stream.</p>
          </div>
        </div>

        {orders.filter((o) => o.status === "active").length === 0 ? (
          <div className="py-8 text-center text-sm text-[oklch(0.5_0.02_60)]">
            No live active orders. All orders processed or none placed yet.
          </div>
        ) : (
          <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            <table className="w-full text-left border-collapse min-w-[480px]">
              <thead>
                <tr className="border-b border-[oklch(0.9_0.015_75)] text-xs font-bold text-[oklch(0.5_0.02_60)] uppercase tracking-wider">
                  <th className="pb-3">Order ID</th>
                  <th className="pb-3">Customer Items</th>
                  <th className="pb-3">Status Stage</th>
                  <th className="pb-3 text-right">Price Total</th>
                </tr>
              </thead>
              <tbody>
                {orders
                  .filter((o) => o.status === "active")
                  .slice(0, 5)
                  .map((o) => (
                    <tr key={o.id} className="border-b border-[oklch(0.95_0.01_75)] text-sm">
                      <td className="py-3 sm:py-4 font-bold text-[oklch(0.18_0.02_50)]">{o.id}</td>
                      <td className="py-3 sm:py-4 text-[oklch(0.18_0.02_50)]">{o.item}</td>
                      <td className="py-3 sm:py-4">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-2.5 py-1 text-xs font-bold text-brand">
                          <span className="h-1.5 w-1.5 rounded-full bg-brand animate-pulse" />
                          {o.stage === 0 && "Confirmed"}
                          {o.stage === 1 && "Cooking"}
                          {o.stage === 2 && "On the way"}
                          {o.stage === 3 && "Delivered"}
                        </span>
                      </td>
                      <td className="py-3 sm:py-4 text-right font-bold text-[oklch(0.18_0.02_50)]">₹{o.price.toFixed(2)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// --- ORDERS TAB PANEL ---
// ==========================================
interface OrdersTabProps {
  orders: Order[];
}
function OrdersTab({ orders }: OrdersTabProps) {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(
    orders.length > 0 ? orders[0].id : null
  );
  const [isMobileDetailOpen, setIsMobileDetailOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isDeleting, setIsDeleting] = useState(false);

  const selectedOrder = useMemo(() => {
    return orders.find((o) => o.id === selectedOrderId) || null;
  }, [orders, selectedOrderId]);

  const handleAdvanceStage = (id: string, currentStage: number) => {
    if (currentStage < 3) {
      ordersStore.updateOrderStage(id, currentStage + 1);
    }
  };

  const handleCancelOrder = (id: string) => {
    ordersStore.cancelOrder(id);
  };

  // Filter orders by search query
  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) return orders;
    const q = searchQuery.toLowerCase();
    return orders.filter(
      (o) =>
        o.id.toLowerCase().includes(q) ||
        o.item.toLowerCase().includes(q) ||
        (o.deliveryAddress || "").toLowerCase().includes(q) ||
        o.status.toLowerCase().includes(q)
    );
  }, [orders, searchQuery]);

  const activeOrders = useMemo(
    () => filteredOrders.filter((o) => o.status === "active"),
    [filteredOrders]
  );
  const pastOrders = useMemo(
    () => filteredOrders.filter((o) => o.status !== "active"),
    [filteredOrders]
  );

  // Toggle selection for a single order
  const handleToggleSelect = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Toggle Select All active orders
  const handleToggleSelectAllActive = () => {
    const activeIds = activeOrders.map((o) => o.id);
    const allActiveSelected = activeIds.length > 0 && activeIds.every((id) => selectedIds.includes(id));
    if (allActiveSelected) {
      setSelectedIds((prev) => prev.filter((id) => !activeIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...activeIds])));
    }
  };

  // Toggle Select All past orders
  const handleToggleSelectAllPast = () => {
    const pastIds = pastOrders.map((o) => o.id);
    const allPastSelected = pastIds.length > 0 && pastIds.every((id) => selectedIds.includes(id));
    if (allPastSelected) {
      setSelectedIds((prev) => prev.filter((id) => !pastIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...pastIds])));
    }
  };

  // Select all orders currently shown
  const handleSelectAllGlobal = () => {
    if (selectedIds.length === filteredOrders.length && filteredOrders.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredOrders.map((o) => o.id));
    }
  };

  // Delete a single order and all its history
  const handleDeleteSingle = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (
      confirm(
        `Are you sure you want to PERMANENTLY delete Order ${id}?\n\nThis will completely erase the order and all its historical tracking records from the database.`
      )
    ) {
      setIsDeleting(true);
      const success = await ordersStore.deleteOrder(id);
      setIsDeleting(false);
      if (success) {
        toast.success(`Order ${id} and all history permanently deleted.`);
        if (selectedOrderId === id) {
          setSelectedOrderId(null);
          setIsMobileDetailOpen(false);
        }
        setSelectedIds((prev) => prev.filter((item) => item !== id));
      } else {
        toast.error(`Failed to delete order ${id}`);
      }
    }
  };

  // Bulk delete selected orders and their history
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (
      confirm(
        `⚠️ Permanently delete ${selectedIds.length} selected order(s)?\n\nThis will completely remove all selected active and archived orders, their items, and history from the database. This action CANNOT be undone.`
      )
    ) {
      setIsDeleting(true);
      const success = await ordersStore.bulkDeleteOrders(selectedIds);
      setIsDeleting(false);
      if (success) {
        toast.success(`Successfully deleted ${selectedIds.length} order(s) and their full history.`);
        if (selectedOrderId && selectedIds.includes(selectedOrderId)) {
          setSelectedOrderId(null);
          setIsMobileDetailOpen(false);
        }
        setSelectedIds([]);
      } else {
        toast.error("Failed to delete selected orders.");
      }
    }
  };

  const handleOpenOrder = (id: string) => {
    setSelectedOrderId(id);
    setIsMobileDetailOpen(true);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* TOP CONTROLS & BULK ACTION BAR */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 rounded-[1.5rem] sm:rounded-[2rem] bg-white border border-[oklch(0.9_0.015_75)] p-3.5 sm:p-4 shadow-sm">
        {/* Search Input */}
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by order ID, items, or address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-xs bg-[oklch(0.98_0.005_75)] border border-[oklch(0.9_0.015_75)] rounded-xl focus:outline-none focus:border-brand"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Global Select All & Bulk Actions */}
        <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2 sm:gap-3">
          <button
            type="button"
            onClick={handleSelectAllGlobal}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-[oklch(0.95_0.01_75)] hover:bg-[oklch(0.9_0.015_75)] text-slate-700 transition-colors cursor-pointer"
          >
            {selectedIds.length === filteredOrders.length && filteredOrders.length > 0 ? (
              <CheckSquare className="h-4 w-4 text-brand" />
            ) : (
              <Square className="h-4 w-4 text-slate-400" />
            )}
            <span>
              {selectedIds.length === filteredOrders.length && filteredOrders.length > 0
                ? "Deselect All"
                : `Select All (${filteredOrders.length})`}
            </span>
          </button>

          {/* Bulk Delete Trigger Button */}
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2 animate-fadeIn">
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleBulkDelete}
                className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                <span>Delete ({selectedIds.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedIds([])}
                className="text-xs text-slate-500 hover:text-slate-800 underline px-1 cursor-pointer"
              >
                Clear
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* ORDERS LIST PANEL (LEFT 2/3 ON DESKTOP, FULL WIDTH ON MOBILE) */}
        <div className="col-span-1 lg:col-span-2 space-y-6">
          {/* Active Orders List */}
          <div className="rounded-[1.5rem] sm:rounded-[2rem] bg-white border border-[oklch(0.9_0.015_75)] p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 border-b border-[oklch(0.9_0.015_75)] pb-3">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <button
                  type="button"
                  onClick={handleToggleSelectAllActive}
                  className="text-slate-400 hover:text-brand transition-colors cursor-pointer"
                  title="Select all active orders"
                >
                  {activeOrders.length > 0 &&
                  activeOrders.every((o) => selectedIds.includes(o.id)) ? (
                    <CheckSquare className="h-4 w-4 text-brand" />
                  ) : (
                    <Square className="h-4 w-4" />
                  )}
                </button>
                <h3 className="text-sm sm:text-base font-bold text-[oklch(0.18_0.02_50)]">
                  Active Orders Stream
                </h3>
              </div>
              <span className="text-xs font-bold text-brand bg-brand/10 px-2.5 py-1 rounded-full">
                {activeOrders.length} Processing
              </span>
            </div>

            {activeOrders.length === 0 ? (
              <div className="py-12 text-center text-sm text-[oklch(0.5_0.02_60)] flex flex-col items-center justify-center gap-2">
                <ShoppingBag className="h-8 w-8 text-[oklch(0.5_0.02_60)] opacity-40" />
                <span>No orders currently cooking or in transit.</span>
              </div>
            ) : (
              <ul className="divide-y divide-[oklch(0.95_0.01_75)]">
                {activeOrders.map((o) => {
                  const isSelected = o.id === selectedOrderId;
                  const isChecked = selectedIds.includes(o.id);
                  return (
                    <li
                      key={o.id}
                      onClick={() => handleOpenOrder(o.id)}
                      className={`group relative flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 -mx-2 sm:-mx-4 rounded-2xl transition-all cursor-pointer gap-2.5 sm:gap-3 ${
                        isSelected
                          ? "bg-[oklch(0.94_0.018_75)]"
                          : "hover:bg-[oklch(0.97_0.012_75)]"
                      } ${isChecked ? "ring-2 ring-brand/40 bg-brand/5" : ""}`}
                    >
                      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                        {/* Checkbox */}
                        <div
                          onClick={(e) => handleToggleSelect(o.id, e)}
                          className="grid h-6 w-6 place-items-center rounded-md text-slate-400 hover:text-brand cursor-pointer shrink-0"
                        >
                          {isChecked ? (
                            <CheckSquare className="h-4 w-4 text-brand" />
                          ) : (
                            <Square className="h-4 w-4" />
                          )}
                        </div>

                        <img
                          src={o.image}
                          alt=""
                          className="h-11 w-11 sm:h-12 sm:w-12 rounded-xl object-cover shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-xs sm:text-sm text-[oklch(0.18_0.02_50)] truncate">
                              {o.id}
                            </h4>
                            <span className="text-[10px] text-[oklch(0.5_0.02_60)] shrink-0">
                              {o.date}
                            </span>
                          </div>
                          <p className="truncate text-xs font-semibold text-[oklch(0.18_0.02_50)] mt-0.5">
                            {o.item}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-2.5 sm:gap-3 pl-8 sm:pl-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-[oklch(0.95_0.01_75)] shrink-0">
                        <span className="inline-flex items-center gap-1 rounded-full bg-brand/10 px-2.5 py-0.5 text-xs font-bold text-brand">
                          <span className="h-1.5 w-1.5 rounded-full bg-brand animate-pulse" />
                          {o.stage === 0 && "Confirmed"}
                          {o.stage === 1 && "Cooking"}
                          {o.stage === 2 && "On the way"}
                        </span>

                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-[oklch(0.18_0.02_50)]">
                            ₹{o.price.toFixed(2)}
                          </span>

                          {/* Individual Delete Button */}
                          <button
                            type="button"
                            onClick={(e) => handleDeleteSingle(o.id, e)}
                            className="grid h-7 w-7 place-items-center rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Permanently delete this order & history"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>

                          <ChevronRight className="h-4 w-4 text-[oklch(0.5_0.02_60)] transition-transform group-hover:translate-x-0.5" />
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Past Orders List */}
          <div className="rounded-[1.5rem] sm:rounded-[2rem] bg-white border border-[oklch(0.9_0.015_75)] p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 border-b border-[oklch(0.9_0.015_75)] pb-3">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <button
                  type="button"
                  onClick={handleToggleSelectAllPast}
                  className="text-slate-400 hover:text-brand transition-colors cursor-pointer"
                  title="Select all past orders"
                >
                  {pastOrders.length > 0 &&
                  pastOrders.every((o) => selectedIds.includes(o.id)) ? (
                    <CheckSquare className="h-4 w-4 text-brand" />
                  ) : (
                    <Square className="h-4 w-4" />
                  )}
                </button>
                <h3 className="text-sm sm:text-base font-bold text-[oklch(0.18_0.02_50)]">
                  Completed & Cancelled History
                </h3>
              </div>
              <span className="text-xs font-bold text-[oklch(0.5_0.02_60)] bg-[oklch(0.94_0.018_75)] px-2.5 py-1 rounded-full">
                {pastOrders.length} Logged
              </span>
            </div>

            {pastOrders.length === 0 ? (
              <div className="py-8 text-center text-sm text-[oklch(0.5_0.02_60)]">
                No order archive history is available yet.
              </div>
            ) : (
              <ul className="divide-y divide-[oklch(0.95_0.01_75)]">
                {pastOrders.map((o) => {
                  const isSelected = o.id === selectedOrderId;
                  const isChecked = selectedIds.includes(o.id);
                  return (
                    <li
                      key={o.id}
                      onClick={() => handleOpenOrder(o.id)}
                      className={`group flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 -mx-2 sm:-mx-4 rounded-2xl transition-all cursor-pointer gap-2.5 sm:gap-3 ${
                        isSelected
                          ? "bg-[oklch(0.94_0.018_75)]"
                          : "hover:bg-[oklch(0.97_0.012_75)]"
                      } ${isChecked ? "ring-2 ring-brand/40 bg-brand/5" : ""}`}
                    >
                      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                        {/* Checkbox */}
                        <div
                          onClick={(e) => handleToggleSelect(o.id, e)}
                          className="grid h-6 w-6 place-items-center rounded-md text-slate-400 hover:text-brand cursor-pointer shrink-0"
                        >
                          {isChecked ? (
                            <CheckSquare className="h-4 w-4 text-brand" />
                          ) : (
                            <Square className="h-4 w-4" />
                          )}
                        </div>

                        <img
                          src={o.image}
                          alt=""
                          className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl object-cover opacity-60 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-xs sm:text-sm text-[oklch(0.18_0.02_50)] truncate">
                              {o.id}
                            </h4>
                            <span className="text-[10px] text-[oklch(0.5_0.02_60)] shrink-0">
                              {o.date}
                            </span>
                          </div>
                          <p className="truncate text-xs font-semibold text-[oklch(0.5_0.02_60)] mt-0.5">
                            {o.item}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-2.5 sm:gap-3 pl-8 sm:pl-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-[oklch(0.95_0.01_75)] shrink-0">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            o.status === "cancelled"
                              ? "bg-destructive/10 text-destructive"
                              : "bg-emerald-500/10 text-emerald-600"
                          }`}
                        >
                          {o.status}
                        </span>

                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-[oklch(0.18_0.02_50)]">
                            ₹{o.price.toFixed(2)}
                          </span>

                          {/* Individual Delete Button */}
                          <button
                            type="button"
                            onClick={(e) => handleDeleteSingle(o.id, e)}
                            className="grid h-7 w-7 place-items-center rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Permanently delete this order & history"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>

                          <ChevronRight className="h-4 w-4 text-[oklch(0.5_0.02_60)] transition-transform group-hover:translate-x-0.5" />
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        {/* DESKTOP DETAIL CONSOLE PANEL (RIGHT 1/3) */}
        <div className="hidden lg:block lg:col-span-1">
          {selectedOrder ? (
            <div className="sticky top-28 rounded-[2rem] bg-white border border-[oklch(0.9_0.015_75)] p-6 shadow-sm space-y-6 animate-fadeIn">
              <div className="border-b border-[oklch(0.9_0.015_75)] pb-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-brand uppercase tracking-wider">
                    Live Dispatch
                  </span>
                  <span className="text-xs text-[oklch(0.5_0.02_60)]">{selectedOrder.date}</span>
                </div>
                <h3 className="text-xl font-display font-extrabold text-[oklch(0.18_0.02_50)] mt-1">
                  Order {selectedOrder.id}
                </h3>
              </div>

              <div className="flex gap-3">
                <img
                  src={selectedOrder.image}
                  alt=""
                  className="h-20 w-20 rounded-2xl object-cover shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-xs text-[oklch(0.5_0.02_60)] font-bold uppercase tracking-wider">
                    Items Summary
                  </p>
                  <h4 className="text-sm font-bold text-[oklch(0.18_0.02_50)] mt-1 leading-snug break-words">
                    {selectedOrder.item}
                  </h4>
                </div>
              </div>

              {selectedOrder.deliveryAddress && (
                <div className="rounded-2xl bg-[oklch(0.97_0.012_75)] p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-brand shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-[oklch(0.18_0.02_50)] uppercase tracking-wider mb-1">
                        Delivery Address
                      </p>
                      <p className="text-sm text-[oklch(0.5_0.02_60)] leading-snug break-words">
                        {selectedOrder.deliveryAddress}
                      </p>
                    </div>
                  </div>
                  <a
                    href={
                      selectedOrder.deliveryLat && selectedOrder.deliveryLng
                        ? `https://maps.google.com/?q=${selectedOrder.deliveryLat},${selectedOrder.deliveryLng}`
                        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                            selectedOrder.deliveryAddress
                          )}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-full border border-[oklch(0.9_0.015_75)] bg-white py-2.5 text-xs font-bold text-[oklch(0.18_0.02_50)] hover:bg-[oklch(0.98_0.005_75)] transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Navigate with Google Maps
                  </a>
                </div>
              )}

              {/* Stepper Status Progress */}
              {selectedOrder.status === "active" && (
                <div className="rounded-2xl bg-[oklch(0.97_0.012_75)] p-4 space-y-3">
                  <p className="text-xs font-bold text-[oklch(0.18_0.02_50)] uppercase tracking-wider">
                    Update Cooking Stream
                  </p>

                  <div className="grid grid-cols-3 gap-2">
                    <div
                      className={`flex flex-col items-center p-2 rounded-xl text-center border ${
                        selectedOrder.stage >= 0
                          ? "bg-brand/10 border-brand/20 text-brand"
                          : "bg-white border-transparent text-muted-foreground"
                      }`}
                    >
                      <Check className="h-4 w-4" />
                      <span className="text-[9px] font-bold mt-1 uppercase">Confirmed</span>
                    </div>
                    <div
                      className={`flex flex-col items-center p-2 rounded-xl text-center border ${
                        selectedOrder.stage >= 1
                          ? "bg-brand/10 border-brand/20 text-brand"
                          : "bg-white border-transparent text-muted-foreground"
                      }`}
                    >
                      <Activity
                        className={`h-4 w-4 ${selectedOrder.stage === 1 ? "animate-pulse" : ""}`}
                      />
                      <span className="text-[9px] font-bold mt-1 uppercase">Cooking</span>
                    </div>
                    <div
                      className={`flex flex-col items-center p-2 rounded-xl text-center border ${
                        selectedOrder.stage >= 2
                          ? "bg-brand/10 border-brand/20 text-brand"
                          : "bg-white border-transparent text-muted-foreground"
                      }`}
                    >
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-[9px] font-bold mt-1 uppercase">In Transit</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    {selectedOrder.stage === 0 && (
                      <button
                        onClick={() => handleAdvanceStage(selectedOrder.id, 0)}
                        className="w-full rounded-full bg-brand py-2.5 text-xs font-bold text-brand-foreground hover:bg-brand/90 transition-colors cursor-pointer"
                      >
                        Advance to "Cooking"
                      </button>
                    )}
                    {selectedOrder.stage === 1 && (
                      <button
                        onClick={() => handleAdvanceStage(selectedOrder.id, 1)}
                        className="w-full rounded-full bg-primary py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
                      >
                        Advance to "On The Way"
                      </button>
                    )}
                    {selectedOrder.stage === 2 && (
                      <button
                        onClick={() => handleAdvanceStage(selectedOrder.id, 2)}
                        className="w-full rounded-full bg-emerald-600 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition-colors cursor-pointer"
                      >
                        Mark as "Delivered"
                      </button>
                    )}
                  </div>
                </div>
              )}

              <div className="border-t border-[oklch(0.9_0.015_75)] pt-4 space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[oklch(0.5_0.02_60)] font-semibold">
                    Total Price (GST Incl.)
                  </span>
                  <span className="text-lg font-extrabold text-[oklch(0.18_0.02_50)]">
                    ₹{selectedOrder.price.toFixed(2)}
                  </span>
                </div>

                <div className="space-y-2">
                  {selectedOrder.status === "active" && (
                    <button
                      onClick={() => handleCancelOrder(selectedOrder.id)}
                      className="flex w-full items-center justify-center gap-1.5 rounded-full border border-amber-300 text-amber-800 bg-amber-50 hover:bg-amber-100 transition-colors py-2 text-xs font-bold cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5" />
                      <span>Cancel Order</span>
                    </button>
                  )}

                  {/* Permanent Delete Button */}
                  <button
                    disabled={isDeleting}
                    onClick={() => handleDeleteSingle(selectedOrder.id)}
                    className="flex w-full items-center justify-center gap-1.5 rounded-full border border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100 hover:border-rose-300 transition-colors py-2.5 text-xs font-bold cursor-pointer disabled:opacity-50"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-rose-600" />
                    <span>Permanently Delete Order & History</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="sticky top-28 rounded-[2rem] bg-white border border-[oklch(0.9_0.015_75)] p-6 shadow-sm text-center text-sm text-[oklch(0.5_0.02_60)] py-12">
              Select an order from the list to view live tracking and update stages.
            </div>
          )}
        </div>
      </div>

      {/* MOBILE ORDER DETAIL BOTTOM SHEET DRAWER */}
      {isMobileDetailOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div
            className="absolute inset-0"
            onClick={() => setIsMobileDetailOpen(false)}
          />
          <div className="relative bg-white rounded-t-[2rem] max-h-[88vh] overflow-y-auto p-5 space-y-5 shadow-2xl border-t border-[oklch(0.9_0.015_75)]">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-[oklch(0.9_0.015_75)] pb-3">
              <div>
                <span className="text-[10px] font-bold text-brand uppercase tracking-wider">
                  Live Dispatch · {selectedOrder.date}
                </span>
                <h3 className="text-lg font-display font-extrabold text-[oklch(0.18_0.02_50)]">
                  Order {selectedOrder.id}
                </h3>
              </div>
              <button
                onClick={() => setIsMobileDetailOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-full bg-[oklch(0.94_0.018_75)] text-slate-600 hover:bg-[oklch(0.9_0.015_75)]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Items Summary */}
            <div className="flex gap-3">
              <img
                src={selectedOrder.image}
                alt=""
                className="h-16 w-16 rounded-2xl object-cover shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] text-[oklch(0.5_0.02_60)] font-bold uppercase tracking-wider">
                  Items Summary
                </p>
                <h4 className="text-sm font-bold text-[oklch(0.18_0.02_50)] mt-0.5 leading-snug break-words">
                  {selectedOrder.item}
                </h4>
              </div>
            </div>

            {/* Delivery Address */}
            {selectedOrder.deliveryAddress && (
              <div className="rounded-2xl bg-[oklch(0.97_0.012_75)] p-4 space-y-3">
                <div className="flex items-start gap-2.5">
                  <MapPin className="h-4 w-4 text-brand shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold text-[oklch(0.18_0.02_50)] uppercase tracking-wider mb-0.5">
                      Delivery Address
                    </p>
                    <p className="text-xs text-[oklch(0.5_0.02_60)] leading-snug break-words">
                      {selectedOrder.deliveryAddress}
                    </p>
                  </div>
                </div>
                <a
                  href={
                    selectedOrder.deliveryLat && selectedOrder.deliveryLng
                      ? `https://maps.google.com/?q=${selectedOrder.deliveryLat},${selectedOrder.deliveryLng}`
                      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          selectedOrder.deliveryAddress
                        )}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-[oklch(0.9_0.015_75)] bg-white py-2 text-xs font-bold text-[oklch(0.18_0.02_50)] hover:bg-[oklch(0.98_0.005_75)] transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Navigate with Google Maps
                </a>
              </div>
            )}

            {/* Cooking Stream Progress */}
            {selectedOrder.status === "active" && (
              <div className="rounded-2xl bg-[oklch(0.97_0.012_75)] p-4 space-y-3">
                <p className="text-[10px] font-bold text-[oklch(0.18_0.02_50)] uppercase tracking-wider">
                  Update Cooking Stream
                </p>

                <div className="grid grid-cols-3 gap-2">
                  <div
                    className={`flex flex-col items-center p-2 rounded-xl text-center border ${
                      selectedOrder.stage >= 0
                        ? "bg-brand/10 border-brand/20 text-brand"
                        : "bg-white border-transparent text-muted-foreground"
                    }`}
                  >
                    <Check className="h-4 w-4" />
                    <span className="text-[9px] font-bold mt-1 uppercase">Confirmed</span>
                  </div>
                  <div
                    className={`flex flex-col items-center p-2 rounded-xl text-center border ${
                      selectedOrder.stage >= 1
                        ? "bg-brand/10 border-brand/20 text-brand"
                        : "bg-white border-transparent text-muted-foreground"
                    }`}
                  >
                    <Activity
                      className={`h-4 w-4 ${selectedOrder.stage === 1 ? "animate-pulse" : ""}`}
                    />
                    <span className="text-[9px] font-bold mt-1 uppercase">Cooking</span>
                  </div>
                  <div
                    className={`flex flex-col items-center p-2 rounded-xl text-center border ${
                      selectedOrder.stage >= 2
                        ? "bg-brand/10 border-brand/20 text-brand"
                        : "bg-white border-transparent text-muted-foreground"
                    }`}
                  >
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-[9px] font-bold mt-1 uppercase">In Transit</span>
                  </div>
                </div>

                <div className="pt-1">
                  {selectedOrder.stage === 0 && (
                    <button
                      onClick={() => handleAdvanceStage(selectedOrder.id, 0)}
                      className="w-full rounded-full bg-brand py-3 text-xs font-bold text-brand-foreground hover:bg-brand/90 transition-colors cursor-pointer"
                    >
                      Advance to "Cooking"
                    </button>
                  )}
                  {selectedOrder.stage === 1 && (
                    <button
                      onClick={() => handleAdvanceStage(selectedOrder.id, 1)}
                      className="w-full rounded-full bg-primary py-3 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
                    >
                      Advance to "On The Way"
                    </button>
                  )}
                  {selectedOrder.stage === 2 && (
                    <button
                      onClick={() => handleAdvanceStage(selectedOrder.id, 2)}
                      className="w-full rounded-full bg-emerald-600 py-3 text-xs font-bold text-white hover:bg-emerald-700 transition-colors cursor-pointer"
                    >
                      Mark as "Delivered"
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Price & Actions */}
            <div className="border-t border-[oklch(0.9_0.015_75)] pt-3 space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-[oklch(0.5_0.02_60)] font-semibold text-xs">
                  Total Price (GST Incl.)
                </span>
                <span className="text-base font-extrabold text-[oklch(0.18_0.02_50)]">
                  ₹{selectedOrder.price.toFixed(2)}
                </span>
              </div>

              <div className="space-y-2">
                {selectedOrder.status === "active" && (
                  <button
                    onClick={() => handleCancelOrder(selectedOrder.id)}
                    className="flex w-full items-center justify-center gap-1.5 rounded-full border border-amber-300 text-amber-800 bg-amber-50 hover:bg-amber-100 transition-colors py-2.5 text-xs font-bold cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                    <span>Cancel Order</span>
                  </button>
                )}

                <button
                  disabled={isDeleting}
                  onClick={() => handleDeleteSingle(selectedOrder.id)}
                  className="flex w-full items-center justify-center gap-1.5 rounded-full border border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100 hover:border-rose-300 transition-colors py-2.5 text-xs font-bold cursor-pointer disabled:opacity-50"
                >
                  <Trash2 className="h-3.5 w-3.5 text-rose-600" />
                  <span>Permanently Delete Order & History</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// --- MENU CRUD TAB PANEL ---
// ==========================================
interface MenuTabProps {
  menuItems: MenuItem[];
}
function MenuTab({ menuItems }: MenuTabProps) {
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  // Filters
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "disabled">("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Form Fields
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState<"Burgers" | "Burrito" | "Sides" | "Drinks" | "Combos">("Burgers");
  const [tag, setTag] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);
  const [isComingSoon, setIsComingSoon] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [image, setImage] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  // Upload States
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [showManualImageUrl, setShowManualImageUrl] = useState(false);
  const [showManualVideoUrl, setShowManualVideoUrl] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Counts
  const activeCount = useMemo(
    () => menuItems.filter((i) => i.isAvailable !== false).length,
    [menuItems]
  );
  const disabledCount = useMemo(
    () => menuItems.filter((i) => i.isAvailable === false).length,
    [menuItems]
  );

  // Filtered Items
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const isItemActive = item.isAvailable !== false;
      const matchesStatus =
        filterStatus === "all"
          ? true
          : filterStatus === "active"
          ? isItemActive
          : !isItemActive;

      const matchesCategory =
        selectedCategory === "All" ||
        item.category?.toLowerCase() === selectedCategory.toLowerCase();

      const matchesSearch =
        !searchQuery.trim() ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.desc || item.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.tag || "").toLowerCase().includes(searchQuery.toLowerCase());

      return matchesStatus && matchesCategory && matchesSearch;
    });
  }, [menuItems, filterStatus, selectedCategory, searchQuery]);

  const resetForm = () => {
    setEditingItem(null);
    setName("");
    setDesc("");
    setPrice("");
    setCategory("Burgers");
    setTag("");
    setIsAvailable(true);
    setIsComingSoon(false);
    setIsFeatured(false);
    setImage("");
    setVideoUrl("");
    setIsUploadingImage(false);
    setIsUploadingVideo(false);
    setShowManualImageUrl(false);
    setShowManualVideoUrl(false);
    if (imageInputRef.current) imageInputRef.current.value = "";
    if (videoInputRef.current) videoInputRef.current.value = "";
  };

  const handleEditInit = (item: MenuItem) => {
    setEditingItem(item);
    setName(item.name);
    setDesc(item.desc || item.description || "");
    setPrice(item.price.toString());
    setCategory(item.category);
    setTag(item.tag || "");
    setIsAvailable(item.isAvailable !== false);
    setIsComingSoon(Boolean((item as any).isComingSoon) || item.tag?.toLowerCase() === "coming soon");
    setIsFeatured(Boolean((item as any).isFeatured));
    setImage(item.imageUrl || item.image || "");
    setVideoUrl(item.videoUrl || "");
    setShowManualImageUrl(false);
    setShowManualVideoUrl(false);
  };

  const handleToggleAvailable = async (item: MenuItem) => {
    const nextState = item.isAvailable === false ? true : false;
    const res = await menuStore.toggleAvailable(item.id, nextState);
    if (res) {
      toast.success(
        nextState
          ? `🟢 "${item.name}" enabled (now visible on customer store)!`
          : `⏸️ "${item.name}" disabled (soft-deleted & hidden from customer store)`
      );
    }
  };

  const handleToggleFeatured = async (item: MenuItem) => {
    const newFeatured = !Boolean((item as any).isFeatured);
    const res = await menuStore.updateItem(item.id, { isFeatured: newFeatured });
    if (res) {
      toast.success(
        newFeatured
          ? `⭐ "${item.name}" added to Homepage Main Carousel!`
          : `"${item.name}" removed from Homepage Main Carousel`
      );
    }
  };

  // Upload Photo from computer to Cloudinary
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (PNG, JPG, WEBP, etc.)");
      return;
    }

    try {
      setIsUploadingImage(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "kaivu/menu");
      formData.append("resourceType", "image");

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success && (data.data?.secureUrl || data.data?.url)) {
        const uploadedUrl = data.data.secureUrl || data.data.url;
        setImage(uploadedUrl);
        toast.success("Product photo uploaded to Cloudinary successfully!");
      } else {
        toast.error(data.error || "Failed to upload image to Cloudinary");
      }
    } catch (err: any) {
      console.error("Image upload error:", err);
      toast.error(err?.message || "Failed to upload image");
    } finally {
      setIsUploadingImage(false);
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
  };

  // Upload Video from computer to Cloudinary
  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      toast.error("Please upload a video file (MP4, WebM, QuickTime, etc.)");
      return;
    }

    try {
      setIsUploadingVideo(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "kaivu/videos");
      formData.append("resourceType", "video");

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success && (data.data?.secureUrl || data.data?.url)) {
        const uploadedUrl = data.data.secureUrl || data.data.url;
        setVideoUrl(uploadedUrl);
        toast.success("Product video uploaded to Cloudinary successfully!");
      } else {
        toast.error(data.error || "Failed to upload video to Cloudinary");
      }
    } catch (err: any) {
      console.error("Video upload error:", err);
      toast.error(err?.message || "Failed to upload video");
    } finally {
      setIsUploadingVideo(false);
      if (videoInputRef.current) videoInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !desc) {
      toast.error("Please fill in the product name, price, and description");
      return;
    }

    if (isUploadingImage || isUploadingVideo) {
      toast.error("Please wait for media uploads to complete before saving");
      return;
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice)) {
      toast.error("Please enter a valid price");
      return;
    }

    // Default fallback avatar burger item if image is missing
    const defaultImage = "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=60";
    const finalImageUrl = image.trim() || defaultImage;

    const itemPayload = {
      name,
      desc,
      price: parsedPrice,
      category,
      tag: tag.trim() || undefined,
      isAvailable,
      isComingSoon,
      isFeatured,
      image: finalImageUrl,
      imageUrl: finalImageUrl,
      videoUrl: videoUrl.trim() || undefined,
      rating: editingItem ? editingItem.rating : 5.0,
    };

    if (editingItem) {
      const res = await menuStore.updateItem(editingItem.id, itemPayload);
      if (res) {
        toast.success(`"${name}" updated successfully!`);
      } else {
        toast.error("Failed to update item");
      }
    } else {
      const res = await menuStore.addItem(itemPayload);
      if (res) {
        toast.success(`"${name}" created successfully in menu!`);
      } else {
        toast.error("Failed to create menu item");
      }
    }

    resetForm();
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to permanently delete "${name}" from database?`)) {
      menuStore.hardDeleteItem(id);
      toast.success(`"${name}" permanently deleted`);
      if (editingItem && editingItem.id === id) {
        resetForm();
      }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8 animate-fadeIn">
      {/* PRODUCTS LIST TABLE (LEFT 3/5 ON DESKTOP, FULL ON MOBILE) */}
      <div className="col-span-1 lg:col-span-3 rounded-[1.5rem] sm:rounded-[2rem] bg-white border border-[oklch(0.9_0.015_75)] p-4 sm:p-6 shadow-sm flex flex-col gap-4 min-w-0">
        {/* Header & Stats */}
        <div className="flex flex-col gap-3 border-b border-[oklch(0.9_0.015_75)] pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[oklch(0.18_0.02_50)]">
                Catalog Menu Items ({menuItems.length})
              </h3>
              <p className="text-xs text-[oklch(0.5_0.02_60)]">
                Manage product details, pricing, and customer visibility
              </p>
            </div>
            <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Cloudinary Media Sync
            </span>
          </div>

          {/* Filter Status Tabs (All / Active / Disabled) */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="inline-flex rounded-xl bg-[oklch(0.95_0.01_75)] p-1 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setFilterStatus("all")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  filterStatus === "all"
                    ? "bg-white text-[oklch(0.18_0.02_50)] shadow-xs font-bold"
                    : "text-[oklch(0.5_0.02_60)] hover:text-foreground"
                }`}
              >
                All ({menuItems.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus("active")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  filterStatus === "active"
                    ? "bg-emerald-500 text-white shadow-xs font-bold"
                    : "text-[oklch(0.5_0.02_60)] hover:text-emerald-700"
                }`}
              >
                <span className="h-2 w-2 rounded-full bg-emerald-300" />
                Active ({activeCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus("disabled")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  filterStatus === "disabled"
                    ? "bg-slate-800 text-white shadow-xs font-bold"
                    : "text-[oklch(0.5_0.02_60)] hover:text-slate-900"
                }`}
              >
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                Disabled / Hidden ({disabledCount})
              </button>
            </div>

            {/* Search & Category Filter */}
            <div className="flex items-center gap-2 flex-1 max-w-xs">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-[oklch(0.98_0.005_75)] border border-[oklch(0.9_0.015_75)] rounded-xl focus:outline-none focus:border-brand"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="text-xs bg-[oklch(0.98_0.005_75)] border border-[oklch(0.9_0.015_75)] rounded-xl px-2 py-1.5 focus:outline-none focus:border-brand cursor-pointer"
              >
                <option value="All">All Categories</option>
                <option value="Burgers">Burgers</option>
                <option value="Burrito">Burrito</option>
                <option value="Sides">Sides</option>
                <option value="Drinks">Drinks</option>
                <option value="Combos">Combos</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 my-2">
              <Utensils className="h-8 w-8 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-600">No menu items found</p>
              <p className="text-xs text-slate-400 mt-1">
                {filterStatus === "disabled"
                  ? "No disabled items currently in the catalog."
                  : "Try adjusting your search or status filter."}
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[560px]">
              <thead>
                <tr className="border-b border-[oklch(0.9_0.015_75)] text-xs font-bold text-[oklch(0.5_0.02_60)] uppercase tracking-wider">
                  <th className="pb-3 pl-2">Product</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Price</th>
                  <th className="pb-3 text-right pr-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => {
                  const isItemActive = item.isAvailable !== false;
                  return (
                    <tr
                      key={item.id}
                      className={`border-b border-[oklch(0.95_0.01_75)] text-sm group transition-colors ${
                        !isItemActive
                          ? "bg-slate-50/80 opacity-75 hover:opacity-100"
                          : "hover:bg-[oklch(0.98_0.005_75)]"
                      }`}
                    >
                      <td className="py-3 pl-2">
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-12 rounded-xl overflow-hidden shrink-0 bg-accent border border-[oklch(0.9_0.015_75)] shadow-xs">
                            <img
                              src={item.imageUrl || item.image}
                              alt={item.name}
                              className={`h-full w-full object-cover transition-all ${
                                !isItemActive ? "grayscale" : ""
                              }`}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&auto=format&fit=crop&q=60";
                              }}
                            />
                            {item.videoUrl && (
                              <span
                                className="absolute bottom-1 right-1 grid h-4 w-4 place-items-center rounded-full bg-black/70 text-white"
                                title="Has attached video"
                              >
                                <Film className="h-2.5 w-2.5" />
                              </span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h4
                                className={`font-bold ${
                                  !isItemActive
                                    ? "text-slate-500 line-through"
                                    : "text-[oklch(0.18_0.02_50)]"
                                }`}
                              >
                                {item.name}
                              </h4>
                              {item.tag && (
                                <span className="rounded bg-[oklch(0.9_0.015_75)] px-1 py-0.5 text-[8px] font-bold text-foreground">
                                  {item.tag}
                                </span>
                              )}
                              {(item.isComingSoon || item.tag?.toLowerCase() === "coming soon") && (
                                <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-700 px-1.5 py-0.2 text-[9px] font-bold">
                                  🚀 Coming Soon
                                </span>
                              )}
                              {item.isFeatured && (
                                <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-500 text-slate-950 px-1.5 py-0.2 text-[9px] font-bold shadow-2xs">
                                  ⭐ Main Carousel
                                </span>
                              )}
                              {item.videoUrl && (
                                <span className="inline-flex items-center gap-0.5 rounded-full bg-blue-500/10 px-1.5 py-0.2 text-[9px] font-bold text-blue-600">
                                  <Video className="h-2.5 w-2.5" /> Video
                                </span>
                              )}
                            </div>
                            <p className="truncate text-xs text-[oklch(0.5_0.02_60)] mt-0.5 max-w-xs">
                              {item.desc || item.description}
                            </p>
                          </div>
                        </div>
                      </td>
                      {/* Status Column */}
                      <td className="py-3">
                        {isItemActive ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 text-slate-600 border border-slate-300 px-2 py-0.5 text-[10px] font-bold">
                            <EyeOff className="h-3 w-3 text-slate-400" />
                            Disabled
                          </span>
                        )}
                      </td>
                      <td className="py-3">
                        <span className="rounded-full bg-[oklch(0.94_0.018_75)] px-2.5 py-1 text-xs font-medium text-[oklch(0.22_0.025_50)]">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-3 font-bold text-[oklch(0.18_0.02_50)]">
                        ₹{item.price.toFixed(2)}
                      </td>
                      <td className="py-3 text-right pr-2">
                        <div className="inline-flex items-center gap-1.5">
                          {/* Soft Delete / Disable Toggle Button */}
                          <button
                            type="button"
                            onClick={() => handleToggleAvailable(item)}
                            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer ${
                              isItemActive
                                ? "bg-slate-100 text-slate-700 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 border border-slate-200"
                                : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-300 shadow-2xs"
                            }`}
                            title={
                              isItemActive
                                ? "Disable / Soft Delete (Hides from customer store)"
                                : "Enable Product (Makes visible on customer store)"
                            }
                          >
                            {isItemActive ? (
                              <>
                                <EyeOff className="h-3 w-3 text-slate-500" />
                                <span>Disable</span>
                              </>
                            ) : (
                              <>
                                <Check className="h-3 w-3 text-emerald-600 font-bold" />
                                <span>Enable</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleFeatured(item)}
                            className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-bold transition-all cursor-pointer ${
                              item.isFeatured
                                ? "bg-amber-400 text-amber-950 hover:bg-amber-500 shadow-2xs"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200"
                            }`}
                            title={
                              item.isFeatured
                                ? "Click to remove from Homepage Carousel"
                                : "Click to spotlight in Homepage Carousel"
                            }
                          >
                            <Star
                              className={`h-3 w-3 ${
                                item.isFeatured ? "fill-amber-950 text-amber-950" : "text-gray-400"
                              }`}
                            />
                            <span>{item.isFeatured ? "Featured" : "Feature"}</span>
                          </button>
                          <button
                            onClick={() => handleEditInit(item)}
                            className="grid h-8 w-8 place-items-center rounded-lg hover:bg-brand/10 hover:text-brand transition-colors text-[oklch(0.5_0.02_60)] cursor-pointer"
                            title="Edit Item"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id, item.name)}
                            className="grid h-8 w-8 place-items-center rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors text-[oklch(0.5_0.02_60)] cursor-pointer"
                            title="Permanently Delete Item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* FORM MANAGEMENT (RIGHT 2/5 ON DESKTOP, FULL ON MOBILE) */}
      <div className="col-span-1 lg:col-span-2">
        <div className="lg:sticky lg:top-28 rounded-[1.5rem] sm:rounded-[2rem] bg-white border border-[oklch(0.9_0.015_75)] p-4 sm:p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-[oklch(0.9_0.015_75)] pb-3">
            <div>
              <h3 className="text-base font-bold text-[oklch(0.18_0.02_50)]">
                {editingItem ? "Edit Catalog Item" : "Create New Product"}
              </h3>
              <p className="text-[11px] text-[oklch(0.5_0.02_60)]">
                Upload image & video directly to Cloudinary
              </p>
            </div>
            {editingItem && (
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center gap-1 rounded-full bg-[oklch(0.95_0.01_75)] px-2.5 py-1 text-xs font-semibold text-[oklch(0.5_0.02_60)] hover:text-foreground hover:bg-[oklch(0.9_0.015_75)] transition-colors cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
                <span>Cancel</span>
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Product Title */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[oklch(0.18_0.02_50)] uppercase tracking-wider">
                Product Title *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-[oklch(0.9_0.015_75)] bg-[oklch(0.98_0.005_75)] px-3 py-2 text-sm focus:border-brand focus:outline-none"
                placeholder="e.g. Kaivu Smash Royale"
              />
            </div>

            {/* Price & Category */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[oklch(0.18_0.02_50)] uppercase tracking-wider">
                  Price (INR ₹) *
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full rounded-xl border border-[oklch(0.9_0.015_75)] bg-[oklch(0.98_0.005_75)] px-3 py-2 text-sm focus:border-brand focus:outline-none"
                  placeholder="399"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[oklch(0.18_0.02_50)] uppercase tracking-wider">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full rounded-xl border border-[oklch(0.9_0.015_75)] bg-[oklch(0.98_0.005_75)] px-3 py-2.5 text-sm focus:border-brand focus:outline-none cursor-pointer"
                >
                  <option value="Burgers">Burgers</option>
                  <option value="Burrito">Burrito</option>
                  <option value="Sides">Sides</option>
                  <option value="Drinks">Drinks</option>
                  <option value="Combos">Combos</option>
                </select>
              </div>
            </div>

            {/* --- PRODUCT PHOTO UPLOAD (CLOUDINARY) --- */}
            <div className="space-y-2 rounded-2xl border border-[oklch(0.9_0.015_75)] bg-[oklch(0.99_0.003_75)] p-3.5">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-1.5 text-[11px] font-bold text-[oklch(0.18_0.02_50)] uppercase tracking-wider">
                  <ImageIcon className="h-3.5 w-3.5 text-brand" />
                  Product Photo (Cloudinary)
                </label>
                {image && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="h-3 w-3" /> Ready
                  </span>
                )}
              </div>

              {/* Hidden file input */}
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

              {image ? (
                <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-[oklch(0.92_0.01_75)]">
                  <img
                    src={image}
                    alt="Preview"
                    className="h-16 w-16 rounded-lg object-cover bg-accent shrink-0 border border-border"
                  />
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="truncate text-xs font-medium text-[oklch(0.3_0.02_50)]">
                      {image.includes("res.cloudinary.com") ? "Cloudinary Asset" : "Image Selected"}
                    </p>
                    <p className="truncate text-[10px] text-[oklch(0.55_0.02_60)] max-w-[200px]">
                      {image}
                    </p>
                    <div className="flex items-center gap-2 pt-0.5">
                      <button
                        type="button"
                        onClick={() => imageInputRef.current?.click()}
                        disabled={isUploadingImage}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-brand hover:underline cursor-pointer"
                      >
                        <Upload className="h-3 w-3" /> Replace Photo
                      </button>
                      <button
                        type="button"
                        onClick={() => setImage("")}
                        className="text-[11px] font-bold text-destructive hover:underline cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => !isUploadingImage && imageInputRef.current?.click()}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed transition-all cursor-pointer ${
                    isUploadingImage
                      ? "border-brand/40 bg-brand/5 cursor-wait"
                      : "border-[oklch(0.88_0.015_75)] hover:border-brand hover:bg-brand/5 bg-white"
                  }`}
                >
                  {isUploadingImage ? (
                    <div className="flex flex-col items-center gap-2 text-center py-1">
                      <Loader2 className="h-6 w-6 text-brand animate-spin" />
                      <span className="text-xs font-bold text-brand">Uploading image to Cloudinary...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1.5 text-center">
                      <div className="grid h-9 w-9 place-items-center rounded-full bg-brand/10 text-brand">
                        <Upload className="h-4 w-4" />
                      </div>
                      <span className="text-xs font-bold text-[oklch(0.25_0.02_50)]">
                        Upload Product Photo from Computer
                      </span>
                      <span className="text-[10px] text-[oklch(0.55_0.02_60)]">
                        JPG, PNG, WEBP · Auto-stored on Cloudinary
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Manual URL toggle */}
              <div className="pt-1">
                {!showManualImageUrl ? (
                  <button
                    type="button"
                    onClick={() => setShowManualImageUrl(true)}
                    className="text-[10px] text-[oklch(0.55_0.02_60)] hover:text-foreground underline cursor-pointer"
                  >
                    Or paste image URL manually
                  </button>
                ) : (
                  <div className="space-y-1 pt-1">
                    <input
                      type="text"
                      value={image}
                      onChange={(e) => setImage(e.target.value)}
                      className="w-full rounded-lg border border-[oklch(0.9_0.015_75)] bg-white px-2.5 py-1.5 text-xs focus:border-brand focus:outline-none"
                      placeholder="https://res.cloudinary.com/... or https://images.unsplash.com/..."
                    />
                  </div>
                )}
              </div>
            </div>

            {/* --- PRODUCT VIDEO UPLOAD (CLOUDINARY) --- */}
            <div className="space-y-2 rounded-2xl border border-[oklch(0.9_0.015_75)] bg-[oklch(0.99_0.003_75)] p-3.5">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-1.5 text-[11px] font-bold text-[oklch(0.18_0.02_50)] uppercase tracking-wider">
                  <Video className="h-3.5 w-3.5 text-blue-600" />
                  Product Video (Cloudinary · Optional)
                </label>
                {videoUrl && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="h-3 w-3" /> Attached
                  </span>
                )}
              </div>

              {/* Hidden video file input */}
              <input
                ref={videoInputRef}
                type="file"
                accept="video/mp4,video/webm,video/ogg,video/quicktime"
                onChange={handleVideoUpload}
                className="hidden"
              />

              {videoUrl ? (
                <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-[oklch(0.92_0.01_75)]">
                  <div className="relative h-16 w-24 rounded-lg overflow-hidden bg-black shrink-0 border border-border">
                    <video
                      src={videoUrl}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="truncate text-xs font-medium text-[oklch(0.3_0.02_50)]">
                      {videoUrl.includes("res.cloudinary.com") ? "Cloudinary Video Stream" : "Video Attached"}
                    </p>
                    <p className="truncate text-[10px] text-[oklch(0.55_0.02_60)] max-w-[180px]">
                      {videoUrl}
                    </p>
                    <div className="flex items-center gap-2 pt-0.5">
                      <button
                        type="button"
                        onClick={() => videoInputRef.current?.click()}
                        disabled={isUploadingVideo}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
                      >
                        <Upload className="h-3 w-3" /> Replace Video
                      </button>
                      <button
                        type="button"
                        onClick={() => setVideoUrl("")}
                        className="text-[11px] font-bold text-destructive hover:underline cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => !isUploadingVideo && videoInputRef.current?.click()}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed transition-all cursor-pointer ${
                    isUploadingVideo
                      ? "border-blue-500/40 bg-blue-50/50 cursor-wait"
                      : "border-[oklch(0.88_0.015_75)] hover:border-blue-500 hover:bg-blue-50/30 bg-white"
                  }`}
                >
                  {isUploadingVideo ? (
                    <div className="flex flex-col items-center gap-2 text-center py-1">
                      <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
                      <span className="text-xs font-bold text-blue-600">Uploading video to Cloudinary...</span>
                      <span className="text-[10px] text-[oklch(0.55_0.02_60)]">Streaming optimization in progress</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1.5 text-center">
                      <div className="grid h-9 w-9 place-items-center rounded-full bg-blue-50 text-blue-600">
                        <Video className="h-4 w-4" />
                      </div>
                      <span className="text-xs font-bold text-[oklch(0.25_0.02_50)]">
                        Upload Product Video from Computer
                      </span>
                      <span className="text-[10px] text-[oklch(0.55_0.02_60)]">
                        MP4, WebM, MOV · Plays in hero & card spotlights
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Manual Video URL toggle */}
              <div className="pt-1">
                {!showManualVideoUrl ? (
                  <button
                    type="button"
                    onClick={() => setShowManualVideoUrl(true)}
                    className="text-[10px] text-[oklch(0.55_0.02_60)] hover:text-foreground underline cursor-pointer"
                  >
                    Or paste video URL manually
                  </button>
                ) : (
                  <div className="space-y-1 pt-1">
                    <input
                      type="text"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      className="w-full rounded-lg border border-[oklch(0.9_0.015_75)] bg-white px-2.5 py-1.5 text-xs focus:border-brand focus:outline-none"
                      placeholder="https://res.cloudinary.com/.../video/upload/..."
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Ribbon Tag */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[oklch(0.18_0.02_50)] uppercase tracking-wider">
                Ribbon Tag (optional)
              </label>
              <input
                type="text"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                className="w-full rounded-xl border border-[oklch(0.9_0.015_75)] bg-[oklch(0.98_0.005_75)] px-3 py-2 text-sm focus:border-brand focus:outline-none"
                placeholder="e.g. Spicy, Hot, Bestseller"
              />
            </div>

            {/* --- VISIBILITY & SOFT-DELETE TOGGLE --- */}
            <div
              className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                isAvailable
                  ? "bg-emerald-50/80 border-emerald-200 text-emerald-950"
                  : "bg-slate-100 border-slate-300 text-slate-800"
              }`}
            >
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold cursor-pointer">
                  <span>{isAvailable ? "🟢" : "⏸️"}</span> Product Visibility on Store
                </label>
                <p className="text-[10px] opacity-80 mt-0.5">
                  {isAvailable
                    ? "Active: Displayed and purchasable in the customer store."
                    : "Disabled / Soft-Deleted: Hidden from customer store but preserved in database."}
                </p>
              </div>
              <input
                type="checkbox"
                checked={isAvailable}
                onChange={(e) => setIsAvailable(e.target.checked)}
                className="h-5 w-5 rounded-md accent-emerald-600 cursor-pointer"
              />
            </div>

            {/* Coming Soon Status Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-amber-950">
                  <span>🚀</span> Coming Soon Status
                </label>
                <p className="text-[10px] text-amber-800/80 mt-0.5">
                  Mark as not launched yet. Disables Add to Cart & displays "Coming Soon" badge.
                </p>
              </div>
              <input
                type="checkbox"
                checked={isComingSoon}
                onChange={(e) => setIsComingSoon(e.target.checked)}
                className="h-5 w-5 rounded-md accent-amber-600 cursor-pointer"
              />
            </div>

            {/* Main Homepage Carousel Spotlight Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-50 border border-amber-300/80">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-amber-950">
                  <span>⭐</span> Homepage Main Carousel
                </label>
                <p className="text-[10px] text-amber-900/80 mt-0.5">
                  Display and spotlight this product in the top rotating carousel on the home page.
                </p>
              </div>
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="h-5 w-5 rounded-md accent-amber-600 cursor-pointer"
              />
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[oklch(0.18_0.02_50)] uppercase tracking-wider">
                Description / Ingredients *
              </label>
              <textarea
                required
                rows={3}
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                className="w-full rounded-xl border border-[oklch(0.9_0.015_75)] bg-[oklch(0.98_0.005_75)] px-3 py-2 text-sm focus:border-brand focus:outline-none resize-none"
                placeholder="Fresh brioche bun, double beef patty, melted cheddar, secret sauce..."
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isUploadingImage || isUploadingVideo}
              className={`w-full rounded-full py-3 text-sm font-bold transition-all shadow cursor-pointer flex items-center justify-center gap-2 ${
                isUploadingImage || isUploadingVideo
                  ? "bg-primary/50 text-primary-foreground cursor-not-allowed"
                  : "bg-primary text-primary-foreground hover:bg-primary/95"
              }`}
            >
              {(isUploadingImage || isUploadingVideo) && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              {isUploadingImage || isUploadingVideo
                ? "Uploading media to Cloudinary..."
                : editingItem
                ? "Update Catalog Item"
                : "Create Product"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// --- SETTINGS / SIMULATOR TAB PANEL ---
// ==========================================
function SettingsTab() {
  const [simMessage, setSimMessage] = useState("");

  const handleSimulateOrder = async () => {
    try {
      const res = await fetch("/api/admin/simulate-order", {
        method: "POST",
      });
      const data = await res.json();
      
      if (data.success) {
        setSimMessage(
          `Simulated Customer "${data.data.customer}" checked out! Order: ${data.data.orderNumber} placed.`
        );
        // Refresh local orders list
        await ordersStore.refresh();
      } else {
        setSimMessage(`Simulation failed: ${data.error}`);
      }
    } catch (e) {
      setSimMessage("Failed to connect to simulation api.");
    }
    setTimeout(() => setSimMessage(""), 6000);
  };

  return (
    <div className="max-w-2xl space-y-6 animate-fadeIn">
      {/* Simulation card */}
      <div className="rounded-[2rem] bg-white border border-[oklch(0.9_0.015_75)] p-6 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-[oklch(0.18_0.02_50)] flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-brand" />
          <span>Customer Flow Simulation Tools</span>
        </h3>
        <p className="text-sm text-[oklch(0.5_0.02_60)] leading-relaxed">
          Need to test the live tracking updates? Press the simulation button to immediately dispatch a mock burger order into the system. This triggers a state change in the orders store, allowing you to test order progression and updates.
        </p>

        {simMessage && (
          <div className="flex items-center gap-2 rounded-2xl bg-brand/10 p-4 text-xs font-semibold text-brand border border-brand/20">
            <Check className="h-4 w-4 shrink-0" />
            <span>{simMessage}</span>
          </div>
        )}

        <button
          onClick={handleSimulateOrder}
          className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-bold text-brand-foreground hover:bg-brand/95 transition-colors cursor-pointer shadow-md"
        >
          <MenuSquare className="h-4 w-4" />
          <span>Simulate Customer Checkout</span>
        </button>
      </div>

      {/* Admin details */}
      <div className="rounded-[2rem] bg-white border border-[oklch(0.9_0.015_75)] p-6 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-[oklch(0.18_0.02_50)]">System Details</h3>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div className="border border-[oklch(0.95_0.01_75)] p-3 rounded-2xl">
            <dt className="text-[oklch(0.5_0.02_60)] font-semibold">OS Environment</dt>
            <dd className="font-bold text-[oklch(0.18_0.02_50)] mt-0.5">Windows Server Subhost</dd>
          </div>
          <div className="border border-[oklch(0.95_0.01_75)] p-3 rounded-2xl">
            <dt className="text-[oklch(0.5_0.02_60)] font-semibold">Router Core</dt>
            <dd className="font-bold text-[oklch(0.18_0.02_50)] mt-0.5">TanStack Router v1.170</dd>
          </div>
          <div className="border border-[oklch(0.95_0.01_75)] p-3 rounded-2xl">
            <dt className="text-[oklch(0.5_0.02_60)] font-semibold">CSS Core</dt>
            <dd className="font-bold text-[oklch(0.18_0.02_50)] mt-0.5">Tailwind CSS v4.2</dd>
          </div>
          <div className="border border-[oklch(0.95_0.01_75)] p-3 rounded-2xl">
            <dt className="text-[oklch(0.5_0.02_60)] font-semibold">State Syncing</dt>
            <dd className="font-bold text-[oklch(0.18_0.02_50)] mt-0.5">useSyncExternalStore (React 19)</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

// ==========================================
// --- USER EVENT ACTIVITY STREAM TAB PANEL ---
// ==========================================
function ActivityTab() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    try {
      const res = await fetch("/api/admin/dashboard");
      const data = await res.json();
      if (data.success) {
        setEvents(data.data.recentEvents || []);
      }
    } catch (e) {
      console.error("Failed to load live activity", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    const interval = setInterval(fetchEvents, 5000); // poll every 5 seconds for live tracking
    return () => clearInterval(interval);
  }, []);

  const getEventBadgeColor = (type: string) => {
    switch (type) {
      case "LOGIN": return "bg-green-500/10 text-green-600";
      case "SIGNUP": return "bg-emerald-500/10 text-emerald-600";
      case "ADD_TO_CART": return "bg-orange-500/10 text-orange-600";
      case "REMOVE_FROM_CART": return "bg-red-500/10 text-red-600";
      case "ORDER_PLACED": return "bg-purple-500/10 text-purple-600";
      case "PAGE_VIEW": return "bg-blue-500/10 text-blue-600";
      default: return "bg-neutral-500/10 text-neutral-600";
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  };

  return (
    <div className="rounded-[2rem] bg-white border border-[oklch(0.9_0.015_75)] p-6 shadow-sm space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between border-b border-[oklch(0.9_0.015_75)] pb-3">
        <div>
          <h3 className="text-base font-bold text-[oklch(0.18_0.02_50)]">User Activity Feed</h3>
          <p className="text-xs text-[oklch(0.5_0.02_60)]">Live tracking of customer flows and transactions in real-time.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-bold text-emerald-600">Auto-refreshing (5s)</span>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <span className="h-6 w-6 animate-spin rounded-full border-2 border-brand border-t-transparent" />
        </div>
      ) : events.length === 0 ? (
        <div className="py-12 text-center text-sm text-[oklch(0.5_0.02_60)]">No user actions recorded in the session database.</div>
      ) : (
        <div className="relative border-l border-[oklch(0.9_0.015_75)] ml-4 pl-6 space-y-6">
          {events.map((event) => (
            <div key={event.id} className="relative group">
              {/* Event bullet point */}
              <div className="absolute -left-[31px] top-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-brand group-hover:scale-125 transition-transform" />
              
              <div className="flex justify-between items-start gap-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-[oklch(0.18_0.02_50)]">{event.userName}</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${getEventBadgeColor(event.eventType)}`}>
                      {event.eventType}
                    </span>
                  </div>
                  
                  {/* Metadata display */}
                  {event.metadata && Object.keys(event.metadata).length > 0 && (
                    <div className="mt-1.5 text-xs text-[oklch(0.5_0.02_60)] bg-[oklch(0.97_0.012_75)] rounded-xl p-2.5 max-w-lg font-mono">
                      {JSON.stringify(event.metadata)}
                    </div>
                  )}
                </div>
                
                <span className="text-xs text-[oklch(0.5_0.02_60)] shrink-0">{formatTime(event.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ==========================================
// --- USERS TAB PANEL ---
// ==========================================
function UsersTab() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [userDetail, setUserDetail] = useState<any>(null);
  const [userEvents, setUserEvents] = useState<any[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [notifyTitle, setNotifyTitle] = useState("");
  const [notifyBody, setNotifyBody] = useState("");
  const [sendingNotify, setSendingNotify] = useState(false);

  // Live Interactive Modal Preview State
  const [livePreviewBanner, setLivePreviewBanner] = useState<"fullscreen" | "idle" | "offer" | null>(null);

  // Reward Section Toggle State (Default OFF)
  const [rewardEnabled, setRewardEnabled] = useState(false);
  const [rewardLoading, setRewardLoading] = useState(false);

  // Notification Banners State
  const [bannersConfig, setBannersConfig] = useState<NotificationBannersConfig>(DEFAULT_NOTIFICATION_BANNERS_CONFIG);
  const [savingBanners, setSavingBanners] = useState(false);
  const [activeBannerTab, setActiveBannerTab] = useState<"fullscreen" | "idle" | "offer">("fullscreen");

  // Fetch reward section & banner settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/settings/public");
        const data = await res.json();
        if (data.success && data.data) {
          setRewardEnabled(Boolean(data.data.rewardSectionEnabled));
          if (data.data.notificationBanners) {
            setBannersConfig(data.data.notificationBanners);
          }
        }
      } catch (err) {
        console.error("Failed to fetch settings", err);
      }
    };
    fetchSettings();
  }, []);

  const handleSaveBannersConfig = async () => {
    try {
      setSavingBanners(true);
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          updates: [{ key: "notification_banners_config", value: JSON.stringify(bannersConfig) }],
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Notification banners & triggers saved successfully!");
      } else {
        toast.error(data.error || "Failed to save banner settings");
      }
    } catch {
      toast.error("Network error saving banner settings");
    } finally {
      setSavingBanners(false);
    }
  };

  const handleToggleRewardSection = async (nextValue: boolean) => {
    try {
      setRewardLoading(true);
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          updates: [{ key: "reward_section_enabled", value: String(nextValue) }],
        }),
      });
      const data = await res.json();
      if (data.success) {
        setRewardEnabled(nextValue);
        toast.success(
          nextValue
            ? "Reward section is now ACTIVE for users!"
            : "Reward section is now DISABLED for users!"
        );
      } else {
        toast.error(data.error || "Failed to update setting");
      }
    } catch (err) {
      toast.error("Error updating reward section setting");
    } finally {
      setRewardLoading(false);
    }
  };

  // Fetch users list
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/admin/users?search=${encodeURIComponent(search)}`);
        const data = await res.json();
        if (data.success && data.data?.users) {
          setUsers(data.data.users);
          if (data.data.users.length > 0 && !selectedUserId) {
            setSelectedUserId(data.data.users[0].id);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchUsers, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch user details and timeline events when selectedUserId changes
  useEffect(() => {
    if (!selectedUserId) {
      setUserDetail(null);
      setUserEvents([]);
      return;
    }

    const fetchDetail = async () => {
      try {
        setDetailLoading(true);
        const [detailRes, eventsRes] = await Promise.all([
          fetch(`/api/admin/users/${selectedUserId}`),
          fetch(`/api/admin/users/${selectedUserId}/events?limit=20`)
        ]);
        const detailData = await detailRes.json();
        const eventsData = await eventsRes.json();

        if (detailData.success && detailData.data) {
          setUserDetail(detailData.data);
        }
        if (eventsData.success && eventsData.data?.events) {
          setUserEvents(eventsData.data.events);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setDetailLoading(false);
      }
    };

    fetchDetail();
  }, [selectedUserId]);

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || !notifyTitle || !notifyBody) return;

    try {
      setSendingNotify(true);
      const res = await fetch(`/api/admin/users/${selectedUserId}/notify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: notifyTitle, body: notifyBody }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || "Notification sent successfully!");
        setNotifyTitle("");
        setNotifyBody("");
        // Instantly refresh user profile details to show newly added notification
        const detailRes = await fetch(`/api/admin/users/${selectedUserId}`);
        const detailData = await detailRes.json();
        if (detailData.success && detailData.data) {
          setUserDetail(detailData.data);
        }
      } else {
        toast.error(data.error || "Failed to send notification.");
      }
    } catch (err) {
      toast.error("Network error sending notification.");
    } finally {
      setSendingNotify(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 animate-fadeIn">
      {/* USERS LIST & BANNER CONTROLS PANEL (LEFT 2/3 ON DESKTOP, FULL ON MOBILE) */}
      <div className="col-span-1 lg:col-span-2 space-y-6">

        {/* DYNAMIC NOTIFICATION BANNERS CONFIGURATION CARD */}
        <div className="rounded-[2rem] bg-white border border-[oklch(0.9_0.015_75)] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5 border-b border-[oklch(0.9_0.015_75)] pb-4">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-brand/10 text-brand font-bold">
                <BellRing className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[oklch(0.18_0.02_50)]">Dynamic Notification Banners & Smart Triggers</h3>
                <p className="text-xs text-[oklch(0.5_0.02_60)]">
                  Configure when, where, and whom to show fullscreen, idle, and half-screen offer banners with live previews.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setLivePreviewBanner(activeBannerTab)}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <Eye className="h-3.5 w-3.5 text-brand" />
                <span>Test Live Modal</span>
              </button>

              <button
                disabled={savingBanners}
                onClick={handleSaveBannersConfig}
                className="px-4 py-2 rounded-xl bg-brand text-slate-950 text-xs font-black shadow-md hover:bg-brand/90 active:scale-95 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                <Check className="h-3.5 w-3.5" />
                <span>{savingBanners ? "Saving..." : "Save Banners"}</span>
              </button>
            </div>
          </div>

          {/* Banner Tabs */}
          <div className="flex gap-2 p-1 bg-[oklch(0.96_0.01_75)] rounded-2xl mb-6">
            <button
              onClick={() => setActiveBannerTab("fullscreen")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeBannerTab === "fullscreen"
                  ? "bg-white text-[oklch(0.18_0.02_50)] shadow-sm"
                  : "text-[oklch(0.5_0.02_60)] hover:text-slate-900"
              }`}
            >
              <Smartphone className="h-4 w-4 text-brand" />
              <span>1. Fullscreen App Install</span>
              <span className={`h-2 w-2 rounded-full ${bannersConfig.fullScreenInstall.enabled ? "bg-emerald-500" : "bg-slate-300"}`} />
            </button>

            <button
              onClick={() => setActiveBannerTab("idle")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeBannerTab === "idle"
                  ? "bg-white text-[oklch(0.18_0.02_50)] shadow-sm"
                  : "text-[oklch(0.5_0.02_60)] hover:text-slate-900"
              }`}
            >
              <Clock className="h-4 w-4 text-amber-500" />
              <span>2. Idle (1-Min Inactivity)</span>
              <span className={`h-2 w-2 rounded-full ${bannersConfig.idleSmallBanner.enabled ? "bg-emerald-500" : "bg-slate-300"}`} />
            </button>

            <button
              onClick={() => setActiveBannerTab("offer")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeBannerTab === "offer"
                  ? "bg-white text-[oklch(0.18_0.02_50)] shadow-sm"
                  : "text-[oklch(0.5_0.02_60)] hover:text-slate-900"
              }`}
            >
              <Percent className="h-4 w-4 text-rose-500" />
              <span>3. Half-Screen Offer</span>
              <span className={`h-2 w-2 rounded-full ${bannersConfig.halfScreenOffer.enabled ? "bg-emerald-500" : "bg-slate-300"}`} />
            </button>
          </div>

          {/* TAB 1: FULLSCREEN APP INSTALL */}
          {activeBannerTab === "fullscreen" && (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 animate-fadeIn">
              {/* Form Column */}
              <div className="xl:col-span-7 space-y-4">
                <div className="flex items-center justify-between bg-[oklch(0.98_0.005_75)] p-4 rounded-2xl border border-[oklch(0.9_0.015_75)]">
                  <div>
                    <h4 className="text-sm font-bold text-[oklch(0.18_0.02_50)]">Enable Fullscreen App Install Prompt</h4>
                    <p className="text-xs text-[oklch(0.5_0.02_60)]">Show immersive full-screen install modal with 1-tap PWA and iOS guide.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setBannersConfig((prev) => ({
                        ...prev,
                        fullScreenInstall: {
                          ...prev.fullScreenInstall,
                          enabled: !prev.fullScreenInstall.enabled,
                        },
                      }))
                    }
                    className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                      bannersConfig.fullScreenInstall.enabled ? "bg-brand" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                        bannersConfig.fullScreenInstall.enabled ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[oklch(0.3_0.02_50)] mb-1">Whom to Show (Target Audience)</label>
                    <select
                      value={bannersConfig.fullScreenInstall.targetAudience}
                      onChange={(e) =>
                        setBannersConfig((prev) => ({
                          ...prev,
                          fullScreenInstall: {
                            ...prev.fullScreenInstall,
                            targetAudience: e.target.value as TargetAudience,
                          },
                        }))
                      }
                      className="w-full rounded-xl border border-[oklch(0.9_0.015_75)] bg-[oklch(0.98_0.005_75)] p-2.5 text-xs font-semibold focus:border-brand focus:outline-none"
                    >
                      <option value="ALL">All Users (Guests & Registered)</option>
                      <option value="GUEST">Guests Only (Not logged in)</option>
                      <option value="FIRST_ORDER">First-Time Customers (0 orders)</option>
                      <option value="REGULAR">Regular Customers (1+ orders)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[oklch(0.3_0.02_50)] mb-1">When to Show (Delay in Seconds)</label>
                    <input
                      type="number"
                      min={0}
                      max={120}
                      value={bannersConfig.fullScreenInstall.delaySeconds}
                      onChange={(e) =>
                        setBannersConfig((prev) => ({
                          ...prev,
                          fullScreenInstall: {
                            ...prev.fullScreenInstall,
                            delaySeconds: Math.max(0, parseInt(e.target.value) || 0),
                          },
                        }))
                      }
                      className="w-full rounded-xl border border-[oklch(0.9_0.015_75)] bg-[oklch(0.98_0.005_75)] p-2.5 text-xs font-semibold focus:border-brand focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[oklch(0.3_0.02_50)] mb-1.5">Where to Show (Target Routes)</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: "Home Page (/)", path: "/" },
                      { label: "Menu (/menu)", path: "/menu" },
                      { label: "Cart (/cart)", path: "/cart" },
                    ].map((r) => {
                      const isSelected = bannersConfig.fullScreenInstall.routes?.includes(r.path);
                      return (
                        <button
                          key={r.path}
                          type="button"
                          onClick={() => {
                            const current = bannersConfig.fullScreenInstall.routes || [];
                            const updated = isSelected
                              ? current.filter((p) => p !== r.path)
                              : [...current, r.path];
                            setBannersConfig((prev) => ({
                              ...prev,
                              fullScreenInstall: {
                                ...prev.fullScreenInstall,
                                routes: updated.length > 0 ? updated : ["/"],
                              },
                            }));
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            isSelected
                              ? "bg-brand/10 border-brand text-brand"
                              : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          {isSelected ? "✓ " : "+ "} {r.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-[oklch(0.3_0.02_50)] mb-1">Headline Title</label>
                    <input
                      type="text"
                      value={bannersConfig.fullScreenInstall.title}
                      onChange={(e) =>
                        setBannersConfig((prev) => ({
                          ...prev,
                          fullScreenInstall: {
                            ...prev.fullScreenInstall,
                            title: e.target.value,
                          },
                        }))
                      }
                      className="w-full rounded-xl border border-[oklch(0.9_0.015_75)] bg-[oklch(0.98_0.005_75)] p-2.5 text-xs focus:border-brand focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[oklch(0.3_0.02_50)] mb-1">Badge Tag</label>
                    <input
                      type="text"
                      value={bannersConfig.fullScreenInstall.badgeText}
                      onChange={(e) =>
                        setBannersConfig((prev) => ({
                          ...prev,
                          fullScreenInstall: {
                            ...prev.fullScreenInstall,
                            badgeText: e.target.value,
                          },
                        }))
                      }
                      className="w-full rounded-xl border border-[oklch(0.9_0.015_75)] bg-[oklch(0.98_0.005_75)] p-2.5 text-xs focus:border-brand focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[oklch(0.3_0.02_50)] mb-1">Description / Subtitle</label>
                  <textarea
                    rows={2}
                    value={bannersConfig.fullScreenInstall.description}
                    onChange={(e) =>
                      setBannersConfig((prev) => ({
                        ...prev,
                        fullScreenInstall: {
                          ...prev.fullScreenInstall,
                          description: e.target.value,
                        },
                      }))
                    }
                    className="w-full rounded-xl border border-[oklch(0.9_0.015_75)] bg-[oklch(0.98_0.005_75)] p-2.5 text-xs focus:border-brand focus:outline-none"
                  />
                </div>
              </div>

              {/* Real-Time Visual Preview Card */}
              <div className="xl:col-span-5 flex flex-col items-center">
                <div className="w-full flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5 text-brand" /> Live Customer Screen Preview
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Real-time
                  </span>
                </div>

                <div className="w-full max-w-[320px] rounded-[32px] bg-gradient-to-b from-[#1c1214] via-[#120a0c] to-[#0a0507] border border-amber-500/30 p-5 text-white shadow-xl text-center space-y-3">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand/20 border border-brand/40 text-brand text-[10px] font-black uppercase tracking-wider">
                    <Sparkles className="h-3 w-3" />
                    <span>{bannersConfig.fullScreenInstall.badgeText || "100% Free"}</span>
                  </div>

                  <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-brand via-amber-500 to-amber-600 p-0.5 shadow-lg flex items-center justify-center">
                    <div className="w-full h-full rounded-[14px] bg-slate-950 flex flex-col items-center justify-center">
                      <span className="text-2xl">🍔</span>
                    </div>
                  </div>

                  <h5 className="text-base font-black text-white leading-tight">
                    {bannersConfig.fullScreenInstall.title || "Experience Kaivu on the App"}
                  </h5>
                  <p className="text-[10px] text-slate-300 line-clamp-2 leading-relaxed">
                    {bannersConfig.fullScreenInstall.description || "Install Kaivu for lightning-fast 1-tap orders."}
                  </p>

                  <div className="space-y-1.5 text-left bg-white/5 rounded-xl p-2.5 border border-white/10 text-[10px]">
                    <div className="flex items-center gap-2 text-white font-medium">
                      <span className="text-brand">⚡</span> Instant 1-Tap Ordering
                    </div>
                    <div className="flex items-center gap-2 text-white font-medium">
                      <span className="text-amber-400">🔔</span> Real-Time Kitchen Updates
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setLivePreviewBanner("fullscreen")}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-brand to-amber-500 text-slate-950 font-extrabold text-xs shadow-md"
                  >
                    {bannersConfig.fullScreenInstall.buttonText || "Install App Now"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: IDLE SMALL BANNER */}
          {activeBannerTab === "idle" && (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 animate-fadeIn">
              {/* Form Column */}
              <div className="xl:col-span-7 space-y-4">
                <div className="flex items-center justify-between bg-[oklch(0.98_0.005_75)] p-4 rounded-2xl border border-[oklch(0.9_0.015_75)]">
                  <div>
                    <h4 className="text-sm font-bold text-[oklch(0.18_0.02_50)]">Enable Inactivity / Idle Mini-Banner</h4>
                    <p className="text-xs text-[oklch(0.5_0.02_60)]">Shows a compact floating banner near navigation when the user is idle without ordering.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setBannersConfig((prev) => ({
                        ...prev,
                        idleSmallBanner: {
                          ...prev.idleSmallBanner,
                          enabled: !prev.idleSmallBanner.enabled,
                        },
                      }))
                    }
                    className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                      bannersConfig.idleSmallBanner.enabled ? "bg-amber-500" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                        bannersConfig.idleSmallBanner.enabled ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[oklch(0.3_0.02_50)] mb-1">Whom to Show (Target Audience)</label>
                    <select
                      value={bannersConfig.idleSmallBanner.targetAudience}
                      onChange={(e) =>
                        setBannersConfig((prev) => ({
                          ...prev,
                          idleSmallBanner: {
                            ...prev.idleSmallBanner,
                            targetAudience: e.target.value as TargetAudience,
                          },
                        }))
                      }
                      className="w-full rounded-xl border border-[oklch(0.9_0.015_75)] bg-[oklch(0.98_0.005_75)] p-2.5 text-xs font-semibold focus:border-brand focus:outline-none"
                    >
                      <option value="ALL">All Users (Guests & Registered)</option>
                      <option value="GUEST">Guests Only</option>
                      <option value="FIRST_ORDER">First-Time Customers (0 orders)</option>
                      <option value="REGULAR">Regular Customers (1+ orders)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[oklch(0.3_0.02_50)] mb-1">When to Show (Idle Inactivity Seconds)</label>
                    <input
                      type="number"
                      min={10}
                      max={600}
                      value={bannersConfig.idleSmallBanner.idleSeconds}
                      onChange={(e) =>
                        setBannersConfig((prev) => ({
                          ...prev,
                          idleSmallBanner: {
                            ...prev.idleSmallBanner,
                            idleSeconds: Math.max(10, parseInt(e.target.value) || 60),
                          },
                        }))
                      }
                      className="w-full rounded-xl border border-[oklch(0.9_0.015_75)] bg-[oklch(0.98_0.005_75)] p-2.5 text-xs font-semibold focus:border-brand focus:outline-none"
                    />
                    <span className="text-[10px] text-slate-400">Default is 60s (1 minute of no user activity).</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[oklch(0.3_0.02_50)] mb-1.5">Where to Show (Target Routes)</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: "Home Page (/)", path: "/" },
                      { label: "Menu (/menu)", path: "/menu" },
                      { label: "Cart (/cart)", path: "/cart" },
                    ].map((r) => {
                      const isSelected = bannersConfig.idleSmallBanner.routes?.includes(r.path);
                      return (
                        <button
                          key={r.path}
                          type="button"
                          onClick={() => {
                            const current = bannersConfig.idleSmallBanner.routes || [];
                            const updated = isSelected
                              ? current.filter((p) => p !== r.path)
                              : [...current, r.path];
                            setBannersConfig((prev) => ({
                              ...prev,
                              idleSmallBanner: {
                                ...prev.idleSmallBanner,
                                routes: updated.length > 0 ? updated : ["/"],
                              },
                            }));
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            isSelected
                              ? "bg-amber-500/15 border-amber-500 text-amber-700"
                              : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          {isSelected ? "✓ " : "+ "} {r.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-[oklch(0.3_0.02_50)] mb-1">Banner Title</label>
                    <input
                      type="text"
                      value={bannersConfig.idleSmallBanner.title}
                      onChange={(e) =>
                        setBannersConfig((prev) => ({
                          ...prev,
                          idleSmallBanner: {
                            ...prev.idleSmallBanner,
                            title: e.target.value,
                          },
                        }))
                      }
                      className="w-full rounded-xl border border-[oklch(0.9_0.015_75)] bg-[oklch(0.98_0.005_75)] p-2.5 text-xs focus:border-brand focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[oklch(0.3_0.02_50)] mb-1">Button Text</label>
                    <input
                      type="text"
                      value={bannersConfig.idleSmallBanner.buttonText}
                      onChange={(e) =>
                        setBannersConfig((prev) => ({
                          ...prev,
                          idleSmallBanner: {
                            ...prev.idleSmallBanner,
                            buttonText: e.target.value,
                          },
                        }))
                      }
                      className="w-full rounded-xl border border-[oklch(0.9_0.015_75)] bg-[oklch(0.98_0.005_75)] p-2.5 text-xs focus:border-brand focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[oklch(0.3_0.02_50)] mb-1">Description</label>
                  <input
                    type="text"
                    value={bannersConfig.idleSmallBanner.description}
                    onChange={(e) =>
                      setBannersConfig((prev) => ({
                        ...prev,
                        idleSmallBanner: {
                          ...prev.idleSmallBanner,
                          description: e.target.value,
                        },
                      }))
                    }
                    className="w-full rounded-xl border border-[oklch(0.9_0.015_75)] bg-[oklch(0.98_0.005_75)] p-2.5 text-xs focus:border-brand focus:outline-none"
                  />
                </div>
              </div>

              {/* Real-Time Visual Preview Card */}
              <div className="xl:col-span-5 flex flex-col items-center">
                <div className="w-full flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5 text-amber-500" /> Live Floating Capsule Preview
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Real-time
                  </span>
                </div>

                <div className="w-full max-w-[340px] rounded-2xl bg-gradient-to-r from-[#1c0f12] via-[#241217] to-[#1a0c10] border border-amber-500/40 p-4 text-white shadow-xl space-y-2">
                  <div className="flex items-start gap-3">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand to-amber-500 text-slate-950 font-bold">
                      <Flame className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider">
                        Express Kitchen Priority
                      </span>
                      <h5 className="text-xs font-black text-white truncate">
                        {bannersConfig.idleSmallBanner.title || "Still thinking?"}
                      </h5>
                      <p className="text-[10px] text-slate-300 line-clamp-2 mt-0.5">
                        {bannersConfig.idleSmallBanner.description || "Our kitchen is fired up! Order now for express prep."}
                      </p>
                      <div className="mt-2.5 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setLivePreviewBanner("idle")}
                          className="px-3 py-1 rounded-full bg-brand text-slate-950 text-[10px] font-black"
                        >
                          {bannersConfig.idleSmallBanner.buttonText || "Explore Menu"}
                        </button>
                        <span className="text-[10px] text-slate-400">Dismiss</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: HALF-SCREEN OFFER DRAWER */}
          {activeBannerTab === "offer" && (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 animate-fadeIn">
              {/* Form Column */}
              <div className="xl:col-span-7 space-y-4">
                <div className="flex items-center justify-between bg-[oklch(0.98_0.005_75)] p-4 rounded-2xl border border-[oklch(0.9_0.015_75)]">
                  <div>
                    <h4 className="text-sm font-bold text-[oklch(0.18_0.02_50)]">Enable Half-Screen Offer Drawer</h4>
                    <p className="text-xs text-[oklch(0.5_0.02_60)]">Shows a 50% slide-up bottom sheet with coupon code copy & promotion CTA.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setBannersConfig((prev) => ({
                        ...prev,
                        halfScreenOffer: {
                          ...prev.halfScreenOffer,
                          enabled: !prev.halfScreenOffer.enabled,
                        },
                      }))
                    }
                    className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                      bannersConfig.halfScreenOffer.enabled ? "bg-rose-500" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                        bannersConfig.halfScreenOffer.enabled ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[oklch(0.3_0.02_50)] mb-1">Whom to Show (Target Audience)</label>
                    <select
                      value={bannersConfig.halfScreenOffer.targetAudience}
                      onChange={(e) =>
                        setBannersConfig((prev) => ({
                          ...prev,
                          halfScreenOffer: {
                            ...prev.halfScreenOffer,
                            targetAudience: e.target.value as TargetAudience,
                          },
                        }))
                      }
                      className="w-full rounded-xl border border-[oklch(0.9_0.015_75)] bg-[oklch(0.98_0.005_75)] p-2.5 text-xs font-semibold focus:border-brand focus:outline-none"
                    >
                      <option value="FIRST_ORDER">First-Time Customers (0 orders)</option>
                      <option value="ALL">All Users (Everyone)</option>
                      <option value="GUEST">Guests Only</option>
                      <option value="REGULAR">Regular Customers (1+ orders)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[oklch(0.3_0.02_50)] mb-1">When to Show (Delay in Seconds)</label>
                    <input
                      type="number"
                      min={0}
                      max={120}
                      value={bannersConfig.halfScreenOffer.delaySeconds}
                      onChange={(e) =>
                        setBannersConfig((prev) => ({
                          ...prev,
                          halfScreenOffer: {
                            ...prev.halfScreenOffer,
                            delaySeconds: Math.max(0, parseInt(e.target.value) || 0),
                          },
                        }))
                      }
                      className="w-full rounded-xl border border-[oklch(0.9_0.015_75)] bg-[oklch(0.98_0.005_75)] p-2.5 text-xs font-semibold focus:border-brand focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[oklch(0.3_0.02_50)] mb-1.5">Where to Show (Target Routes)</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: "Home Page (/)", path: "/" },
                      { label: "Menu (/menu)", path: "/menu" },
                      { label: "Cart (/cart)", path: "/cart" },
                    ].map((r) => {
                      const isSelected = bannersConfig.halfScreenOffer.routes?.includes(r.path);
                      return (
                        <button
                          key={r.path}
                          type="button"
                          onClick={() => {
                            const current = bannersConfig.halfScreenOffer.routes || [];
                            const updated = isSelected
                              ? current.filter((p) => p !== r.path)
                              : [...current, r.path];
                            setBannersConfig((prev) => ({
                              ...prev,
                              halfScreenOffer: {
                                ...prev.halfScreenOffer,
                                routes: updated.length > 0 ? updated : ["/"],
                              },
                            }));
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            isSelected
                              ? "bg-rose-500/15 border-rose-500 text-rose-700"
                              : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          {isSelected ? "✓ " : "+ "} {r.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-[oklch(0.3_0.02_50)] mb-1">Headline Title</label>
                    <input
                      type="text"
                      value={bannersConfig.halfScreenOffer.title}
                      onChange={(e) =>
                        setBannersConfig((prev) => ({
                          ...prev,
                          halfScreenOffer: {
                            ...prev.halfScreenOffer,
                            title: e.target.value,
                          },
                        }))
                      }
                      className="w-full rounded-xl border border-[oklch(0.9_0.015_75)] bg-[oklch(0.98_0.005_75)] p-2.5 text-xs focus:border-brand focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[oklch(0.3_0.02_50)] mb-1">Promo Coupon Code</label>
                    <input
                      type="text"
                      value={bannersConfig.halfScreenOffer.promoCode}
                      onChange={(e) =>
                        setBannersConfig((prev) => ({
                          ...prev,
                          halfScreenOffer: {
                            ...prev.halfScreenOffer,
                            promoCode: e.target.value.toUpperCase(),
                          },
                        }))
                      }
                      placeholder="e.g. BOGOFREE"
                      className="w-full rounded-xl border border-[oklch(0.9_0.015_75)] bg-[oklch(0.98_0.005_75)] p-2.5 text-xs font-mono font-bold uppercase focus:border-brand focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[oklch(0.3_0.02_50)] mb-1">Description / Subtitle</label>
                  <textarea
                    rows={2}
                    value={bannersConfig.halfScreenOffer.description}
                    onChange={(e) =>
                      setBannersConfig((prev) => ({
                        ...prev,
                        halfScreenOffer: {
                          ...prev.halfScreenOffer,
                          description: e.target.value,
                        },
                      }))
                    }
                    className="w-full rounded-xl border border-[oklch(0.9_0.015_75)] bg-[oklch(0.98_0.005_75)] p-2.5 text-xs focus:border-brand focus:outline-none"
                  />
                </div>
              </div>

              {/* Real-Time Visual Preview Card */}
              <div className="xl:col-span-5 flex flex-col items-center">
                <div className="w-full flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5 text-rose-500" /> Live Half-Screen Drawer Preview
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Real-time
                  </span>
                </div>

                <div className="w-full max-w-[320px] rounded-t-[28px] rounded-b-[20px] bg-gradient-to-b from-[#1c0e12] via-[#12070a] to-[#080305] border border-amber-500/30 p-4 text-white shadow-xl space-y-3">
                  <div className="w-8 h-1 bg-white/20 rounded-full mx-auto" />

                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-[9px] font-black uppercase tracking-wider">
                    <Sparkles className="h-2.5 w-2.5" />
                    <span>{bannersConfig.halfScreenOffer.badgeText || "BUY 1 GET 1 FREE"}</span>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-amber-500 via-rose-600 to-brand text-white font-bold">
                      <Gift className="h-4 w-4 stroke-[2.2]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h5 className="text-xs font-black text-white leading-tight">
                        {bannersConfig.halfScreenOffer.title || "BUY 1 GET 1 FREE on First Order!"}
                      </h5>
                      <p className="text-[10px] text-slate-300 line-clamp-2 mt-0.5">
                        {bannersConfig.halfScreenOffer.description || "Add any 2 burgers & get the second one completely FREE!"}
                      </p>
                    </div>
                  </div>

                  {bannersConfig.halfScreenOffer.promoCode && (
                    <div className="rounded-xl bg-white/5 border border-dashed border-amber-500/40 p-2 flex items-center justify-between">
                      <div>
                        <span className="text-[8px] uppercase text-slate-400 font-bold block">Offer Code</span>
                        <span className="text-xs font-black text-amber-400 font-mono">{bannersConfig.halfScreenOffer.promoCode}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-white/10 text-[9px] font-bold text-white">Copy</span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => setLivePreviewBanner("offer")}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-brand text-slate-950 font-extrabold text-xs shadow-md"
                  >
                    {bannersConfig.halfScreenOffer.buttonText || "Claim BOGO Offer"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* INTERACTIVE FULL MODAL PREVIEWS */}
        {livePreviewBanner === "fullscreen" && (
          <FullScreenInstallBanner
            config={bannersConfig.fullScreenInstall}
            isOpen={true}
            onClose={() => setLivePreviewBanner(null)}
          />
        )}
        {livePreviewBanner === "idle" && (
          <IdleNavBanner
            config={bannersConfig.idleSmallBanner}
            isOpen={true}
            onClose={() => setLivePreviewBanner(null)}
          />
        )}
        {livePreviewBanner === "offer" && (
          <HalfScreenOfferBanner
            config={bannersConfig.halfScreenOffer}
            isOpen={true}
            onClose={() => setLivePreviewBanner(null)}
          />
        )}

        {/* REWARD SECTION TOGGLE CONTROL CARD */}
        <div className="rounded-[2rem] bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-amber-500/10 border border-amber-500/20 p-6 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-500/15 text-amber-600 font-bold shrink-0">
              <Gift className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-base font-bold text-[oklch(0.18_0.02_50)]">User Reward Program</h3>
                <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                  rewardEnabled
                    ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
                    : "bg-slate-200 text-slate-600 border border-slate-300"
                }`}>
                  {rewardEnabled ? "ACTIVE (ON)" : "DISABLED (OFF)"}
                </span>
              </div>
              <p className="text-xs text-[oklch(0.5_0.02_60)] mt-0.5">
                Toggle the Reward section & navbar icon for users. Default is OFF.
              </p>
            </div>
          </div>

          <button
            disabled={rewardLoading}
            onClick={() => handleToggleRewardSection(!rewardEnabled)}
            className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              rewardEnabled ? "bg-amber-500" : "bg-slate-300"
            } ${rewardLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            title="Toggle Reward Section"
          >
            <span
              className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                rewardEnabled ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        <div className="rounded-[2rem] bg-white border border-[oklch(0.9_0.015_75)] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6 border-b border-[oklch(0.9_0.015_75)] pb-3">
            <h3 className="text-base font-bold text-[oklch(0.18_0.02_50)]">Customer Accounts</h3>
            <span className="text-xs font-bold text-brand bg-brand/10 px-2.5 py-1 rounded-full">
              {users.length} Users Found
            </span>
          </div>

          {/* Search bar */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search by name, phone, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-[oklch(0.9_0.015_75)] bg-[oklch(0.98_0.005_75)] px-4 py-3 text-sm focus:border-brand focus:outline-none transition-colors"
            />
          </div>

          {loading ? (
            <div className="flex justify-center p-12">
              <span className="h-6 w-6 animate-spin rounded-full border-2 border-brand border-t-transparent" />
            </div>
          ) : users.length === 0 ? (
            <div className="py-12 text-center text-sm text-[oklch(0.5_0.02_60)]">
              No users found matching search criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[oklch(0.9_0.015_75)] text-xs font-bold text-[oklch(0.5_0.02_60)] uppercase tracking-wider">
                    <th className="pb-3">Customer</th>
                    <th className="pb-3">Phone</th>
                    <th className="pb-3">Coins</th>
                    <th className="pb-3">Wallet</th>
                    <th className="pb-3">Orders</th>
                    <th className="pb-3">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[oklch(0.95_0.01_75)]">
                  {users.map((u) => {
                    const isSelected = u.id === selectedUserId;
                    return (
                      <tr
                        key={u.id}
                        onClick={() => setSelectedUserId(u.id)}
                        className={`text-sm cursor-pointer transition-all ${
                          isSelected ? "bg-[oklch(0.94_0.018_75)] font-semibold" : "hover:bg-[oklch(0.97_0.012_75)]"
                        }`}
                      >
                        <td className="py-3.5 px-2">
                          <div className="font-bold text-[oklch(0.18_0.02_50)]">{u.name || "Guest User"}</div>
                          <div className="text-[10px] text-[oklch(0.5_0.02_60)] font-normal">{u.email || "No email"}</div>
                        </td>
                        <td className="py-3.5 px-2 text-[oklch(0.18_0.02_50)] font-mono">{u.phone}</td>
                        <td className="py-3.5 px-2 text-brand font-bold">🪙 {u.kaivuCoins}</td>
                        <td className="py-3.5 px-2 text-[oklch(0.18_0.02_50)]">₹{u.walletBalance.toFixed(2)}</td>
                        <td className="py-3.5 px-2">
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-700">
                            {u.orderCount}
                          </span>
                        </td>
                        <td className="py-3.5 px-2 text-[oklch(0.5_0.02_60)] text-xs">{formatDate(u.createdAt)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* USER DETAIL CONSOLE PANEL (RIGHT 1/3) */}
      <div className="col-span-1">
        {detailLoading ? (
          <div className="lg:sticky lg:top-28 rounded-[1.5rem] sm:rounded-[2rem] bg-white border border-[oklch(0.9_0.015_75)] p-12 shadow-sm flex justify-center items-center">
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-brand border-t-transparent" />
          </div>
        ) : userDetail ? (
          <div className="lg:sticky lg:top-28 rounded-[1.5rem] sm:rounded-[2rem] bg-white border border-[oklch(0.9_0.015_75)] p-4 sm:p-6 shadow-sm space-y-6 overflow-y-auto max-h-[calc(100vh-180px)] animate-fadeIn">
            <div className="border-b border-[oklch(0.9_0.015_75)] pb-4">
              <span className="text-[10px] font-bold text-brand uppercase tracking-wider">
                User Details Console
              </span>
              <h3 className="text-xl font-display font-extrabold text-[oklch(0.18_0.02_50)] mt-1">
                {userDetail.name || "Guest User"}
              </h3>
              <p className="text-xs text-[oklch(0.5_0.02_60)] font-mono mt-0.5">{userDetail.id}</p>
            </div>

            {/* Core Stats */}
            <div className="grid grid-cols-2 gap-3 bg-[oklch(0.97_0.012_75)] p-4 rounded-2xl">
              <div>
                <p className="text-[10px] font-bold text-[oklch(0.5_0.02_60)] uppercase">Total Orders</p>
                <p className="text-lg font-extrabold text-[oklch(0.18_0.02_50)] mt-0.5">{userDetail.orderCount}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-[oklch(0.5_0.02_60)] uppercase">Total Spent</p>
                <p className="text-lg font-extrabold text-[oklch(0.18_0.02_50)] mt-0.5">₹{userDetail.totalSpent.toFixed(2)}</p>
              </div>
            </div>

            {/* PWA & Permissions info */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[oklch(0.18_0.02_50)] uppercase tracking-wider">PWA & Notification Details</h4>
              <div className="space-y-1 text-xs text-[oklch(0.18_0.02_50)]">
                <div className="flex justify-between py-1 border-b border-[oklch(0.95_0.01_75)]">
                  <span className="text-[oklch(0.5_0.02_60)]">PWA App Installed:</span>
                  <span className={`font-bold ${userDetail.pwaInstalled ? "text-emerald-600" : "text-amber-600"}`}>
                    {userDetail.pwaInstalled ? "Yes (Standalone)" : "No"}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-[oklch(0.95_0.01_75)]">
                  <span className="text-[oklch(0.5_0.02_60)]">Last Dismissed Order:</span>
                  <span className="font-bold">
                    {userDetail.pwaLastDismissedOrderCount === -1 ? "Never" : `Order #${userDetail.pwaLastDismissedOrderCount}`}
                  </span>
                </div>
              </div>
            </div>

            {/* Addresses list */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[oklch(0.18_0.02_50)] uppercase tracking-wider">Delivery Addresses</h4>
              {userDetail.addresses?.length === 0 ? (
                <p className="text-xs text-[oklch(0.5_0.02_60)] italic">No addresses saved yet.</p>
              ) : (
                <ul className="space-y-2">
                  {userDetail.addresses.map((addr: any) => (
                    <li key={addr.id} className="rounded-xl border border-[oklch(0.9_0.015_75)] p-2.5 text-xs">
                      <div className="flex justify-between font-bold text-[oklch(0.18_0.02_50)] mb-1">
                        <span>{addr.label}</span>
                        {addr.isDefault && (
                          <span className="rounded bg-brand/10 px-1 py-0.5 text-[8px] text-brand uppercase">Default</span>
                        )}
                      </div>
                      <p className="text-[oklch(0.5_0.02_60)] leading-tight">{addr.fullAddress}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Referrals */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[oklch(0.18_0.02_50)] uppercase tracking-wider">Referrals Made ({userDetail.referralCount})</h4>
              {userDetail.referralsMade?.length === 0 ? (
                <p className="text-xs text-[oklch(0.5_0.02_60)] italic">No referrals recorded.</p>
              ) : (
                <ul className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {userDetail.referralsMade.map((ref: any) => (
                    <li key={ref.id} className="flex justify-between items-center text-xs py-1 border-b border-[oklch(0.95_0.01_75)]">
                      <span className="font-bold text-[oklch(0.18_0.02_50)]">{ref.referred.name || "Guest"}</span>
                      <span className={`text-[9px] font-bold uppercase rounded px-1.5 py-0.5 ${
                        ref.status === "COMPLETED" ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"
                      }`}>{ref.status}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Sent Notifications history */}
            <div className="border-t border-[oklch(0.9_0.015_75)] pt-4 space-y-3">
              <h4 className="text-xs font-bold text-[oklch(0.18_0.02_50)] uppercase tracking-wider">Sent Notifications ({userDetail.notifications?.length || 0})</h4>
              {userDetail.notifications?.length === 0 ? (
                <p className="text-xs text-[oklch(0.5_0.02_60)] italic">No notifications sent yet.</p>
              ) : (
                <ul className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                  {userDetail.notifications.map((notif: any) => (
                    <li key={notif.id} className="rounded-xl bg-[oklch(0.98_0.005_75)] border border-[oklch(0.95_0.01_75)] p-2.5 text-xs animate-fadeIn">
                      <div className="flex justify-between font-bold text-[oklch(0.18_0.02_50)] mb-1">
                        <span className="truncate max-w-[180px]">{notif.title}</span>
                        <span className="text-[10px] text-[oklch(0.5_0.02_60)] font-normal shrink-0">
                          {new Date(notif.sentAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      </div>
                      <p className="text-[oklch(0.5_0.02_60)] leading-snug">{notif.body}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Send Push Notification */}
            <div className="border-t border-[oklch(0.9_0.015_75)] pt-4 space-y-3">
              <h4 className="text-xs font-bold text-[oklch(0.18_0.02_50)] uppercase tracking-wider">Send Custom Push Notification</h4>
              <form onSubmit={handleSendNotification} className="space-y-3">
                <input
                  type="text"
                  required
                  placeholder="Notification Title"
                  value={notifyTitle}
                  onChange={(e) => setNotifyTitle(e.target.value)}
                  className="w-full rounded-xl border border-[oklch(0.9_0.015_75)] bg-[oklch(0.98_0.005_75)] px-3 py-2 text-xs focus:border-brand focus:outline-none transition-colors"
                />
                <textarea
                  required
                  rows={2}
                  placeholder="Notification message body..."
                  value={notifyBody}
                  onChange={(e) => setNotifyBody(e.target.value)}
                  className="w-full rounded-xl border border-[oklch(0.9_0.015_75)] bg-[oklch(0.98_0.005_75)] px-3 py-2 text-xs focus:border-brand focus:outline-none transition-colors resize-none"
                />
                <button
                  type="submit"
                  disabled={sendingNotify}
                  className="w-full rounded-full bg-brand py-2 text-xs font-bold text-brand-foreground hover:opacity-95 transition-all disabled:opacity-70 cursor-pointer shadow"
                >
                  {sendingNotify ? "Sending Push..." : "Send Web Push Alert"}
                </button>
              </form>
            </div>

            {/* User Activity Feed (Timeline) */}
            <div className="border-t border-[oklch(0.9_0.015_75)] pt-4 space-y-3">
              <h4 className="text-xs font-bold text-[oklch(0.18_0.02_50)] uppercase tracking-wider">User Action Timeline</h4>
              {userEvents.length === 0 ? (
                <p className="text-xs text-[oklch(0.5_0.02_60)] italic">No actions recorded on this user.</p>
              ) : (
                <div className="relative border-l border-[oklch(0.9_0.015_75)] ml-2 pl-4 space-y-4">
                  {userEvents.map((evt: any) => (
                    <div key={evt.id} className="relative text-xs">
                      <div className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full border border-white bg-brand" />
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <span className="font-bold text-[oklch(0.18_0.02_50)] capitalize">{evt.eventType.replace(/_/g, " ")}</span>
                          {evt.metadata && Object.keys(evt.metadata).length > 0 && (
                            <div className="text-[10px] text-[oklch(0.5_0.02_60)] bg-[oklch(0.98_0.005_75)] rounded p-1.5 mt-1 font-mono break-all max-w-[200px]">
                              {JSON.stringify(evt.metadata)}
                            </div>
                          )}
                        </div>
                        <span className="text-[10px] text-[oklch(0.5_0.02_60)] shrink-0">
                          {new Date(evt.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="sticky top-28 rounded-[2rem] bg-white border border-[oklch(0.9_0.015_75)] p-8 shadow-sm text-center text-sm text-[oklch(0.5_0.02_60)]">
            Select a customer from the table to view their database profile.
          </div>
        )}
      </div>
    </div>
  );
}

// --- INSTAGRAM TAB COMPONENT ---
function InstagramTab({ menuItems }: { menuItems: MenuItem[] }) {
  const [url, setUrl] = useState("");
  const [customUsername, setCustomUsername] = useState("");
  const [customMediaUrl, setCustomMediaUrl] = useState("");
  const [featuredProductId, setFeaturedProductId] = useState(menuItems[0]?.id || "");
  const [reactionEmoji, setReactionEmoji] = useState("😍");
  const [loading, setLoading] = useState(false);
  const [previewStory, setPreviewStory] = useState<KaivuStory | null>(null);
  const [candidates, setCandidates] = useState<KaivuStory[]>([]);
  const [stories, setStories] = useState<KaivuStory[]>([]);
  const [storiesEnabled, setStoriesEnabledState] = useState(true);

  useEffect(() => {
    setStories(getStories());
    setStoriesEnabledState(isStoriesEnabled());
  }, []);

  const handleToggleEnabled = () => {
    const nextState = !storiesEnabled;
    setStoriesEnabledState(nextState);
    setStoriesEnabled(nextState);
    if (nextState) {
      toast.success("Kaivu IRL section is now ENABLED on user homepage");
    } else {
      toast.info("Kaivu IRL section is now DISABLED and hidden from user homepage");
    }
  };

  const handleClearAll = () => {
    if (confirm("Are you sure you want to clear all published stories from Kaivu IRL?")) {
      const updated = clearAllStories();
      setStories(updated);
      toast.success("All stories removed. Section is now hidden from homepage.");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCustomMediaUrl(event.target.result as string);
          toast.success(`Story file "${file.name}" loaded!`);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFetch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url && !customMediaUrl) {
      toast.error("Please enter an Instagram story link or select a media file");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/instagram/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          customMediaUrl,
          featuredProductId: featuredProductId || menuItems[0]?.id,
          reactionEmoji,
          customUsername: customUsername.startsWith("@") ? customUsername : customUsername ? `@${customUsername}` : "",
        }),
      });
      const data = await res.json();
      setLoading(false);

      if (data.success && data.data) {
        setPreviewStory(data.data);
        if (data.candidates && data.candidates.length > 0) {
          setCandidates(data.candidates);
        } else {
          setCandidates([data.data]);
        }
        toast.success(data.message || "Story extracted successfully! Check preview.");
      } else {
        toast.error(data.error || "Failed to process Instagram URL");
      }
    } catch (err: any) {
      setLoading(false);
      toast.error(err.message || "Failed to connect to import server");
    }
  };

  const handlePublish = () => {
    if (!previewStory) return;
    const updated = addDynamicStory(previewStory);
    setStories(updated);
    setPreviewStory(null);
    setCandidates([]);
    setUrl("");
    setCustomUsername("");
    toast.success(`Published @${previewStory.username.replace("@", "")}'s story to Kaivu IRL!`);
  };

  const handleDelete = (id: string) => {
    const updated = deleteDynamicStory(id);
    setStories(updated);
    toast.success("Story removed from Kaivu IRL");
  };

  return (
    <div className="space-y-8">
      {/* Header Banner & Section Switch */}
      <div className="rounded-[2rem] bg-gradient-to-r from-purple-900 via-purple-800 to-indigo-900 p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="relative z-10 max-w-xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-400/20 px-3.5 py-1 text-xs font-bold text-yellow-300 backdrop-blur-sm">
            <Camera className="h-3.5 w-3.5" /> Shoppable UGC Importer
          </span>
          <h3 className="mt-3 text-2xl font-display font-extrabold tracking-tight">
            Instagram Story & UGC Importer
          </h3>
          <p className="mt-1 text-sm text-white/80 leading-relaxed">
            Paste any Instagram user story or post link to extract profile details, download story media locally, tag menu items, and publish live to <strong>Kaivu IRL</strong> on the homepage.
          </p>
        </div>

        {/* ON / OFF Switch Control Box */}
        <div className="relative z-10 shrink-0 bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-3xl space-y-2 min-w-[240px] text-center">
          <p className="text-xs font-bold uppercase tracking-wider text-purple-200">Homepage Section Visibility</p>
          <button
            type="button"
            onClick={handleToggleEnabled}
            className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-2xl font-extrabold text-xs transition-all shadow-md cursor-pointer ${
              storiesEnabled
                ? "bg-emerald-500 text-white hover:bg-emerald-600"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            <span>Kaivu IRL Status</span>
            <span className={`px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-widest ${
              storiesEnabled ? "bg-white text-emerald-700" : "bg-red-500 text-white"
            }`}>
              {storiesEnabled ? "ON" : "OFF"}
            </span>
          </button>
          <p className="text-[10px] text-white/60">
            {storiesEnabled ? "Visible when stories exist" : "Completely hidden from homepage"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Import Form */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-[2rem] bg-white border border-[oklch(0.9_0.015_75)] p-6 shadow-sm">
            <h4 className="text-base font-bold text-[oklch(0.18_0.02_50)] flex items-center gap-2">
              <Camera className="h-5 w-5 text-purple-600" /> Import Story Link
            </h4>

            <form onSubmit={handleFetch} className="mt-5 space-y-4">
              <div>
                <label className="text-xs font-bold text-[oklch(0.18_0.02_50)] uppercase tracking-wider">
                  Instagram Story / Post Link
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="e.g. https://www.instagram.com/stories/ar_un_das_/"
                  className="mt-1.5 w-full rounded-2xl border border-[oklch(0.9_0.015_75)] bg-[oklch(0.98_0.005_75)] px-4 py-3 text-sm focus:border-brand focus:outline-none transition-colors"
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[oklch(0.18_0.02_50)] uppercase tracking-wider">
                    Or Upload Story Video / Photo File (Optional)
                  </label>
                  {customMediaUrl && (
                    <span className="text-[10px] text-emerald-600 font-bold">File Attached ✓</span>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileUpload}
                  className="mt-1.5 w-full rounded-2xl border border-dashed border-[oklch(0.85_0.02_75)] bg-[oklch(0.98_0.005_75)] px-4 py-2.5 text-xs text-slate-600 file:mr-3 file:rounded-xl file:border-0 file:bg-purple-100 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-purple-700 cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[oklch(0.18_0.02_50)] uppercase tracking-wider">
                    Custom Handle (Optional)
                  </label>
                  <input
                    type="text"
                    value={customUsername}
                    onChange={(e) => setCustomUsername(e.target.value)}
                    placeholder="e.g. @nihal"
                    className="mt-1.5 w-full rounded-2xl border border-[oklch(0.9_0.015_75)] bg-[oklch(0.98_0.005_75)] px-4 py-3 text-sm focus:border-brand focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[oklch(0.18_0.02_50)] uppercase tracking-wider">
                    Tag Featured Burger
                  </label>
                  <select
                    value={featuredProductId}
                    onChange={(e) => setFeaturedProductId(e.target.value)}
                    className="mt-1.5 w-full rounded-2xl border border-[oklch(0.9_0.015_75)] bg-[oklch(0.98_0.005_75)] px-4 py-3 text-sm focus:border-brand focus:outline-none transition-colors"
                  >
                    {menuItems.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} (₹{item.price})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[oklch(0.18_0.02_50)] uppercase tracking-wider">
                  Reaction Badge Emoji
                </label>
                <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
                  {["😍", "🔥", "🍔", "❤️", "⚡", "🤤", "✨", "🌶️"].map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setReactionEmoji(emoji)}
                      className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-lg font-bold transition-transform ${
                        reactionEmoji === emoji
                          ? "bg-purple-600 text-white scale-110 shadow-md"
                          : "bg-gray-100 text-slate-700 hover:bg-gray-200"
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-full bg-purple-700 py-3.5 text-sm font-bold text-white hover:bg-purple-800 transition-all disabled:opacity-75 cursor-pointer shadow-md"
              >
                {loading ? (
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <Camera className="h-4 w-4" />
                    <span>Fetch & Process Instagram Story</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Live Preview & Publish Box */}
        <div className="lg:col-span-5">
          <div className="rounded-[2rem] bg-slate-900 border border-slate-800 p-6 text-white shadow-lg space-y-4 sticky top-28">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold uppercase tracking-wider text-purple-300">
                Story Preview & Publish
              </h4>
              {previewStory && (
                <span className="rounded-full bg-green-500/20 text-green-300 text-[10px] font-bold px-2.5 py-0.5 border border-green-500/30">
                  Ready to Publish
                </span>
              )}
            </div>

            {/* Candidates Chooser Bar if multiple stories/media items extracted */}
            {candidates.length > 1 && (
              <div className="space-y-2 bg-slate-950/80 p-3 rounded-2xl border border-white/10">
                <label className="text-[10px] font-bold text-yellow-300 uppercase tracking-wider">
                  Extracted Media Items ({candidates.length}) — Click to choose:
                </label>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {candidates.map((cand, idx) => (
                    <button
                      key={cand.id}
                      type="button"
                      onClick={() => setPreviewStory(cand)}
                      className={`relative h-14 w-14 shrink-0 rounded-xl overflow-hidden border-2 transition-transform ${
                        previewStory?.mediaUrl === cand.mediaUrl
                          ? "border-yellow-400 scale-105 shadow-md"
                          : "border-slate-700 opacity-60 hover:opacity-100"
                      }`}
                    >
                      {cand.mediaType === "video" || cand.mediaUrl.match(/\.(mp4|webm)($|\?)/i) ? (
                        <video src={cand.mediaUrl} className="h-full w-full object-cover" />
                      ) : (
                        <img src={cand.mediaUrl} alt={`Item ${idx + 1}`} className="h-full w-full object-cover" />
                      )}
                      <span className="absolute bottom-0 right-0 bg-black/80 text-white text-[9px] font-bold px-1 rounded-tl">
                        #{idx + 1}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {previewStory ? (
              <div className="space-y-4">
                <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-[9/16] max-h-[380px] w-full border border-white/10 flex flex-col justify-between p-3">
                  {previewStory.mediaType === "video" || previewStory.mediaUrl.match(/\.(mp4|webm)($|\?)/i) ? (
                    <video
                      src={previewStory.mediaUrl}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : (
                    <img
                      src={previewStory.mediaUrl}
                      alt={previewStory.username}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  )}
                  {/* Top user bar */}
                  <div className="relative z-10 flex items-center gap-2.5 bg-black/50 backdrop-blur-sm p-2 rounded-xl border border-white/10">
                    <img
                      src={previewStory.avatar}
                      alt={previewStory.username}
                      className="h-8 w-8 rounded-full object-cover border border-yellow-400"
                    />
                    <div>
                      <p className="text-xs font-bold text-white">{previewStory.username}</p>
                      <p className="text-[10px] text-white/70">{previewStory.timestamp}</p>
                    </div>
                    <span className="ml-auto text-sm">{previewStory.reactionEmoji}</span>
                  </div>

                  {/* Bottom tagged product */}
                  {previewStory.featuredProduct && (
                    <div className="relative z-10 bg-white/20 backdrop-blur-md rounded-xl p-2.5 border border-white/20 flex items-center justify-between text-xs">
                      <div>
                        <p className="text-[10px] font-bold text-yellow-300 uppercase">Featured Item</p>
                        <p className="font-bold text-white truncate">{previewStory.featuredProduct.name}</p>
                      </div>
                      <span className="font-extrabold text-white">₹{previewStory.featuredProduct.price}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-3 bg-slate-950/80 p-3 rounded-2xl border border-white/10 text-xs">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Username Handle</label>
                    <input
                      type="text"
                      value={previewStory.username}
                      onChange={(e) => setPreviewStory({ ...previewStory, username: e.target.value })}
                      className="mt-1 w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-1.5 text-xs text-white focus:border-purple-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Media URL</label>
                    <input
                      type="text"
                      value={previewStory.mediaUrl}
                      onChange={(e) => setPreviewStory({ ...previewStory, mediaUrl: e.target.value })}
                      className="mt-1 w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-1.5 text-xs text-white focus:border-purple-500 focus:outline-none font-mono text-[11px]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Story Caption</label>
                    <input
                      type="text"
                      value={previewStory.caption || ""}
                      onChange={(e) => setPreviewStory({ ...previewStory, caption: e.target.value })}
                      className="mt-1 w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-1.5 text-xs text-white focus:border-purple-500 focus:outline-none"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handlePublish}
                    className="w-full rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 py-3 text-sm font-bold text-slate-950 hover:from-amber-300 hover:to-yellow-300 transition-all shadow-lg cursor-pointer mt-2"
                  >
                    Publish to Kaivu IRL Live Feed ✨
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400 space-y-2">
                <Camera className="h-10 w-10 text-slate-600" />
                <p className="text-xs">Paste an Instagram link on the left to extract story media & user details.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Published Stories Table / List */}
      <div className="rounded-[2rem] bg-white border border-[oklch(0.9_0.015_75)] p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-base font-bold text-[oklch(0.18_0.02_50)]">
              Published Kaivu IRL Stories ({stories.length})
            </h4>
            <p className="text-xs text-[oklch(0.5_0.02_60)]">
              {storiesEnabled && stories.length > 0
                ? "Currently live on homepage feed"
                : "Section is hidden from homepage"}
            </p>
          </div>
          {stories.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-destructive/20 text-destructive bg-destructive/5 hover:bg-destructive/10 text-xs font-bold transition-colors cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" /> Clear All Stories
            </button>
          )}
        </div>

        {stories.length === 0 ? (
          <p className="text-sm text-[oklch(0.5_0.02_60)] italic">No published stories yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stories.map((story) => (
              <div
                key={story.id}
                className="rounded-2xl border border-[oklch(0.9_0.015_75)] p-3.5 flex items-center gap-3.5 bg-[oklch(0.98_0.005_75)] hover:shadow-md transition-shadow"
              >
                <div className="relative h-16 w-16 shrink-0 rounded-xl overflow-hidden bg-slate-900 border border-gray-200">
                  <img src={story.mediaUrl} alt={story.username} className="h-full w-full object-cover" />
                  <span className="absolute bottom-0.5 right-0.5 text-xs">{story.reactionEmoji}</span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h5 className="text-sm font-bold text-[oklch(0.18_0.02_50)] truncate">{story.username}</h5>
                    <span className="text-[10px] text-purple-700 bg-purple-100 font-bold px-1.5 py-0.5 rounded">IRL</span>
                  </div>
                  {story.featuredProduct && (
                    <p className="text-xs text-[oklch(0.5_0.02_60)] truncate mt-0.5">
                      🍔 {story.featuredProduct.name} · ₹{story.featuredProduct.price}
                    </p>
                  )}
                  <p className="text-[10px] text-slate-400 mt-1">{story.timestamp}</p>
                </div>

                <button
                  type="button"
                  onClick={() => handleDelete(story.id)}
                  className="p-2 text-destructive hover:bg-destructive/10 rounded-xl transition-colors shrink-0"
                  title="Remove Story"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// --- MANAGE APP & STORE OPERATIONS TAB ---
// ==========================================
function ManageAppTab() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{
    isOpen: boolean;
    closingTimerEndsAt: string | null;
    closedMessage: string;
  }>({
    isOpen: true,
    closingTimerEndsAt: null,
    closedMessage: "We are currently closed for orders. Check back soon!",
  });

  const [selectedMinutes, setSelectedMinutes] = useState<number>(10);
  const [customMinutes, setCustomMinutes] = useState<string>("");
  const [messageInput, setMessageInput] = useState<string>("");

  // Live countdown calculator
  const [countdown, setCountdown] = useState<{ minutes: number; seconds: number; totalSeconds: number } | null>(null);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/store-status");
      const data = await res.json();
      if (data.success && data.data) {
        setStatus(data.data);
        setMessageInput(data.data.closedMessage || "");
      }
    } catch (err) {
      console.error("Failed to fetch store status:", err);
      toast.error("Failed to load store status");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  // Update countdown clock every second
  useEffect(() => {
    if (!status.closingTimerEndsAt) {
      setCountdown(null);
      return;
    }

    const checkTimer = () => {
      const endsAt = new Date(status.closingTimerEndsAt!).getTime();
      const diff = endsAt - Date.now();

      if (diff <= 0) {
        setCountdown({ minutes: 0, seconds: 0, totalSeconds: 0 });
        // Refresh status if timer expired
        fetchStatus();
        return;
      }

      const totalSec = Math.floor(diff / 1000);
      const mins = Math.floor(totalSec / 60);
      const secs = totalSec % 60;
      setCountdown({ minutes: mins, seconds: secs, totalSeconds: totalSec });
    };

    checkTimer();
    const timerInterval = setInterval(checkTimer, 1000);
    return () => clearInterval(timerInterval);
  }, [status.closingTimerEndsAt]);

  const handleToggleOpen = async (newIsOpen: boolean) => {
    try {
      setSaving(true);
      const res = await fetch("/api/admin/store-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle_open", isOpen: newIsOpen }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus(data.data);
        toast.success(newIsOpen ? "Store is now OPEN and accepting orders!" : "Store is now CLOSED.");
      } else {
        toast.error(data.error || "Failed to update store status");
      }
    } catch {
      toast.error("Network error updating store status");
    } finally {
      setSaving(false);
    }
  };

  const handleStartTimer = async (minsToUse?: number) => {
    const mins = minsToUse || (customMinutes ? parseInt(customMinutes, 10) : selectedMinutes);
    if (!mins || mins <= 0 || isNaN(mins)) {
      toast.error("Please enter a valid number of minutes");
      return;
    }

    try {
      setSaving(true);
      const res = await fetch("/api/admin/store-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start_timer", durationMinutes: mins }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus(data.data);
        toast.success(`Closing countdown started! Store will close in ${mins} minutes.`, {
          description: "Customers will now see a live closing warning on the app.",
        });
      } else {
        toast.error(data.error || "Failed to start closing timer");
      }
    } catch {
      toast.error("Network error starting timer");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelTimer = async () => {
    try {
      setSaving(true);
      const res = await fetch("/api/admin/store-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel_timer" }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus(data.data);
        toast.success("Closing timer canceled. Store remains open normally.");
      } else {
        toast.error(data.error || "Failed to cancel timer");
      }
    } catch {
      toast.error("Network error canceling timer");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveMessage = async () => {
    try {
      setSaving(true);
      const res = await fetch("/api/admin/store-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_message", closedMessage: messageInput }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus(data.data);
        toast.success("Closed announcement message saved!");
      } else {
        toast.error(data.error || "Failed to save message");
      }
    } catch {
      toast.error("Network error saving message");
    } finally {
      setSaving(false);
    }
  };

  const isTimerActive = status.closingTimerEndsAt && countdown && countdown.totalSeconds > 0;
  const isStoreClosed = !status.isOpen;

  const presets = [5, 10, 15, 30, 45, 60];

  const quickMessageTemplates = [
    "We are currently closed for orders. Check back soon!",
    "Kitchen is closed for the day. See you tomorrow at 11 AM! 🍔",
    "Sold out for today! Thank you for the massive love ❤️",
    "Temporarily paused for kitchen maintenance. Reopening shortly.",
  ];

  return (
    <div className="space-y-8">
      {/* SECTION 1: MASTER STORE STATUS HERO */}
      <div className={`rounded-[1.5rem] sm:rounded-[2rem] p-4 sm:p-8 transition-all border shadow-sm ${
        isStoreClosed
          ? "bg-red-50/70 border-red-200"
          : isTimerActive
          ? "bg-amber-50/70 border-amber-200"
          : "bg-emerald-50/70 border-emerald-200"
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className={`flex h-4 w-4 rounded-full ${
                isStoreClosed ? "bg-red-600" : isTimerActive ? "bg-amber-500 animate-ping" : "bg-emerald-500"
              }`} />
              <h3 className="text-2xl font-display font-extrabold tracking-tight text-[oklch(0.18_0.02_50)]">
                {isStoreClosed
                  ? "STORE IS CURRENTLY CLOSED"
                  : isTimerActive
                  ? "STORE CLOSING INTAKE SOON"
                  : "STORE IS OPEN & ACCEPTING ORDERS"}
              </h3>
            </div>
            <p className="text-sm text-[oklch(0.45_0.02_60)] max-w-xl">
              {isStoreClosed
                ? "Customers cannot place new orders. The closed announcement banner is active across the app."
                : isTimerActive
                ? `Closing countdown is running. Store will automatically close in ${countdown?.minutes}m ${countdown?.seconds}s.`
                : "The online store is live. Customers can freely browse the menu and checkout orders."}
            </p>
          </div>

          {/* Master Open / Close Controls */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              disabled={saving}
              onClick={() => handleToggleOpen(!status.isOpen)}
              className={`flex items-center gap-2.5 px-6 py-3.5 rounded-2xl font-bold text-sm shadow-md transition-all cursor-pointer ${
                status.isOpen
                  ? "bg-red-600 hover:bg-red-700 text-white shadow-red-600/20 active:scale-95"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20 active:scale-95"
              }`}
            >
              <Power className="h-4 w-4" />
              <span>{status.isOpen ? "Close Store Now" : "Open Store Online"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 2: CLOSING COUNTDOWN TIMER CONTROLLER */}
      <div className="rounded-[1.5rem] sm:rounded-[2rem] bg-white border border-[oklch(0.9_0.015_75)] p-4 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[oklch(0.92_0.015_75)] pb-6">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="grid h-8 w-8 place-items-center rounded-xl bg-amber-100 text-amber-800">
                <Timer className="h-5 w-5" />
              </div>
              <h4 className="text-lg font-bold text-[oklch(0.18_0.02_50)]">
                Order Closing Countdown Timer
              </h4>
            </div>
            <p className="text-xs text-[oklch(0.5_0.02_60)] mt-1">
              Warn customers before closing. Displays a live ticking timer on customer devices saying "We are closing orders soon".
            </p>
          </div>

          {isTimerActive && (
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-2 rounded-full bg-amber-100 px-3.5 py-1.5 text-xs font-bold text-amber-900 border border-amber-300">
                <span className="h-2 w-2 rounded-full bg-amber-600 animate-pulse" />
                Live Timer Running
              </span>
              <button
                type="button"
                disabled={saving}
                onClick={handleCancelTimer}
                className="px-4 py-1.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel Timer
              </button>
            </div>
          )}
        </div>

        {/* ACTIVE TIMER DISPLAY */}
        {isTimerActive ? (
          <div className="rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 p-6 text-black shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-black text-amber-300 shadow-inner">
                <Clock className="h-8 w-8 animate-spin text-amber-400" style={{ animationDuration: "12s" }} />
              </div>
              <div>
                <span className="text-xs uppercase font-extrabold tracking-widest text-black/80">
                  Kitchen Intake Auto-Closes In
                </span>
                <div className="text-4xl font-mono font-black tracking-wider text-white drop-shadow-sm">
                  {countdown?.minutes.toString().padStart(2, "0")}:{countdown?.seconds.toString().padStart(2, "0")}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <button
                type="button"
                disabled={saving}
                onClick={handleCancelTimer}
                className="flex-1 md:flex-none px-5 py-3 rounded-xl bg-black/80 hover:bg-black text-white text-xs font-bold transition-all cursor-pointer"
              >
                Stop Countdown
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => handleToggleOpen(false)}
                className="flex-1 md:flex-none px-5 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow transition-all cursor-pointer"
              >
                Close Immediately
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[oklch(0.4_0.02_60)] block mb-3">
                Select Countdown Duration
              </label>

              {/* Presets Grid */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {presets.map((mins) => {
                  const isSelected = selectedMinutes === mins && !customMinutes;
                  return (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => {
                        setSelectedMinutes(mins);
                        setCustomMinutes("");
                      }}
                      className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-brand text-brand-foreground border-brand shadow-md shadow-brand/10 font-bold scale-[1.02]"
                          : "bg-white border-[oklch(0.9_0.015_75)] text-[oklch(0.3_0.02_50)] hover:border-brand/40 font-semibold"
                      }`}
                    >
                      <span className="text-lg font-black">{mins}</span>
                      <span className="text-[10px] uppercase opacity-80">Minutes</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Minutes Input & Action */}
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <input
                  type="number"
                  min="1"
                  max="300"
                  value={customMinutes}
                  onChange={(e) => {
                    setCustomMinutes(e.target.value);
                  }}
                  placeholder="Or enter minutes..."
                  className="w-full sm:w-44 rounded-xl border border-[oklch(0.85_0.015_75)] bg-white px-4 py-2.5 text-sm font-medium focus:border-brand focus:outline-none"
                />
              </div>

              <button
                type="button"
                disabled={saving || !status.isOpen}
                onClick={() => handleStartTimer()}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white px-6 py-2.5 text-sm font-bold shadow-md shadow-amber-600/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                <Timer className="h-4 w-4" />
                <span>
                  Start {customMinutes ? `${customMinutes} Min` : `${selectedMinutes} Min`} Closing Timer
                </span>
              </button>

              {!status.isOpen && (
                <span className="text-xs text-red-600 font-semibold">
                  (Store must be open to start a closing countdown)
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* SECTION 3: CUSTOM CLOSED ANNOUNCEMENT MESSAGE */}
      <div className="rounded-[1.5rem] sm:rounded-[2rem] bg-white border border-[oklch(0.9_0.015_75)] p-4 sm:p-8 shadow-sm space-y-6">
        <div>
          <h4 className="text-lg font-bold text-[oklch(0.18_0.02_50)]">
            Store Closed Announcement Message
          </h4>
          <p className="text-xs text-[oklch(0.5_0.02_60)] mt-1">
            This message is displayed to customers at the top of the app and on checkout when the store is closed.
          </p>
        </div>

        <div className="space-y-4">
          <textarea
            rows={3}
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            className="w-full rounded-2xl border border-[oklch(0.85_0.015_75)] p-4 text-sm font-medium focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
            placeholder="Enter announcement message..."
          />

          {/* Quick Template Chips */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[oklch(0.5_0.02_60)]">
              Quick Templates:
            </span>
            <div className="flex flex-wrap gap-2">
              {quickMessageTemplates.map((tmpl) => (
                <button
                  key={tmpl}
                  type="button"
                  onClick={() => setMessageInput(tmpl)}
                  className="rounded-full bg-[oklch(0.95_0.015_75)] hover:bg-[oklch(0.92_0.015_75)] px-3 py-1 text-xs text-[oklch(0.3_0.02_50)] font-medium transition-colors cursor-pointer"
                >
                  {tmpl}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              disabled={saving}
              onClick={handleSaveMessage}
              className="flex items-center gap-2 rounded-xl bg-brand text-brand-foreground px-6 py-2.5 text-xs font-bold shadow-md hover:opacity-90 active:scale-95 transition-all cursor-pointer"
            >
              <Check className="h-4 w-4" />
              <span>Save Announcement</span>
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 4: REAL-TIME CUSTOMER APP PREVIEW */}
      <div className="rounded-[1.5rem] sm:rounded-[2rem] bg-white border border-[oklch(0.9_0.015_75)] p-4 sm:p-8 shadow-sm space-y-5">
        <div className="flex items-center gap-2.5">
          <Smartphone className="h-5 w-5 text-brand" />
          <h4 className="text-base font-bold text-[oklch(0.18_0.02_50)]">
            Live Customer Preview (Mobile Display)
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Closing Timer Preview */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              1. Customer Closing Alert (When Timer Active)
            </span>
            <div className="rounded-2xl border border-amber-300 overflow-hidden shadow-sm bg-white">
              <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 text-black px-4 py-2.5 text-center text-xs font-black flex items-center justify-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-600 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                </span>
                <Clock className="h-3.5 w-3.5 text-black" />
                <span>
                  Closing orders soon! <span className="underline font-mono bg-black text-amber-300 px-1 py-0.5 rounded ml-1">09:48</span> remaining
                </span>
              </div>
              <div className="p-4 bg-[#FBF7EE] text-xs text-gray-600 flex items-center justify-between">
                <span>Customer can still browse and add to cart</span>
                <span className="font-bold text-amber-700">Urgency Active</span>
              </div>
            </div>
          </div>

          {/* Store Closed Preview */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              2. Store Closed Alert (When Closed)
            </span>
            <div className="rounded-2xl border border-red-200 overflow-hidden shadow-sm bg-white">
              <div className="bg-[#661E28] text-white px-4 py-2.5 text-center text-xs font-bold flex items-center justify-center gap-2">
                <AlertCircle className="h-3.5 w-3.5 text-amber-300 animate-pulse" />
                <span className="truncate">{messageInput || "We are currently closed for orders. Check back soon!"}</span>
              </div>
              <div className="p-4 bg-gray-50 text-xs text-gray-600 flex items-center justify-between">
                <span>Checkout button is automatically disabled</span>
                <span className="font-bold text-red-600">Orders Blocked</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

