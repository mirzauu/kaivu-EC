"use client";

import { useState, useMemo } from "react";
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
  MenuSquare
} from "lucide-react";
import { adminAuth, useAdminAuth } from "@/lib/admin-store";
import { ordersStore, useOrders, Order } from "@/lib/orders-store";
import { menuStore, useMenu } from "@/lib/menu-store";
import { MenuItem } from "@/lib/menu-data";
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    setTimeout(() => {
      if (username === "admin" && password === "admin") {
        const success = adminAuth.login(password);
        if (!success) {
          setError("Failed to initialize session.");
        }
      } else {
        setError("Invalid username or password. Double check credentials.");
      }
      setLoading(false);
    }, 600);
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
  const [activeTab, setActiveTab] = useState<"dashboard" | "orders" | "menu" | "settings">("dashboard");
  const orders = useOrders((s) => s.orders);
  const menuItems = useMenu((s) => s.menu);

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
            onClick={() => setActiveTab("settings")}
            className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-semibold transition-all cursor-pointer ${activeTab === "settings"
                ? "bg-brand text-brand-foreground shadow-lg shadow-brand/15"
                : "text-[oklch(0.5_0.02_60)] hover:bg-[oklch(0.94_0.018_75)] hover:text-[oklch(0.18_0.02_50)]"
              }`}
          >
            <Settings className="h-5 w-5 shrink-0" />
            <span>Settings & Tools</span>
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
              {activeTab === "settings" && "Settings & Simulator"}
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
          {activeTab === "settings" && <SettingsTab />}
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

  const handleSimulateOrder = () => {
    // Generate a list of randomized mock items
    const demoItems = [
      [
        { name: "The Smashed", price: 330, qty: 1, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=60" },
        { name: "Golden Fries", price: 120, qty: 1, image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&auto=format&fit=crop&q=60" }
      ],
      [
        { name: "Buffalo Flami'n Hot", price: 260, qty: 1, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=60" },
        { name: "Choco Velvet Shake", price: 150, qty: 2, image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&auto=format&fit=crop&q=60" }
      ],
      [
        { name: "Smoke & Jam", price: 360, qty: 1, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=60" }
      ]
    ];

    const pick = demoItems[Math.floor(Math.random() * demoItems.length)];
    const newId = ordersStore.addOrder(pick);

    setSimMessage(`Mock order placed! Order ID: ${newId}. Check "Order Management" tab.`);
    setTimeout(() => setSimMessage(""), 5000);
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
