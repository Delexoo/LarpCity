import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  canCreateLarp,
  currentMonthKey,
  isPro,
} from "@/lib/subscription";
import {
  getActivePlatforms,
  getPlatformBySlug,
} from "@/lib/platforms/catalog";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("larps")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ larps: data });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const platformSlug =
    typeof body.platform_slug === "string" ? body.platform_slug : "";
  const title =
    typeof body.title === "string" && body.title.trim()
      ? body.title.trim()
      : "Untitled LARP";
  const data =
    body.data && typeof body.data === "object" && !Array.isArray(body.data)
      ? body.data
      : {};

  const platform =
    getPlatformBySlug(platformSlug) ||
    getActivePlatforms().find((p) => p.slug === platformSlug);

  if (!platform || platform.tier === "coming_soon") {
    return NextResponse.json({ error: "Invalid platform" }, { status: 400 });
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("plan, larps_created_this_month, larps_month_key")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  if (platform.tier === "pro" && !isPro(profile)) {
    return NextResponse.json(
      { error: "Pro plan required for this platform" },
      { status: 403 },
    );
  }

  const monthKey = currentMonthKey();
  let createdThisMonth = profile?.larps_created_this_month ?? 0;
  if (profile?.larps_month_key !== monthKey) {
    createdThisMonth = 0;
  }

  if (!canCreateLarp(profile, createdThisMonth)) {
    return NextResponse.json(
      {
        error:
          "Free plan allows 1 LARP per month. Upgrade to Pro for unlimited.",
      },
      { status: 403 },
    );
  }

  const { data: larp, error } = await supabase
    .from("larps")
    .insert({
      user_id: user.id,
      platform_slug: platformSlug,
      title,
      data,
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await supabase
    .from("profiles")
    .update({
      larps_month_key: monthKey,
      larps_created_this_month: createdThisMonth + 1,
    })
    .eq("id", user.id);

  return NextResponse.json({ larp }, { status: 201 });
}
