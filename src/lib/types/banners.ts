export type TargetAudience = "ALL" | "GUEST" | "FIRST_ORDER" | "REGULAR";

export interface FullScreenInstallBannerConfig {
  enabled: boolean;
  targetAudience: TargetAudience;
  routes: string[]; // ["ALL"] or ["/", "/menu", etc.]
  delaySeconds: number;
  title: string;
  description: string;
  buttonText: string;
  badgeText: string;
}

export interface IdleNavBannerConfig {
  enabled: boolean;
  targetAudience: TargetAudience;
  routes: string[];
  idleSeconds: number;
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
}

export interface HalfScreenOfferBannerConfig {
  enabled: boolean;
  targetAudience: TargetAudience;
  routes: string[];
  delaySeconds: number;
  title: string;
  description: string;
  promoCode: string;
  buttonText: string;
  buttonLink: string;
  badgeText: string;
}

export interface NotificationBannersConfig {
  fullScreenInstall: FullScreenInstallBannerConfig;
  idleSmallBanner: IdleNavBannerConfig;
  halfScreenOffer: HalfScreenOfferBannerConfig;
}

export const DEFAULT_NOTIFICATION_BANNERS_CONFIG: NotificationBannersConfig = {
  fullScreenInstall: {
    enabled: true,
    targetAudience: "ALL",
    routes: ["/"],
    delaySeconds: 4,
    title: "Experience Kaivu on the App",
    description: "Install Kaivu for lightning-fast 1-tap orders, real-time live GPS order tracking & VIP app-only treats.",
    buttonText: "Install App",
    badgeText: "Fast & Lightweight",
  },
  idleSmallBanner: {
    enabled: true,
    targetAudience: "ALL",
    routes: ["/", "/menu"],
    idleSeconds: 60,
    title: "Still thinking?",
    description: "Our kitchen is fired up! Order now for instant express preparation.",
    buttonText: "Explore Menu",
    buttonLink: "/menu",
  },
  halfScreenOffer: {
    enabled: true,
    targetAudience: "FIRST_ORDER",
    routes: ["/", "/menu", "/cart"],
    delaySeconds: 3,
    title: "BUY 1 GET 1 FREE on First Order!",
    description: "Add any 2 artisanal craft burgers to your cart & get the second one completely FREE! Applied automatically at checkout.",
    promoCode: "BOGOFREE",
    buttonText: "Claim BOGO Offer",
    buttonLink: "/menu?category=Burgers",
    badgeText: "Limited Time Offer",
  },
};
