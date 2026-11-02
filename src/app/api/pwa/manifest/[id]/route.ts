import { NextResponse } from "next/server";
import { getPlatformBrand, getPlatformLogoSrc } from "@/lib/larps/platform-brand";

/** Prefer PNG/JPG for home-screen icons — SVG often fails install / wrong fallback. */
function pwaIconPath(slug: string, brandIcon: string): string {
  const preferred = brandIcon || getPlatformLogoSrc(slug);
  if (/\.(png|jpe?g|webp)$/i.test(preferred)) return preferred;
  // Fall back from SVG tile marks to known PNG brand assets when available.
  const pngGuess = preferred.replace(/\.svg$/i, ".png");
  if (pngGuess !== preferred) return pngGuess;
  return preferred;
}

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
  // Scope must be unique per LARP so installs don't steal each other's start URL.
  const scopePath = `/larps/${encodeURIComponent(id)}`;
  const startUrl = `${origin}${scopePath}?source=pwa`;
  const iconPath = pwaIconPath(slug, brand.iconPath);
  const iconUrl = `${origin}${iconPath}`;

  const manifest = {
    id: scopePath,
    name,
    short_name: shortName,
    description: `${name} dashboard`,
    start_url: startUrl,
    scope: scopePath,
    display: "standalone",
    orientation: "portrait-primary",
    background_color: brand.backgroundColor,
    theme_color: brand.themeColor,
    icons: [
      {
        src: iconUrl,
        sizes: "192x192",
        type: iconPath.endsWith(".svg") ? "image/svg+xml" : "image/png",
        purpose: "any",
      },
      {
        src: iconUrl,
        sizes: "512x512",
        type: iconPath.endsWith(".svg") ? "image/svg+xml" : "image/png",
        purpose: "any maskable",
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
