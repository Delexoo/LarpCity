import type { PreviewData } from "./GenericPreview";

export function CoinbasePreview({ data }: { data: PreviewData }) {
  const txs = data.transactions ?? [
    { label: "Bought BTC", amount: "-$2,500.00", date: "Today" },
    { label: "Received ETH", amount: "+0.84 ETH", date: "Mar 1" },
    { label: "Sold SOL", amount: "+$640.12", date: "Feb 28" },
  ];

  return (
    <div className="overflow-hidden rounded-xl border border-[#2f3336] bg-[#0A0B0D] text-white shadow-2xl">
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-full bg-[#0052FF] text-sm font-bold">
            C
          </div>
          <div>
            <p className="text-sm font-semibold">Coinbase</p>
            <p className="text-[11px] text-white/45">
              @{data.username || "trader"}
            </p>
          </div>
        </div>
        <div className="rounded-full bg-white/10 px-3 py-1 text-[11px]">
          Portfolio
        </div>
      </div>
      <div className="px-5 pb-5">
        <p className="text-xs text-white/45">Total balance</p>
        <p className="mt-1 text-4xl font-semibold tracking-tight">
          {data.balance || "$84,220.50"}
        </p>
        <p className="mt-2 text-sm text-emerald-400">+$1,240.12 (1.5%)</p>
      </div>
      <div className="border-t border-white/8 px-5 py-4">
        <p className="mb-3 text-xs text-white/45">Recent transactions</p>
        <div className="space-y-3">
          {txs.map((tx, i) => (
            <div key={`${tx.label}-${i}`} className="flex justify-between">
              <div>
                <p className="text-sm">{tx.label}</p>
                <p className="text-[11px] text-white/40">{tx.date}</p>
              </div>
              <p className="text-sm">{tx.amount}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
