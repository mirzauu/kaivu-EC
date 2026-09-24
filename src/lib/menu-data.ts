import assets from "./cloudinary-assets.json";

const kaivuMacBurger = assets.menuImages["kaivu-mac-burger.jpg"];
const kaivuCluckBurger = assets.menuImages["kaivu-cluck-burger.jpg"];
const kaivuLoadedBowl = assets.menuImages["kaivu-loaded-bowl.jpg"];
const kaivuShake = assets.menuImages["shake.jpg"];

export const categories = [
  "All",
  "Burgers",
  "Sandos",
  "Tenders",
  "Wings",
  "Pasta",
  "Loaded",
  "Drinks",
  "Combos",
  "Add-ons",
] as const;

export type VariantOption = {
  name: string;
  price: number;
  quantity?: number;
  currency?: string;
};

export type VariantGroup = {
  groupTitle: string; // e.g. "Size", "Portion", "Pieces"
  options: VariantOption[];
};

export type MenuItem = {
  id: string;
  name: string;
  desc: string;
  description?: string;
  price: number;
  currency?: string;
  size?: string;
  image: any;
  imageUrl?: string;
  videoUrl?: string;
  category: "Burgers" | "Sandos" | "Tenders" | "Wings" | "Pasta" | "Loaded" | "Burrito" | "Sides" | "Drinks" | "Combos" | "Add-ons";
  tag?: string;
  badge?: string;
  rating: number;
  isAvailable?: boolean;
  isComingSoon?: boolean;
  isFeatured?: boolean;
  variants?: VariantGroup | null;
  patty_count?: number;
  topping?: string;
};

