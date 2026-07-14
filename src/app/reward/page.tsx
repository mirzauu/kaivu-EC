"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Award, Gift, Ticket, Wallet, Magnet, Loader2, Coins } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { useAuth, auth } from "@/lib/auth-store";
import { toast } from "sonner";

type RewardItem = {
  id: string;
  name: string;
  description: string;
  type: string;
  pointsRequired: number;
  value: number;
  isUnlocked: boolean;
  isClaimed: boolean;
  claimStatus: string | null;
};

type LoyaltyProgress = {
  current: number;
  target: number;
  isComplete: boolean;
  remaining: number;
};

export default function Reward() {
  const user = useAuth((s) => s.user);
  const [rewards, setRewards] = useState<RewardItem[]>([]);
  const [loyalty, setLoyalty] = useState<LoyaltyProgress>({
    current: 0,
    target: 8,
    isComplete: false,
    remaining: 8,
  });
  const [loading, setLoading] = useState(true);
  const [redeemingId, setRedeemingId] = useState<string | null>(null);

  const fetchRewardsData = async () => {
    try {
      const res = await fetch("/api/rewards");
      const data = await res.json();
      if (data.success) {
        setRewards(data.data.rewards || []);
        setLoyalty(data.data.loyalty || {
          current: 0,
          target: 8,
          isComplete: false,
          remaining: 8,
        });
      }
    } catch (e) {
      console.error("Failed to load rewards", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRewardsData();
  }, []);

  const handleRedeem = async (rewardId: string, rewardName: string) => {
    if (redeemingId) return;
    setRedeemingId(rewardId);
    
    try {
      const res = await fetch("/api/rewards/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rewardId }),
      });
      const data = await res.json();

      if (data.success) {
        toast.success(`Redeemed ${rewardName}!`);
        // Refresh rewards list and user stats (coins updated)
        await Promise.all([
          fetchRewardsData(),
          auth.refreshUser(),
        ]);
      } else {
        toast.error(data.error || "Failed to redeem reward");
      }
    } catch (e) {
      toast.error("Network error. Please try again.");
    } finally {
      setRedeemingId(null);
    }
  };

  const handleInviteShare = async () => {
    try {
      const res = await fetch("/api/referral/share");
      const data = await res.json();
      if (data.success && navigator.share) {
        await navigator.share({
          title: "Join Kaivu!",
          text: data.data.shareMessage,
          url: data.data.referralLink,
        });
      } else if (data.success) {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(data.data.shareMessage);
        toast.success("Referral invitation copied to clipboard!");
      }
    } catch (e) {
      console.error("Share failed", e);
    }
  };

  return (
    <MobileShell>
      <header className="px-5 pt-6">
        <h1 className="text-2xl font-bold">Rewards</h1>
      </header>
      
      {/* Loyalty Club Section */}
      <section className="px-5 pt-4">
        <div className="overflow-hidden rounded-3xl bg-primary p-5 text-primary-foreground">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-brand">
                <Award className="h-3 w-3" /> Kaivu Club
              </p>
              <h3 className="mt-1 text-lg font-bold">
                {loyalty.isComplete ? "Free burger earned! 🍔" : `${loyalty.remaining} order${loyalty.remaining > 1 ? "s" : ""} away`}
              </h3>
              <p className="mt-0.5 text-xs text-primary-foreground/70">
                {loyalty.current} / {loyalty.target} orders this month
              </p>
            </div>
            <span className="shrink-0 text-2xl font-bold text-brand">
              {loyalty.current}/{loyalty.target}
            </span>
          </div>
          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div 
              className="h-full rounded-full bg-brand transition-all duration-500" 
              style={{ width: `${(loyalty.current / loyalty.target) * 100}%` }} 
            />
          </div>
        </div>
      </section>

      {/* Wallet balance */}
      <section className="px-5 pt-4">
        <Link href="/wallet" className="flex items-center justify-between rounded-3xl bg-surface p-5 shadow-sm transition-transform active:scale-[0.98]">
          <div className="flex items-center gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-brand/10 text-brand">
              <Wallet className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Wallet Balance</p>
              <h3 className="text-xl font-bold">₹{user?.walletBalance !== undefined ? Number(user.walletBalance).toFixed(2) : "0.00"}</h3>
            </div>
          </div>
          <button className="rounded-full bg-brand px-4 py-2 text-sm font-bold text-brand-foreground shadow-sm cursor-pointer">
            Top Up
          </button>
        </Link>
      </section>

      {/* Invite and Earn */}
      <section className="px-5 pt-4">
        <button 
          onClick={handleInviteShare}
          className="w-full flex items-center justify-between rounded-3xl bg-brand/10 p-5 shadow-sm transition-transform active:scale-[0.98] cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-brand text-brand-foreground">
              <Magnet className="h-6 w-6" />
            </div>
            <div className="text-left">
              <h3 className="text-base font-bold text-brand">Invite & Earn</h3>
              <p className="text-xs font-medium text-brand/80 mt-0.5">Get 100 coins for every friend</p>
            </div>
          </div>
          <span className="rounded-full bg-brand px-4 py-2 text-sm font-bold text-brand-foreground shadow-sm">
            Invite
          </span>
        </button>
      </section>

      {/* Available Rewards List */}
      <section className="px-5 pt-6 pb-20">
        <h3 className="px-1 pb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          Available Rewards
        </h3>
        
        {loading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin text-brand" />
          </div>
        ) : rewards.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center p-6 bg-surface rounded-3xl">No rewards available at the moment.</p>
        ) : (
          <ul className="divide-y divide-border overflow-hidden rounded-3xl bg-surface shadow-sm">
            {rewards.map((reward) => {
              const Icon = reward.type === "FREE_ITEM" ? Gift : Ticket;
              const canClaim = reward.isUnlocked && !reward.isClaimed;
              
              return (
                <li key={reward.id} className="relative">
                  <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3.5 text-left">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-accent text-foreground">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold">{reward.name}</span>
                      <span className="block text-[11px] text-muted-foreground">{reward.description}</span>
                      <span className="flex items-center gap-0.5 text-[10px] font-bold text-brand mt-1">
                        <Coins className="h-3 w-3" /> {reward.pointsRequired} coins
                      </span>
                    </span>
                    <button
                      onClick={() => handleRedeem(reward.id, reward.name)}
                      disabled={!canClaim || redeemingId !== null}
                      className={`rounded-full px-3 py-1.5 text-xs font-bold transition-all shrink-0 cursor-pointer ${
                        reward.isClaimed
                          ? "bg-green-500/10 text-green-500"
                          : canClaim
                          ? "bg-brand text-brand-foreground hover:bg-brand/90"
                          : "bg-muted text-muted-foreground cursor-not-allowed opacity-60"
                      }`}
                    >
                      {redeemingId === reward.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : reward.isClaimed ? (
                        "Claimed"
                      ) : (
                        "Redeem"
                      )}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </MobileShell>
  );
}
