"use client";

import * as React from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { CoverImageUploader } from "./cover-image-uploader";

interface CreateInformasiFormProps {
  onSuccess?: (result: { id: string; slug: string }) => void;
}

export function CreateInformasiForm({
  onSuccess,
}: CreateInformasiFormProps) {
  const createInformasiAction = useAction(api.informasi.createInformasiAction);

  const [formData, setFormData] = React.useState({
    type: "artikel",
    title: "",
    meta: "",
    tags: "",
    category: "",
    status: "draft",
  });

  const [coverImageId, setCoverImageId] = React.useState<string>();

  const [isLoading, setIsLoading] = React.useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const getEditorContent = (): string | undefined => {
    // Try to get content from window.__plateEditorContent if available
    // Otherwise, form submission will fail with validation error
    if (typeof window !== "undefined") {
      return (window as any).__plateEditorContent;
    }
    return undefined;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.title.trim()) {
      toast.error("Judul tidak boleh kosong");
      return;
    }

    if (!formData.meta.trim()) {
      toast.error("Meta description tidak boleh kosong");
      return;
    }

    if (!formData.category.trim()) {
      toast.error("Kategori tidak boleh kosong");
      return;
    }

    const editorContent = getEditorContent();

    if ((formData.type === "artikel" || formData.type === "galeri") && !editorContent) {
      toast.error(`Konten tidak boleh kosong untuk tipe ${formData.type}`);
      return;
    }

    setIsLoading(true);

    try {
      const tags = formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      const result = await createInformasiAction({
        type: formData.type,
        title: formData.title,
        meta: formData.meta,
        content: editorContent,
        coverImageStorageId: coverImageId as any, // eslint-disable-line @typescript-eslint/no-explicit-any
        tags,
        category: formData.category,
        status: formData.status,
      });

      toast.success(`${formData.type} berhasil dibuat!`);
      onSuccess?.(result);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Gagal membuat informasi";
      toast.error(errorMessage);
      console.error("Error creating informasi:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Cover Image Uploader */}
      <CoverImageUploader
        onImageUpload={setCoverImageId}
        onImageRemove={() => setCoverImageId(undefined)}
      />

      {/* Type Selector */}
      <div>
        <label htmlFor="type" className="text-sm font-medium">
          Tipe Informasi
        </label>
        <Select
          value={formData.type}
          onValueChange={(value) => handleSelectChange("type", value)}
        >
          <SelectTrigger id="type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="umum">Umum</SelectItem>
            <SelectItem value="galeri">Galeri</SelectItem>
            <SelectItem value="artikel">Artikel/Blog</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Title */}
      <div>
        <label htmlFor="title" className="text-sm font-medium">
          Judul
        </label>
        <Input
          id="title"
          name="title"
          placeholder="Masukkan judul informasi"
          value={formData.title}
          onChange={handleInputChange}
          disabled={isLoading}
        />
      </div>

      {/* Meta Description */}
      <div>
        <label htmlFor="meta" className="text-sm font-medium">
          Meta Description (SEO)
        </label>
        <Textarea
          id="meta"
          name="meta"
          placeholder="Deskripsi singkat untuk SEO (150-160 karakter)"
          value={formData.meta}
          onChange={handleInputChange}
          disabled={isLoading}
          rows={3}
        />
        <p className="text-xs text-muted-foreground mt-1">
          {formData.meta.length}/160 karakter
        </p>
      </div>

      {/* Category */}
      <div>
        <label htmlFor="category" className="text-sm font-medium">
          Kategori
        </label>
        <Input
          id="category"
          name="category"
          placeholder="Contoh: Pendidikan, Berita, Acara"
          value={formData.category}
          onChange={handleInputChange}
          disabled={isLoading}
        />
      </div>

      {/* Tags */}
      <div>
        <label htmlFor="tags" className="text-sm font-medium">
          Tags
        </label>
        <Input
          id="tags"
          name="tags"
          placeholder="Pisahkan dengan koma. Contoh: sekolah, pendidikan, berita"
          value={formData.tags}
          onChange={handleInputChange}
          disabled={isLoading}
        />
      </div>

      {/* Status */}
      <div>
        <label htmlFor="status" className="text-sm font-medium">
          Status
        </label>
        <Select
          value={formData.status}
          onValueChange={(value) => handleSelectChange("status", value)}
        >
          <SelectTrigger id="status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Submit Buttons */}
      <div className="flex gap-2 pt-4">
        <Button
          type="submit"
          disabled={isLoading}
          className="flex-1"
        >
          {isLoading ? "Menyimpan..." : "Publish"}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={isLoading}
          onClick={() => {
            handleSelectChange("status", "draft");
            // Trigger submit with draft status
            const form = document.querySelector("form");
            if (form) {
              const event = new Event("submit", { bubbles: true });
              form.dispatchEvent(event);
            }
          }}
        >
          Save Draft
        </Button>
      </div>
    </form>
  );
}
