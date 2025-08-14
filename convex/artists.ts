import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Create or update artist profile
export const createOrUpdateArtistProfile = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("artistProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existing) {
      return await ctx.db.patch(existing._id, {
        ...args,
        updatedAt: Date.now(),
      });
    } else {
      return await ctx.db.insert("artistProfiles", {
        userId,
        ...args,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  },
});

// Get artist profile by user ID
export const getArtistProfile = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("artistProfiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();
  },
});

// Get artist profile by display name (for URL routing)
export const getArtistByName = query({
  args: { displayName: v.string() },
  handler: async (ctx, args) => {
    const profiles = await ctx.db.query("artistProfiles").collect();
    return profiles.find(profile => 
      profile.displayName.toLowerCase().replace(/\s+/g, '-') === args.displayName.toLowerCase()
    );
  },
});

// Get current user's artist profile
export const getMyArtistProfile = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    return await ctx.db
      .query("artistProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
  },
});

// Get all artist profiles (for discovery)
export const getAllArtistProfiles = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("artistProfiles")
      .collect();
  },
});

// Get tracks by artist
export const getTracksByArtist = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const tracks = await ctx.db
      .query("tracks")
      .withIndex("by_user", (q) => q.eq("uploadedBy", args.userId))
      .order("desc")
      .collect();

    return await Promise.all(
      tracks.map(async (track) => ({
        ...track,
        audioUrl: track.audioFileId ? await ctx.storage.getUrl(track.audioFileId) : null,
        coverArtUrl: track.coverArtId ? await ctx.storage.getUrl(track.coverArtId) : null,
      }))
    );
  },
});