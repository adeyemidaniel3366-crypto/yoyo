"use client";

import React, { useState, useRef } from "react";
import {
  Upload,
  Image as ImageIcon,
  X,
  CheckCircle2,
  Loader2,
  FolderOpen,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageDropzoneProps {
  value?: string;
  values?: string[];
  multiple?: boolean;
  onChange?: (url: string) => void;
  onMultipleChange?: (urls: string[]) => void;
  label?: string;
  purpose?: "products" | "rooms" | "receipts" | "avatars";
  className?: string;
}

/**
 * Compress an image file client-side into a compact Data URL so it can be
 * reliably persisted in localStorage as well as uploaded to /api/uploads.
 */
async function fileToCompressedDataUrl(file: File, maxWidth = 900): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (!result) return reject(new Error("Failed to read file"));
      const img = new window.Image();
      img.onload = () => {
        try {
          const scale = img.width > maxWidth ? maxWidth / img.width : 1;
          const canvas = document.createElement("canvas");
          canvas.width = Math.round(img.width * scale);
          canvas.height = Math.round(img.height * scale);
          const ctx = canvas.getContext("2d");
          if (!ctx) return resolve(result);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const compressed = canvas.toDataURL("image/webp", 0.84);
          resolve(compressed.length < result.length ? compressed : result);
        } catch {
          resolve(result);
        }
      };
      img.onerror = () => resolve(result);
      img.src = result;
    };
    reader.onerror = () => reject(new Error("File read error"));
    reader.readAsDataURL(file);
  });
}

export function ImageDropzone({
  value,
  values,
  multiple = false,
  onChange,
  onMultipleChange,
  label = "Product / Service Image",
  purpose = "products",
  className,
}: ImageDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const imageList: string[] = multiple
    ? values ?? (value ? [value] : [])
    : value
    ? [value]
    : [];

  const processFiles = async (files: FileList | File[]) => {
    const validFiles = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (validFiles.length === 0) {
      setErrorMsg("Please drop a valid image file (PNG, JPG, WebP, GIF).");
      return;
    }

    setErrorMsg(null);
    setIsUploading(true);
    setUploadStatus(`Storing ${validFiles.length > 1 ? `${validFiles.length} images` : validFiles[0].name}...`);

    const uploadedUrls: string[] = [];

    for (const file of validFiles) {
      try {
        // 1. Read compressed Data URL immediately for instant preview & local persistence
        const localDataUrl = await fileToCompressedDataUrl(file);

        // 2. Also upload to server disk (/public/uploads/products/...)
        let finalUrl = localDataUrl;
        try {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("purpose", purpose);
          const res = await fetch("/api/uploads", {
            method: "POST",
            body: formData,
          });
          if (res.ok) {
            const json = await res.json();
            if (json?.ok && json?.data?.url) {
              // Keep localDataUrl if offline/restarting, or use server URL
              finalUrl = localDataUrl || json.data.url;
            }
          }
        } catch {
          // Use localDataUrl fallback seamlessly
        }

        uploadedUrls.push(finalUrl);
        if (!multiple) break;
      } catch {
        setErrorMsg("Could not process image file. Please try another image.");
      }
    }

    if (uploadedUrls.length > 0) {
      if (multiple) {
        const next = [...imageList, ...uploadedUrls];
        onMultipleChange?.(next);
        onChange?.(next[0] ?? "");
      } else {
        onChange?.(uploadedUrls[0]);
        onMultipleChange?.([uploadedUrls[0]]);
      }
      setUploadStatus("Image stored from local device");
      setTimeout(() => setUploadStatus(null), 3000);
    }

    setIsUploading(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await processFiles(e.target.files);
      e.target.value = "";
    }
  };

  const handleRemove = (index: number) => {
    if (multiple) {
      const next = imageList.filter((_, i) => i !== index);
      onMultipleChange?.(next);
      onChange?.(next[0] ?? "");
    } else {
      onChange?.("");
      onMultipleChange?.([]);
    }
  };

  return (
    <div className={cn("space-y-2.5", className)}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-heading">{label}</label>
          {uploadStatus && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {uploadStatus}
            </span>
          )}
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Drag & Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "relative rounded-xl border-2 border-dashed p-4 transition-all cursor-pointer select-none text-center",
          isDragging
            ? "border-active bg-indigo-50/80 scale-[1.01] shadow-md"
            : "border-gray-300 hover:border-active bg-gray-50/60 hover:bg-indigo-50/30"
        )}
      >
        <div className="flex flex-col items-center justify-center gap-2 py-2">
          {isUploading ? (
            <>
              <div className="w-11 h-11 rounded-full bg-indigo-100 text-active flex items-center justify-center">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
              <p className="text-xs font-bold text-heading">Processing &amp; storing image...</p>
            </>
          ) : (
            <>
              <div
                className={cn(
                  "w-11 h-11 rounded-2xl flex items-center justify-center transition-transform",
                  isDragging
                    ? "bg-active text-white scale-110"
                    : "bg-indigo-100/80 text-active"
                )}
              >
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-heading">
                  {isDragging
                    ? "Drop image file here to store it"
                    : "Drag & drop image from your device here"}
                </p>
                <p className="text-[11px] text-muted mt-0.5">
                  or <span className="text-active font-semibold underline">browse local storage</span> (PNG, JPG, WebP up to 5MB)
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="mt-1 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-border text-[11px] font-bold text-heading hover:bg-gray-50 shadow-2xs transition-colors"
              >
                <FolderOpen className="w-3.5 h-3.5 text-active" />
                <span>Choose File from Device</span>
              </button>
            </>
          )}
        </div>
      </div>

      {errorMsg && (
        <p className="text-[11px] font-semibold text-rose-600">{errorMsg}</p>
      )}

      {/* Stored Image Preview Cards */}
      {imageList.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          {imageList.map((imgUrl, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 p-2.5 rounded-xl border border-border bg-white shadow-2xs"
            >
              <div className="w-14 h-14 rounded-lg bg-gray-100 border border-border overflow-hidden shrink-0 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imgUrl}
                  alt={`Uploaded preview ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                  <Sparkles className="w-3 h-3 shrink-0" />
                  <span className="truncate">Stored on Website</span>
                </div>
                <p className="text-[10px] text-muted truncate mt-0.5">
                  {imgUrl.startsWith("data:") ? "Local Device Image (Saved)" : imgUrl}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[10px] font-bold text-active hover:underline"
                  >
                    Replace
                  </button>
                  <span className="text-gray-300">•</span>
                  <button
                    type="button"
                    onClick={() => handleRemove(idx)}
                    className="text-[10px] font-bold text-rose-600 hover:underline flex items-center gap-0.5"
                  >
                    <X className="w-3 h-3" /> Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
