import Link from "next/link";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Button } from "@/components/ui/Button";

export const metadata = {
  title: "Sign in",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <SiteHeader solid />
      <div className="mx-auto flex min-h-[calc(100vh-4.25rem)] max-w-sm flex-col justify-center px-5 pb-16 pt-28">
        <h1 className="page-title text-[2rem]">Welcome back</h1>
        <p className="mt-3 text-[0.95rem] leading-relaxed text-[var(--text-secondary)]">
          Jump straight into the app. Sign-in providers can be wired later.
        </p>
        <div className="mt-8 space-y-3">
          <Link href="/dashboard" className="block">
            <Button className="w-full" size="lg">
              Enter app
            </Button>
          </Link>
          <Button className="w-full" size="lg" variant="outline" disabled>
            Continue with Google
          </Button>
        </div>
      </div>
    </div>
  );
}
