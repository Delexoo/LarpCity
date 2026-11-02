import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--bg)] px-5 text-center">
      <Link href="/" className="wordmark text-xl">
        LarpingKit
      </Link>
      <h1 className="page-title mt-10 text-4xl">Page not found</h1>
      <p className="mt-3 max-w-sm text-sm text-[var(--text-secondary)]">
        That route doesn&apos;t exist. Head home or jump into the app.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/">
          <Button variant="outline">Home</Button>
        </Link>
        <Link href="/dashboard">
          <Button>Open app</Button>
        </Link>
      </div>
    </div>
  );
}
