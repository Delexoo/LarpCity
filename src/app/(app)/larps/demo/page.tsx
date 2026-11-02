import { redirect } from "next/navigation";

/** Legacy demo route → platform create form */
export default async function DemoLarpPage({
  searchParams,
}: {
  searchParams: Promise<{ platform?: string }>;
}) {
  const params = await searchParams;
  const slug = params.platform || "stripe";
  redirect(`/platforms/${slug}/new`);
}
