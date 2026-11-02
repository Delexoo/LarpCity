import type { PreviewData } from "./GenericPreview";

export function StripePreview({ data }: { data: PreviewData }) {
  const txs = data.transactions ?? [
    { label: "Payment from Acme Co", amount: "+$1,240.00", date: "Today" },
    { label: "Payout to bank ****4821", amount: "-$800.00", date: "Yesterday" },
    { label: "Subscription · Pro plan", amount: "+$29.00", date: "Mar 2" },
  ];

  return (
    <div className="overflow-hidden rounded-xl border border-[#2a2a2a] bg-[#0a2540] text-white shadow-2xl">
      <div className="flex items-center gap-6 border-b border-white/10 px-5 py-3 text-sm">
        <span className="font-semibold tracking-tight">stripe</span>
        <span className="text-white/50">Home</span>
        <span className="text-white/50">Payments</span>
        <span className="text-white/50">Customers</span>
        <span className="ml-auto text-xs text-white/40">
          {data.businessName || "Your business"}
        </span>
      </div>
      <div className="grid gap-4 p-5 md:grid-cols-3">
        <div className="rounded-lg bg-white/5 p-4 md:col-span-2">
          <p className="text-xs text-white/50">Today&apos;s balance</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight">
            {data.balance || "$12,480.22"}
          </p>
          <p className="mt-2 text-xs text-emerald-300">+12.4% vs last week</p>
        </div>
        <div className="rounded-lg bg-white/5 p-4">
          <p className="text-xs text-white/50">Account</p>
          <p className="mt-2 text-sm font-medium">
            @{data.username || "merchant"}
          </p>
          <p className="mt-1 text-xs text-white/40">USD · United States</p>
        </div>
      </div>
      <div className="border-t border-white/10 px-5 py-4">
        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-white/40">
          Recent payments
        </p>
        <div className="space-y-2">
          {txs.map((tx, i) => (
            <div
              key={`${tx.label}-${i}`}
              className="flex items-center justify-between border-b border-white/5 py-2 last:border-0"
            >
              <div>
                <p className="text-sm">{tx.label}</p>
                <p className="text-[11px] text-white/40">{tx.date}</p>
              </div>
              <p className="text-sm font-medium">{tx.amount}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
