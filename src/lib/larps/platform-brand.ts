/** Brand assets for install / PWA / notifications / dashboard tiles by platform slug. */

export type PlatformBrand = {
  name: string;
  iconPath: string;
  themeColor: string;
  backgroundColor: string;
};

/** Prefer crisp SVG marks on the dashboard; PNG/JPG still fine for PWA icons. */
const LOGO_SRC: Record<string, string> = {
  coinbase: "/brand-logos/coinbase.svg",
  chase: "/brand-logos/chase.png",
  amex: "/brand-logos/amex.svg",
  venmo: "/brand-logos/venmo.svg",
  "cash-app": "/brand-logos/cashapp.svg",
  cashapp: "/brand-logos/cashapp.svg",
  stripe: "/brand-logos/stripe.svg",
  "youtube-studio": "/brand-logos/youtube.svg",
  youtube: "/brand-logos/youtube.svg",
  shopify: "/brand-logos/shopify.svg",
  "meta-ads": "/brand-logos/meta.svg",
  metaads: "/brand-logos/meta.svg",
  phantom: "/brand-logos/phantom.svg",
  exodus: "/brand-logos/exodus.svg",
  "exodus-app": "/brand-logos/exodus.svg",
  "ledger-live": "/brand-logos/ledger.svg",
  "ledger-portfolios": "/brand-logos/ledger.svg",
  revolut: "/brand-logos/revolut.svg",
  metamask: "/brand-logos/metamask.svg",
  "trezor-suite": "/brand-logos/trezor-suite.png",
  "cake-wallet": "/brand-logos/cakewallet.png",
  "feather-wallet": "/brand-logos/feather-wallet.png",
  onekey: "/brand-logos/onekey.png",
  bmw: "/brand-logos/bmw.png",
  tesla: "/brand-logos/tesla.png",
  porsche: "/brand-logos/porsche.png",
  lamborghini: "/brand-logos/lamborghini.png",
  bybit: "/brand-logos/bybit.png",
  metatrader: "/brand-logos/metatrader-logo.png",
  infloww: "/brand-logos/infloww.png",
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
    iconPath: "/brand-logos/cash-app.png",
    themeColor: "#00D632",
    backgroundColor: "#00D632",
  },
  cashapp: {
    name: "Cash App",
    iconPath: "/brand-logos/cash-app.png",
    themeColor: "#00D632",
    backgroundColor: "#00D632",
  },
  coinbase: {
    name: "Coinbase",
    iconPath: "/brand-logos/coinbase.png",
    themeColor: "#0052FF",
    backgroundColor: "#0052FF",
  },
  chase: {
    name: "Chase",
    iconPath: "/brand-logos/chase.png",
    themeColor: "#117ACA",
    backgroundColor: "#0f1324",
  },
  "youtube-studio": {
    name: "YouTube Studio",
    iconPath: "/brand-logos/youtube.svg",
    themeColor: "#FF0000",
    backgroundColor: "#0F0F0F",
  },
  receipts: {
    name: "Coinbase",
    iconPath: "/brand-logos/coinbase.png",
    themeColor: "#0052FF",
    backgroundColor: "#0052FF",
  },
};

export function getPlatformLogoSrc(slug: string): string {
  return LOGO_SRC[slug] || `/brand-logos/${slug}.png`;
}

export function getPlatformBrand(slug: string): PlatformBrand {
  // Keep PNG/JPG iconPath for PWA / apple-touch; SVG logos are for in-app tiles.
  const mapped = BRANDS[slug];
  if (mapped) return mapped;
  return {
    name: slug
      .split("-")
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join(" "),
    iconPath: `/brand-logos/${slug}.png`,
    themeColor: "#111111",
    backgroundColor: "#111111",
  };
}
