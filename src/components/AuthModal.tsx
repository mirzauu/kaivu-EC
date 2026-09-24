"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { auth, useAuth } from "@/lib/auth-store";
import { AlertCircle, Loader2, MessageSquare, ArrowRight, CheckCircle2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export function AuthModal() {
  const isOpen = useAuth((s) => s.isAuthModalOpen);
  const isAuthenticated = useAuth((s) => s.isAuthenticated);
  const isLoading = useAuth((s) => s.isLoading);
  const searchParams = useSearchParams();

  // Mode: "instant" (WhatsApp 1-tap) | "phone" | "otp"
  const [mode, setMode] = useState<"instant" | "phone" | "otp">("instant");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // WhatsApp Instant Session state
  const [waToken, setWaToken] = useState<string | null>(null);
  const [waUrl, setWaUrl] = useState<string | null>(null);
  const [isWaitingWa, setIsWaitingWa] = useState(false);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const urlRefCode = searchParams.get("ref");
  const [storedRefCode] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("kaivu_ref_code");
    }
    return null;
  });
  const refCode = urlRefCode || storedRefCode;

  // Persist referral code from URL & handle auth query parameter
  useEffect(() => {
    if (typeof window !== "undefined") {
      const code = searchParams.get("ref");
      if (code) {
        localStorage.setItem("kaivu_ref_code", code);
      }

      const authParam = searchParams.get("auth");
      if (authParam === "success" && !isAuthenticated) {
        auth.refreshUser();
      } else if (authParam && !isAuthenticated && !isLoading) {
        auth.openModal();
      }
    }
  }, [searchParams, isAuthenticated, isLoading]);

  // Cleanup polling timer
  const stopPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  };

  useEffect(() => {
    return () => stopPolling();
  }, []);

  // Poll for token verification
  const startPolling = (token: string) => {
    stopPolling();
    setIsWaitingWa(true);

    pollIntervalRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/auth/whatsapp-session?token=${token}`);
        const data = await res.json();

        if (data.success && data.data?.status === "VERIFIED" && data.data?.user) {
          stopPolling();
          setIsWaitingWa(false);

          if (typeof window !== "undefined") {
            localStorage.removeItem("kaivu_ref_code");
          }

          await auth.setSessionUser(data.data.user);
          handleClose();
        } else if (data.data?.status === "EXPIRED") {
          stopPolling();
          setIsWaitingWa(false);
          setError("Login session expired. Tap below to refresh.");
        }
      } catch (e) {
        console.error("Polling error:", e);
      }
    }, 1500);
  };

  // Launch WhatsApp 1-Tap Login
  const handleInitiateWhatsApp = async () => {
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/whatsapp-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ referralCode: refCode || undefined }),
      });
      const data = await res.json();
      setLoading(false);

      if (data.success && data.data?.whatsappUrl) {
        setWaToken(data.data.token);
        setWaUrl(data.data.whatsappUrl);

        // Open WhatsApp in new tab/app
        window.open(data.data.whatsappUrl, "_blank");

        // Start polling for message verification
        startPolling(data.data.token);
      } else {
        setError(data.error || "Failed to start WhatsApp login");
      }
    } catch {
      setLoading(false);
      setError("Network error starting WhatsApp login");
    }
  };

  // Traditional OTP handlers
  const handleNext = async () => {
    if (phone.length < 10) return;
    setError("");
    setLoading(true);

    const res = await auth.sendOtp(phone);
    setLoading(false);

    if (res.success) {
      setMode("otp");
    } else {
      setError(res.error || "Failed to send OTP. Please check your number.");
    }
  };

  const handleVerify = async () => {
    if (otp.length < 4) return;
    setError("");
    setLoading(true);

    const res = await auth.verifyOtp(phone, otp, refCode || undefined);
    setLoading(false);

    if (res.success) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("kaivu_ref_code");
      }
      handleClose();
    } else {
      setError(res.error || "Incorrect OTP. Please try again.");
    }
  };

  const handleClose = () => {
    stopPolling();
    auth.closeModal();
    setTimeout(() => {
      setMode("instant");
      setPhone("");
      setOtp("");
      setError("");
      setWaToken(null);
      setWaUrl(null);
      setIsWaitingWa(false);
    }, 300);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      handleClose();
    } else {
      auth.openModal();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="w-[92%] max-w-md rounded-[32px] p-6 sm:rounded-[32px] bg-[#111111] border border-[#262626] text-[#FFF8E7] shadow-2xl">
        <DialogHeader className="text-left">
          <div className="flex items-center justify-between mb-3">
            <img
              src="/images/brand/kaivu-logo-black.png"
              alt="kaivu."
              className="h-9 w-auto object-contain rounded-lg brightness-200 contrast-200"
            />
            {refCode && (
              <span className="text-[11px] font-bold text-brand bg-brand/10 border border-brand/20 px-2.5 py-1 rounded-full">
                🎁 Bonus Applied
              </span>
            )}
          </div>
          <DialogTitle className="text-2xl font-black font-oswald tracking-wide uppercase text-[#FFF8E7]">
            {mode === "instant"
              ? "WhatsApp Login"
              : mode === "phone"
              ? "Login via OTP"
              : "Verify OTP"}
          </DialogTitle>
          {mode === "instant" ? (
            <DialogDescription className="sr-only">Sign in with WhatsApp</DialogDescription>
          ) : (
            <DialogDescription className="text-xs text-[#FFF8E7]/70">
              {mode === "phone"
                ? "Enter your mobile number to receive a 4-digit code on WhatsApp."
                : `Enter the 4-digit code sent to +91 ${phone}.`}
            </DialogDescription>
          )}
        </DialogHeader>

        {error && (
          <div className="flex items-center gap-2 rounded-2xl bg-destructive/10 p-3.5 text-xs font-semibold text-destructive border border-destructive/20 mt-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="mt-4 flex flex-col gap-4">
          {mode === "instant" ? (
            <>
              {!isWaitingWa ? (
                <div className="flex flex-col gap-3">
                  <Button
                    size="lg"
                    onClick={handleInitiateWhatsApp}
                    disabled={loading}
                    className="h-14 rounded-2xl text-base font-bold bg-[#25D366] hover:bg-[#20ba5a] text-black shadow-lg shadow-[#25D366]/20 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
                  >
                    {loading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <MessageSquare className="h-5 w-5 fill-black" />
                        <span>Continue with WhatsApp</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>

                  <div className="relative flex py-1 items-center">
                    <div className="flex-grow border-t border-[#262626]"></div>
                    <span className="flex-shrink mx-4 text-[11px] text-[#FFF8E7]/40 uppercase tracking-widest font-semibold">
                      or
                    </span>
                    <div className="flex-grow border-t border-[#262626]"></div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setError("");
                      setMode("phone");
                    }}
                    className="text-xs text-[#FFF8E7]/60 hover:text-[#FFF8E7] transition-colors font-medium text-center py-1 cursor-pointer"
                  >
                    Prefer OTP? <span className="underline underline-offset-4 text-brand">Enter phone number manually</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 px-4 bg-[#1A1A1A] rounded-2xl border border-[#2A2A2A] text-center space-y-4">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-full bg-[#25D366]/10 flex items-center justify-center border border-[#25D366]/30">
                      <Loader2 className="h-7 w-7 text-[#25D366] animate-spin" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm font-bold text-[#FFF8E7]">Waiting for your message...</p>
                    <p className="text-xs text-[#FFF8E7]/60 max-w-[260px] mx-auto">
                      Send the message in WhatsApp to log in. This screen will auto-refresh the moment it arrives!
                    </p>
                  </div>

                  {waToken && (
                    <div className="w-full bg-[#111111] p-3 rounded-xl border border-[#333] flex items-center justify-between">
                      <div className="text-left">
                        <span className="text-[10px] text-[#FFF8E7]/50 uppercase tracking-wider block font-medium">Message code</span>
                        <span className="font-mono text-base font-extrabold text-[#25D366]">LOGIN {waToken}</span>
                      </div>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          navigator.clipboard.writeText(`LOGIN ${waToken}`);
                          toast.success("Code copied to clipboard!");
                        }}
                        className="h-8 text-xs font-bold rounded-lg cursor-pointer bg-white/10 hover:bg-white/20 text-[#FFF8E7]"
                      >
                        Copy
                      </Button>
                    </div>
                  )}

                  {waUrl && (
                    <div className="flex flex-col gap-2 w-full pt-1">
                      <Button
                        size="sm"
                        onClick={() => window.open(waUrl, "_blank")}
                        className="h-11 rounded-xl text-xs font-bold bg-[#25D366] hover:bg-[#20ba5a] text-black shadow-md cursor-pointer"
                      >
                        Open WhatsApp Again
                      </Button>
                      <button
                        type="button"
                        onClick={() => {
                          stopPolling();
                          setIsWaitingWa(false);
                          setMode("phone");
                        }}
                        className="text-[11px] text-[#FFF8E7]/50 hover:text-[#FFF8E7] underline pt-1 cursor-pointer"
                      >
                        Try entering phone number instead
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : mode === "phone" ? (
            <>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-muted-foreground text-lg font-medium">+91</span>
                <Input
                  type="tel"
                  placeholder="Mobile number"
                  value={phone}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    setPhone(val);
                  }}
                  maxLength={10}
                  className="h-14 rounded-2xl pl-14 pr-4 text-lg font-medium tracking-wide bg-[#1A1A1A] border-[#333] text-[#FFF8E7]"
                  autoFocus
                  disabled={loading}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => {
                    setError("");
                    setMode("instant");
                  }}
                  disabled={loading}
                  className="h-14 rounded-2xl text-sm font-bold flex-1 border-[#333] text-[#FFF8E7] hover:bg-[#222]"
                >
                  ⚡ Back
                </Button>
                <Button
                  size="lg"
                  onClick={handleNext}
                  disabled={phone.length < 10 || loading}
                  className="h-14 rounded-2xl text-base font-bold bg-brand text-brand-foreground hover:bg-brand/90 transition-all flex-[2] cursor-pointer"
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Send OTP"}
                </Button>
              </div>
            </>
          ) : (
            <>
              <Input
                type="text"
                placeholder="enter 4-digit otp"
                value={otp}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  setOtp(val);
                }}
                className="h-14 rounded-2xl px-4 text-center text-xl placeholder:text-sm placeholder:tracking-normal font-bold bg-[#1A1A1A] border-[#333] text-[#FFF8E7]"
                maxLength={4}
                autoFocus
                disabled={loading}
              />

              <div className="flex gap-2">
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => {
                    setMode("phone");
                    setOtp("");
                    setError("");
                  }}
                  disabled={loading}
                  className="h-14 rounded-2xl text-base font-bold flex-1 border-[#333] text-[#FFF8E7] hover:bg-[#222] cursor-pointer"
                >
                  Back
                </Button>
                <Button
                  size="lg"
                  onClick={handleVerify}
                  disabled={otp.length < 4 || loading}
                  className="h-14 rounded-2xl text-base font-bold bg-brand text-brand-foreground hover:bg-brand/90 flex-[2] transition-all cursor-pointer"
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Verify & Login"}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
