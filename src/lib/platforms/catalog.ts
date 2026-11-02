export type PlatformTier = "free" | "pro" | "coming_soon";

export type NavSection =
  | "General"
  | "Platforms"
  | "Wallets"
  | "Creator"
  | "Lifestyle"
  | "Trading"
  | "Mobile apps"
  | "Receipts"
  | "More"
  | "Coming soon";

export type NavItem = {
  id: string;
  name: string;
  slug: string;
  href: string;
  section: NavSection;
  tier: PlatformTier;
  icon?: string;
  description?: string;
};

/** Platforms with a real viewer dashboard shipped in the app. */
export const READY_PLATFORM_SLUGS = new Set([
  "stripe",
  "venmo",
  "cash-app",
  "coinbase",
  "shopify",
  "youtube-studio",
  "chase",
  "imessage",
  "instagram",
  "receipts",
]);

/** Active platforms are Free (with watermark). Pro removes the watermark. */
function platform(
  name: string,
  slug: string,
  section: NavSection,
  extras?: Partial<NavItem>,
): NavItem {
  const ready = READY_PLATFORM_SLUGS.has(slug);
  const tier: PlatformTier =
    extras?.tier ?? (ready ? "free" : "coming_soon");
  return {
    id: extras?.id ?? slug,
    name,
    slug,
    href: extras?.href ?? `/platforms/${slug}`,
    section,
    tier,
    icon: extras?.icon,
    description: extras?.description,
  };
}

function comingSoon(
  name: string,
  slug: string,
  extras?: Partial<NavItem>,
): NavItem {
  return platform(name, slug, "Coming soon", {
    ...extras,
    tier: "coming_soon",
  });
}

