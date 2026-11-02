import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import type { LocalLarp } from "@/lib/larps/local-store";

function adminless() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

function isLocalLarp(value: unknown): value is LocalLarp {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === "string" &&
    typeof v.title === "string" &&
    typeof v.platform_slug === "string" &&
    typeof v.data === "object" &&
    v.data !== null &&
    !Array.isArray(v.data)
  );
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const supabase = adminless();
  const { data, error } = await supabase
    .from("larp_snapshots")
    .select("payload")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data?.payload || !isLocalLarp(data.payload)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(
    { larp: data.payload },
    {
      headers: {
        "Cache-Control": "private, max-age=60",
      },
    },
  );
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const larp = body?.larp;
  if (!isLocalLarp(larp) || larp.id !== id) {
    return NextResponse.json({ error: "Invalid larp" }, { status: 400 });
  }

  const supabase = adminless();
  const { error } = await supabase.from("larp_snapshots").upsert(
    {
      id,
      payload: larp,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
