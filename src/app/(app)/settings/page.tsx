import { PlanSettings } from "./PlanSettings";

export const metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="page-title">Settings</h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Profile, plan, and billing. Stripe payments turn on when billing is live.
        </p>
      </div>

      <section className="ll-panel overflow-hidden">
        <div className="border-b border-[var(--hairline)] px-5 py-4">
          <h2 className="text-sm font-semibold text-[var(--ink)]">Profile</h2>
        </div>
        <dl>
          <div className="flex min-h-[52px] items-center justify-between gap-4 border-b border-[var(--hairline)] px-5">
            <dt className="text-sm text-[var(--text-secondary)]">Email</dt>
            <dd className="text-sm text-[var(--ink)]">guest@larpcity.local</dd>
          </div>
          <div className="flex min-h-[52px] items-center justify-between gap-4 px-5">
            <dt className="text-sm text-[var(--text-secondary)]">Name</dt>
            <dd className="text-sm text-[var(--ink)]">Guest</dd>
          </div>
        </dl>
      </section>

      <PlanSettings />
    </div>
  );
}
