"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAction, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const GallerySchema = z.object({
  title: z.string().min(1, "Judul wajib diisi"),
  description: z.string().optional(),
  status: z.enum(["draft", "published"]),
});

type GalleryFormValues = z.infer<typeof GallerySchema> & {
  photos?: FileList;
};

export default function CreateGalleryPage() {
  const router = useRouter();
  const generateUploadUrl = useMutation(api.informasi.generateUploadUrl);
  const createGalleryAction = useAction(api.informasi.createGalleryAction);
  const form = useForm<GalleryFormValues>({
    resolver: zodResolver(GallerySchema),
    defaultValues: { title: "", description: "", status: "draft" },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onSubmit = async (values: GalleryFormValues) => {
    console.log("Form submitted with values:", values);
    setIsSubmitting(true);
    
    // Get files from ref instead of form values
    const files = fileInputRef.current?.files;
    console.log("Files from input:", files);
    
    const maxBytes = 5 * 1024 * 1024; // 5MB
    if (!files || files.length === 0) {
      toast.error("Minimal satu foto wajib diunggah");
      setIsSubmitting(false);
      return;
    }
    for (const file of Array.from(files)) {
      console.log("Validating file:", file.name, file.size, file.type);
      if (file.size > maxBytes) {
        toast.error(`Ukuran gambar '${file.name}' melebihi 5MB`);
        setIsSubmitting(false);
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast.error(`File bukan gambar: '${file.name}'`);
        setIsSubmitting(false);
        return;
      }
    }

    try {
      const storageIds: Id<"_storage">[] = [];
      for (const file of Array.from(files)) {
        // Step 1: Get a short-lived upload URL
        console.log(`Getting upload URL for ${file.name}...`);
        const postUrl = await generateUploadUrl();
        console.log("Upload URL received:", postUrl);
        // Step 2: POST the file to the URL
        console.log(`Uploading ${file.name}...`);
        const result = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });
        console.log(`Upload response status for ${file.name}:`, result.status);
        if (!result.ok) {
          const errorText = await result.text();
          console.error(`Upload failed for ${file.name}:`, errorText);
          throw new Error(`Gagal upload gambar: ${file.name}`);
        }
        const { storageId } = await result.json();
        console.log(`Storage ID received for ${file.name}:`, storageId);
        storageIds.push(storageId as Id<"_storage">);
      }

      console.log("Calling createGalleryAction with:", {
        title: values.title,
        description: values.description,
        photoStorageIds: storageIds,
        status: values.status,
      });
      const result = await createGalleryAction({
        title: values.title,
        description: values.description,
        photoStorageIds: storageIds,
        status: values.status,
      });
      console.log("Action result:", result);
      toast.success("Informasi Galeri berhasil disimpan");
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setIsSubmitting(false);
      router.push("/portal/informasi");
    } catch (err: unknown) {
      console.error("Error in onSubmit:", err);
      const message = err instanceof Error ? err.message : "Terjadi kesalahan";
      toast.error(message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto max-w-3xl p-6">
      <h1 className="mb-6 text-2xl font-semibold">Buat Informasi Galeri</h1>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6"
          noValidate
        >
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Judul</FormLabel>
                <FormControl>
                  <Input placeholder="Masukkan judul" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Deskripsi (opsional)</FormLabel>
                <FormControl>
                  <Textarea rows={6} placeholder="Tulis deskripsi (opsional)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Publish</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormItem>
            <FormLabel>Foto (wajib, bisa beberapa)</FormLabel>
            <FormControl>
              <Input
                type="file"
                accept="image/*"
                multiple
                ref={fileInputRef}
              />
            </FormControl>
            <FormMessage />
          </FormItem>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => router.push("/portal/informasi")} disabled={isSubmitting}>Batal</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}