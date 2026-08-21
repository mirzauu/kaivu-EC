import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getImageUrl(image: any): string {
  if (!image) return "";
  let src = typeof image === "object" && image.src ? image.src : String(image);

  // Auto-optimize Cloudinary URLs with f_auto,q_auto if not already specified
  if (
    typeof src === "string" &&
    src.includes("res.cloudinary.com") &&
    src.includes("/upload/") &&
    !src.includes("/f_auto")
  ) {
    src = src.replace("/upload/", "/upload/f_auto,q_auto/");
  }

  return src;
}