export const menu: MenuItem[] = [
  // ─── BURGERS ─────────────────────────────────────────────────────────────
  {
    id: "cluck-riot",
    name: "Cluck Riot",
    desc: "Crispy fried chicken tossed in Nashville hot oil, dusted with our own seasoning, and piled high with slaw.",
    price: 229,
    currency: "INR",
    image: kaivuCluckBurger,
    category: "Burgers",
    tag: "Nashville Hot",
    rating: 4.9,
  },
  {
    id: "mac-and-rooster",
    name: "Mac and Rooster",
    desc: "Crispy Nashville fried chicken stacked with creamy mac and cheese. A comfort-food favourite with a little heat.",
    price: 269,
    currency: "INR",
    image: kaivuMacBurger,
    category: "Burgers",
    tag: "Comfort",
    rating: 4.9,
  },
  {
    id: "classic-fried-bird",
    name: "Classic Fried Bird",
    desc: "A crispy fried chicken burger made for those who love a classic crunch.",
    price: 219,
    currency: "INR",
    image: null,
    category: "Burgers",
    tag: "Classic",
    rating: 4.8,
  },
  {
    id: "og-buff-smash",
    name: "OG Buff Smash",
    desc: "A double smashed beef patty burger, built for a rich, satisfying bite.",
    price: 339,
    currency: "INR",
    image: null,
    category: "Burgers",
    tag: "Double Beef",
    patty_count: 2,
    rating: 5.0,
  },
  {
    id: "classic-smash",
    name: "Classic Smash",
    desc: "A single smashed beef patty finished with chimichurri for a fresh, herby kick.",
    price: 239,
    currency: "INR",
    image: null,
    category: "Burgers",
    tag: "Single Beef",
    patty_count: 1,
    rating: 4.8,
  },
  {
    id: "yolk-me-up",
    name: "Yolk Me Up",
    desc: "Double smashed beef patties topped with a fried bullseye egg. Rich, hearty, and seriously satisfying.",
    price: 369,
    currency: "INR",
    image: null,
    category: "Burgers",
    tag: "Bullseye Egg",
    patty_count: 2,
    topping: "Fried bullseye egg",
    rating: 5.0,
  },

  // ─── SANDOS ──────────────────────────────────────────────────────────────
  {
    id: "beef-patty-melt",
    name: "Beef Patty Melt",
    desc: "A hearty beef patty sandwich made for a rich, savoury bite.",
    price: 219,
    currency: "INR",
    image: null,
    category: "Sandos",
    tag: "Sando",
    rating: 4.8,
  },
  {
    id: "grilled-chicken-sando",
    name: "Grilled Chicken Sando",
    desc: "Juicy grilled chicken served sandwich-style for a satisfying, savoury bite.",
    price: 229,
    currency: "INR",
    image: null,
    category: "Sandos",
    tag: "Sando",
    rating: 4.8,
  },

  // ─── TENDERS ─────────────────────────────────────────────────────────────
  {
    id: "normal-tenders",
    name: "Normal Tenders",
    desc: "Golden, crispy chicken tenders with a satisfying crunch.",
    price: 259,
    currency: "INR", // default base price for 4
    image: null,
    category: "Tenders",
    tag: "Crispy",
    rating: 4.8,
    variants: {
      groupTitle: "Sizes",
      options: [
        { name: "Box of 4", quantity: 4, price: 259, currency: "INR" },
        { name: "Box of 6", quantity: 6, price: 359, currency: "INR" },
      ],
    },
  },
  {
    id: "hot-bird-tenders",
    name: "Hot Bird Tenders",
    desc: "Crispy chicken tenders coated in bold Nashville-style heat.",
    price: 279,
    currency: "INR",
    image: null,
    category: "Tenders",
    tag: "Nashville Spicy",
    rating: 4.9,
    variants: {
      groupTitle: "Sizes",
      options: [
        { name: "Box of 4", quantity: 4, price: 279, currency: "INR" },
        { name: "Box of 6", quantity: 6, price: 369, currency: "INR" },
      ],
    },
  },
  {
    id: "honey-bbq-glazed-tenders",
    name: "Honey BBQ Glazed Tenders",
    desc: "Crispy chicken tenders coated in a sweet, smoky honey BBQ glaze.",
    price: 299,
    currency: "INR",
    image: null,
    category: "Tenders",
    tag: "Honey BBQ",
    rating: 5.0,
    variants: {
      groupTitle: "Sizes",
      options: [
        { name: "Box of 4", quantity: 4, price: 299, currency: "INR" },
        { name: "Box of 6", quantity: 6, price: 399, currency: "INR" },
      ],
    },
  },

  // ─── WINGS ───────────────────────────────────────────────────────────────
  {
    id: "hot-honey-wings",
    name: "Hot Honey Wings",
    desc: "Crispy chicken wings coated in a sweet honey glaze with a spicy kick.",
    price: 269,
    currency: "INR",
    image: null,
    category: "Wings",
    tag: "Hot Honey",
    rating: 4.9,
    variants: {
      groupTitle: "Sizes",
      options: [
        { name: "Box of 3", quantity: 3, price: 269, currency: "INR" },
        { name: "Box of 5", quantity: 5, price: 379, currency: "INR" },
      ],
    },
  },
  {
    id: "hot-chicken-wings",
    name: "Hot Chicken Wings",
    desc: "Crispy chicken wings tossed in bold, fiery Nashville-style seasoning.",
    price: 249,
    currency: "INR",
    image: null,
    category: "Wings",
    tag: "Fiery",
    rating: 4.8,
    variants: {
      groupTitle: "Sizes",
      options: [
        { name: "Box of 3", quantity: 3, price: 249, currency: "INR" },
        { name: "Box of 5", quantity: 5, price: 359, currency: "INR" },
      ],
    },
  },
  {
    id: "honey-bbq-wings",
    name: "Honey BBQ Wings",
    desc: "Crispy chicken wings glazed with a sweet and smoky honey BBQ sauce.",
    price: 259,
    currency: "INR",
    image: null,
    category: "Wings",
    tag: "Smoky BBQ",
    rating: 4.9,
    variants: {
      groupTitle: "Sizes",
      options: [
        { name: "Box of 3", quantity: 3, price: 259, currency: "INR" },
        { name: "Box of 5", quantity: 5, price: 369, currency: "INR" },
      ],
    },
  },

  // ─── PASTA ────────────────────────────────────────────
  {
    id: "mac-and-cheese-with-hot-tender",
    name: "Mac and Cheese with Hot Tender",
    desc: "Creamy mac and cheese topped with a crispy hot chicken tender and a drizzle of chipotle mayo.",
    price: 249,
    currency: "INR",
    image: null,
    category: "Pasta",
    tag: "Special",
    rating: 4.9,
  },

  // ─── LOADED ────────────────────────────────────────────
  {
    id: "nashville-loaded",
    name: "Nashville Loaded",
    desc: "Crispy fries loaded with bold Nashville flavour.",
    price: 239,
    currency: "INR",
    image: kaivuLoadedBowl,
    category: "Loaded",
    tag: "Loaded Fries",
    rating: 4.8,
  },

  // ─── ADD-ONS ──────────────────────────────────────────────────────
  {
    id: "hot-tender-addon",
    name: "Hot Tender",
    desc: "An extra crispy hot chicken tender.",
    price: 89,
    currency: "INR",
    image: null,
    category: "Add-ons",
    tag: "Add-on",
    rating: 4.8,
  },
  {
    id: "ranch-dip",
    name: "Ranch",
    desc: "Creamy ranch dip.",
    price: 25,
    currency: "INR",
    size: "50 ml",
    image: null,
    category: "Add-ons",
    tag: "50 ml",
    rating: 4.8,
  },
  {
    id: "hot-honey-dip",
    name: "Hot Honey",
    desc: "Sweet honey with a spicy kick.",
    price: 30,
    currency: "INR",
    size: "50 ml",
    image: null,
    category: "Add-ons",
    tag: "50 ml",
    rating: 4.8,
  },
  {
    id: "chipotle-mayo-dip",
    name: "Chipotle Mayo",
    desc: "Creamy chipotle mayo with a smoky kick.",
    price: 30,
    currency: "INR",
    size: "50 ml",
    image: null,
    category: "Add-ons",
    tag: "50 ml",
    rating: 4.8,
  },
  {
    id: "bread-addon",
    name: "Bread",
    desc: "An extra serving of bread.",
    price: 5,
    currency: "INR",
    image: null,
    category: "Add-ons",
    tag: "Add-on",
    rating: 4.7,
  },

  // ─── DRINKS ──────────────────────────────────────────────────────────────
  {
    id: "cola",
    name: "Cola",
    desc: "A chilled, refreshing cola.",
    price: 20,
    currency: "INR",
    image: kaivuShake,
    category: "Drinks",
    tag: "Chilled",
    rating: 4.7,
  },
  {
    id: "sprite",
    name: "Sprite",
    desc: "A crisp, refreshing lemon-lime soft drink.",
    price: 20,
    currency: "INR",
    image: kaivuShake,
    category: "Drinks",
    tag: "Chilled",
    rating: 4.7,
  },
  {
    id: "7up",
    name: "7UP",
    desc: "A refreshing lemon-lime soft drink.",
    price: 20,
    currency: "INR",
    image: kaivuShake,
    category: "Drinks",
    tag: "Chilled",
    rating: 4.7,
  },
  {
    id: "pepsi",
    name: "Pepsi",
    desc: "A chilled, refreshing cola.",
    price: 20,
    currency: "INR",
    image: kaivuShake,
    category: "Drinks",
    tag: "Chilled",
    rating: 4.7,
  },
];
