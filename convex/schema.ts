import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Convex Schema converted from Prisma schema.prisma
 *
 * Notes on type conversions and constraints:
 * - Prisma `String` -> Convex `v.string()`
 * - Prisma `Boolean` -> Convex `v.boolean()`
 * - Prisma `Int` -> Convex `v.number()` (Convex has a single numeric type; enforce integer in mutations if required)
 * - Prisma `DateTime` -> Convex `v.string()` (store ISO 8601 timestamps; set defaults like `now()` in mutations)
 * - Prisma `String[]` -> Convex `v.array(v.string())`
 * - Prisma `@id` becomes Convex `_id: Id<"table">` automatically
 * - Prisma foreign keys that referenced `User.clerkId` are converted to Convex `Id<"users">` fields for proper relationship patterns
 * - Prisma `@unique` and composite unique constraints are NOT enforced at schema level in Convex.
 *   To preserve these constraints, add indexes below and enforce uniqueness in mutations using `db.query().withIndex(...)` checks.
 * - All models and relationships are preserved EXCEPT `Threads` and `Chat`, which are excluded per requirements.
 */

export default defineSchema({
  // User
  users: defineTable({
    clerkId: v.string(), // UNIQUE (enforce in mutations)
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    email: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    createdAt: v.string(), // ISO string; default(now()) in mutations
    updatedAt: v.string(), // ISO string; @updatedAt in mutations
    role: v.string(), // default("USER") in mutations
  })
    .index("by_clerk_first_last_email", [
      "clerkId",
      "firstName",
      "lastName",
      "email",
    ])
    .index("by_clerkId", ["clerkId"]),

  // Post
  posts: defineTable({
    title: v.string(),
    slug: v.string(), // UNIQUE (enforce in mutations)
    content: v.string(),
    tags: v.array(v.string()),
    metadata: v.optional(v.string()),
    category: v.optional(v.string()),
    featuredImage: v.optional(v.string()),
    createdAt: v.string(),
    updatedAt: v.string(),
    authorId: v.optional(v.id("users")), // temporarily optional until user validation is implemented
    isPublished: v.boolean(), // default(false) in mutations
  })
    .index("by_author_slug_title_category_published", [
      "authorId",
      "slug",
      "title",
      "category",
      "isPublished",
    ])
    .index("by_slug", ["slug"]) // support uniqueness checks
    .index("by_author", ["authorId"]),

  // Comment
  comments: defineTable({
    content: v.string(),
    createdAt: v.string(),
    updatedAt: v.string(),
    postId: v.id("posts"),
    author: v.string(),
    authorEmail: v.string(),
    parentId: v.optional(v.id("comments")),
  })
    .index("by_postId", ["postId"]) // query comments by post
    .index("by_parentId", ["parentId"]), // threaded replies

  // Submission
  submissions: defineTable({
    name: v.string(),
    slug: v.string(), // UNIQUE (enforce in mutations)
    categoryId: v.id("submissionCategories"),
    createdAt: v.string(),
    updatedAt: v.string(),
    status: v.string(),
    openDate: v.optional(v.string()), // ISO
    closeDate: v.optional(v.string()), // ISO
    quota: v.number(),
    academicYear: v.string(),
    authorId: v.optional(v.id("users")), // temporarily optional until user validation is implemented
    description: v.optional(v.string()),
  })
    .index("by_author_slug_name_status", ["authorId", "slug", "name", "status"])
    .index("by_category", ["categoryId"]) // query submissions by category
    .index("by_slug", ["slug"]) // support uniqueness checks
    .index("by_author", ["authorId"]),

  // SubmissionCategory
  submissionCategories: defineTable({
    name: v.string(),
    slug: v.string(), // UNIQUE (enforce in mutations)
    createdAt: v.string(),
    updatedAt: v.string(),
    authorId: v.optional(v.id("users")), // temporarily optional until user validation is implemented
    description: v.optional(v.string()),
  })
    .index("by_author_slug_name", ["authorId", "slug", "name"]) // mirrors Prisma composite index
    .index("by_slug", ["slug"]) // support uniqueness checks
    .index("by_author", ["authorId"]),

  // Participant
  participants: defineTable({
    submissionId: v.id("submissions"),
    submissionStatus: v.string(), // default("unverified") in mutations
    name: v.string(),
    nickname: v.string(),
    nik: v.string(), // UNIQUE (enforce in mutations)
    nisn: v.string(),
    dateOfBirth: v.string(), // ISO
    placeOfBirth: v.string(),
    gender: v.string(),
    religion: v.string(),
    hobby: v.string(),
    aspiration: v.string(),
    nationality: v.string(),
    birthOrder: v.number(),
    totalSiblings: v.number(),
    birthStatus: v.string(),
    bloodType: v.string(),
    createdAt: v.string(),
    updatedAt: v.string(),
    userId: v.id("users"), // was String referencing User.clerkId; now Id<"users">
    siblings: v.optional(v.boolean()),
    siblingsName: v.optional(v.string()),
    siblingsGrade: v.optional(v.string()),
    medicalHistory: v.optional(v.string()),
    majorIllness: v.optional(v.string()),
    minorIllness: v.optional(v.string()),
    isCompleted: v.boolean(), // default(false) in mutations
    isSubmitted: v.boolean(), // default(false) in mutations
  })
    .index("by_user_submission_identity", [
      "userId",
      "submissionId",
      "name",
      "nickname",
      "nik",
      "nisn",
    ])
    .index("by_user", ["userId"]) // query participants by user
    .index("by_submission", ["submissionId"]) // query participants by submission
    .index("by_nik", ["nik"]) // support uniqueness checks
    .index("by_nisn", ["nisn"]),

  // ParticipantAddress (one-to-one with Participant via participantId UNIQUE)
  participantAddresses: defineTable({
    participantId: v.id("participants"), // UNIQUE (enforce in mutations)
    address: v.string(),
    district: v.string(),
    subDistrict: v.string(),
    city: v.string(),
    province: v.string(),
    postalCode: v.string(),
    isSubmitted: v.boolean(), // default(false) in mutations
  }).index("by_participantId", ["participantId"]), // enforce uniqueness in mutations

  // ParticipantParent (one-to-one with Participant via participantId UNIQUE)
  participantParents: defineTable({
    participantId: v.id("participants"), // UNIQUE (enforce in mutations)
    parentPhone: v.string(),
    parentEmail: v.string(),
    fatherName: v.string(),
    fatherNationalId: v.string(),
    fatherBirthPlace: v.string(),
    fatherBirthDate: v.string(), // ISO
    fatherReligion: v.string(),
    fatherOccupation: v.string(),
    fatherEducation: v.string(),
    fatherIncome: v.string(),
    fatherCitizenship: v.string(),
    motherName: v.string(),
    motherNationalId: v.string(),
    motherBirthPlace: v.string(),
    motherBirthDate: v.string(), // ISO
    motherReligion: v.string(),
    motherOccupation: v.string(),
    motherEducation: v.string(),
    motherIncome: v.string(),
    motherCitizenship: v.string(),
    isSubmitted: v.boolean(), // default(false) in mutations
  }).index("by_participantId", ["participantId"]),

  // ParticipantEducation (one-to-one with Participant via participantId UNIQUE)
  participantEducations: defineTable({
    participantId: v.id("participants"), // UNIQUE (enforce in mutations)
    schoolName: v.optional(v.string()),
    schoolAddress: v.optional(v.string()),
    schoolCity: v.optional(v.string()),
    schoolDistrict: v.optional(v.string()),
    schoolSubDistrict: v.optional(v.string()),
    schoolProvince: v.optional(v.string()),
    schoolPostalCode: v.optional(v.string()),
    schoolPhone: v.optional(v.string()),
    schoolEmail: v.optional(v.string()),
    isSubmitted: v.boolean(), // default(false) in mutations
  }).index("by_participantId", ["participantId"]),

  // ParticipantDocument (one-to-one with Participant via participantId UNIQUE)
  participantDocuments: defineTable({
    participantId: v.id("participants"), // UNIQUE (enforce in mutations)
    isSubmitted: v.boolean(), // default(false) in mutations
    photo: v.optional(v.string()),
    familyCard: v.optional(v.string()),
    birthCertificate: v.optional(v.string()),
    skhus: v.optional(v.string()),
    graduationCertificate: v.optional(v.string()),
  }).index("by_participantId", ["participantId"]),

  // Informasi (Umum, Galeri, Artikel/Blog)
  informasi: defineTable({
    type: v.string(), // 'umum' | 'galeri' | 'artikel' (enforce in mutations)
    title: v.string(),
    description: v.optional(v.string()), // enforce required for 'umum' in mutations
    status: v.string(), // 'draft' | 'published' (enforce in mutations)
    slug: v.string(), // UNIQUE (enforce in mutations)
    content: v.optional(v.any()), // PlateJS JSON value for 'artikel' & 'galeri'
    coverImageId: v.optional(v.id("_storage")), // featured image
    imageIds: v.optional(v.array(v.id("_storage"))), // for 'galeri' - images from editor
    tags: v.optional(v.array(v.string())), // user-defined tags
    category: v.optional(v.string()), // user-defined category
    meta: v.optional(v.string()), // SEO meta description
    metaTitle: v.optional(v.string()),
    metaDescription: v.optional(v.string()),
    metaImageId: v.optional(v.id("_storage")),
    publishedAt: v.optional(v.string()), // ISO string
    createdAt: v.string(), // ISO string
    updatedAt: v.string(), // ISO string
    authorId: v.optional(v.id("users")),
  })
    .index("by_type", ["type"]) // filter by type
    .index("by_status_createdAt", ["status", "createdAt"]) // list by status and time
    .index("by_slug", ["slug"]), // support uniqueness checks
});
