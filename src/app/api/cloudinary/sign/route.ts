import crypto from "node:crypto";
import { NextResponse } from "next/server";

export async function POST() {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const folder = process.env.CLOUDINARY_UPLOAD_FOLDER ?? "to-link";

  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json(
      {
        error: "Cloudinary is not configured.",
      },
      {
        status: 503,
      },
    );
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const parameterString = [`folder=${folder}`, `timestamp=${timestamp}`].join("&");
  const signature = crypto
    .createHash("sha1")
    .update(`${parameterString}${apiSecret}`)
    .digest("hex");

  return NextResponse.json({
    apiKey,
    cloudName,
    folder,
    signature,
    timestamp,
  });
}