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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlateEditor } from "@/components/rte/plate-editor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ArticleSchema = z.object({
  title: z.string().min(1, "Judul wajib diisi"),
  status: z.enum(["draft", "published"]),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
});

type ArticleFormValues = z.infer<typeof ArticleSchema>;

export default function CreateArticlePage() {
  const router = useRouter();
  const generateUploadUrl = useMutation(api.informasi.generateUploadUrl);
  const createArticleAction = useAction(api.informasi.createArticleAction);
  
  const form = useForm<ArticleFormValues>({
    resolver: zodResolver(ArticleSchema),
    defaultValues: { 
      title: "", 
      status: "draft",
      metaTitle: "",
      metaDescription: "",
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("edit");
  const [content, setContent] = useState<any[]>([
    {
      type: "p",
      children: [{ text: "" }],
    },
  ]);
  
  const coverImageInputRef = useRef<HTMLInputElement>(null);
  const metaImageInputRef = useRef<HTMLInputElement>(null);

  const onSubmit = async (values: ArticleFormValues) => {
    console.log("Form submitted with values:", values);
    console.log("Content:", content);
    setIsSubmitting(true);

    // Validate content
    if (!content || content.length === 0) {
      toast.error("Konten artikel wajib diisi");
      setIsSubmitting(false);
      return;
    }

    try {
      // Upload cover image
      let coverImageStorageId: Id<"_storage"> | undefined = undefined;
      const coverFiles = coverImageInputRef.current?.files;
      
      if (!coverFiles || coverFiles.length === 0) {
        toast.error("Foto cover wajib diunggah");
        setIsSubmitting(false);
        return;
      }

      const coverFile = coverFiles[0];
      console.log("Cover file selected:", coverFile.name, coverFile.size, coverFile.type);
      
      if (!coverFile.type.startsWith("image/")) {
        toast.error("File cover harus bertipe gambar");
        setIsSubmitting(false);
        return;
      }

      console.log("Getting upload URL for cover...");
      const coverPostUrl = await generateUploadUrl();
      console.log("Cover upload URL received:", coverPostUrl);
      
      console.log("Uploading cover file...");
      const coverResult = await fetch(coverPostUrl, {
        method: "POST",
        headers: { "Content-Type": coverFile.type },
        body: coverFile,
      });
      console.log("Cover upload response status:", coverResult.status);
      
      if (!coverResult.ok) {
        const errorText = await coverResult.text();
        console.error("Cover upload failed:", errorText);
        throw new Error("Gagal mengupload foto cover ke storage");
      }
      
      const { storageId: coverStorageId } = await coverResult.json();
      console.log("Cover storage ID received:", coverStorageId);
      coverImageStorageId = coverStorageId as Id<"_storage">;

      // Upload meta image (optional)
      let metaImageStorageId: Id<"_storage"> | undefined = undefined;
      const metaFiles = metaImageInputRef.current?.files;
      
      if (metaFiles && metaFiles.length > 0) {
        const metaFile = metaFiles[0];
        console.log("Meta image file selected:", metaFile.name, metaFile.size, metaFile.type);
        
        if (!metaFile.type.startsWith("image/")) {
          toast.error("File meta image harus bertipe gambar");
          setIsSubmitting(false);
          return;
        }

        console.log("Getting upload URL for meta image...");
        const metaPostUrl = await generateUploadUrl();
        console.log("Meta image upload URL received:", metaPostUrl);
        
        console.log("Uploading meta image file...");
        const metaResult = await fetch(metaPostUrl, {
          method: "POST",
          headers: { "Content-Type": metaFile.type },
          body: metaFile,
        });
        console.log("Meta image upload response status:", metaResult.status);
        
        if (!metaResult.ok) {
          const errorText = await metaResult.text();
          console.error("Meta image upload failed:", errorText);
          throw new Error("Gagal mengupload meta image ke storage");
        }
        
        const { storageId: metaStorageId } = await metaResult.json();
        console.log("Meta image storage ID received:", metaStorageId);
        metaImageStorageId = metaStorageId as Id<"_storage">;
      }

      console.log("Calling createArticleAction with:", {
        title: values.title,
        content: content,
        coverImageStorageId: coverImageStorageId,
        metaTitle: values.metaTitle,
        metaDescription: values.metaDescription,
        metaImageStorageId: metaImageStorageId,
        status: values.status,
      });

      const result = await createArticleAction({
        title: values.title,
        content: JSON.stringify(content),
        coverImageStorageId: coverImageStorageId,
        metaTitle: values.metaTitle,
        metaDescription: values.metaDescription,
        metaImageStorageId: metaImageStorageId,
        status: values.status,
      });

      console.log("Action result:", result);
      toast.success("Artikel berhasil disimpan");
      
      // Reset file inputs
      if (coverImageInputRef.current) {
        coverImageInputRef.current.value = "";
      }
      if (metaImageInputRef.current) {
        metaImageInputRef.current.value = "";
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
    <div className="container mx-auto max-w-5xl p-6">
      <h1 className="mb-6 text-2xl font-semibold">Buat Artikel/Blog</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="edit">Edit</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="edit" className="space-y-6 mt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" noValidate>
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Judul Artikel</FormLabel>
                    <FormControl>
                      <Input placeholder="Masukkan judul artikel" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormItem>
                <FormLabel>Konten Artikel</FormLabel>
                <FormControl>
                  <PlateEditor
                    value={content}
                    onChange={setContent}
                    placeholder="Tulis konten artikel di sini..."
                  />
                </FormControl>
                <FormDescription>
                  Gunakan toolbar untuk memformat teks, menambahkan gambar, tabel, dan lainnya.
                </FormDescription>
              </FormItem>

              <FormItem>
                <FormLabel>Foto Cover (wajib)</FormLabel>
                <FormControl>
                  <Input type="file" accept="image/*" ref={coverImageInputRef} />
                </FormControl>
                <FormDescription>
                  Foto cover akan ditampilkan sebagai thumbnail artikel.
                </FormDescription>
                <FormMessage />
              </FormItem>

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

              {/* SEO Fields */}
              <div className="border-t pt-6">
                <h2 className="text-lg font-semibold mb-4">SEO Settings</h2>
                
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="metaTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meta Title (opsional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Judul untuk SEO" {...field} />
                        </FormControl>
                        <FormDescription>
                          Jika kosong, akan menggunakan judul artikel.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="metaDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meta Description (opsional)</FormLabel>
                        <FormControl>
                          <Textarea
                            rows={3}
                            placeholder="Deskripsi untuk SEO"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Deskripsi yang akan muncul di hasil pencarian.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormItem>
                    <FormLabel>Meta Image (opsional)</FormLabel>
                    <FormControl>
                      <Input type="file" accept="image/*" ref={metaImageInputRef} />
                    </FormControl>
                    <FormDescription>
                      Gambar untuk social media sharing. Jika kosong, akan menggunakan foto cover.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                </div>
              </div>

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
        </TabsContent>

        <TabsContent value="preview" className="mt-6">
          <div className="prose prose-lg max-w-none">
            <h1>{form.watch("title") || "Judul Artikel"}</h1>
            <div className="border rounded-lg p-6 bg-muted/50">
              <PlateEditor
                value={content}
                readOnly={true}
                placeholder="Preview konten akan muncul di sini..."
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
