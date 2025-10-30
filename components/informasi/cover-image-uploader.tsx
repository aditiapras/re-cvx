"use client";

import * as React from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";

interface CoverImageUploaderProps {
  onImageUpload?: (storageId: string) => void;
  onImageRemove?: () => void;
}

export function CoverImageUploader({
  onImageUpload,
  onImageRemove,
}: CoverImageUploaderProps) {
  const generateUploadUrl = useMutation(api.informasi.generateUploadUrl);
  const [isUploading, setIsUploading] = React.useState(false);
  const [preview, setPreview] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar");
      return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("Ukuran gambar maksimal 5MB");
      return;
    }

    setIsUploading(true);

    try {
      // Generate upload URL
      const uploadUrl = await generateUploadUrl();

      // Upload file
      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!response.ok) {
        throw new Error("Gagal upload gambar");
      }

      const { storageId } = await response.json();

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      onImageUpload?.(storageId);
      toast.success("Gambar berhasil diupload");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Gagal upload gambar";
      toast.error(errorMessage);
      console.error("Error uploading image:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onImageRemove?.();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    toast.success("Gambar dihapus");
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Cover Image</label>

      {preview ? (
        <div className="relative">
          <img
            src={preview}
            alt="Cover preview"
            className="w-full h-48 object-cover rounded-md border"
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            onClick={handleRemove}
            disabled={isUploading}
          >
            <X className="size-4" />
          </Button>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed rounded-md p-6 text-center hover:bg-muted/50 transition-colors cursor-pointer"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleChange}
            disabled={isUploading}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="w-full"
          >
            <div className="flex flex-col items-center gap-2">
              <Upload className="size-6 text-muted-foreground" />
              <div className="text-sm">
                <p className="font-medium">
                  {isUploading ? "Uploading..." : "Drag & drop atau klik untuk upload"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Max 5MB, format: JPG, PNG, WebP
                </p>
              </div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
