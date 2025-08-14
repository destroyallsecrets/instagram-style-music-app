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
    genre: v.optional(v.string()),
    audioQuality: v.optional(v.string()), // "128k", "320k", "lossless"
    allowDownload: v.optional(v.boolean()),
  })
    .index("by_uploaded_at", ["uploadedAt"])
    .index("by_user", ["uploadedBy"])
    .index("by_genre", ["genre"])
    .searchIndex("by_search", {
      searchField: "title",
      filterFields: ["artist", "genre"],
    }),

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
    
    playlists: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    ownerId: v.id("users"),
    isPublic: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_owner", ["ownerId"])
    .index("by_public", ["isPublic"]),

  playlistTracks: defineTable({
    playlistId: v.id("playlists"),
    trackId: v.id("tracks"),
    addedAt: v.number(),
  })
    .index("by_playlist", ["playlistId"])
    .index("by_track", ["trackId"])
    .index("by_playlist_track", ["playlistId", "trackId"]),

  artistProfiles: defineTable({
    userId: v.id("users"),
    displayName: v.string(),
    bio: v.optional(v.string()),
    genre: v.optional(v.string()),
    website: v.optional(v.string()),
    profileImageId: v.optional(v.id("_storage")),
    bannerImageId: v.optional(v.id("_storage")),
    socialLinks: v.optional(v.object({
      spotify: v.optional(v.string()),
      bandcamp: v.optional(v.string()),
      soundcloud: v.optional(v.string()),
      youtube: v.optional(v.string()),
    })),
    customColors: v.optional(v.object({
      primary: v.string(),
      secondary: v.string(),
      accent: v.string(),
    })),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_genre", ["genre"])
    .searchIndex("by_name", {
      searchField: "displayName",
      filterFields: ["genre"],
    }),

  releases: defineTable({
    title: v.string(),
    artistId: v.id("users"),
    description: v.optional(v.string()),
    releaseDate: v.number(),
    coverArtId: v.optional(v.id("_storage")),
    releaseType: v.union(v.literal("single"), v.literal("ep"), v.literal("album")),
    trackIds: v.array(v.id("tracks")),
    isPublished: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_artist", ["artistId"])
    .index("by_release_date", ["releaseDate"])
    .index("by_published", ["isPublished"])
    .searchIndex("by_title", {
      searchField: "title",
      filterFields: ["artistId", "releaseType"],
    }),

  userPlaylists: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    userId: v.id("users"),
    trackIds: v.array(v.id("tracks")),
    isPublic: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_public", ["isPublic"])
    .searchIndex("by_name", {
      searchField: "name",
      filterFields: ["userId", "isPublic"],
    }),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
