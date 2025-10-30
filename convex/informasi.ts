import { action, mutation, query } from "./_generated/server";
import { api } from "./_generated/api";
import type { MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { v } from "convex/values";

function slugify(input: string) {
  const base = input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return base || "post";
}

async function ensureUniqueSlug(ctx: MutationCtx, base: string) {
  let candidate = base;
  let counter = 2;
  // Check existing by index
  // If exists, append numeric suffix until unique
  // Note: Convex indexes are eventually consistent; this is acceptable for creation flow
  // Enforce uniqueness at application level here.
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await ctx.db
      .query("informasi")
      .withIndex("by_slug", (q) => q.eq("slug", candidate))
      .first();
    if (!existing) return candidate;
    candidate = `${base}-${counter++}`;
  }
}

export const createGeneral = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    photoId: v.optional(v.id("_storage")), // optional single photo
    status: v.optional(v.string()), // 'draft' | 'published'
  },
  handler: async (ctx, args) => {
    const status = args.status ?? "draft";
    if (status !== "draft" && status !== "published") {
      throw new Error("Status harus 'draft' atau 'published'");
    }
    const now = new Date().toISOString();
    const baseSlug = slugify(args.title);
    const slug = await ensureUniqueSlug(ctx, baseSlug);

    const docId = await ctx.db.insert("informasi", {
      type: "umum",
      title: args.title,
      description: args.description,
      status,
      slug,
      content: undefined,
      coverImageId: args.photoId,
      imageIds: undefined,
      metaTitle: undefined,
      metaDescription: undefined,
      metaImageId: undefined,
      createdAt: now,
      updatedAt: now,
      authorId: undefined,
    });

    return { id: docId, slug };
  },
});

export const createGallery = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    imageIds: v.array(v.id("_storage")), // required, validate non-empty in handler
    status: v.optional(v.string()), // 'draft' | 'published'
  },
  handler: async (ctx, args) => {
    if (!args.imageIds || args.imageIds.length === 0) {
      throw new Error("Minimal satu foto wajib diunggah");
    }
    const status = args.status ?? "draft";
    if (status !== "draft" && status !== "published") {
      throw new Error("Status harus 'draft' atau 'published'");
    }

    const now = new Date().toISOString();
    const baseSlug = slugify(args.title);
    const slug = await ensureUniqueSlug(ctx, baseSlug);

    const docId = await ctx.db.insert("informasi", {
      type: "galeri",
      title: args.title,
      description: args.description,
      status,
      slug,
      content: undefined,
      coverImageId: undefined,
      imageIds: args.imageIds,
      metaTitle: undefined,
      metaDescription: undefined,
      metaImageId: undefined,
      createdAt: now,
      updatedAt: now,
      authorId: undefined,
    });

    return { id: docId, slug };
  },
});

// Secure upload flow using Convex storage
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

async function headContent(url: string) {
  const res = await fetch(url, { method: "HEAD" });
  if (!res.ok) {
    throw new Error("Gagal memeriksa metadata file yang diupload");
  }
  const contentType = res.headers.get("content-type") || "";
  const contentLengthStr = res.headers.get("content-length");
  const contentLength = contentLengthStr
    ? Number.parseInt(contentLengthStr, 10)
    : NaN;
  return { contentType, contentLength };
}

export const createGeneralAction = action({
  args: {
    title: v.string(),
    description: v.string(),
    photoStorageId: v.optional(v.id("_storage")),
    status: v.optional(v.string()),
  },
  handler: async (
    ctx,
    args,
  ): Promise<{ id: Id<"informasi">; slug: string }> => {
    const photoId = args.photoStorageId;
    const maxBytes = 5 * 1024 * 1024;
    if (photoId) {
      const url = await ctx.storage.getUrl(photoId);
      if (!url) {
        throw new Error("URL file tidak tersedia");
      }
      const { contentType, contentLength } = await headContent(url);
      if (!contentType.startsWith("image/")) {
        await ctx.storage.delete(photoId);
        throw new Error("File yang diupload harus bertipe gambar");
      }
      if (!Number.isNaN(contentLength) && contentLength > maxBytes) {
        await ctx.storage.delete(photoId);
        throw new Error("Ukuran gambar melebihi 5MB");
      }
    }

    const result: { id: Id<"informasi">; slug: string } = await ctx.runMutation(
      api.informasi.createGeneral,
      {
        title: args.title,
        description: args.description,
        photoId: photoId,
        status: args.status,
      },
    );

    return result;
  },
});

