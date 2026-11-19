// ---------------------------------------------------------------------------
// Zino One — File Upload Validation & Storage (§12)
// Local public/uploads/ in dev; S3-compatible when S3_BUCKET is set.
// Resizes product/room images to max 1600px wide WebP via sharp.
// ---------------------------------------------------------------------------

import crypto from "crypto";
import path from "path";
import fs from "fs/promises";
import { ValidationError } from "./errors";
import { getEnv } from "./env";
import { logger } from "./logger";

const ALLOWED_PURPOSES = ["products", "rooms", "receipts", "avatars", "imports"] as const;
export type UploadPurpose = (typeof ALLOWED_PURPOSES)[number];

const IMAGE_MIMES = new Set(["image/jpeg", "image/png", "image/webp"]);
const DOC_MIMES = new Set(["application/pdf", "text/csv", "application/vnd.ms-excel"]);

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB
const MAX_DOC_BYTES = 10 * 1024 * 1024; // 10 MB

export interface UploadResult {
  url: string;
  key: string;
  size: number;
  mimeType: string;
}

export async function handleFileUpload(
  file: File,
  purposeRaw: string
): Promise<UploadResult> {
  const purpose: UploadPurpose = ALLOWED_PURPOSES.includes(purposeRaw as UploadPurpose)
    ? (purposeRaw as UploadPurpose)
    : "receipts";

  const mime = file.type || "application/octet-stream";
  const isImage = IMAGE_MIMES.has(mime);
  const isDoc = DOC_MIMES.has(mime) || (purpose === "imports" && file.name.endsWith(".csv"));

  if (purpose === "products" || purpose === "rooms" || purpose === "avatars") {
    if (!isImage) {
      throw new ValidationError("Only JPG, PNG, or WebP images are allowed for this upload");
    }
  } else if (purpose === "receipts") {
    if (!isImage && mime !== "application/pdf") {
      throw new ValidationError("Receipts must be JPG, PNG, WebP, or PDF");
    }
  } else if (purpose === "imports") {
    if (!isDoc) {
      throw new ValidationError("Import files must be CSV");
    }
  }

  const maxBytes = isImage ? MAX_IMAGE_BYTES : MAX_DOC_BYTES;
  if (file.size > maxBytes) {
    throw new ValidationError(
      `File too large. Maximum allowed size is ${Math.round(maxBytes / (1024 * 1024))}MB`
    );
  }

  let buffer: Buffer = Buffer.from(await file.arrayBuffer());
  let finalMime = mime;
  let ext = mime === "image/png" ? "png" : mime === "image/webp" ? "webp" : mime === "application/pdf" ? "pdf" : purpose === "imports" ? "csv" : "jpg";

  // Resize product/room images to max 1600px wide WebP (§12)
  if (isImage && (purpose === "products" || purpose === "rooms")) {
    try {
      const sharp = (await import("sharp")).default;
      buffer = await sharp(buffer)
        .resize({ width: 1600, withoutEnlargement: true })
        .webp({ quality: 82 })
        .toBuffer();
      finalMime = "image/webp";
      ext = "webp";
    } catch (err) {
      logger.warn({ err: (err as Error).message }, "sharp resize skipped; saving original image");
    }
  }

  const filename = `${crypto.randomUUID()}.${ext}`;
  const key = `${purpose}/${filename}`;
  const env = getEnv();

  if (env.S3_BUCKET && env.S3_ENDPOINT) {
    // S3-compatible PUT upload (no extra SDK required)
    const uploadUrl = `${env.S3_ENDPOINT.replace(/\/$/, "")}/${env.S3_BUCKET}/${key}`;
    const res = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": finalMime,
      },
      body: new Uint8Array(buffer),
    });
    if (!res.ok) {
      logger.warn({ status: res.status }, "S3 upload failed; falling back to local disk");
    } else {
      const publicBase = env.S3_PUBLIC_URL || `${env.S3_ENDPOINT.replace(/\/$/, "")}/${env.S3_BUCKET}`;
      return {
        url: `${publicBase.replace(/\/$/, "")}/${key}`,
        key,
        size: buffer.length,
        mimeType: finalMime,
      };
    }
  }

  const destDir = path.join(process.cwd(), "public", "uploads", purpose);
  await fs.mkdir(destDir, { recursive: true });
  await fs.writeFile(path.join(destDir, filename), buffer);

  return {
    url: `/uploads/${key}`,
    key,
    size: buffer.length,
    mimeType: finalMime,
  };
}
