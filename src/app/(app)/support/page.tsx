import { EmptyState } from "@/components/ui/EmptyState";
import { LifeBuoy } from "lucide-react";
import { Button } from "@/components/ui/Button";

export const metadata = { title: "Support" };

export default function SupportPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="page-title">Support</h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Reach the LarpingKit team on Discord.
        </p>
      </div>
      <EmptyState
        icon={<LifeBuoy className="size-8" strokeWidth={2} />}
        title="We're on Discord"
        description="Ask product questions, report bugs, or share feature ideas."
        action={
          <a href="https://discord.gg/" target="_blank" rel="noreferrer">
            <Button>Open Discord</Button>
          </a>
        }
      />
    </div>
  );
}