export const createGalleryAction = action({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    photoStorageIds: v.array(v.id("_storage")),
    status: v.optional(v.string()),
  },
  handler: async (
    ctx,
    args,
  ): Promise<{ id: Id<"informasi">; slug: string }> => {
    if (!args.photoStorageIds || args.photoStorageIds.length === 0) {
      throw new Error("Minimal satu foto wajib diunggah");
    }
    const maxBytes = 5 * 1024 * 1024;
    const verified: Id<"_storage">[] = [];
    for (const storageId of args.photoStorageIds) {
      const url = await ctx.storage.getUrl(storageId);
      if (!url) {
        throw new Error("URL file tidak tersedia");
      }
      const { contentType, contentLength } = await headContent(url);
      if (!contentType.startsWith("image/")) {
        await ctx.storage.delete(storageId);
        throw new Error("Semua file harus bertipe gambar");
      }
      if (!Number.isNaN(contentLength) && contentLength > maxBytes) {
        await ctx.storage.delete(storageId);
        throw new Error("Ukuran salah satu gambar melebihi 5MB");
      }
      verified.push(storageId);
    }

    const result: { id: Id<"informasi">; slug: string } = await ctx.runMutation(
      api.informasi.createGallery,
      {
        title: args.title,
        description: args.description,
        imageIds: verified,
        status: args.status,
      },
    );

    return result;
  },
});

// List informasi untuk ditampilkan di portal (published terbaru dulu)
export const listInformasi = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db
      .query("informasi")
      .withIndex("by_status_createdAt", (q) => q.eq("status", "published"))
      .order("desc")
      .take(50);

    const mapped = await Promise.all(
      rows.map(async (row) => {
        let coverUrl: string | null = null;
        if (row.coverImageId) {
          coverUrl = (await ctx.storage.getUrl(row.coverImageId)) ?? null;
        } else if (
          row.type === "galeri" &&
          row.imageIds &&
          row.imageIds.length > 0
        ) {
          coverUrl = (await ctx.storage.getUrl(row.imageIds[0]!)) ?? null;
        }
        return {
          _id: row._id,
          type: row.type,
          title: row.title,
          description: row.description,
          status: row.status,
          slug: row.slug,
          createdAt: row.createdAt,
          coverUrl,
        };
      }),
    );

    return mapped;
  },
});

// Detail Informasi by slug
export const getInformasiBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const row = await ctx.db
      .query("informasi")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (!row) return null;

    let coverUrl: string | null = null;
    if (row.coverImageId) {
      coverUrl = (await ctx.storage.getUrl(row.coverImageId)) ?? null;
    } else if (row.type === "galeri" && row.imageIds && row.imageIds.length > 0) {
      coverUrl = (await ctx.storage.getUrl(row.imageIds[0]!)) ?? null;
    }

    return {
      _id: row._id,
      type: row.type,
      title: row.title,
      description: row.description ?? row.meta ?? "",
      status: row.status,
      slug: row.slug,
      createdAt: row.createdAt,
      category: row.category,
      tags: row.tags ?? [],
      coverUrl,
      content: row.content ?? null,
    };
  },
});

// Create Article/Blog mutation
export const createArticle = mutation({
  args: {
    title: v.string(),
    content: v.string(), // JSON stringified content from Plate editor
    coverImageId: v.id("_storage"), // required cover image
    metaTitle: v.optional(v.string()),
    metaDescription: v.optional(v.string()),
    metaImageId: v.optional(v.id("_storage")),
    status: v.optional(v.string()), // 'draft' | 'published'
  },
  handler: async (ctx, args) => {
    const status = args.status ?? "draft";
    if (status !== "draft" && status !== "published") {
      throw new Error("Status harus 'draft' atau 'published'");
    }
    const now = new Date().toISOString();
    const baseSlug = slugify(args.title);
    const slug = await ensureUniqueSlug(ctx, baseSlug);

    const docId = await ctx.db.insert("informasi", {
      type: "artikel",
      title: args.title,
      description: undefined,
      status,
      slug,
      content: args.content,
      coverImageId: args.coverImageId,
      imageIds: undefined,
      metaTitle: args.metaTitle,
      metaDescription: args.metaDescription,
      metaImageId: args.metaImageId,
      createdAt: now,
      updatedAt: now,
      authorId: undefined,
    });

    return { id: docId, slug };
  },
});

// Create Article Action with validation
export const createArticleAction = action({
  args: {
    title: v.string(),
    content: v.string(),
    coverImageStorageId: v.id("_storage"),
    metaTitle: v.optional(v.string()),
    metaDescription: v.optional(v.string()),
    metaImageStorageId: v.optional(v.id("_storage")),
    status: v.optional(v.string()),
  },
  handler: async (
    ctx,
    args,
  ): Promise<{ id: Id<"informasi">; slug: string }> => {
    const maxBytes = 5 * 1024 * 1024;

    // Validate cover image
    const coverUrl = await ctx.storage.getUrl(args.coverImageStorageId);
    if (!coverUrl) {
      throw new Error("URL cover image tidak tersedia");
    }
    const { contentType: coverType, contentLength: coverLength } =
      await headContent(coverUrl);
    if (!coverType.startsWith("image/")) {
      await ctx.storage.delete(args.coverImageStorageId);
      throw new Error("Cover image harus bertipe gambar");
    }
    if (!Number.isNaN(coverLength) && coverLength > maxBytes) {
      await ctx.storage.delete(args.coverImageStorageId);
      throw new Error("Ukuran cover image melebihi 5MB");
    }

    // Validate meta image if provided
    if (args.metaImageStorageId) {
      const metaUrl = await ctx.storage.getUrl(args.metaImageStorageId);
      if (!metaUrl) {
        throw new Error("URL meta image tidak tersedia");
      }
      const { contentType: metaType, contentLength: metaLength } =
        await headContent(metaUrl);
      if (!metaType.startsWith("image/")) {
        await ctx.storage.delete(args.metaImageStorageId);
        throw new Error("Meta image harus bertipe gambar");
      }
      if (!Number.isNaN(metaLength) && metaLength > maxBytes) {
        await ctx.storage.delete(args.metaImageStorageId);
        throw new Error("Ukuran meta image melebihi 5MB");
      }
    }

    const result: { id: Id<"informasi">; slug: string } = await ctx.runMutation(
      api.informasi.createArticle,
      {
        title: args.title,
        content: args.content,
        coverImageId: args.coverImageStorageId,
        metaTitle: args.metaTitle,
        metaDescription: args.metaDescription,
        metaImageId: args.metaImageStorageId,
        status: args.status,
      },
    );

    return result;
  },
});

