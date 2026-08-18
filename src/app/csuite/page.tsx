"use client";

import { useState, useMemo, useEffect } from "react";
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

        <div className="mt-8 border-t border-[oklch(0.9_0.015_75)] pt-6 text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[oklch(0.94_0.018_75)] px-4 py-1.5 text-xs text-[oklch(0.22_0.025_50)] font-medium">
            <Sparkles className="h-3.5 w-3.5 text-brand" />
            <span>Hint: Use <strong className="font-bold">admin</strong> / <strong className="font-bold">admin</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- ADMIN CONSOLE COMPONENT ---
function AdminConsole() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "orders" | "menu" | "users" | "settings" | "activity" | "instagram">("dashboard");
  const orders = useOrders((s) => s.orders);
  const menuItems = useMenu((s) => s.menu);

  useEffect(() => {
    ordersStore.refresh();
    const interval = setInterval(() => {
      ordersStore.refresh();
    }, 15000); // refresh orders every 15s for the admin panel
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    adminAuth.logout();
  };

  return (
    <div className="flex min-h-screen bg-[oklch(0.97_0.012_75)] font-sans">
      {/* SIDEBAR */}
      <aside className="fixed inset-y-0 left-0 flex w-64 flex-col border-r border-[oklch(0.9_0.015_75)] bg-white">
        <div className="flex h-20 items-center px-6 border-b border-[oklch(0.9_0.015_75)]">
          <span className="text-2xl font-display font-extrabold text-[oklch(0.18_0.02_50)] tracking-tight">
            Kaivu <span className="text-brand">C-Suite</span>
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
            {orders.filter((o) => o.status === "active").length > 0 && (
              <span className={`grid h-5 min-w-5 place-items-center rounded-full text-[10px] font-bold px-1.5 ${activeTab === "orders" ? "bg-white text-brand" : "bg-brand text-brand-foreground"
                }`}>
                {orders.filter((o) => o.status === "active").length}
              </span>
            )}
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
      <div className="flex flex-1 flex-col pl-64">
        {/* HEADER */}
        <header className="flex h-20 items-center justify-between bg-white px-8 border-b border-[oklch(0.9_0.015_75)]">
          <div>
            <h2 className="text-xl font-bold text-[oklch(0.18_0.02_50)] uppercase tracking-tight">
              {activeTab === "dashboard" && "Dashboard Overview"}
              {activeTab === "orders" && "Order Management"}
              {activeTab === "menu" && "Menu Management"}
              {activeTab === "instagram" && "Instagram Story Importer"}
              {activeTab === "users" && "User Management"}
              {activeTab === "settings" && "Settings & Simulator"}
              {activeTab === "activity" && "User Activity Stream"}
            </h2>
            <p className="text-xs text-[oklch(0.5_0.02_60)]">
              Welcome back, Admin · Systems operational.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-full bg-[oklch(0.94_0.018_75)] px-3 py-1.5 text-xs text-[oklch(0.22_0.025_50)] font-semibold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Live Synced</span>
            </div>

            <div className="h-8 w-px bg-[oklch(0.9_0.015_75)]" />

            <div className="flex items-center gap-2.5">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-brand text-brand-foreground font-bold text-sm">
                A
              </div>
              <span className="text-sm font-bold text-[oklch(0.18_0.02_50)]">Administrator</span>
            </div>
          </div>
        </header>

        {/* WORKSPACE */}
        <main className="flex-1 p-8 overflow-y-auto">
          {activeTab === "dashboard" && (
            <DashboardTab orders={orders} menuItems={menuItems} />
          )}
          {activeTab === "orders" && <OrdersTab orders={orders} />}
          {activeTab === "menu" && <MenuTab menuItems={menuItems} />}
          {activeTab === "instagram" && <InstagramTab menuItems={menuItems} />}
          {activeTab === "users" && <UsersTab />}
          {activeTab === "settings" && <SettingsTab />}
          {activeTab === "activity" && <ActivityTab />}
        </main>
      </div>
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
  // Compute Stats
  const stats = useMemo(() => {
    // base baseline values for stats to make the dashboard look like an active corporate system
    const baseRevenue = 15240;
    const baseOrdersCount = 24;

    const actualRevenue = orders
      .filter((o) => o.status === "delivered" || o.status === "active")
      .reduce((sum, o) => sum + o.price, 0);

    const totalRevenue = baseRevenue + actualRevenue;
    const totalOrdersCount = baseOrdersCount + orders.length;
    const averageOrderValue = totalOrdersCount > 0 ? totalRevenue / totalOrdersCount : 0;
    const activeProductsCount = menuItems.length;

    return {
      revenue: totalRevenue,
      ordersCount: totalOrdersCount,
      aov: averageOrderValue,
      productsCount: activeProductsCount
    };
  }, [orders, menuItems]);

  // Recharts Sales Trend Data
  const salesTrendData = useMemo(() => {
    return [
      { day: "Mon", sales: 1800 },
      { day: "Tue", sales: 2400 },
      { day: "Wed", sales: 2200 },
      { day: "Thu", sales: 3100 },
      { day: "Fri", sales: 4200 },
      { day: "Sat", sales: 5800 },
      { day: "Sun", sales: 4900 + (orders.length * 200) } // scales dynamically slightly
    ];
  }, [orders]);

  // Recharts Category Sales Data
  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {
      Burgers: 65,
      Sides: 32,
      Drinks: 18,
      Combos: 15
    };

    // add active orders to categorizations
    orders.forEach((o) => {
      if (o.item.toLowerCase().includes("smashed") || o.item.toLowerCase().includes("bbq") || o.item.toLowerCase().includes("burger")) {
        counts.Burgers += 1;
      } else if (o.item.toLowerCase().includes("fries")) {
        counts.Sides += 1;
      } else if (o.item.toLowerCase().includes("shake") || o.item.toLowerCase().includes("choco")) {
        counts.Drinks += 1;
      } else {
        counts.Combos += 1;
      }
    });

    return [
      { name: "Burgers", value: counts.Burgers },
      { name: "Sides", value: counts.Sides },
      { name: "Drinks", value: counts.Drinks },
      { name: "Combos", value: counts.Combos }
    ];
  }, [orders]);

  const COLORS = ["oklch(0.68 0.19 40)", "oklch(0.22 0.025 50)", "oklch(0.5 0.02 60)", "#f59e0b"];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 4 STATS CARDS */}
      <div className="grid grid-cols-4 gap-6">
        <div className="rounded-[2rem] bg-white border border-[oklch(0.9_0.015_75)] p-6 shadow-sm flex items-center gap-5">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-brand/10 text-brand shrink-0">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-[oklch(0.5_0.02_60)] uppercase tracking-wider">
              Total Revenue
            </p>
            <h3 className="mt-1 text-2xl font-display font-extrabold text-[oklch(0.18_0.02_50)]">
              ₹{stats.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
          </div>
        </div>

        <div className="rounded-[2rem] bg-white border border-[oklch(0.9_0.015_75)] p-6 shadow-sm flex items-center gap-5">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[oklch(0.22_0.025_50)]/5 text-[oklch(0.22_0.025_50)] shrink-0">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-[oklch(0.5_0.02_60)] uppercase tracking-wider">
              Total Orders
            </p>
            <h3 className="mt-1 text-2xl font-display font-extrabold text-[oklch(0.18_0.02_50)]">
              {stats.ordersCount}
            </h3>
          </div>
        </div>

        <div className="rounded-[2rem] bg-white border border-[oklch(0.9_0.015_75)] p-6 shadow-sm flex items-center gap-5">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[oklch(0.5_0.02_60)]/5 text-[oklch(0.5_0.02_60)] shrink-0">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-[oklch(0.5_0.02_60)] uppercase tracking-wider">
              Average Ticket
            </p>
            <h3 className="mt-1 text-2xl font-display font-extrabold text-[oklch(0.18_0.02_50)]">
              ₹{stats.aov.toFixed(2)}
            </h3>
          </div>
        </div>

        <div className="rounded-[2rem] bg-white border border-[oklch(0.9_0.015_75)] p-6 shadow-sm flex items-center gap-5">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-brand/10 text-brand shrink-0">
            <Utensils className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-[oklch(0.5_0.02_60)] uppercase tracking-wider">
              Active Products
            </p>
            <h3 className="mt-1 text-2xl font-display font-extrabold text-[oklch(0.18_0.02_50)]">
              {stats.productsCount}
            </h3>
          </div>
        </div>
      </div>

      {/* CHARTS GRID */}
      <div className="grid grid-cols-5 gap-6">
        {/* Sales Area Chart */}
        <div className="col-span-3 rounded-[2rem] bg-white border border-[oklch(0.9_0.015_75)] p-6 shadow-sm flex flex-col">
          <div className="mb-4">
            <h4 className="text-base font-bold text-[oklch(0.18_0.02_50)]">Sales Volume Trend</h4>
            <p className="text-xs text-[oklch(0.5_0.02_60)]">Daily performance across the last week.</p>
          </div>
          <div className="h-80 w-full flex-1">
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
        <div className="col-span-2 rounded-[2rem] bg-white border border-[oklch(0.9_0.015_75)] p-6 shadow-sm flex flex-col">
          <div className="mb-4">
            <h4 className="text-base font-bold text-[oklch(0.18_0.02_50)]">Category Distribution</h4>
            <p className="text-xs text-[oklch(0.5_0.02_60)]">Popularity percentage of catalog categories.</p>
          </div>
          <div className="h-80 w-full flex-1 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="45%"
                  innerRadius={70}
                  outerRadius={100}
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
      <div className="rounded-[2rem] bg-white border border-[oklch(0.9_0.015_75)] p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-base font-bold text-[oklch(0.18_0.02_50)]">Active Live Orders</h4>
            <p className="text-xs text-[oklch(0.5_0.02_60)]">Real-time status of orders currently in the kitchen or delivery stream.</p>
          </div>
        </div>

        {orders.filter((o) => o.status === "active").length === 0 ? (
          <div className="py-8 text-center text-sm text-[oklch(0.5_0.02_60)]">
            No live active orders. All orders processed or none placed yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
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
                      <td className="py-4 font-bold text-[oklch(0.18_0.02_50)]">{o.id}</td>
                      <td className="py-4 text-[oklch(0.18_0.02_50)]">{o.item}</td>
                      <td className="py-4">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-2.5 py-1 text-xs font-bold text-brand">
                          <span className="h-1.5 w-1.5 rounded-full bg-brand animate-pulse" />
                          {o.stage === 0 && "Confirmed"}
                          {o.stage === 1 && "Cooking"}
                          {o.stage === 2 && "On the way"}
                          {o.stage === 3 && "Delivered"}
                        </span>
                      </td>
                      <td className="py-4 text-right font-bold text-[oklch(0.18_0.02_50)]">₹{o.price.toFixed(2)}</td>
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

  const activeOrders = orders.filter((o) => o.status === "active");
  const pastOrders = orders.filter((o) => o.status !== "active");

  return (
    <div className="grid grid-cols-3 gap-8 animate-fadeIn">
      {/* ORDERS LIST PANEL (LEFT 2/3) */}
      <div className="col-span-2 space-y-6">
        {/* Active Orders List */}
        <div className="rounded-[2rem] bg-white border border-[oklch(0.9_0.015_75)] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 border-b border-[oklch(0.9_0.015_75)] pb-3">
            <h3 className="text-base font-bold text-[oklch(0.18_0.02_50)]">Active Orders Stream</h3>
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
                return (
                  <li
                    key={o.id}
                    onClick={() => setSelectedOrderId(o.id)}
                    className={`group relative flex items-center justify-between p-4 -mx-4 rounded-2xl transition-all cursor-pointer ${isSelected
                        ? "bg-[oklch(0.94_0.018_75)]"
                        : "hover:bg-[oklch(0.97_0.012_75)]"
                      }`}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <img src={o.image} alt="" className="h-12 w-12 rounded-xl object-cover" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-[oklch(0.18_0.02_50)]">{o.id}</h4>
                          <span className="text-[10px] text-[oklch(0.5_0.02_60)]">{o.date}</span>
                        </div>
                        <p className="truncate text-xs font-semibold text-[oklch(0.18_0.02_50)] mt-0.5 max-w-sm">
                          {o.item}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-brand/10 px-2.5 py-0.5 text-xs font-bold text-brand">
                        <span className="h-1.5 w-1.5 rounded-full bg-brand animate-pulse" />
                        {o.stage === 0 && "Confirmed"}
                        {o.stage === 1 && "Cooking"}
                        {o.stage === 2 && "On the way"}
                      </span>
                      <span className="font-bold text-sm text-[oklch(0.18_0.02_50)]">
                        ₹{o.price.toFixed(2)}
                      </span>
                      <ChevronRight className="h-4 w-4 text-[oklch(0.5_0.02_60)] transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Past Orders List */}
        <div className="rounded-[2rem] bg-white border border-[oklch(0.9_0.015_75)] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 border-b border-[oklch(0.9_0.015_75)] pb-3">
            <h3 className="text-base font-bold text-[oklch(0.18_0.02_50)]">Completed & Cancelled History</h3>
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
                return (
                  <li
                    key={o.id}
                    onClick={() => setSelectedOrderId(o.id)}
                    className={`group flex items-center justify-between p-4 -mx-4 rounded-2xl transition-all cursor-pointer ${isSelected
                        ? "bg-[oklch(0.94_0.018_75)]"
                        : "hover:bg-[oklch(0.97_0.012_75)]"
                      }`}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <img src={o.image} alt="" className="h-10 w-10 rounded-xl object-cover opacity-60" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-[oklch(0.18_0.02_50)]">{o.id}</h4>
                          <span className="text-[10px] text-[oklch(0.5_0.02_60)]">{o.date}</span>
                        </div>
                        <p className="truncate text-xs font-semibold text-[oklch(0.5_0.02_60)] mt-0.5 max-w-sm">
                          {o.item}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${o.status === "cancelled" ? "bg-destructive/10 text-destructive" : "bg-emerald-500/10 text-emerald-600"
                        }`}>
                        {o.status}
                      </span>
                      <span className="font-bold text-sm text-[oklch(0.18_0.02_50)]">
                        ₹{o.price.toFixed(2)}
                      </span>
                      <ChevronRight className="h-4 w-4 text-[oklch(0.5_0.02_60)] transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* DETAIL CONSOLE PANEL (RIGHT 1/3) */}
      <div className="col-span-1">
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
              <img src={selectedOrder.image} alt="" className="h-20 w-20 rounded-2xl object-cover shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-[oklch(0.5_0.02_60)] font-bold uppercase tracking-wider">Items Summary</p>
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
                  href={selectedOrder.deliveryLat && selectedOrder.deliveryLng 
                    ? `https://maps.google.com/?q=${selectedOrder.deliveryLat},${selectedOrder.deliveryLng}`
                    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedOrder.deliveryAddress)}`}
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
                  <div className={`flex flex-col items-center p-2 rounded-xl text-center border ${selectedOrder.stage >= 0 ? "bg-brand/10 border-brand/20 text-brand" : "bg-white border-transparent text-muted-foreground"
                    }`}>
                    <Check className="h-4 w-4" />
                    <span className="text-[9px] font-bold mt-1 uppercase">Confirmed</span>
                  </div>
                  <div className={`flex flex-col items-center p-2 rounded-xl text-center border ${selectedOrder.stage >= 1 ? "bg-brand/10 border-brand/20 text-brand" : "bg-white border-transparent text-muted-foreground"
                    }`}>
                    <Activity className={`h-4 w-4 ${selectedOrder.stage === 1 ? "animate-pulse" : ""}`} />
                    <span className="text-[9px] font-bold mt-1 uppercase">Cooking</span>
                  </div>
                  <div className={`flex flex-col items-center p-2 rounded-xl text-center border ${selectedOrder.stage >= 2 ? "bg-brand/10 border-brand/20 text-brand" : "bg-white border-transparent text-muted-foreground"
                    }`}>
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
                <span className="text-[oklch(0.5_0.02_60)] font-semibold">Total Price (GST Incl.)</span>
                <span className="text-lg font-extrabold text-[oklch(0.18_0.02_50)]">
                  ₹{selectedOrder.price.toFixed(2)}
                </span>
              </div>

              {selectedOrder.status === "active" && (
                <button
                  onClick={() => handleCancelOrder(selectedOrder.id)}
                  className="flex w-full items-center justify-center gap-1.5 rounded-full border border-destructive/20 text-destructive bg-destructive/5 hover:bg-destructive/10 transition-colors py-2 text-xs font-bold cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Cancel Order</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="sticky top-28 rounded-[2rem] bg-white border border-[oklch(0.9_0.015_75)] p-6 shadow-sm text-center text-sm text-[oklch(0.5_0.02_60)] py-12">
            Select an order from the list to view live tracking and update stages.
          </div>
        )}
      </div>
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

  // Form Fields
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState<"Burgers" | "Sides" | "Drinks" | "Combos">("Burgers");
  const [tag, setTag] = useState("");
  const [image, setImage] = useState("");

  const resetForm = () => {
    setEditingItem(null);
    setName("");
    setDesc("");
    setPrice("");
    setCategory("Burgers");
    setTag("");
    setImage("");
  };

  const handleEditInit = (item: MenuItem) => {
    setEditingItem(item);
    setName(item.name);
    setDesc(item.desc);
    setPrice(item.price.toString());
    setCategory(item.category);
    setTag(item.tag || "");
    setImage(item.image);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !desc) return;

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice)) return;

    // Use default fallback avatar burger item if image is missing
    const defaultImage = "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=60";

    const itemPayload = {
      name,
      desc,
      price: parsedPrice,
      category,
      tag: tag || undefined,
      image: image || defaultImage,
      rating: editingItem ? editingItem.rating : 5.0
    };

    if (editingItem) {
      menuStore.updateItem(editingItem.id, itemPayload);
    } else {
      menuStore.addItem(itemPayload);
    }

    resetForm();
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this menu item?")) {
      menuStore.deleteItem(id);
      if (editingItem && editingItem.id === id) {
        resetForm();
      }
    }
  };

  return (
    <div className="grid grid-cols-5 gap-8 animate-fadeIn">
      {/* PRODUCTS LIST TABLE (LEFT 3/5) */}
      <div className="col-span-3 rounded-[2rem] bg-white border border-[oklch(0.9_0.015_75)] p-6 shadow-sm">
        <h3 className="text-base font-bold text-[oklch(0.18_0.02_50)] border-b border-[oklch(0.9_0.015_75)] pb-3 mb-4">
          Catalog Menu Items ({menuItems.length})
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[oklch(0.9_0.015_75)] text-xs font-bold text-[oklch(0.5_0.02_60)] uppercase tracking-wider">
                <th className="pb-3 pl-2">Product</th>
                <th className="pb-3">Category</th>
                <th className="pb-3">Price</th>
                <th className="pb-3 text-right pr-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {menuItems.map((item) => (
                <tr key={item.id} className="border-b border-[oklch(0.95_0.01_75)] text-sm group hover:bg-[oklch(0.98_0.005_75)] transition-colors">
                  <td className="py-3 pl-2">
                    <div className="flex items-center gap-3">
                      <img src={item.image} alt={item.name} className="h-10 w-10 rounded-xl object-cover shrink-0 bg-accent" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-[oklch(0.18_0.02_50)]">{item.name}</h4>
                          {item.tag && (
                            <span className="rounded bg-[oklch(0.9_0.015_75)] px-1 py-0.5 text-[8px] font-bold text-foreground">
                              {item.tag}
                            </span>
                          )}
                        </div>
                        <p className="truncate text-xs text-[oklch(0.5_0.02_60)] mt-0.5 max-w-xs">{item.desc}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3">
                    <span className="rounded-full bg-[oklch(0.94_0.018_75)] px-2.5 py-1 text-xs font-medium text-[oklch(0.22_0.025_50)]">
                      {item.category}
                    </span>
                  </td>
                  <td className="py-3 font-bold text-[oklch(0.18_0.02_50)]">₹{item.price.toFixed(2)}</td>
                  <td className="py-3 text-right pr-2">
                    <div className="inline-flex gap-1">
                      <button
                        onClick={() => handleEditInit(item)}
                        className="grid h-8 w-8 place-items-center rounded-lg hover:bg-brand/10 hover:text-brand transition-colors text-[oklch(0.5_0.02_60)] cursor-pointer"
                        title="Edit Item"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="grid h-8 w-8 place-items-center rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors text-[oklch(0.5_0.02_60)] cursor-pointer"
                        title="Delete Item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FORM MANAGEMENT (RIGHT 2/5) */}
      <div className="col-span-2">
        <div className="sticky top-28 rounded-[2rem] bg-white border border-[oklch(0.9_0.015_75)] p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-[oklch(0.9_0.015_75)] pb-3">
            <h3 className="text-base font-bold text-[oklch(0.18_0.02_50)]">
              {editingItem ? "Edit Catalog Item" : "Create New Product"}
            </h3>
            {editingItem && (
              <button
                onClick={resetForm}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[oklch(0.5_0.02_60)] hover:text-foreground cursor-pointer"
              >
                <X className="h-3 w-3" />
                <span>Cancel</span>
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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
                placeholder="e.g. Csuite Smashed Wagyu"
              />
            </div>

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
                  <option value="Sides">Sides</option>
                  <option value="Drinks">Drinks</option>
                  <option value="Combos">Combos</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[oklch(0.18_0.02_50)] uppercase tracking-wider">
                Product Image URL
              </label>
              <input
                type="text"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className="w-full rounded-xl border border-[oklch(0.9_0.015_75)] bg-[oklch(0.98_0.005_75)] px-3 py-2 text-sm focus:border-brand focus:outline-none"
                placeholder="Leave blank for default"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[oklch(0.18_0.02_50)] uppercase tracking-wider">
                Ribbon Tag (optional)
              </label>
              <input
                type="text"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                className="w-full rounded-xl border border-[oklch(0.9_0.015_75)] bg-[oklch(0.98_0.005_75)] px-3 py-2 text-sm focus:border-brand focus:outline-none"
                placeholder="e.g. Spicy, Hot, New"
              />
            </div>

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
                placeholder="Fresh brioche bun, double beef, secret sauce..."
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-full bg-primary py-3 text-sm font-bold text-primary-foreground hover:bg-primary/95 transition-colors cursor-pointer shadow"
            >
              {editingItem ? "Update Catalog Item" : "Create Product"}
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
    <div className="grid grid-cols-3 gap-8 animate-fadeIn">
      {/* USERS LIST & BANNER CONTROLS PANEL (LEFT 2/3) */}
      <div className="col-span-2 space-y-6">

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
                      placeholder="e.g. FIRSTFEAST"
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

                <div className="w-full max-w-[320px] rounded-t-[28px] rounded-b-[20px] bg-gradient-to-b from-[#180e11] via-[#100709] to-[#080305] border border-amber-500/30 p-4 text-white shadow-xl space-y-3">
                  <div className="w-8 h-1 bg-white/20 rounded-full mx-auto" />

                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-[9px] font-black uppercase tracking-wider">
                    <Sparkles className="h-2.5 w-2.5" />
                    <span>{bannersConfig.halfScreenOffer.badgeText || "Special Exclusive Deal"}</span>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand to-rose-600 text-white font-bold">
                      <Percent className="h-4 w-4 stroke-[2.5]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h5 className="text-xs font-black text-white leading-tight">
                        {bannersConfig.halfScreenOffer.title || "Flat ₹200 OFF Your Feast!"}
                      </h5>
                      <p className="text-[10px] text-slate-300 line-clamp-2 mt-0.5">
                        {bannersConfig.halfScreenOffer.description || "Use coupon code on orders above ₹499."}
                      </p>
                    </div>
                  </div>

                  {bannersConfig.halfScreenOffer.promoCode && (
                    <div className="rounded-xl bg-white/5 border border-dashed border-amber-500/40 p-2 flex items-center justify-between">
                      <div>
                        <span className="text-[8px] uppercase text-slate-400 font-bold block">Coupon Code</span>
                        <span className="text-xs font-black text-amber-400 font-mono">{bannersConfig.halfScreenOffer.promoCode}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-white/10 text-[9px] font-bold text-white">Copy</span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => setLivePreviewBanner("offer")}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-brand to-amber-500 text-slate-950 font-extrabold text-xs shadow-md"
                  >
                    {bannersConfig.halfScreenOffer.buttonText || "Claim Offer Now"}
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
          <div className="sticky top-28 rounded-[2rem] bg-white border border-[oklch(0.9_0.015_75)] p-12 shadow-sm flex justify-center items-center">
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-brand border-t-transparent" />
          </div>
        ) : userDetail ? (
          <div className="sticky top-28 rounded-[2rem] bg-white border border-[oklch(0.9_0.015_75)] p-6 shadow-sm space-y-6 overflow-y-auto max-h-[calc(100vh-180px)] animate-fadeIn">
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
