import { v2 as cloudinary } from "cloudinary";
import { getSession } from "@/lib/session";

// The browser uploads the file straight to Cloudinary.
// This route only hands out a short-lived signature, so the API secret never leaves the server.
const ALLOWED_FOLDERS = ["destinations", "places", "packages", "experiences", "blogs", "team", "general", "library"];

export async function POST(req: Request) {
  if (!(await getSession())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const sub = ALLOWED_FOLDERS.includes(body.folder) ? body.folder : "general";
  const folder = `myyatracircle/${sub}`;
  const timestamp = Math.round(Date.now() / 1000);

  const signature = cloudinary.utils.api_sign_request({ timestamp, folder }, process.env.CLOUDINARY_API_SECRET!);

  return Response.json({
    signature,
    timestamp,
    folder,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  });
}
