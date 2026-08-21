/**
 * Client-safe Cloudinary URL formatting and optimization helpers.
 * This file contains no Node.js dependencies and can safely be imported into Client and Server components.
 */

/**
 * Generate an auto-optimized, auto-formatted Cloudinary image URL.
 * Automatically serves WebP/AVIF based on browser support and compresses optimally.
 */
export function getOptimizedImageUrl(
  publicIdOrUrl: string,
  options: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string | number;
    format?: string;
  } = {}
): string {
  if (!publicIdOrUrl) return "";

  // If already a full Cloudinary URL with transformations or remote URL
  if (publicIdOrUrl.startsWith("http://") || publicIdOrUrl.startsWith("https://")) {
    if (publicIdOrUrl.includes("res.cloudinary.com") && !publicIdOrUrl.includes("/f_auto,q_auto/")) {
      return publicIdOrUrl.replace("/upload/", "/upload/f_auto,q_auto/");
    }
    return publicIdOrUrl;
  }

  // If it's a relative local path (/images/...), return as is
  if (publicIdOrUrl.startsWith("/")) {
    return publicIdOrUrl;
  }

  const cloudName =
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME || "gohdctov";

  if (!cloudName) {
    return publicIdOrUrl;
  }

  const { width, height, crop = "fill", quality = "auto", format = "auto" } = options;
  const transforms = [`f_${format}`, `q_${quality}`];

  if (width) transforms.push(`w_${width}`);
  if (height) transforms.push(`h_${height}`);
  if (width || height) transforms.push(`c_${crop}`);

  return `https://res.cloudinary.com/${cloudName}/image/upload/${transforms.join(",")}/${publicIdOrUrl}`;
}

/**
 * Generate an optimized Cloudinary video streaming URL.
 */
export function getOptimizedVideoUrl(
  publicIdOrUrl: string,
  options: {
    quality?: string | number;
    format?: string;
  } = {}
): string {
  if (!publicIdOrUrl) return "";

  if (publicIdOrUrl.startsWith("http://") || publicIdOrUrl.startsWith("https://")) {
    if (publicIdOrUrl.includes("res.cloudinary.com") && !publicIdOrUrl.includes("/vc_auto,q_auto/")) {
      return publicIdOrUrl.replace("/upload/", "/upload/vc_auto,q_auto/");
    }
    return publicIdOrUrl;
  }

  if (publicIdOrUrl.startsWith("/")) {
    return publicIdOrUrl;
  }

  const cloudName =
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME || "gohdctov";

  if (!cloudName) {
    return publicIdOrUrl;
  }

  const { quality = "auto", format = "auto" } = options;
  return `https://res.cloudinary.com/${cloudName}/video/upload/vc_${format},q_${quality}/${publicIdOrUrl}`;
}
