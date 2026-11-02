import type { PreviewData } from "./GenericPreview";

export function CashAppPreview({ data }: { data: PreviewData }) {
  const txs = data.transactions ?? [
    { label: "Payment to Alex", amount: "-$42.00", date: "Today" },
    { label: "From Jordan", amount: "+$120.00", date: "Yesterday" },
    { label: "Stock · AAPL", amount: "-$200.00", date: "Feb 27" },
  ];

  return (
    <div className="mx-auto max-w-sm overflow-hidden rounded-[2rem] border border-[#1f1f1f] bg-[#00D632] text-[#0D0D0D] shadow-2xl">
      <div className="bg-[#00D632] px-6 pb-8 pt-6">
        <p className="text-sm font-medium opacity-70">Cash</p>
        <p className="mt-3 text-4xl font-bold tracking-tight">
          {data.balance || "$2,480.00"}
        </p>
        <p className="mt-2 text-sm font-medium">
          ${data.username || "you"} · {data.businessName || "Personal"}
        </p>
      </div>
      <div className="rounded-t-[1.5rem] bg-[#0D0D0D] px-5 py-5 text-white">
        <p className="mb-3 text-xs uppercase tracking-wider text-white/40">
          Activity
        </p>
        <div className="space-y-3">
          {txs.map((tx, i) => (
            <div key={`${tx.label}-${i}`} className="flex justify-between">
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
