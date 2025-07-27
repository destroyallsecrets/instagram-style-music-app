import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated. Please sign in to upload music.");
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
      throw new Error("Not authenticated. Please sign in to upload music.");
    }

    // Validate inputs
    if (!args.title.trim()) {
      throw new Error("Track title is required");
    }
    if (!args.artist.trim()) {
      throw new Error("Artist name is required");
    }
    if (args.duration <= 0) {
      throw new Error("Invalid audio duration");
    }

    // Verify that the audio file exists
    try {
      const audioUrl = await ctx.storage.getUrl(args.audioFileId);
      if (!audioUrl) {
        throw new Error("Audio file not found");
      }
    } catch (error) {
      throw new Error("Invalid audio file");
    }

    // Verify cover art if provided
    if (args.coverArtId) {
      try {
        const coverUrl = await ctx.storage.getUrl(args.coverArtId);
        if (!coverUrl) {
          throw new Error("Cover art file not found");
        }
      } catch (error) {
        throw new Error("Invalid cover art file");
      }
    }

    return await ctx.db.insert("tracks", {
      title: args.title.trim(),
      artist: args.artist.trim(),
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
        try {
          const audioUrl = await ctx.storage.getUrl(track.audioFileId);
          const coverArtUrl = track.coverArtId
            ? await ctx.storage.getUrl(track.coverArtId)
            : null;
          
          // Handle cases where user might not exist or be anonymous
          let uploaderName = "Anonymous User";
          if (track.uploadedBy) {
            try {
              const user = await ctx.db.get(track.uploadedBy);
              uploaderName = user?.name || user?.email || "Anonymous User";
            } catch (error) {
              console.warn("Could not fetch user info:", error);
            }
          }
          
          return {
            ...track,
            audioUrl,
            coverArtUrl,
            uploaderName,
          };
        } catch (error) {
          console.error("Error processing track:", track._id, error);
          // Return track with null URLs if storage access fails
          return {
            ...track,
            audioUrl: null,
            coverArtUrl: null,
            uploaderName: "Unknown User",
          };
        }
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
        try {
          const audioUrl = await ctx.storage.getUrl(track.audioFileId);
          const coverArtUrl = track.coverArtId
            ? await ctx.storage.getUrl(track.coverArtId)
            : null;
          
          return {
            ...track,
            audioUrl,
            coverArtUrl,
          };
        } catch (error) {
          console.error("Error processing user track:", track._id, error);
          return {
            ...track,
            audioUrl: null,
            coverArtUrl: null,
          };
        }
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

    // Delete associated files from storage
    try {
      await ctx.storage.delete(track.audioFileId);
      if (track.coverArtId) {
        await ctx.storage.delete(track.coverArtId);
      }
    } catch (error) {
      console.warn("Could not delete storage files:", error);
      // Continue with track deletion even if storage cleanup fails
    }

    await ctx.db.delete(args.trackId);
    return { success: true };
  },
});

export const getTrack = query({
  args: { trackId: v.id("tracks") },
  handler: async (ctx, args) => {
    const track = await ctx.db.get(args.trackId);
    if (!track) {
      return null;
    }

    try {
      const audioUrl = await ctx.storage.getUrl(track.audioFileId);
      const coverArtUrl = track.coverArtId
        ? await ctx.storage.getUrl(track.coverArtId)
        : null;
      
      let uploaderName = "Anonymous User";
      if (track.uploadedBy) {
        try {
          const user = await ctx.db.get(track.uploadedBy);
          uploaderName = user?.name || user?.email || "Anonymous User";
        } catch (error) {
          console.warn("Could not fetch uploader info:", error);
        }
      }
      
      return {
        ...track,
        audioUrl,
        coverArtUrl,
        uploaderName,
      };
    } catch (error) {
      console.error("Error processing track:", track._id, error);
      return {
        ...track,
        audioUrl: null,
        coverArtUrl: null,
        uploaderName: "Unknown User",
      };
    }
  },
});