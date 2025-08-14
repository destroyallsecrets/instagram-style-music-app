import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Create a new playlist
export const createPlaylist = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    isPublic: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("userPlaylists", {
      ...args,
      userId,
      trackIds: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Add track to playlist
export const addTrackToPlaylist = mutation({
  args: {
    playlistId: v.id("userPlaylists"),
    trackId: v.id("tracks"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const playlist = await ctx.db.get(args.playlistId);
    if (!playlist || playlist.userId !== userId) {
      throw new Error("Playlist not found or access denied");
    }

    if (!playlist.trackIds.includes(args.trackId)) {
      await ctx.db.patch(args.playlistId, {
        trackIds: [...playlist.trackIds, args.trackId],
        updatedAt: Date.now(),
      });
    }
  },
});

// Remove track from playlist
export const removeTrackFromPlaylist = mutation({
  args: {
    playlistId: v.id("userPlaylists"),
    trackId: v.id("tracks"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const playlist = await ctx.db.get(args.playlistId);
    if (!playlist || playlist.userId !== userId) {
      throw new Error("Playlist not found or access denied");
    }

    await ctx.db.patch(args.playlistId, {
      trackIds: playlist.trackIds.filter(id => id !== args.trackId),
      updatedAt: Date.now(),
    });
  },
});

// Get user's playlists
export const getUserPlaylists = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("userPlaylists")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

// Get playlist with tracks
export const getPlaylistWithTracks = query({
  args: { playlistId: v.id("userPlaylists") },
  handler: async (ctx, args) => {
    const playlist = await ctx.db.get(args.playlistId);
    if (!playlist) return null;

    const tracks = await Promise.all(
      playlist.trackIds.map(async (trackId) => {
        const track = await ctx.db.get(trackId);
        if (!track) return null;
        
        return {
          ...track,
          audioUrl: track.audioFileId ? await ctx.storage.getUrl(track.audioFileId) : null,
          coverArtUrl: track.coverArtId ? await ctx.storage.getUrl(track.coverArtId) : null,
        };
      })
    );

    return {
      ...playlist,
      tracks: tracks.filter(Boolean),
    };
  },
});