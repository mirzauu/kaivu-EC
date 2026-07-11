"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { auth, useAuth } from "@/lib/auth-store";

export function AuthModal() {
  const isOpen = useAuth((s) => s.isAuthModalOpen);
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");

  const handleNext = () => {
    if (phone.length >= 10) {
      setStep("otp");
    }
  };

  const handleVerify = () => {
    if (otp.length >= 4) {
      auth.login();
      // Reset for next time
      setTimeout(() => {
        setStep("phone");
        setPhone("");
        setOtp("");
      }, 300);
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
            {step === "phone" ? "Welcome" : "Verify Phone"}
          </DialogTitle>
          <DialogDescription>
            {step === "phone"
              ? "Enter your mobile number to continue."
              : `We sent a code to ${phone}.`}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 flex flex-col gap-4">
          {step === "phone" ? (
            <>
              <Input
                type="tel"
                placeholder="Mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-14 rounded-2xl px-4 text-lg"
                autoFocus
              />
              <Button
                size="lg"
                onClick={handleNext}
                disabled={phone.length < 10}
                className="h-14 rounded-2xl text-base font-bold bg-brand text-brand-foreground hover:bg-brand/90"
              >
                Next
              </Button>
            </>
          ) : (
            <>
              <Input
                type="text"
                placeholder="Enter OTP (e.g. 1234)"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="h-14 rounded-2xl px-4 text-center text-xl tracking-widest"
                maxLength={6}
                autoFocus
              />
              <Button
                size="lg"
                onClick={handleVerify}
                disabled={otp.length < 4}
                className="h-14 rounded-2xl text-base font-bold bg-brand text-brand-foreground hover:bg-brand/90"
              >
                Verify & Login
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
