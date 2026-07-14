"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { auth, useAuth } from "@/lib/auth-store";
import { AlertCircle, Loader2 } from "lucide-react";

export function AuthModal() {
  const isOpen = useAuth((s) => s.isAuthModalOpen);
  const searchParams = useSearchParams();
  
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [refCode, setRefCode] = useState<string | null>(null);

  // Capture referral code from URL search parameter on mount or when URL changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      const code = searchParams.get("ref") || localStorage.getItem("kaivu_ref_code");
      if (code) {
        setRefCode(code);
        localStorage.setItem("kaivu_ref_code", code);
      }
    }
  }, [searchParams]);

  const handleNext = async () => {
    if (phone.length < 10) return;
    setError("");
    setLoading(true);
    
    const res = await auth.sendOtp(phone);
    setLoading(false);
    
    if (res.success) {
      setStep("otp");
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
      // Clear URL ref parameter if signup succeeded
      if (typeof window !== "undefined") {
        localStorage.removeItem("kaivu_ref_code");
      }
      
      // Reset state on success
      setTimeout(() => {
        setStep("phone");
        setPhone("");
        setOtp("");
        setError("");
      }, 300);
    } else {
      setError(res.error || "Incorrect OTP. Please try again.");
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      auth.closeModal();
      // Reset on close
      setTimeout(() => {
        setStep("phone");
        setPhone("");
        setOtp("");
        setError("");
      }, 300);
    } else {
      auth.openModal();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="w-[90%] max-w-md rounded-[32px] p-6 sm:rounded-[32px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {step === "phone" ? "Welcome to Kaivu" : "Verify Phone"}
          </DialogTitle>
          <DialogDescription>
            {step === "phone"
              ? "Enter your mobile number to get started or login."
              : `We sent a code to ${phone}.`}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="flex items-center gap-2 rounded-2xl bg-destructive/5 p-4 text-xs font-semibold text-destructive border border-destructive/10 mt-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="mt-4 flex flex-col gap-4">
          {step === "phone" ? (
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
                  className="h-14 rounded-2xl pl-14 pr-4 text-lg font-medium tracking-wide"
                  autoFocus
                  disabled={loading}
                />
              </div>
              
              {refCode && (
                <div className="text-xs text-brand font-bold bg-brand/10 rounded-xl px-3 py-2 text-center border border-brand/20">
                  Referral Applied: {refCode} 🎁
                </div>
              )}

              <Button
                size="lg"
                onClick={handleNext}
                disabled={phone.length < 10 || loading}
                className="h-14 rounded-2xl text-base font-bold bg-brand text-brand-foreground hover:bg-brand/90 transition-all cursor-pointer"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Send OTP"}
              </Button>
            </>
          ) : (
            <>
              <Input
                type="text"
                placeholder="Enter OTP (e.g. 1234)"
                value={otp}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  setOtp(val);
                }}
                className="h-14 rounded-2xl px-4 text-center text-xl tracking-widest font-black"
                maxLength={6}
                autoFocus
                disabled={loading}
              />
              
              <div className="flex gap-2">
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => {
                    setStep("phone");
                    setOtp("");
                    setError("");
                  }}
                  disabled={loading}
                  className="h-14 rounded-2xl text-base font-bold flex-1 cursor-pointer"
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
