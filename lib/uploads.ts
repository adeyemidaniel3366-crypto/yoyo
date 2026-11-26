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

const IMAGE_MIMES = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif", "image/svg+xml"]);
const DOC_MIMES = new Set(["application/pdf", "text/csv", "application/vnd.ms-excel"]);

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB
const MAX_DOC_BYTES = 10 * 1024 * 1024; // 10 MB

export interface UploadResult {
  url: string;
  key: string;
  size: number;
  mimeType: string;
}

function signS3PutHeaders(params: {
  url: URL;
  contentType: string;
  body: Buffer;
  accessKey: string;
  secretKey: string;
  region: string;
}): Record<string, string> {
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);
  const payloadHash = crypto.createHash("sha256").update(params.body).digest("hex");
  const host = params.url.host;

  const canonicalHeaders =
    `content-type:${params.contentType}\n` +
    `host:${host}\n` +
    `x-amz-content-sha256:${payloadHash}\n` +
    `x-amz-date:${amzDate}\n`;
  const signedHeaders = "content-type;host;x-amz-content-sha256;x-amz-date";

  const canonicalRequest = [
    "PUT",
    params.url.pathname,
    params.url.searchParams.toString(),
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join("\n");

  const algorithm = "AWS4-HMAC-SHA256";
  const credentialScope = `${dateStamp}/${params.region}/s3/aws4_request`;
  const stringToSign = [
    algorithm,
    amzDate,
    credentialScope,
    crypto.createHash("sha256").update(canonicalRequest).digest("hex"),
  ].join("\n");

  const hmac = (key: Buffer | string, data: string) =>
    crypto.createHmac("sha256", key).update(data).digest();
  const kDate = hmac(`AWS4${params.secretKey}`, dateStamp);
  const kRegion = hmac(kDate, params.region);
  const kService = hmac(kRegion, "s3");
  const kSigning = hmac(kService, "aws4_request");
  const signature = crypto.createHmac("sha256", kSigning).update(stringToSign).digest("hex");

  return {
    "Content-Type": params.contentType,
    "x-amz-content-sha256": payloadHash,
    "x-amz-date": amzDate,
    Authorization: `${algorithm} Credential=${params.accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`,
  };
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
    // S3-compatible PUT upload with AWS Signature V4 signing when credentials are provided
    const uploadUrl = `${env.S3_ENDPOINT.replace(/\/$/, "")}/${env.S3_BUCKET}/${key}`;
    const headers: Record<string, string> =
      env.S3_ACCESS_KEY && env.S3_SECRET_KEY
        ? signS3PutHeaders({
            url: new URL(uploadUrl),
            contentType: finalMime,
            body: buffer,
            accessKey: env.S3_ACCESS_KEY,
            secretKey: env.S3_SECRET_KEY,
            region: process.env.S3_REGION || "auto",
          })
        : { "Content-Type": finalMime };

    const res = await fetch(uploadUrl, {
      method: "PUT",
      headers,
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
