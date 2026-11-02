/** Brand assets for install / PWA / notifications / dashboard tiles by platform slug. */

export type PlatformBrand = {
  name: string;
  iconPath: string;
  themeColor: string;
  backgroundColor: string;
};

/**
 * In-app tiles — prefer full-bleed square marks (CSS clips the corners).
 * Bump ?v= when swapping assets so caches refresh.
 */
const LOGO_SRC: Record<string, string> = {
  // Platforms
  coinbase: "/brand-logos/coinbase.svg?v=4",
  amex: "/brand-logos/amex.svg?v=4",
  venmo: "/brand-logos/venmo.svg?v=4",
  "cash-app": "/brand-logos/cashapp.svg?v=4",
  cashapp: "/brand-logos/cashapp.svg?v=4",
  stripe: "/brand-logos/stripe.svg?v=4",
  shopify: "/brand-logos/shopify.svg?v=4",
  "meta-ads": "/brand-logos/meta.svg?v=4",
  metaads: "/brand-logos/meta.svg?v=4",

  // Wallets
  phantom: "/brand-logos/phantom.svg?v=4",
  exodus: "/brand-logos/exodus.svg?v=4",
  "exodus-app": "/brand-logos/exodus.svg?v=4",
  "ledger-live": "/brand-logos/ledger.svg?v=4",
  "ledger-portfolios": "/brand-logos/ledger.svg?v=4",
  revolut: "/brand-logos/revolut.svg?v=4",
  chase: "/brand-logos/chase.png?v=4",
  "trezor-suite": "/brand-logos/trezor-suite.png?v=4",
  metamask: "/brand-logos/metamask.svg?v=4",
  onekey: "/brand-logos/onekey.png?v=4",
  "cake-wallet": "/brand-logos/cakewallet.png?v=4",
  "feather-wallet": "/brand-logos/feather-wallet.png?v=4",

  // Creator
  instagram: "/brand-logos/instagram.svg?v=4",
  "youtube-studio": "/brand-logos/youtube.svg?v=4",
  youtube: "/brand-logos/youtube.svg?v=4",
  infloww: "/brand-logos/infloww.png?v=4",

  // Lifestyle
  bmw: "/brand-logos/bmw.png?v=4",
  tesla: "/brand-logos/tesla.png?v=4",
  porsche: "/brand-logos/porsche.png?v=4",
  lamborghini: "/brand-logos/lamborghini.png?v=4",

  // Trading / casino
  bybit: "/brand-logos/bybit.png?v=4",
  metatrader: "/brand-logos/metatrader-logo.png?v=4",
  "prop-firms": "/brand-logos/ftmo.png?v=4",
  fanduel: "/brand-logos/fanduel.png?v=4",
  "casino-larp": "/brand-logos/stake.webp?v=4",
  stake: "/brand-logos/stake.webp?v=4",
  shuffle: "/brand-logos/shuffle.png?v=4",
  rainbet: "/brand-logos/rainbet.png?v=4",
  roobet: "/brand-logos/roobet.jpg?v=4",

  // Receipts / messaging
  receipts: "/brand-logos/coinbase.svg?v=4",
  imessage: "/brand-logos/imessage.jpg?v=4",
  "larp-emails": "/brand-logos/gmail.jpg?v=4",

  // Misc known marks
  paypal: "/brand-logos/paypal.png?v=4",
};

/** Slugs that have a dedicated brand file (sidebar / tiles). */
export function hasPlatformLogo(slug: string): boolean {
  return Boolean(LOGO_SRC[slug]);
}

/** PWA / apple-touch icons must be raster when possible. */
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
    iconPath: "/brand-logos/youtube.png",
    themeColor: "#FF0000",
    backgroundColor: "#0F0F0F",
  },
  receipts: {
    name: "Receipts",
    iconPath: "/brand-logos/coinbase.png",
    themeColor: "#0052FF",
    backgroundColor: "#0052FF",
  },
  shopify: {
    name: "Shopify",
    iconPath: "/brand-logos/shopify.png",
    themeColor: "#95BF47",
    backgroundColor: "#002E25",
  },
  phantom: {
    name: "Phantom",
    iconPath: "/brand-logos/phantom.png",
    themeColor: "#AB9FF2",
    backgroundColor: "#1C1C1C",
  },
  revolut: {
    name: "Revolut",
    iconPath: "/brand-logos/revolut.png",
    themeColor: "#0666EB",
    backgroundColor: "#000000",
  },
  imessage: {
    name: "iMessage",
    iconPath: "/brand-logos/imessage.jpg",
    themeColor: "#34C759",
    backgroundColor: "#F2F2F7",
  },
  instagram: {
    name: "Instagram",
    iconPath: "/brand-logos/instagram.svg",
    themeColor: "#E1306C",
    backgroundColor: "#ffffff",
  },
  amex: {
    name: "Amex",
    iconPath: "/brand-logos/amex.png",
    themeColor: "#006FCF",
    backgroundColor: "#006FCF",
  },
};

export function getPlatformLogoSrc(slug: string): string {
  return LOGO_SRC[slug] || `/brand-logos/${slug}.png`;
}

export function getPlatformBrand(slug: string): PlatformBrand {
  const mapped = BRANDS[slug];
  if (mapped) return mapped;
  const logo = getPlatformLogoSrc(slug);
  return {
    name: slug
      .split("-")
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join(" "),
    iconPath: logo,
    themeColor: "#111111",
    backgroundColor: "#111111",
  };
}
