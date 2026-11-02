import { redirect } from "next/navigation";

/** My LARPs is combined into Home. */
export default async function LarpsPage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string }>;
}) {
  const params = await searchParams;
  const q = params.created
    ? `?created=${encodeURIComponent(params.created)}`
    : "";
  redirect(`/dashboard${q}`);
}
