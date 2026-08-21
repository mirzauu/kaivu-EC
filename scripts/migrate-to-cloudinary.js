const fs = require("fs");
const path = require("path");
const { v2: cloudinary } = require("cloudinary");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  console.error("❌ Cloudinary credentials not found in .env.");
  console.error("Please add the following to your .env file:");
  console.error("  CLOUDINARY_CLOUD_NAME=your_cloud_name");
  console.error("  CLOUDINARY_API_KEY=your_api_key");
  console.error("  CLOUDINARY_API_SECRET=your_api_secret");
  process.exit(1);
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
});

const publicDir = path.join(__dirname, "../public");
const imagesMenuDir = path.join(publicDir, "images/menu");
const videosDir = path.join(publicDir, "video");
const outputFile = path.join(__dirname, "../src/lib/cloudinary-assets.json");

async function uploadFile(filePath, folder, resourceType = "auto") {
  const fileName = path.basename(filePath, path.extname(filePath));
  // Clean filename for publicId
  const cleanId = fileName.replace(/[^a-zA-Z0-9-_]/g, "_");

  try {
    const res = await cloudinary.uploader.upload(filePath, {
      folder: `kaivu/${folder}`,
      public_id: cleanId,
      resource_type: resourceType,
      overwrite: true,
      tags: ["kaivu", folder],
    });
    console.log(`✅ Uploaded [${folder}]: ${path.basename(filePath)} -> ${res.secure_url}`);
    return {
      localPath: `/${path.relative(publicDir, filePath).replace(/\\/g, "/")}`,
      fileName: path.basename(filePath),
      publicId: res.public_id,
      secureUrl: res.secure_url,
      format: res.format,
      bytes: res.bytes,
      resourceType: res.resource_type,
    };
  } catch (err) {
    console.error(`❌ Failed to upload ${filePath}:`, err.message);
    return null;
  }
}

async function run() {
  console.log("🚀 Starting Cloudinary Media Migration for Kaivu...");
  console.log(`Account: ${cloudName}\n`);

  const results = {
    cloudName,
    uploadedAt: new Date().toISOString(),
    menuImages: {},
    videos: {},
  };

  // 1. Upload Menu Images
  if (fs.existsSync(imagesMenuDir)) {
    const imageFiles = fs.readdirSync(imagesMenuDir).filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f));
    console.log(`📸 Found ${imageFiles.length} menu images to upload...`);

    for (const file of imageFiles) {
      const fullPath = path.join(imagesMenuDir, file);
      const res = await uploadFile(fullPath, "menu", "image");
      if (res) {
        results.menuImages[file] = res.secureUrl;
      }
    }
  }

  // 2. Upload Product Videos
  if (fs.existsSync(videosDir)) {
    const videoFiles = fs.readdirSync(videosDir).filter((f) => /\.(mp4|webm|mov)$/i.test(f));
    console.log(`\n🎥 Found ${videoFiles.length} product videos to upload...`);

    for (const file of videoFiles) {
      const fullPath = path.join(videosDir, file);
      const res = await uploadFile(fullPath, "videos", "video");
      if (res) {
        results.videos[file] = res.secureUrl;
      }
    }
  }

  // Write mapping JSON
  fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));
  console.log(`\n🎉 Migration finished! Asset mappings saved to:\n  ${outputFile}`);
}

run().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
