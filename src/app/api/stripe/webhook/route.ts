import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

async function setPro(
  userId: string,
  extras: {
    stripe_customer_id?: string | null;
    stripe_subscription_id?: string | null;
    plan?: "free" | "pro";
  },
) {
  const admin = createAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({
      plan: extras.plan ?? "pro",
      ...(extras.stripe_customer_id !== undefined
        ? { stripe_customer_id: extras.stripe_customer_id }
        : {}),
      ...(extras.stripe_subscription_id !== undefined
        ? { stripe_subscription_id: extras.stripe_subscription_id }
        : {}),
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) throw error;
}

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret || webhookSecret === "REPLACE_ME") {
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 400 },
    );
  }

  const body = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Invalid webhook signature";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId =
          session.client_reference_id || session.metadata?.user_id;
        if (!userId) break;

        await setPro(userId, {
          plan: "pro",
          stripe_customer_id:
            typeof session.customer === "string"
              ? session.customer
              : session.customer?.id,
          stripe_subscription_id:
            typeof session.subscription === "string"
              ? session.subscription
              : session.subscription?.id || null,
        });
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.user_id;
        const customerId =
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer.id;

        let resolvedUserId = userId;
        if (!resolvedUserId) {
          const admin = createAdminClient();
          const { data } = await admin
            .from("profiles")
            .select("id")
            .eq("stripe_customer_id", customerId)
            .maybeSingle();
          resolvedUserId = data?.id;
        }

        if (!resolvedUserId) break;

        const active =
          event.type === "customer.subscription.updated" &&
          (subscription.status === "active" ||
            subscription.status === "trialing");

        await setPro(resolvedUserId, {
          plan: active ? "pro" : "free",
          stripe_customer_id: customerId,
          stripe_subscription_id: active ? subscription.id : null,
        });
        break;
      }
      default:
        break;
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Webhook handler failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
