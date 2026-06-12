export interface UploadedMediaAsset {
  publicId: string;
  secureUrl: string;
  bytes: number;
  format: string;
  originalFilename: string;
  resourceType: string;
}

interface CloudinarySignaturePayload {
  apiKey: string;
  cloudName: string;
  folder: string;
  signature: string;
  timestamp: number;
}

const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const VIDEO_TYPES = new Set(["video/mp4", "video/quicktime", "video/x-msvideo"]);
const DOCUMENT_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "text/csv",
  "application/zip",
  "application/x-zip-compressed",
  "application/vnd.rar",
]);
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const MAX_VIDEO_SIZE_BYTES = 50 * 1024 * 1024;
const MAX_DOCUMENT_SIZE_BYTES = 25 * 1024 * 1024;
const MAX_IMAGE_COUNT = 5;
const MAX_VIDEO_COUNT = 3;
const MAX_DOCUMENT_COUNT = 10;

export const cloudinarySetupHint =
  "Add Cloudinary credentials to .env.local to enable image and video uploads.";

export function validateMediaSelection(source: FileList | File[]) {
  const files = Array.from(source);
  const images = files.filter((file) => IMAGE_TYPES.has(file.type));
  const videos = files.filter((file) => VIDEO_TYPES.has(file.type));
  const documents = files.filter((file) => DOCUMENT_TYPES.has(file.type));
  const unsupported = files.filter(
    (file) => !IMAGE_TYPES.has(file.type) && !VIDEO_TYPES.has(file.type) && !DOCUMENT_TYPES.has(file.type),
  );
  const errors: string[] = [];

  if (images.length > MAX_IMAGE_COUNT) {
    errors.push(`You can upload at most ${MAX_IMAGE_COUNT} images.`);
  }

  if (videos.length > MAX_VIDEO_COUNT) {
    errors.push(`You can upload at most ${MAX_VIDEO_COUNT} videos.`);
  }

  if (documents.length > MAX_DOCUMENT_COUNT) {
    errors.push(`You can upload at most ${MAX_DOCUMENT_COUNT} document files.`);
  }

  if (unsupported.length > 0) {
    errors.push("Only images, MP4/QuickTime/AVI videos, PDF, Word, Excel, PowerPoint, text, CSV, and ZIP files are supported.");
  }

  if (images.some((file) => file.size > MAX_IMAGE_SIZE_BYTES)) {
    errors.push("Each image must be 5MB or smaller.");
  }

  if (videos.some((file) => file.size > MAX_VIDEO_SIZE_BYTES)) {
    errors.push("Each video must be 50MB or smaller.");
  }

  if (documents.some((file) => file.size > MAX_DOCUMENT_SIZE_BYTES)) {
    errors.push("Each document must be 25MB or smaller.");
  }

  return {
    files,
    images,
    videos,
    documents,
    errors,
    valid: errors.length === 0,
  };
}

export async function uploadFilesToCloudinary(files: File[]) {
  if (files.length === 0) {
    return [] satisfies UploadedMediaAsset[];
  }

  const signatureResponse = await fetch("/api/cloudinary/sign", {
    method: "POST",
  });

  if (!signatureResponse.ok) {
    throw new Error(cloudinarySetupHint);
  }

  const signaturePayload =
    (await signatureResponse.json()) as CloudinarySignaturePayload;

  return Promise.all(
    files.map(async (file) => {
      const formData = new FormData();

      formData.append("file", file);
      formData.append("api_key", signaturePayload.apiKey);
      formData.append("timestamp", String(signaturePayload.timestamp));
      formData.append("signature", signaturePayload.signature);
      formData.append("folder", signaturePayload.folder);

      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${signaturePayload.cloudName}/auto/upload`,
        {
          method: "POST",
          body: formData,
        },
      );

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();

        throw new Error(errorText || "Cloudinary upload failed.");
      }

      const payload = await uploadResponse.json();

      return {
        publicId: payload.public_id,
        secureUrl: payload.secure_url,
        bytes: payload.bytes,
        format: payload.format,
        originalFilename: payload.original_filename,
        resourceType: payload.resource_type,
      } satisfies UploadedMediaAsset;
    }),
  );
}