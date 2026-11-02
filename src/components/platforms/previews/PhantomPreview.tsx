import type { PreviewData } from "./GenericPreview";

export function PhantomPreview({ data }: { data: PreviewData }) {
  const txs = data.transactions ?? [
    { label: "Swap SOL → USDC", amount: "+420 USDC", date: "2m ago" },
    { label: "Received SOL", amount: "+12.4 SOL", date: "1h ago" },
    { label: "NFT mint", amount: "-0.08 SOL", date: "Yesterday" },
  ];

  return (
    <div className="mx-auto max-w-sm overflow-hidden rounded-2xl border border-[#2a2140] bg-gradient-to-b from-[#1b1430] to-[#0d0a16] text-white shadow-2xl">
      <div className="flex items-center justify-between px-5 pt-5">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-full bg-gradient-to-br from-[#AB9FF2] to-[#4E44CE]" />
          <div>
            <p className="text-sm font-semibold">Phantom</p>
            <p className="text-[11px] text-white/45">
              {data.username || "Account 1"}
            </p>
          </div>
        </div>
        <div className="rounded-full bg-white/10 px-2.5 py-1 text-[10px]">
          Solana
        </div>
      </div>
      <div className="px-5 py-8 text-center">
        <p className="text-xs text-white/45">Total value</p>
        <p className="mt-2 text-4xl font-semibold tracking-tight">
          {data.balance || "$18,940.22"}
        </p>
      </div>
      <div className="border-t border-white/8 px-5 py-4">
        <p className="mb-3 text-xs text-white/45">Recent activity</p>
        <div className="space-y-3">
          {txs.map((tx, i) => (
            <div key={`${tx.label}-${i}`} className="flex justify-between">
              <div>
                <p className="text-sm">{tx.label}</p>
                <p className="text-[11px] text-white/40">{tx.date}</p>
              </div>
              <p className="text-sm text-[#AB9FF2]">{tx.amount}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
