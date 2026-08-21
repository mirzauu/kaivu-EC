import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary server-side instance
if (
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

/**
 * Check if Cloudinary credentials are fully configured.
 */
export function isCloudinaryConfigured(): boolean {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
}

export type UploadOptions = {
  folder?: string;
  publicId?: string;
  resourceType?: "image" | "video" | "auto" | "raw";
  tags?: string[];
  transformation?: any[];
};

export type UploadResult = {
  success: boolean;
  url: string;
  secureUrl: string;
  publicId: string;
  format: string;
  resourceType: string;
  bytes: number;
  width?: number;
  height?: number;
  duration?: number;
  error?: string;
};

/**
 * Upload an image, video, or data buffer to Cloudinary (Server-side only).
 */
export async function uploadToCloudinary(
  file: string | Buffer,
  options: UploadOptions = {}
): Promise<UploadResult> {
  if (!isCloudinaryConfigured()) {
    throw new Error(
      "Cloudinary credentials missing. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your .env file."
    );
  }

  const {
    folder = "kaivu/menu",
    publicId,
    resourceType = "auto",
    tags = ["kaivu-product"],
    transformation,
  } = options;

  try {
    if (typeof file === "string") {
      const result = await cloudinary.uploader.upload(file, {
        folder,
        public_id: publicId,
        resource_type: resourceType,
        tags,
        transformation,
      });

      return {
        success: true,
        url: result.url,
        secureUrl: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        resourceType: result.resource_type,
        bytes: result.bytes,
        width: result.width,
        height: result.height,
        duration: result.duration,
      };
    } else {
      // Buffer upload via upload_stream
      return new Promise<UploadResult>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder,
            public_id: publicId,
            resource_type: resourceType,
            tags,
            transformation,
          },
          (error, result) => {
            if (error || !result) {
              return reject(error || new Error("Failed to upload stream to Cloudinary"));
            }
            resolve({
              success: true,
              url: result.url,
              secureUrl: result.secure_url,
              publicId: result.public_id,
              format: result.format,
              resourceType: result.resource_type,
              bytes: result.bytes,
              width: result.width,
              height: result.height,
              duration: result.duration,
            });
          }
        );
        stream.end(file);
      });
    }
  } catch (error: any) {
    console.error("Cloudinary upload error:", error);
    return {
      success: false,
      url: "",
      secureUrl: "",
      publicId: "",
      format: "",
      resourceType: "",
      bytes: 0,
      error: error?.message || "Upload failed",
    };
  }
}

export { cloudinary };