export const NAV_CATALOG: NavItem[] = [
  // General — Home combines former dashboard + My LARPs
  {
    id: "home",
    name: "Home",
    slug: "home",
    href: "/dashboard",
    section: "General",
    tier: "free",
    icon: "Home",
  },
  {
    id: "library",
    name: "Media Library",
    slug: "library",
    href: "/library",
    section: "General",
    tier: "free",
    icon: "Images",
  },

  // Platforms
  platform("Coinbase", "coinbase", "Platforms", { icon: "Coins" }),
  platform("Amex", "amex", "Platforms", { icon: "CreditCard" }),
  platform("Venmo", "venmo", "Platforms", { icon: "Wallet" }),
  platform("Cash App", "cash-app", "Platforms", { icon: "DollarSign" }),
  platform("Stripe", "stripe", "Platforms", { icon: "BadgeDollarSign" }),
  platform("Shopify", "shopify", "Platforms", { icon: "ShoppingBag" }),
  platform("Meta Ads", "meta-ads", "Platforms", { icon: "Megaphone" }),

  // Wallets
  platform("Phantom", "phantom", "Wallets", { icon: "Ghost" }),
  platform("Exodus", "exodus", "Wallets", { icon: "Wallet" }),
  platform("Ledger Live", "ledger-live", "Wallets", { icon: "Cpu" }),
  platform("Ledger Portfolios", "ledger-portfolios", "Wallets", {
    icon: "Briefcase",
  }),
  platform("Revolut", "revolut", "Wallets", { icon: "Building2" }),
  platform("Chase", "chase", "Wallets", { icon: "Landmark" }),
  platform("Trezor Suite", "trezor-suite", "Wallets", { icon: "Shield" }),
  platform("MetaMask", "metamask", "Wallets", { icon: "Fox" }),
  platform("OneKey", "onekey", "Wallets", { icon: "KeyRound" }),
  platform("Cake Wallet", "cake-wallet", "Wallets", { icon: "Cake" }),
  platform("Feather Wallet", "feather-wallet", "Wallets", { icon: "Feather" }),
  platform("Axiom Terminal", "axiom-terminal", "Wallets", { icon: "Terminal" }),
  platform("Exodus App", "exodus-app", "Wallets", { icon: "Smartphone" }),
  platform("Browse seeds & keys", "browse-seeds-keys", "Wallets", {
    icon: "Key",
  }),

  // Creator
  platform("Instagram", "instagram", "Creator", { icon: "Instagram" }),
  platform("YouTube Studio", "youtube-studio", "Creator", { icon: "Youtube" }),
  platform("TikTok Studio", "tiktok-studio", "Creator", { icon: "Music2" }),
  platform("Spotify Artists", "spotify-artists", "Creator", {
    icon: "AudioLines",
  }),
  platform("Twitch", "twitch", "Creator", { icon: "Twitch" }),
  platform("Roblox", "roblox", "Creator", { icon: "Gamepad2" }),
  platform("OnlyFans", "onlyfans", "Creator", { icon: "Heart" }),
  platform("Fanvue", "fanvue", "Creator", { icon: "Star" }),
  platform("Infloww", "infloww", "Creator", { icon: "TrendingUp" }),

  // Lifestyle
  platform("BMW", "bmw", "Lifestyle", { icon: "Car" }),
  platform("McLaren", "mclaren", "Lifestyle", { icon: "CarFront" }),
  platform("Lamborghini", "lamborghini", "Lifestyle", { icon: "Car" }),
  platform("Porsche", "porsche", "Lifestyle", { icon: "Car" }),
  platform("Tesla", "tesla", "Lifestyle", { icon: "Zap" }),

  // Trading
  platform("Binance", "binance", "Trading", { icon: "CandlestickChart" }),
  platform("Bybit", "bybit", "Trading", { icon: "LineChart" }),
  platform("OKX", "okx", "Trading", { icon: "BarChart3" }),
  platform("KuCoin", "kucoin", "Trading", { icon: "ChartSpline" }),
  platform("Moon X", "moon-x", "Trading", { icon: "Moon" }),
  platform("MetaTrader", "metatrader", "Trading", { icon: "Activity" }),
  platform("Prop Firms", "prop-firms", "Trading", { icon: "Building" }),
  platform("AXIOM Trade", "axiom-trade", "Trading", { icon: "Rocket" }),

  // Mobile apps
  platform("App LARPs", "app-larps", "Mobile apps", { icon: "AppWindow" }),
  platform("Notifications", "notifications", "Mobile apps", { icon: "Bell" }),
  platform("Inbox", "inbox", "Mobile apps", { icon: "Inbox" }),

  // Receipts
  platform("Receipts", "receipts", "Receipts", { icon: "Receipt" }),
  platform("Larp Emails", "larp-emails", "Receipts", { icon: "Mail" }),
  platform("iMessage", "imessage", "Receipts", { icon: "MessageCircle" }),

  // More
  platform("Companion App", "companion-app", "More", {
    icon: "Smartphone",
  }),
  platform("Wallet links", "wallet-links", "More", { icon: "Link" }),
  platform("Casino LARP", "casino-larp", "More", { icon: "Dice5" }),
  platform("FanDuel", "fanduel", "More", { icon: "Trophy" }),
  platform("Safari", "safari", "More", { icon: "Compass" }),
  {
    id: "settings",
    name: "Settings",
    slug: "settings",
    href: "/settings",
    section: "More",
    tier: "free",
    icon: "Settings",
  },
  {
    id: "support",
    name: "Support",
    slug: "support",
    href: "/support",
    section: "More",
    tier: "free",
    icon: "LifeBuoy",
  },
  {
    id: "refer",
    name: "Refer a friend",
    slug: "refer",
    href: "/refer",
    section: "More",
    tier: "free",
    icon: "Gift",
  },

  // Extra roadmap
  comingSoon("Robinhood", "robinhood", { icon: "Bird" }),
  comingSoon("Mercury", "mercury", { icon: "Building2" }),
  comingSoon("Wise", "wise", { icon: "Globe" }),
  comingSoon("Wire Transfers", "wire-transfers", { icon: "ArrowLeftRight" }),
  comingSoon("X Analytics", "x-analytics", { icon: "BarChart2" }),
  comingSoon("Substack", "substack", { icon: "Newspaper" }),
  comingSoon("Offer Letters", "offer-letters", { icon: "FileText" }),
  comingSoon("LinkedIn DMs", "linkedin-dms", { icon: "MessageSquare" }),
  comingSoon("Recruiter Pings", "recruiter-pings", { icon: "BellRing" }),
  comingSoon("Levels.fyi", "levels-fyi", { icon: "Layers" }),
  comingSoon("Boarding Passes", "boarding-passes", { icon: "Plane" }),
  comingSoon("Hotel Bookings", "hotel-bookings", { icon: "Hotel" }),
  comingSoon("Strava", "strava", { icon: "Bike" }),
  comingSoon("Whoop", "whoop", { icon: "HeartPulse" }),
  comingSoon("Press Articles", "press-articles", { icon: "Newspaper" }),
  comingSoon("Podcast Invites", "podcast-invites", { icon: "Mic" }),
  comingSoon("Subdomain", "subdomain", { icon: "Globe2" }),
  comingSoon("Custom Domain", "custom-domain", { icon: "Globe" }),
];

export const NAV_SECTIONS: NavSection[] = [
  "General",
  "Platforms",
  "Wallets",
  "Creator",
  "Lifestyle",
  "Trading",
  "Mobile apps",
  "Receipts",
  "More",
  "Coming soon",
];

export function getNavBySection(section: NavSection): NavItem[] {
  return NAV_CATALOG.filter((item) => item.section === section);
}

export function getPlatformBySlug(slug: string): NavItem | undefined {
  return NAV_CATALOG.find(
    (item) =>
      item.slug === slug &&
      item.href.startsWith("/platforms/") &&
      item.section !== "General" &&
      item.section !== "More",
  );
}

/** Ready platforms only (create / featured grids). */
export function getActivePlatforms(): NavItem[] {
  return NAV_CATALOG.filter(
    (item) =>
      item.href.startsWith("/platforms/") &&
      item.tier !== "coming_soon" &&
      READY_PLATFORM_SLUGS.has(item.slug),
  );
}

/** All platform hubs including Soon — for pickers that show greyed items. */
export function getAllPlatforms(): NavItem[] {
  return NAV_CATALOG.filter(
    (item) =>
      item.href.startsWith("/platforms/") &&
      item.section !== "General" &&
      !["settings", "support", "refer"].includes(item.id),
  );
}

export function isPlatformLocked(
  item: NavItem,
  _userIsPro: boolean,
): boolean {
  void _userIsPro;
  return item.tier === "coming_soon";
}
