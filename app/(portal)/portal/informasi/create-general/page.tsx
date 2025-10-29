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

const GeneralSchema = z.object({
  title: z.string().min(1, "Judul wajib diisi"),
  description: z.string().min(1, "Deskripsi wajib diisi"),
  status: z.enum(["draft", "published"]),
  // File akan divalidasi manual (opsional, max 5MB)
});

type GeneralFormValues = z.infer<typeof GeneralSchema> & {
  photo?: FileList;
};

export default function CreateGeneralPage() {
  const router = useRouter();
  const generateUploadUrl = useMutation(api.informasi.generateUploadUrl);
  const createGeneralAction = useAction(api.informasi.createGeneralAction);
  const form = useForm<GeneralFormValues>({
    resolver: zodResolver(GeneralSchema),
    defaultValues: { title: "", description: "", status: "draft" },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onSubmit = async (values: GeneralFormValues) => {
    console.log("Form submitted with values:", values);
    setIsSubmitting(true);

    // Get file from ref instead of form values
    const files = fileInputRef.current?.files;
    console.log("Files from input:", files);

    if (files && files.length > 0) {
      const file = files[0];
      console.log("File selected:", file.name, file.size, file.type);
      const maxBytes = 5 * 1024 * 1024; // 5MB
      if (file.size > maxBytes) {
        toast.error("Ukuran gambar maksimal 5MB");
        setIsSubmitting(false);
        return;
      }
    }
    try {
      let photoStorageId: Id<"_storage"> | undefined = undefined;
      if (files && files.length > 0) {
        const file = files[0];
        if (!file.type.startsWith("image/")) {
          toast.error("File harus bertipe gambar");
          setIsSubmitting(false);
          return;
        }
        // Step 1: Get a short-lived upload URL
        console.log("Getting upload URL...");
        const postUrl = await generateUploadUrl();
        console.log("Upload URL received:", postUrl);
        // Step 2: POST the file to the URL
        console.log("Uploading file...");
        const result = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });
        console.log("Upload response status:", result.status);
        if (!result.ok) {
          const errorText = await result.text();
          console.error("Upload failed:", errorText);
          throw new Error("Gagal mengupload gambar ke storage");
        }
        const { storageId } = await result.json();
        console.log("Storage ID received:", storageId);
        photoStorageId = storageId as Id<"_storage">;
      }

      console.log("Calling createGeneralAction with:", {
        title: values.title,
        description: values.description,
        photoStorageId: photoStorageId,
        status: values.status,
      });
      const result = await createGeneralAction({
        title: values.title,
        description: values.description,
        photoStorageId: photoStorageId,
        status: values.status,
      });
      console.log("Action result:", result);
      toast.success("Informasi Umum berhasil disimpan");
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
      <h1 className="mb-6 text-2xl font-semibold">Buat Informasi Umum</h1>
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
                <FormLabel>Deskripsi</FormLabel>
                <FormControl>
                  <Textarea rows={6} placeholder="Tulis deskripsi" {...field} />
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
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
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
            <FormLabel>Foto (opsional)</FormLabel>
            <FormControl>
              <Input type="file" accept="image/*" ref={fileInputRef} />
            </FormControl>
            <FormMessage />
          </FormItem>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push("/portal/informasi")}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
