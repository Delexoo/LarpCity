"use client";

import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

export function GoogleSignInButton({
  next = "/dashboard",
}: {
  next?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signIn() {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const origin = window.location.origin;
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });
      if (oauthError) throw oauthError;
    } catch (err) {
      const raw = err instanceof Error ? err.message : "Sign-in failed";
      const friendly =
        /provider is not enabled|Unsupported provider/i.test(raw)
          ? "Google sign-in is not enabled yet. In Supabase → Authentication → Providers, turn on Google and paste your Google Client ID + Secret."
          : raw;
      setError(friendly);
      setLoading(false);
    }
  }

  return (
    <div className="w-full space-y-3">
      <Button
        onClick={signIn}
        disabled={loading}
        className="w-full"
        size="lg"
        variant="primary"
      >
        {loading ? "Redirecting…" : "Continue with Google"}
      </Button>
      {error ? (
        <p className="text-center text-xs text-red-400">{error}</p>
      ) : null}
    </div>
  );
}
