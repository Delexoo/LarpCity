import { notFound } from "next/navigation";
import { NAV_CATALOG } from "@/lib/platforms/catalog";
import { StripeNewLarpForm } from "@/components/platforms/forms/StripeNewLarpForm";
import { VenmoNewLarpForm } from "@/components/platforms/forms/VenmoNewLarpForm";
import { GenericNewLarpForm } from "@/components/platforms/forms/GenericNewLarpForm";

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ edit?: string }>;
}) {
  const { slug } = await params;
  const { edit } = await searchParams;
  const platform = NAV_CATALOG.find((i) => i.slug === slug);
  const editing = Boolean(edit);
  return {
    title: platform
      ? editing
        ? `Edit ${platform.name} LARP`
        : `New ${platform.name} LARP`
      : "New LARP",
  };
}

export default async function NewPlatformLarpPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ edit?: string }>;
}) {
  const { slug } = await params;
  const { edit } = await searchParams;
  const platform = NAV_CATALOG.find(
    (i) => i.slug === slug && i.href === `/platforms/${slug}`,
  );
  if (!platform || platform.tier === "coming_soon") notFound();

  const cancelHref = edit ? `/larps/${edit}` : `/platforms/${slug}`;

  if (slug === "stripe") {
    return <StripeNewLarpForm cancelHref={cancelHref} editId={edit} />;
  }

  if (slug === "venmo") {
    return <VenmoNewLarpForm cancelHref={cancelHref} editId={edit} />;
  }

  return (
    <GenericNewLarpForm
      platformName={platform.name}
      platformSlug={platform.slug}
      cancelHref={cancelHref}
      editId={edit}
    />
  );
}
