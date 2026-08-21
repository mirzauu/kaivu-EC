import { NextResponse } from "next/server";
import { apiError, apiSuccess } from "@/lib/api-utils";
import { withAdmin, type AuthenticatedRequest } from "@/lib/auth/middleware";
import { uploadToCloudinary, isCloudinaryConfigured } from "@/lib/cloudinary-server";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/upload
 * Upload media directly to Cloudinary (Admin only).
 * Accepts multipart/form-data with `file`, `folder`, `resourceType`, `publicId`
 * OR JSON with `dataUrl` / `url`.
 */
export const POST = withAdmin(async (req: AuthenticatedRequest) => {
  try {
    if (!isCloudinaryConfigured()) {
      return NextResponse.json(
        apiError(
          "Cloudinary credentials are not configured. Please add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to your .env file."
        ),
        { status: 400 }
      );
    }

    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      const folder = (formData.get("folder") as string) || "kaivu/menu";
      const resourceType = (formData.get("resourceType") as "image" | "video" | "auto") || "auto";
      const publicId = (formData.get("publicId") as string) || undefined;

      if (!file) {
        return NextResponse.json(apiError("No file provided in form data"), { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const result = await uploadToCloudinary(buffer, {
        folder,
        publicId,
        resourceType,
      });

      if (!result.success) {
        return NextResponse.json(apiError(result.error || "Failed to upload to Cloudinary"), { status: 500 });
      }

      return NextResponse.json(apiSuccess(result));
    } else {
      // JSON body
      const body = await req.json();
      const { file, folder = "kaivu/menu", resourceType = "auto", publicId } = body;

      if (!file) {
        return NextResponse.json(apiError("File string (base64 or URL) is required"), { status: 400 });
      }

      const result = await uploadToCloudinary(file, {
        folder,
        publicId,
        resourceType,
      });

      if (!result.success) {
        return NextResponse.json(apiError(result.error || "Failed to upload to Cloudinary"), { status: 500 });
      }

      return NextResponse.json(apiSuccess(result));
    }
  } catch (error: any) {
    console.error("Admin media upload error:", error);
    return NextResponse.json(
      apiError(error?.message || "Internal error uploading media to Cloudinary"),
      { status: 500 }
    );
  }
});
