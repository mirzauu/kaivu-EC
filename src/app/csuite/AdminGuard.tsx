"use client";

import { useEffect, useState } from "react";
import { useAdminAuth, adminAuth } from "@/lib/admin-store";
import { useAuth } from "@/lib/auth-store";
import { Lock, AlertCircle, ArrowRight, ShieldAlert, Loader2 } from "lucide-react";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAdminAuth((s) => s.isAuthenticated);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let active = true;
    adminAuth.checkAdminSession().finally(() => {
      if (active) setChecking(false);
    });
    return () => {
      active = false;
    };
  }, []);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[oklch(0.97_0.012_75)] font-sans">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-brand" />
          <span className="text-xs font-semibold text-[oklch(0.5_0.02_60)]">
            Verifying administrative access...
          </span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  return <>{children}</>;
}

export function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const currentUser = useAuth((s) => s.user);

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

  const isNormalUser = currentUser && currentUser.role !== "ADMIN";

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

        {isNormalUser && (
          <div className="mt-6 flex items-start gap-2.5 rounded-2xl bg-amber-50 p-3.5 text-xs text-amber-900 border border-amber-200/80 leading-relaxed">
            <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
            <span>
              You are currently signed in as a customer (<strong>{currentUser.phone || currentUser.name || "Customer"}</strong>). Admin privileges are required to view C-Suite. Please log in with admin credentials below.
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
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
              className="w-full rounded-2xl border border-[oklch(0.9_0.015_75)] bg-[oklch(0.98_0.005_75)] px-4 py-3 text-sm text-[oklch(0.18_0.02_50)] focus:border-brand focus:outline-none transition-colors"
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
              className="w-full rounded-2xl border border-[oklch(0.9_0.015_75)] bg-[oklch(0.98_0.005_75)] px-4 py-3 text-sm text-[oklch(0.18_0.02_50)] focus:border-brand focus:outline-none transition-colors"
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
