import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  tracks: defineTable({
    title: v.string(),
    artist: v.string(),
    duration: v.number(), // in seconds
    audioFileId: v.id("_storage"),
    coverArtId: v.optional(v.id("_storage")),
    uploadedBy: v.id("users"),
    uploadedAt: v.number(),
  })
    .index("by_uploaded_at", ["uploadedAt"])
    .index("by_user", ["uploadedBy"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
