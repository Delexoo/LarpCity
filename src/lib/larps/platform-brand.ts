/** Brand assets for install / PWA / notifications by platform slug. */

export type PlatformBrand = {
  name: string;
  iconPath: string;
  themeColor: string;
  backgroundColor: string;
};

const BRANDS: Record<string, PlatformBrand> = {
  venmo: {
    name: "Venmo",
    iconPath: "/brand-logos/venmo.png",
    themeColor: "#008CFF",
    backgroundColor: "#008CFF",
  },
  stripe: {
    name: "Stripe",
    iconPath: "/brand-logos/stripe.png",
    themeColor: "#635bff",
    backgroundColor: "#635bff",
  },
  "cash-app": {
    name: "Cash App",
    iconPath: "/brand-logos/venmo.png",
    themeColor: "#00D632",
    backgroundColor: "#00D632",
  },
  coinbase: {
    name: "Coinbase",
    iconPath: "/brand-logos/coinbase.png",
    themeColor: "#0052FF",
    backgroundColor: "#0052FF",
  },
};

export function getPlatformBrand(slug: string): PlatformBrand {
  return (
    BRANDS[slug] || {
      name: slug
        .split("-")
        .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
        .join(" "),
      iconPath: `/brand-logos/${slug}.png`,
      themeColor: "#111111",
      backgroundColor: "#111111",
    }
  );
}
