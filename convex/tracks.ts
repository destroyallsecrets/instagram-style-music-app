import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    return await ctx.storage.generateUploadUrl();
  },
});

export const createTrack = mutation({
  args: {
    title: v.string(),
    artist: v.string(),
    duration: v.number(),
    audioFileId: v.id("_storage"),
    coverArtId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    return await ctx.db.insert("tracks", {
      title: args.title,
      artist: args.artist,
      duration: args.duration,
      audioFileId: args.audioFileId,
      coverArtId: args.coverArtId,
      uploadedBy: userId,
      uploadedAt: Date.now(),
    });
  },
});

export const getAllTracks = query({
  args: {},
  handler: async (ctx) => {
    const tracks = await ctx.db
      .query("tracks")
      .withIndex("by_uploaded_at")
      .order("desc")
      .collect();

    return Promise.all(
      tracks.map(async (track) => {
        const audioUrl = await ctx.storage.getUrl(track.audioFileId);
        const coverArtUrl = track.coverArtId
          ? await ctx.storage.getUrl(track.coverArtId)
          : null;
        
        const user = await ctx.db.get(track.uploadedBy);
        
        return {
          ...track,
          audioUrl,
          coverArtUrl,
          uploaderName: user?.name || user?.email || "Unknown User",
        };
      })
    );
  },
});

export const getUserTracks = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const tracks = await ctx.db
      .query("tracks")
      .withIndex("by_user", (q) => q.eq("uploadedBy", userId))
      .order("desc")
      .collect();

    return Promise.all(
      tracks.map(async (track) => {
        const audioUrl = await ctx.storage.getUrl(track.audioFileId);
        const coverArtUrl = track.coverArtId
          ? await ctx.storage.getUrl(track.coverArtId)
          : null;
        
        return {
          ...track,
          audioUrl,
          coverArtUrl,
        };
      })
    );
  },
});

export const deleteTrack = mutation({
  args: { trackId: v.id("tracks") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const track = await ctx.db.get(args.trackId);
    if (!track) {
      throw new Error("Track not found");
    }

    if (track.uploadedBy !== userId) {
      throw new Error("Not authorized to delete this track");
    }

    await ctx.db.delete(args.trackId);
    return { success: true };
  },
});
