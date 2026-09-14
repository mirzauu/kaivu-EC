import assets from "./cloudinary-assets.json";

const kaivuMacBurger = assets.menuImages["kaivu-mac-burger.jpg"];
const kaivuCluckBurger = assets.menuImages["kaivu-cluck-burger.jpg"];
const kaivuLoadedBowl = assets.menuImages["kaivu-loaded-bowl.jpg"];
const kaivuShake = assets.menuImages["shake.jpg"];

export type MenuItem = {
  id: string;
  name: string;
  desc: string;
  description?: string;
  price: number;
  image: any;
  imageUrl?: string;
  videoUrl?: string;
  category: "Burgers" | "Burrito" | "Sides" | "Drinks" | "Combos";
  tag?: string;
  badge?: string;
  rating: number;
  isAvailable?: boolean;
  isComingSoon?: boolean;
  isFeatured?: boolean;
};

export const menu: MenuItem[] = [
  { id: "og-smash-beef", name: "OG Smash (Beef)", desc: "Classic beef smash burger", price: 210, image: kaivuCluckBurger, category: "Burgers", tag: "Bestseller", rating: 4.8 },
  { id: "classic-smash-burger-beef", name: "Classic Smash Burger (Beef)", desc: "Classic-style beef smash burger", price: 320, image: kaivuMacBurger, category: "Burgers", rating: 4.7 },
  { id: "jalapeno-jam-beef", name: "Jalapeño Jam (Beef)", desc: "Beef smash burger with jalapeño jam", price: 220, image: kaivuCluckBurger, category: "Burgers", tag: "Spicy", rating: 4.9 },
  { id: "the-dirty-shroom-beef", name: "The Dirty Shroom (Beef)", desc: "Beef burger featuring mushrooms", price: 340, image: kaivuCluckBurger, category: "Burgers", rating: 4.8 },
  { id: "nashville-cluck-chicken", name: "Nashville Cluck (Chicken)", desc: "Nashville-style chicken burger", price: 210, image: kaivuCluckBurger, category: "Burgers", tag: "Spicy", rating: 4.7 },
  { id: "mac-and-rooster-chicken", name: "Mac & Rooster (Chicken)", desc: "Chicken burger with mac & cheese", price: 240, image: kaivuMacBurger, category: "Burgers", rating: 4.8 },
  { id: "hot-bird-tenders-box-of-4", name: "Hot Bird Tenders — Box of 4", desc: "4 pieces of hot chicken tenders", price: 270, image: kaivuCluckBurger, category: "Sides", tag: "Spicy", rating: 4.8 },
  { id: "hot-bird-tenders-box-of-6", name: "Hot Bird Tenders — Box of 6", desc: "6 pieces of hot chicken tenders", price: 380, image: kaivuCluckBurger, category: "Sides", tag: "Spicy", rating: 4.9 },
  { id: "honey-hot-bird-tenders-4", name: "Honey Hot Bird Tenders — 4", desc: "4 pieces of chicken tenders with honey", price: 390, image: kaivuLoadedBowl, category: "Sides", rating: 4.9 },
  { id: "honey-hot-bird-tenders-6", name: "Honey Hot Bird Tenders — 6", desc: "6 pieces of chicken tenders with honey", price: 520, image: kaivuLoadedBowl, category: "Sides", tag: "Bestseller", rating: 5.0 },
  { id: "nashville-loaded", name: "Nashville Loaded", desc: "Nashville-style loaded dish", price: 230, image: kaivuLoadedBowl, category: "Sides", tag: "Spicy", rating: 4.7 },
  { id: "beef-loaded", name: "Beef Loaded", desc: "Beef loaded dish", price: 240, image: kaivuLoadedBowl, category: "Sides", rating: 4.8 },
  { id: "mac-and-cheese", name: "Mac & Cheese", desc: "Creamy mac & cheese", price: 215, image: kaivuLoadedBowl, category: "Sides", rating: 4.6 },
  { id: "7up-1ltr", name: "7Up (1 Litre)", desc: "Refreshing 7Up 1 Litre bottle", price: 60, image: kaivuLoadedBowl, category: "Drinks", tag: "Chilled", rating: 4.8 },
  { id: "belgian-choco-shake", name: "Belgian Chocolate Shake", desc: "Thick, rich & chilled artisanal chocolate shake", price: 120, image: kaivuShake, category: "Drinks", tag: "Bestseller", rating: 4.9 },
  { id: "classic-cold-coffee", name: "Classic Cold Coffee", desc: "Creamy brewed chilled coffee perfection", price: 95, image: kaivuShake, category: "Drinks", tag: "Popular", rating: 4.8 },
  { id: "pepsi-can-330", name: "Pepsi Can (330ml)", desc: "Classic ice-cold fizzy refreshment", price: 40, image: kaivuLoadedBowl, category: "Drinks", rating: 4.6 },
  { id: "mirinda-can-330", name: "Mirinda Orange (330ml)", desc: "Tangy sweet fizzy orange punch", price: 40, image: kaivuLoadedBowl, category: "Drinks", rating: 4.5 },
  { id: "mountain-dew-330", name: "Mountain Dew (330ml)", desc: "Citrus blast with energizing fizz", price: 40, image: kaivuLoadedBowl, category: "Drinks", rating: 4.6 },
  { id: "fresh-lime-soda", name: "Fresh Lime Soda", desc: "Sparkling lime refresher with sweet & salt", price: 50, image: kaivuLoadedBowl, category: "Drinks", tag: "Fresh", rating: 4.7 },
  { id: "mango-passion-smoothie", name: "Mango Passion Smoothie", desc: "Tropical mango blend with passion fruit twist", price: 110, image: kaivuShake, category: "Drinks", tag: "Tropical", rating: 4.9 },
  { id: "iced-berry-lemonade", name: "Iced Berry Lemonade", desc: "Chilled wild berry lemonade with crushed ice", price: 85, image: kaivuShake, category: "Drinks", tag: "Refreshing", rating: 4.8 },
  { id: "red-bull-energy", name: "Red Bull Energy (250ml)", desc: "Vitalizes body and mind - 250ml energy can", price: 125, image: kaivuShake, category: "Drinks", tag: "Energy", rating: 4.9 },
  { id: "sprite-1ltr", name: "Sprite Crisp Lime (1 Litre)", desc: "Crisp, clean & refreshing lemon-lime 1L bottle", price: 60, image: kaivuLoadedBowl, category: "Drinks", tag: "Chilled", rating: 4.8 },
  { id: "oreo-cookies-shake", name: "Oreo Cookies & Cream Shake", desc: "Blended real Oreos with vanilla ice cream & whipped top", price: 135, image: kaivuShake, category: "Drinks", tag: "Bestseller", rating: 5.0 },
  
  // COMBOS (Party Packs for 4, 6, 8 People)
  { id: "squad-pack-feeds-4", name: "Squad Party Pack (Feeds 4)", desc: "4 Smash Burgers + 2 Loaded Bowls + 4 Cold Beverages. Perfect for 4 people!", price: 899, image: kaivuMacBurger, category: "Combos", tag: "Party Pack", rating: 4.9 },
  { id: "mega-pack-feeds-6", name: "Mega Party Pack (Feeds 6)", desc: "6 Smash Burgers + 3 Hot Bird Tenders (6pc) + 6 Cold Beverages + Large Fries. Feeds 6 people!", price: 1299, image: kaivuCluckBurger, category: "Combos", tag: "Best Value", rating: 5.0 },
  { id: "ultimate-feast-feeds-8", name: "Ultimate Feast Pack (Feeds 8)", desc: "8 Smash Burgers + 4 Loaded Bowls + 2 Tenders Boxes + 8 Cold Beverages. Grand feast for 8 people!", price: 1699, image: kaivuLoadedBowl, category: "Combos", tag: "Grand Feast", rating: 5.0 },
];

export const categories = ["All", "Burgers", "Burrito", "Sides", "Drinks", "Combos"] as const;
