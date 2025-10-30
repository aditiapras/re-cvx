"use client";

import * as React from "react";
import Image from "next/image";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { createSlateEditor } from "platejs";
import { EditorStatic } from "@/components/ui/editor-static";
import { BaseEditorKit } from "@/components/editor-base-kit";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

export default function InformasiSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = React.use(params);
  const data = useQuery(api.informasi.getInformasiBySlug, {
    slug,
  });

  const [error, setError] = React.useState<string | null>(null);
  const [editor, setEditor] = React.useState<any>(null);

  React.useEffect(() => {
    if (data === undefined || data === null) return;
    setError(null);
    try {
      const value = data.content
        ? JSON.parse(data.content)
        : [{ type: "p", children: [{ text: data.description || "" }] }];
      const ed = createSlateEditor({
        plugins: BaseEditorKit,
        value,
      });
      setEditor(ed);
    } catch (e) {
      console.error("Failed to parse Plate content JSON", e);
      setError("Konten tidak dapat ditampilkan (format tidak valid)");
      const ed = createSlateEditor({
        plugins: BaseEditorKit,
        value: [{ type: "p", children: [{ text: data.description || "" }] }],
      });
      setEditor(ed);
    }
  }, [data]);

  if (data === undefined) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <p className="text-muted-foreground">Memuat konten...</p>
      </div>
    );
  }

  if (data === null) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <p className="text-red-500">Konten tidak ditemukan.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold">{data.title}</h1>
        <div className="mt-2 flex items-center gap-2">
          <Badge variant="secondary">{data.category}</Badge>
          {data.tags?.map((t: string) => (
            <Badge key={t} variant="outline">{t}</Badge>
          ))}
        </div>
      </div>

      {data.coverUrl ? (
        <div className="relative w-full h-64 mb-6 overflow-hidden rounded-md">
          <Image
            src={data.coverUrl}
            alt={data.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
          />
        </div>
      ) : null}

      <Separator className="my-4" />

      {error ? (
        <p className="text-red-500 mb-4">{error}</p>
      ) : null}

      {editor ? (
        <EditorStatic editor={editor} variant="default" />
      ) : (
        <p className="text-muted-foreground">Menyiapkan editor...</p>
      )}
    </div>
  );
}