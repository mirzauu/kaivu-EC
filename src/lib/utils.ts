import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getImageUrl(image: any): string {
  if (!image) return "";
  if (typeof image === "object" && image.src) return image.src;
  return String(image);
}
