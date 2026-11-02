import { NextResponse } from "next/server";
import { getPlatformBrand } from "@/lib/larps/platform-brand";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const url = new URL(request.url);
  const origin = url.origin;
  const slug = (url.searchParams.get("slug") || "").toLowerCase();
  const brand = getPlatformBrand(slug);
  const name = (url.searchParams.get("name") || brand.name).slice(0, 32);
  const shortName = name.slice(0, 12);
  const startUrl = `${origin}/larps/${encodeURIComponent(id)}?source=pwa`;
  const iconUrl = `${origin}${brand.iconPath}`;

  const manifest = {
    id: `/larps/${id}`,
    name,
    short_name: shortName,
    description: `${name} dashboard`,
    start_url: startUrl,
    scope: `${origin}/`,
    display: "standalone",
    orientation: "portrait-primary",
    background_color: brand.backgroundColor,
    theme_color: brand.themeColor,
    icons: [
      {
        src: iconUrl,
        sizes: "384x384",
        type: "image/png",
        purpose: "any",
      },
      {
        src: iconUrl,
        sizes: "384x384",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };

  return NextResponse.json(manifest, {
    headers: {
      "Content-Type": "application/manifest+json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
