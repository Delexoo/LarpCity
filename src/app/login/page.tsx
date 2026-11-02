import Link from "next/link";
import { Button } from "@/components/ui/Button";

export const metadata = {
  title: "Sign in",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] px-5">
      <div className="w-full max-w-sm">
        <Link href="/" className="wordmark text-2xl">
          LarpCity
        </Link>
        <h1 className="page-title mt-10 text-3xl">Welcome back</h1>
        <p className="mt-3 text-sm text-[var(--text-secondary)]">
          Authentication is paused while we focus on the website. Jump straight
          into the app.
        </p>
        <div className="mt-8 space-y-3">
          <Link href="/dashboard" className="block">
            <Button className="w-full" size="lg">
              Enter dashboard
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
