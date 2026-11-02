import { DashboardShell } from "@/components/layout/DashboardShell";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardShell email="guest@larpcity.local">
      {children}
    </DashboardShell>
  );
}
