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

  feedback: defineTable({
    trackId: v.id("tracks"),
    userId: v.optional(v.id("users")), // Optional for anonymous feedback
    type: v.union(v.literal("love"), v.literal("like"), v.literal("meh"), v.literal("dislike")),
    timestamp: v.number(),
    isAnonymous: v.boolean(),
    deviceType: v.string(), // For analytics
    sessionId: v.string(), // For anonymous users
  })
    .index("by_track", ["trackId"])
    .index("by_user", ["userId"])
    .index("by_timestamp", ["timestamp"])
    .index("by_track_user", ["trackId", "userId"])
    .index("by_session", ["sessionId"]),

  feedbackStats: defineTable({
    trackId: v.id("tracks"),
    loveCount: v.number(),
    likeCount: v.number(),
    mehCount: v.number(),
    dislikeCount: v.number(),
    totalFeedback: v.number(),
    averageRating: v.number(),
    lastUpdated: v.number(),
  })
    .index("by_track", ["trackId"])
    .index("by_rating", ["averageRating"])
    .index("by_total", ["totalFeedback"])
    .index("by_updated", ["lastUpdated"]),

  trendingTracks: defineTable({
    trackId: v.id("tracks"),
    score: v.number(), // Calculated trending score
    timeframe: v.string(), // "1h", "24h", "7d", "30d"
    category: v.string(),
    rank: v.number(),
    lastCalculated: v.number(),
  })
    .index("by_timeframe_rank", ["timeframe", "rank"])
    .index("by_score", ["score"])
    .index("by_timeframe_score", ["timeframe", "score"])
    .index("by_calculated", ["lastCalculated"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
