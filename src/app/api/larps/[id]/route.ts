import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function getOwnedLarp(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase, user: null, larp: null, error: "Unauthorized" as const };
  }

  const { data: larp, error } = await supabase
    .from("larps")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    return { supabase, user, larp: null, error: error.message };
  }

  if (!larp) {
    return { supabase, user, larp: null, error: "Not found" as const };
  }

  return { supabase, user, larp, error: null };
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const { larp, error } = await getOwnedLarp(id);

  if (error === "Unauthorized") {
    return NextResponse.json({ error }, { status: 401 });
  }
  if (error === "Not found" || !larp) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json({ larp });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const { supabase, larp, error } = await getOwnedLarp(id);

  if (error === "Unauthorized") {
    return NextResponse.json({ error }, { status: 401 });
  }
  if (error === "Not found" || !larp) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  const body = await request.json().catch(() => ({}));
  const updates: Record<string, unknown> = {};

  if (typeof body.title === "string") updates.title = body.title.trim();
  if (body.data && typeof body.data === "object" && !Array.isArray(body.data)) {
    updates.data = body.data;
  }
  if (typeof body.is_public === "boolean") updates.is_public = body.is_public;

  const { data: updated, error: updateError } = await supabase
    .from("larps")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ larp: updated });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const { supabase, larp, error } = await getOwnedLarp(id);

  if (error === "Unauthorized") {
    return NextResponse.json({ error }, { status: 401 });
  }
  if (error === "Not found" || !larp) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  const { error: deleteError } = await supabase
    .from("larps")
    .delete()
    .eq("id", id);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
