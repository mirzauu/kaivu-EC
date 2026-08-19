import burgerClassic from "@/assets/burger-classic.jpg";
import burgerSpicy from "@/assets/burger-spicy.jpg";
import burgerBacon from "@/assets/burger-bacon.jpg";
import fries from "@/assets/fries.jpg";
import shake from "@/assets/shake.jpg";

export type MenuItem = {
  id: string;
  name: string;
  desc: string;
  description?: string;
  price: number;
  image: any;
  category: "Burgers" | "Sides" | "Drinks" | "Combos";
  tag?: string;
  badge?: string;
  rating: number;
};

export const menu: MenuItem[] = [
  { id: "og-smash-beef", name: "OG Smash (Beef)", desc: "Classic beef smash burger", price: 210, image: burgerClassic, category: "Burgers", tag: "Bestseller", rating: 4.8 },
  { id: "classic-smash-burger-beef", name: "Classic Smash Burger (Beef)", desc: "Classic-style beef smash burger", price: 320, image: burgerClassic, category: "Burgers", rating: 4.7 },
  { id: "jalapeno-jam-beef", name: "Jalapeño Jam (Beef)", desc: "Beef smash burger with jalapeño jam", price: 220, image: burgerSpicy, category: "Burgers", tag: "Spicy", rating: 4.9 },
  { id: "the-dirty-shroom-beef", name: "The Dirty Shroom (Beef)", desc: "Beef burger featuring mushrooms", price: 340, image: burgerBacon, category: "Burgers", rating: 4.8 },
  { id: "nashville-cluck-chicken", name: "Nashville Cluck (Chicken)", desc: "Nashville-style chicken burger", price: 210, image: burgerSpicy, category: "Burgers", tag: "Spicy", rating: 4.7 },
  { id: "mac-and-rooster-chicken", name: "Mac & Rooster (Chicken)", desc: "Chicken burger with mac & cheese", price: 240, image: burgerClassic, category: "Burgers", rating: 4.8 },
  { id: "hot-bird-tenders-box-of-4", name: "Hot Bird Tenders — Box of 4", desc: "4 pieces of hot chicken tenders", price: 270, image: burgerSpicy, category: "Sides", tag: "Spicy", rating: 4.8 },
  { id: "hot-bird-tenders-box-of-6", name: "Hot Bird Tenders — Box of 6", desc: "6 pieces of hot chicken tenders", price: 380, image: burgerSpicy, category: "Sides", tag: "Spicy", rating: 4.9 },
  { id: "honey-hot-bird-tenders-4", name: "Honey Hot Bird Tenders — 4", desc: "4 pieces of chicken tenders with honey", price: 390, image: burgerSpicy, category: "Sides", rating: 4.9 },
  { id: "honey-hot-bird-tenders-6", name: "Honey Hot Bird Tenders — 6", desc: "6 pieces of chicken tenders with honey", price: 520, image: burgerSpicy, category: "Sides", tag: "Bestseller", rating: 5.0 },
  { id: "nashville-loaded", name: "Nashville Loaded", desc: "Nashville-style loaded dish", price: 230, image: fries, category: "Sides", tag: "Spicy", rating: 4.7 },
  { id: "beef-loaded", name: "Beef Loaded", desc: "Beef loaded dish", price: 240, image: fries, category: "Sides", rating: 4.8 },
  { id: "mac-and-cheese", name: "Mac & Cheese", desc: "Creamy mac & cheese", price: 215, image: fries, category: "Sides", rating: 4.6 },
];

export const categories = ["All", "Burgers", "Sides", "Drinks", "Combos"] as const;