// ============================================
// UNIFIED CREATE INFORMASI (Umum, Galeri, Artikel)
// ============================================

export const createInformasi = mutation({
  args: {
    type: v.string(), // 'umum' | 'galeri' | 'artikel'
    title: v.string(),
    meta: v.string(), // SEO meta description
    content: v.optional(v.string()), // JSON stringified content from Plate editor (required for artikel & galeri)
    coverImageId: v.optional(v.id("_storage")), // featured image
    tags: v.array(v.string()), // user-defined tags
    category: v.string(), // user-defined category
    status: v.string(), // 'draft' | 'published'
  },
  handler: async (ctx, args) => {
    // Validate type
    if (!["umum", "galeri", "artikel"].includes(args.type)) {
      throw new Error("Type harus 'umum', 'galeri', atau 'artikel'");
    }

    // Validate status
    if (!["draft", "published"].includes(args.status)) {
      throw new Error("Status harus 'draft' atau 'published'");
    }

    // Validate required fields
    if (!args.title || args.title.trim().length === 0) {
      throw new Error("Judul tidak boleh kosong");
    }

    if (!args.meta || args.meta.trim().length === 0) {
      throw new Error("Meta description tidak boleh kosong");
    }

    // For artikel & galeri, content is required
    if ((args.type === "artikel" || args.type === "galeri") && !args.content) {
      throw new Error(`Konten tidak boleh kosong untuk tipe ${args.type}`);
    }

    const now = new Date().toISOString();
    const baseSlug = slugify(args.title);
    const slug = await ensureUniqueSlug(ctx, baseSlug);

    const publishedAt = args.status === "published" ? now : undefined;

    const docId = await ctx.db.insert("informasi", {
      type: args.type,
      title: args.title,
      description: args.meta, // Store meta in description field for backward compatibility
      status: args.status,
      slug,
      content: args.content,
      coverImageId: args.coverImageId,
      imageIds: undefined, // Will be populated from editor content for galeri
      tags: args.tags,
      category: args.category,
      meta: args.meta,
      metaTitle: undefined,
      metaDescription: undefined,
      metaImageId: undefined,
      publishedAt,
      createdAt: now,
      updatedAt: now,
      authorId: undefined,
    });

    return { id: docId, slug };
  },
});

export const createInformasiAction = action({
  args: {
    type: v.string(), // 'umum' | 'galeri' | 'artikel'
    title: v.string(),
    meta: v.string(),
    content: v.optional(v.string()),
    coverImageStorageId: v.optional(v.id("_storage")),
    tags: v.array(v.string()),
    category: v.string(),
    status: v.string(),
  },
  handler: async (
    ctx,
    args,
  ): Promise<{ id: Id<"informasi">; slug: string }> => {
    const maxBytes = 5 * 1024 * 1024;

    // Validate cover image if provided
    if (args.coverImageStorageId) {
      const coverUrl = await ctx.storage.getUrl(args.coverImageStorageId);
      if (!coverUrl) {
        throw new Error("URL cover image tidak tersedia");
      }
      const { contentType: coverType, contentLength: coverLength } =
        await headContent(coverUrl);
      if (!coverType.startsWith("image/")) {
        await ctx.storage.delete(args.coverImageStorageId);
        throw new Error("Cover image harus bertipe gambar");
      }
      if (!Number.isNaN(coverLength) && coverLength > maxBytes) {
        await ctx.storage.delete(args.coverImageStorageId);
        throw new Error("Ukuran cover image melebihi 5MB");
      }
    }

    const result: { id: Id<"informasi">; slug: string } = await ctx.runMutation(
      api.informasi.createInformasi,
      {
        type: args.type,
        title: args.title,
        meta: args.meta,
        content: args.content,
        coverImageId: args.coverImageStorageId,
        tags: args.tags,
        category: args.category,
        status: args.status,
      },
    );

    return result;
  },
});
