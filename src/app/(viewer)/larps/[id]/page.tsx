import { LocalLarpClient } from "./LocalLarpClient";

export const metadata = { title: "Stripe" };

export default async function LarpViewerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <LocalLarpClient id={id} />;
}
