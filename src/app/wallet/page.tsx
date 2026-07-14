"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowUpRight, ArrowDownLeft, Loader2, Plus, Sparkles } from "lucide-react";
import { useAuth, auth } from "@/lib/auth-store";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type WalletTx = {
  id: string;
  amount: number;
  type: string;
  description: string;
  balanceAfter: number;
  createdAt: string;
};

export default function WalletPage() {
  const router = useRouter();
  const user = useAuth((s) => s.user);
  const [transactions, setTransactions] = useState<WalletTx[]>([]);
  const [loading, setLoading] = useState(true);
  const [topupOpen, setTopupOpen] = useState(false);
  const [topupAmount, setTopupAmount] = useState("");
  const [topupLoading, setTopupLoading] = useState(false);

  const fetchWalletData = async () => {
    try {
      const res = await fetch("/api/wallet");
      const data = await res.json();
      if (data.success) {
        setTransactions(data.data.walletTransactions || []);
      }
    } catch (e) {
      console.error("Failed to load wallet transactions", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, []);

  const handleTopup = async () => {
    const amt = parseFloat(topupAmount);
    if (isNaN(amt) || amt <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setTopupLoading(true);
    try {
      const res = await fetch("/api/wallet/topup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amt }),
      });
      const data = await res.json();

      if (data.success) {
        toast.success(`Successfully added ₹${amt.toFixed(2)} to wallet!`);
        setTopupOpen(false);
        setTopupAmount("");
        
        // Refresh wallet data and auth profile (wallet balance updated)
        await Promise.all([
          fetchWalletData(),
          auth.refreshUser(),
        ]);
      } else {
        toast.error(data.error || "Failed to top up");
      }
    } catch (e) {
      toast.error("Network error. Please try again.");
    } finally {
      setTopupLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <main className="mx-auto max-w-md pb-10">
        <header className="px-5 pt-6 pb-2 flex items-center justify-between">
          <button onClick={() => router.push("/reward")} className="p-2 -ml-2 rounded-full hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-bold">Wallet Balance</h1>
          <div className="w-10"></div>
        </header>

        <section className="px-5 pt-10 pb-10 text-center">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Available Balance</p>
          <h2 className="text-6xl font-black mt-3 tracking-tighter text-brand">
            ₹{user?.walletBalance !== undefined ? Number(user.walletBalance).toFixed(2) : "0.00"}
          </h2>
          
          <div className="flex gap-6 justify-center mt-10">
            <button 
              onClick={() => setTopupOpen(true)}
              className="group flex flex-col items-center gap-3 cursor-pointer"
            >
              <div className="grid h-16 w-16 place-items-center rounded-full bg-brand text-brand-foreground shadow-lg transition-transform group-active:scale-95">
                <ArrowDownLeft className="h-7 w-7" />
              </div>
              <span className="text-sm font-bold">Top Up</span>
            </button>
            <button 
              onClick={() => toast.info("Transfer feature coming soon!")}
              className="group flex flex-col items-center gap-3 cursor-pointer"
            >
              <div className="grid h-16 w-16 place-items-center rounded-full bg-surface text-foreground shadow-lg transition-transform group-active:scale-95">
                <ArrowUpRight className="h-7 w-7" />
              </div>
              <span className="text-sm font-bold text-muted-foreground">Transfer</span>
            </button>
          </div>
        </section>

        {/* Transaction History */}
        <section className="px-5 pt-6">
          <h3 className="px-2 pb-4 text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Transaction History
          </h3>
          
          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-brand" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center p-8 bg-surface rounded-3xl text-sm text-muted-foreground">
              No transactions recorded yet.
            </div>
          ) : (
            <ul className="divide-y divide-border rounded-3xl bg-surface p-3 shadow-sm">
              {transactions.map((tx) => {
                const isCredit = tx.amount > 0;
                
                return (
                  <li key={tx.id} className="flex items-center justify-between px-3 py-4">
                    <div className="flex items-center gap-4">
                      <div className={`grid h-12 w-12 place-items-center rounded-2xl ${
                        isCredit 
                          ? 'bg-green-500/15 text-green-600' 
                          : 'bg-red-500/15 text-red-600'
                      }`}>
                        {isCredit ? <ArrowDownLeft className="h-6 w-6" /> : <ArrowUpRight className="h-6 w-6" />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground line-clamp-1">{tx.description}</p>
                        <p className="text-xs font-medium text-muted-foreground mt-0.5">{formatDate(tx.createdAt)}</p>
                      </div>
                    </div>
                    <span className={`text-sm font-black shrink-0 ml-2 ${isCredit ? 'text-green-500' : 'text-foreground'}`}>
                      {isCredit ? "+" : ""}₹{Math.abs(tx.amount).toFixed(2)}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>

      {/* Topup Dialog */}
      <Dialog open={topupOpen} onOpenChange={setTopupOpen}>
        <DialogContent className="w-[90%] max-w-md rounded-[32px] p-6 sm:rounded-[32px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-brand" /> Top Up Wallet
            </DialogTitle>
            <DialogDescription>
              Enter the amount you would like to add to your Kaivu wallet balance.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 flex flex-col gap-4">
            <div className="relative flex items-center">
              <span className="absolute left-4 text-muted-foreground text-lg font-bold">₹</span>
              <Input
                type="number"
                placeholder="Amount (e.g. 500)"
                value={topupAmount}
                onChange={(e) => setTopupAmount(e.target.value)}
                className="h-14 rounded-2xl pl-10 pr-4 text-lg font-bold"
                autoFocus
                disabled={topupLoading}
              />
            </div>

            <div className="flex gap-2 overflow-x-auto py-1 scrollbar-none">
              {[100, 200, 500, 1000].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setTopupAmount(amt.toString())}
                  disabled={topupLoading}
                  className="rounded-xl border border-border px-4 py-2 text-xs font-bold bg-surface hover:bg-accent cursor-pointer transition-colors shrink-0"
                >
                  +₹{amt}
                </button>
              ))}
            </div>

            <Button
              size="lg"
              onClick={handleTopup}
              disabled={topupLoading || !topupAmount}
              className="h-14 rounded-2xl text-base font-bold bg-brand text-brand-foreground hover:bg-brand/90 transition-all cursor-pointer mt-2"
            >
              {topupLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "Proceed to Pay"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
