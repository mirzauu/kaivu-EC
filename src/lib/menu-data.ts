import burgerClassic from "@/assets/burger-classic.jpg";
import burgerSpicy from "@/assets/burger-spicy.jpg";
import burgerBacon from "@/assets/burger-bacon.jpg";
import fries from "@/assets/fries.jpg";
import shake from "@/assets/shake.jpg";

export type MenuItem = {
  id: string;
  name: string;
  desc: string;
  price: number;
  image: any;
  category: "Burgers" | "Sides" | "Drinks" | "Combos";
  tag?: string;
  rating: number;
};

export const menu: MenuItem[] = [
  { id: "buffalo-flamin-hot", name: "Buffalo Flami'n Hot", desc: "Crispy chicken glazed in bold buffalo heat, cooled down with ranch and finished with fresh crunch", price: 260, image: burgerSpicy, category: "Burgers", tag: "Spicy", rating: 4.8 },
  { id: "nashville-fried", name: "Nashville Fried & Creamy Slaw", desc: "Nashville-spiced fried chicken layered with creamy slaw, roasted garlic aioli and a touch of tang.", price: 240, image: burgerSpicy, category: "Burgers", tag: "New", rating: 4.7 },
  { id: "smoky-bbq-comfort", name: "Smoky BBQ Comfort", desc: "Flame-grilled chicken, smoky honey BBQ, crispy onions and melted cheese on a toasted potato bun.", price: 210, image: burgerBacon, category: "Burgers", rating: 4.6 },
  { id: "the-smashed", name: "The Smashed", desc: "Double smashed beef, melted cheese, grilled onions and pickled tang. Nothing extra. Nothing missing.", price: 330, image: burgerClassic, category: "Burgers", tag: "Bestseller", rating: 4.9 },
  { id: "shroomland", name: "Shroomland", desc: "Juicy beef, melted cheese and rich mushroom demi-glace inspired by old-school steakhouse flavours.", price: 390, image: burgerClassic, category: "Burgers", rating: 4.8 },
  { id: "smoke-jam", name: "Smoke & Jam", desc: "Double smashed beef loaded with bacon jam, caramelized onions, melted cheese and smoky indulgence", price: 360, image: burgerBacon, category: "Burgers", rating: 4.9 },
  { id: "golden-fries", name: "Golden Fries", desc: "Hand-cut, sea salt, rosemary", price: 120, image: fries, category: "Sides", rating: 4.6 },
  { id: "choco-shake", name: "Choco Velvet Shake", desc: "Belgian chocolate, whipped cream", price: 150, image: shake, category: "Drinks", rating: 4.8 },
];

export const categories = ["All", "Burgers", "Sides", "Drinks", "Combos"] as const;
