"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowUpRight, ArrowDownLeft } from "lucide-react";

export default function WalletPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto max-w-md pb-10">
        <header className="px-5 pt-6 pb-2 flex items-center justify-between">
          <button onClick={() => router.push("/reward")} className="p-2 -ml-2 rounded-full hover:bg-accent hover:text-accent-foreground transition-colors">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-bold">Kaivu Credits</h1>
          <div className="w-10"></div> {/* Placeholder to center title */}
        </header>

        <section className="px-5 pt-10 pb-10 text-center">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Available Balance</p>
          <h2 className="text-6xl font-black mt-3 tracking-tighter text-brand">$12.50</h2>
          
          <div className="flex gap-6 justify-center mt-10">
            <button className="group flex flex-col items-center gap-3">
              <div className="grid h-16 w-16 place-items-center rounded-full bg-brand text-brand-foreground shadow-lg transition-transform group-active:scale-95">
                <ArrowDownLeft className="h-7 w-7" />
              </div>
              <span className="text-sm font-bold">Top Up</span>
            </button>
            <button className="group flex flex-col items-center gap-3">
              <div className="grid h-16 w-16 place-items-center rounded-full bg-surface text-foreground shadow-lg transition-transform group-active:scale-95">
                <ArrowUpRight className="h-7 w-7" />
              </div>
              <span className="text-sm font-bold text-muted-foreground">Transfer</span>
            </button>
          </div>
        </section>

        <section className="px-5 pt-6">
          <h3 className="px-2 pb-4 text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Transaction History
          </h3>
          <ul className="divide-y divide-border rounded-3xl bg-surface p-3 shadow-sm">
            {[
              { id: 1, title: "Top up via Credit Card", date: "Today, 10:45 AM", amount: "+$20.00", type: "in" },
              { id: 2, title: "Burger Order #402", date: "Yesterday, 2:15 PM", amount: "-$7.50", type: "out" },
              { id: 3, title: "Welcome Bonus", date: "Jul 8, 9:00 AM", amount: "+$5.00", type: "in" },
            ].map((tx) => (
              <li key={tx.id} className="flex items-center justify-between px-3 py-4">
                <div className="flex items-center gap-4">
                  <div className={`grid h-12 w-12 place-items-center rounded-2xl ${tx.type === 'in' ? 'bg-green-500/15 text-green-600' : 'bg-red-500/15 text-red-600'}`}>
                    {tx.type === 'in' ? <ArrowDownLeft className="h-6 w-6" /> : <ArrowUpRight className="h-6 w-6" />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">{tx.title}</p>
                    <p className="text-xs font-medium text-muted-foreground mt-0.5">{tx.date}</p>
                  </div>
                </div>
                <span className={`text-sm font-black ${tx.type === 'in' ? 'text-green-500' : 'text-foreground'}`}>
                  {tx.amount}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
