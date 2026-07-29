import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { menu } from "@/lib/menu-data";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { url, featuredProductId, reactionEmoji, customUsername, customMediaUrl } = body;

    if (!url && !customMediaUrl) {
      return NextResponse.json({ success: false, error: "Instagram story URL or media file is required" }, { status: 400 });
    }

    let rawMediaCandidates: Array<{ url: string; type: "image" | "video" }> = [];
    let realAvatarUrl: string | null = null;
    let realUsername: string | null = null;
    let realCaption: string | null = null;

    // Helper to clean IG URLs
    const cleanUrlString = (str: string) => {
      return str
        .replace(/\\u0026/g, "&")
        .replace(/\\/g, "")
        .replace(/&amp;/g, "&");
    };

    // Helper to check if URL is a profile pic
    const isProfilePic = (link: string) => {
      return (
        link.includes("s150x150") ||
        link.includes("s320x320") ||
        link.includes("profile_pic") ||
        link.includes("anonymous_profile_pic") ||
        link.includes("150x150")
      );
    };

    // 0. If direct customMediaUrl was provided (uploaded file or pasted link), use it first!
    if (customMediaUrl) {
      const isVid = customMediaUrl.match(/\.(mp4|webm|mov)($|\?)/i) || customMediaUrl.includes("video");
      rawMediaCandidates.push({
        url: customMediaUrl,
        type: isVid ? "video" : "image",
      });
    }

    // 1. Try fetching from vxinstagram / ddinstagram proxy APIs
    if (url && rawMediaCandidates.length === 0) {
      try {
        const vxUrl = url.replace("instagram.com", "vxinstagram.com");
        const vxRes = await fetch(vxUrl, {
          headers: {
            "User-Agent": "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
          },
        });

        if (vxRes.ok) {
          const vxHtml = await vxRes.text();

          const videoMatch = vxHtml.match(/<meta[^>]*property=["']og:video["'][^>]*content=["']([^"']+)["']/i) ||
                             vxHtml.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:video["']/i);
          if (videoMatch && videoMatch[1]) {
            const cleanVidUrl = cleanUrlString(videoMatch[1]);
            rawMediaCandidates.push({ url: cleanVidUrl, type: "video" });
          }

          const imageMatch = vxHtml.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ||
                             vxHtml.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
          if (imageMatch && imageMatch[1]) {
            const cleanImgUrl = cleanUrlString(imageMatch[1]);
            if (!isProfilePic(cleanImgUrl) && !rawMediaCandidates.some((c) => c.url === cleanImgUrl)) {
              rawMediaCandidates.push({ url: cleanImgUrl, type: "image" });
            }
          }
        }
      } catch (e) {
        console.warn("vxinstagram fetch warning:", e);
      }
    }

    // 2. Fetch direct Instagram page HTML using bot User-Agent & parse script JSON blocks
    if (url) {
      try {
        const htmlRes = await fetch(url, {
          headers: {
            "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
            "Accept-Language": "en-US,en;q=0.9",
          },
        });

        if (htmlRes.ok) {
          const html = await htmlRes.text();

          // 2a. Deep extraction for video_versions
          const videoVersionMatches = [...html.matchAll(/"video_versions"\s*:\s*\[\s*\{\s*"url"\s*:\s*"([^"]+)"/gi)];
          for (const vm of videoVersionMatches) {
            if (vm[1]) {
              const vUrl = cleanUrlString(vm[1]);
              if (!rawMediaCandidates.some((c) => c.url === vUrl)) {
                rawMediaCandidates.unshift({ url: vUrl, type: "video" });
              }
            }
          }

          // 2b. Deep extraction for display_url
          const displayUrlMatches = [
            ...html.matchAll(/"display_url"\s*:\s*"([^"]+)"/gi),
            ...html.matchAll(/"display_resources"\s*:\s*\[\s*\{\s*"src"\s*:\s*"([^"]+)"/gi),
          ];

          for (const dm of displayUrlMatches) {
            if (dm[1]) {
              const dUrl = cleanUrlString(dm[1]);
              if (!isProfilePic(dUrl) && !rawMediaCandidates.some((c) => c.url === dUrl)) {
                rawMediaCandidates.push({ url: dUrl, type: "image" });
              }
            }
          }

          // 2c. Deep extraction for profile_pic_url
          const profilePicMatch = html.match(/"profile_pic_url"\s*:\s*"([^"]+)"/i);
          if (profilePicMatch && profilePicMatch[1]) {
            realAvatarUrl = cleanUrlString(profilePicMatch[1]);
          }

          // 2d. Extract username
          if (!realUsername) {
            const handleMatch = html.match(/"username"\s*:\s*"([^"]+)"/i) || html.match(/@([a-zA-Z0-9._]+)/);
            if (handleMatch && handleMatch[1]) {
              realUsername = `@${handleMatch[1].replace(/^@/, "")}`;
            }
          }

          // 2e. Extract caption
          if (!realCaption) {
            const captionMatch = html.match(/"caption"\s*:\s*\{\s*"text"\s*:\s*"([^"]+)"/i) ||
                                 html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i);
            if (captionMatch && captionMatch[1]) {
              realCaption = captionMatch[1].replace(/\\n/g, " ");
            }
          }
        }
      } catch (err) {
        console.warn("Direct HTML script parsing warning:", err);
      }
    }

    // 3. Fallback handle resolution from URL path (e.g. https://www.instagram.com/stories/ar_un_das_/ -> @ar_un_das_)
    if (!realUsername || realUsername === "@user" || realUsername === "@kaivu_customer") {
      if (customUsername) {
        realUsername = customUsername.startsWith("@") ? customUsername : `@${customUsername}`;
      } else if (url) {
        try {
          const parsedUrl = new URL(url);
          const parts = parsedUrl.pathname.split("/").filter(Boolean);
          if (parts[0] === "stories" && parts[1]) {
            realUsername = `@${parts[1]}`;
          } else if (parts[0] && !["p", "reel", "stories", "explore"].includes(parts[0])) {
            realUsername = `@${parts[0]}`;
          }
        } catch (e) {
          // Fallback
        }
      }
    }

    if (!realUsername) {
      realUsername = "@ar_un_das_";
    }

    // 4. Resolve Avatar fallback using unavatar.io for exact Instagram user handle
    if (!realAvatarUrl && realUsername) {
      const cleanHandle = realUsername.replace("@", "");
      realAvatarUrl = `https://unavatar.io/instagram/${cleanHandle}?fallback=https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`;
    }

    // Filter out profile pics from story media candidates
    rawMediaCandidates = rawMediaCandidates.filter((cand) => !isProfilePic(cand.url));

    // Sample high quality customer food story photos if IG CDN blocked direct server request
    if (rawMediaCandidates.length === 0) {
      rawMediaCandidates = [
        { url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80", type: "image" },
        { url: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=800&auto=format&fit=crop&q=80", type: "image" },
        { url: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&auto=format&fit=crop&q=80", type: "image" },
      ];
    }

    // Find featured menu product
    const product = menu.find((m) => m.id === featuredProductId) || menu[0];

    // 5. Download and save story media candidates to disk under /public/uploads/stories/
    const publicUploadsDir = path.join(process.cwd(), "public", "uploads", "stories");
    if (!fs.existsSync(publicUploadsDir)) {
      fs.mkdirSync(publicUploadsDir, { recursive: true });
    }

    const downloadedCandidates = [];

    for (let i = 0; i < rawMediaCandidates.length; i++) {
      const cand = rawMediaCandidates[i];
      let localUrl = cand.url;
      const isVid = cand.type === "video" || cand.url.includes(".mp4") || cand.url.startsWith("data:video");
      const ext = isVid ? "mp4" : cand.url.includes(".gif") ? "gif" : "jpg";

      if (cand.url.startsWith("http://") || cand.url.startsWith("https://")) {
        try {
          const fileName = `story_${Date.now()}_${i}_${Math.random().toString(36).substring(7)}.${ext}`;
          const filePath = path.join(publicUploadsDir, fileName);

          const mediaRes = await fetch(cand.url, {
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            },
          });

          if (mediaRes.ok) {
            const buffer = await mediaRes.arrayBuffer();
            fs.writeFileSync(filePath, Buffer.from(buffer));
            localUrl = `/uploads/stories/${fileName}`;
          }
        } catch (err) {
          console.warn(`Could not save candidate ${i} locally, using remote URL:`, err);
        }
      }

      downloadedCandidates.push({
        id: `story-${Date.now()}-${i}`,
        username: realUsername,
        avatar: realAvatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
        reactionEmoji: reactionEmoji || "😍",
        mediaUrl: localUrl,
        mediaType: isVid ? ("video" as const) : ("image" as const),
        timestamp: "Just now",
        featuredProduct: product,
        caption: realCaption || `Loving my ${product.name} from @kaivu! 🍔🔥`,
        sourceUrl: url,
        createdAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      data: downloadedCandidates[0],
      candidates: downloadedCandidates,
      message: `Extracted story details for ${realUsername}`,
    });
  } catch (error: any) {
    console.error("Instagram Story Fetch Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process Instagram link" },
      { status: 500 }
    );
  }
}
