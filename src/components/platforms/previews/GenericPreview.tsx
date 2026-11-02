export type PreviewData = {
  balance?: string;
  businessName?: string;
  username?: string;
  transactions?: Array<{
    label?: string;
    amount?: string;
    date?: string;
    status?: string;
  }>;
};

export function GenericPreview({
  platformName,
  data,
}: {
  platformName: string;
  data: PreviewData;
}) {
  const txs = data.transactions ?? [];

  return (
    <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[#111] shadow-2xl">
      <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-3">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-[var(--muted)]">
            {platformName}
          </p>
          <p className="text-sm font-medium text-white">
            {data.businessName || data.username || "Preview account"}
          </p>
        </div>
        <div className="rounded-md bg-white/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white/80">
          Live preview
        </div>
      </div>
      <div className="px-5 py-6">
        <p className="text-xs text-[var(--muted)]">Available balance</p>
        <p className="mt-1 text-3xl font-bold tracking-tight text-white">
          {data.balance || "$0.00"}
        </p>
      </div>
      <div className="border-t border-[var(--border)] px-5 py-4">
        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
          Recent activity
        </p>
        <div className="space-y-2">
          {(txs.length ? txs : [{ label: "No transactions yet", amount: "—" }]).map(
            (tx, i) => (
              <div
                key={`${tx.label}-${i}`}
                className="flex items-center justify-between rounded-lg bg-white/[0.03] px-3 py-2.5"
              >
                <div>
                  <p className="text-sm text-white">{tx.label || "Transaction"}</p>
                  <p className="text-[11px] text-[var(--muted)]">
                    {tx.date || tx.status || ""}
                  </p>
                </div>
                <p className="text-sm font-medium text-white">{tx.amount || ""}</p>
              </div>
            ),
          )}
        </div>
      </div>
    </div>
  );
}
