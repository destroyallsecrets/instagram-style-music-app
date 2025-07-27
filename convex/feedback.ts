import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Rate limiting helper
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_FEEDBACK_PER_WINDOW = 30;

// Feedback type mapping for scoring
const FEEDBACK_SCORES = {
  love: 4,
  like: 3,
  meh: 2,
  dislike: 1,
} as const;
type FeedbackType = keyof typeof FEEDBACK_SCORES;
export const submitFeedback = mutation({
  args: {
    trackId: v.id("tracks"),
    type: v.union(v.literal("love"), v.literal("like"), v.literal("meh"), v.literal("dislike")),
    isAnonymous: v.optional(v.boolean()),
    deviceType: v.optional(v.string()),
    sessionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const now = Date.now();
    
    // Validate track exists
    const track = await ctx.db.get(args.trackId);
    if (!track) {
      throw new Error("Track not found");
    }

    // Rate limiting check
    if (userId) {
      const recentFeedback = await ctx.db
        .query("feedback")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .filter((q) => q.gt(q.field("timestamp"), now - RATE_LIMIT_WINDOW))
        .collect();
      
      if (recentFeedback.length >= MAX_FEEDBACK_PER_WINDOW) {
        throw new Error("Rate limit exceeded. Please wait before submitting more feedback.");
      }
    }

    // Check for existing feedback
    let existingFeedback = null;
    if (userId && !args.isAnonymous) {
      existingFeedback = await ctx.db
        .query("feedback")
        .withIndex("by_track_user", (q) => q.eq("trackId", args.trackId).eq("userId", userId))
        .first();
    } else if (args.sessionId) {
      const sessionId = args.sessionId;
      existingFeedback = await ctx.db
        .query("feedback")
        .withIndex("by_session", (q) => q.eq("sessionId", sessionId))
        .filter((q) => q.eq(q.field("trackId"), args.trackId))
        .first();
    }

    // Update or create feedback
    let feedbackId;
    if (existingFeedback) {
      await ctx.db.patch(existingFeedback._id, {
        type: args.type,
        timestamp: now,
        deviceType: args.deviceType || "unknown",
      });
      feedbackId = existingFeedback._id;
    } else {
      // Handle userId properly - convert null to undefined
      const userIdForInsert = args.isAnonymous || !userId ? undefined : userId;
      
      feedbackId = await ctx.db.insert("feedback", {
        trackId: args.trackId,
        userId: userIdForInsert,
        type: args.type,
        timestamp: now,
        isAnonymous: args.isAnonymous || false,
        deviceType: args.deviceType || "unknown",
        sessionId: args.sessionId || `anon_${now}_${Math.random()}`,
      });
    }

    // Update feedback stats
    await updateFeedbackStats(ctx, args.trackId);
    
    return { success: true, feedbackId };
  },
});

export const updateFeedback = mutation({
  args: {
    feedbackId: v.id("feedback"),
    type: v.union(v.literal("love"), v.literal("like"), v.literal("meh"), v.literal("dislike")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const feedback = await ctx.db.get(args.feedbackId);
    
    if (!feedback) {
      throw new Error("Feedback not found");
    }

    // Authorization check
    if (!feedback.isAnonymous && feedback.userId !== userId) {
      throw new Error("Not authorized to update this feedback");
    }

    await ctx.db.patch(args.feedbackId, {
      type: args.type,
      timestamp: Date.now(),
    });

    // Update feedback stats
    await updateFeedbackStats(ctx, feedback.trackId);
    
    return { success: true };
  },
});

export const deleteFeedback = mutation({
  args: {
    feedbackId: v.id("feedback"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const feedback = await ctx.db.get(args.feedbackId);
    
    if (!feedback) {
      throw new Error("Feedback not found");
    }

    // Authorization check
    if (!feedback.isAnonymous && feedback.userId !== userId) {
      throw new Error("Not authorized to delete this feedback");
    }

    const trackId = feedback.trackId;
    await ctx.db.delete(args.feedbackId);

    // Update feedback stats
    await updateFeedbackStats(ctx, trackId);
    
    return { success: true };
  },
});

// Helper function to update feedback statistics
async function updateFeedbackStats(ctx: any, trackId: any) {
  const allFeedback = await ctx.db
    .query("feedback")
    .withIndex("by_track", (q: { eq: (arg0: string, arg1: any) => any; }) => q.eq("trackId", trackId))
    .collect();

  const stats = {
    loveCount: 0,
    likeCount: 0,
    mehCount: 0,
    dislikeCount: 0,
    totalFeedback: allFeedback.length,
    averageRating: 0,
    lastUpdated: Date.now(),
  };

  let totalScore = 0;
  for (const feedback of allFeedback) {
    const feedbackType = feedback.type as FeedbackType;
    stats[`${feedbackType}Count` as keyof typeof stats] += 1;
    totalScore += FEEDBACK_SCORES[feedbackType];
  }

  if (stats.totalFeedback > 0) {
    stats.averageRating = totalScore / stats.totalFeedback;
  }

  // Update or create stats record
  const existingStats = await ctx.db
    .query("feedbackStats")
    .withIndex("by_track", (q: { eq: (arg0: string, arg1: any) => any; }) => q.eq("trackId", trackId))
    .first();

  if (existingStats) {
    await ctx.db.patch(existingStats._id, stats);
  } else {
    await ctx.db.insert("feedbackStats", {
      trackId,
      ...stats,
    });
  }
}

export const getFeedbackStats = query({
  args: {
    trackId: v.id("tracks"),
  },
  handler: async (ctx, args) => {
    const stats = await ctx.db
      .query("feedbackStats")
      .withIndex("by_track", (q) => q.eq("trackId", args.trackId))
      .first();

    if (!stats) {
      return {
        trackId: args.trackId,
        loveCount: 0,
        likeCount: 0,
        mehCount: 0,
        dislikeCount: 0,
        totalFeedback: 0,
        averageRating: 0,
        lastUpdated: Date.now(),
      };
    }

    return stats;
  },
});

export const getUserFeedback = query({
  args: {
    trackId: v.optional(v.id("tracks")),
    sessionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    
    if (!userId && !args.sessionId) {
      return null;
    }

    // Initialize query properly
    let feedbackQuery;
    
    if (userId) {
      feedbackQuery = ctx.db
        .query("feedback")
        .withIndex("by_user", (q) => q.eq("userId", userId));
    } else if (args.sessionId) {
      // Type guard to ensure sessionId is defined
      const sessionId = args.sessionId;
      feedbackQuery = ctx.db
        .query("feedback")
        .withIndex("by_session", (q) => q.eq("sessionId", sessionId));
    } else {
      return null;
    }

    if (args.trackId) {
      const feedback = await feedbackQuery
        .filter((q) => q.eq(q.field("trackId"), args.trackId))
        .first();
      return feedback;
    }

    const allFeedback = await feedbackQuery.collect();
    return allFeedback;
  },
});

export const getTrendingTracks = query({
  args: {
    timeframe: v.optional(v.string()),
    category: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const timeframe = args.timeframe || "24h";
    const limit = args.limit || 20;
    
    let query = ctx.db
      .query("trendingTracks")
      .withIndex("by_timeframe_rank", (q) => q.eq("timeframe", timeframe));

    if (args.category && args.category !== "all") {
      // Type guard to ensure category is defined
      const category = args.category;
      query = query.filter((q) => q.eq(q.field("category"), category));
    }

    const trendingData = await query
      .order("asc")
      .take(limit);

    // Get full track data with feedback stats
    const tracksWithStats = await Promise.all(
      trendingData.map(async (trending) => {
        const track = await ctx.db.get(trending.trackId);
        const stats = await ctx.db
          .query("feedbackStats")
          .withIndex("by_track", (q) => q.eq("trackId", trending.trackId))
          .first();

        if (!track) return null;

        const audioUrl = await ctx.storage.getUrl(track.audioFileId);
        const coverArtUrl = track.coverArtId
          ? await ctx.storage.getUrl(track.coverArtId)
          : null;

        let uploaderName = "Anonymous User";
        if (track.uploadedBy) {
          const user = await ctx.db.get(track.uploadedBy);
          uploaderName = user?.name || user?.email || "Anonymous User";
        }

        return {
          ...track,
          audioUrl,
          coverArtUrl,
          uploaderName,
          trendingScore: trending.score,
          trendingRank: trending.rank,
          feedbackStats: stats || {
            loveCount: 0,
            likeCount: 0,
            mehCount: 0,
            dislikeCount: 0,
            totalFeedback: 0,
            averageRating: 0,
          },
        };
      })
    );

    return tracksWithStats.filter(Boolean);
  },
});

export const getFeedbackStream = query({
  args: {
    sortBy: v.optional(v.string()),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const sortBy = args.sortBy || "recent";
    const limit = args.limit || 20;
    const offset = args.offset || 0;

    let tracks;
    
    if (sortBy === "trending") {
      // Get tracks sorted by feedback activity
      const stats = await ctx.db
        .query("feedbackStats")
        .withIndex("by_total", (q) => q.gt("totalFeedback", 0))
        .order("desc")
        .take(limit + offset);
      
      tracks = await Promise.all(
        stats.slice(offset).map(async (stat) => {
          const track = await ctx.db.get(stat.trackId);
          return track ? { ...track, feedbackStats: stat } : null;
        })
      );
    } else if (sortBy === "controversial") {
      // Get tracks with mixed feedback (high total, average rating around 2.5)
      const stats = await ctx.db
        .query("feedbackStats")
        .withIndex("by_total", (q) => q.gt("totalFeedback", 5))
        .collect();
      
      const controversial = stats
        .filter(stat => Math.abs(stat.averageRating - 2.5) < 0.5)
        .sort((a, b) => b.totalFeedback - a.totalFeedback)
        .slice(offset, offset + limit);
      
      tracks = await Promise.all(
        controversial.map(async (stat) => {
          const track = await ctx.db.get(stat.trackId);
          return track ? { ...track, feedbackStats: stat } : null;
        })
      );
    } else {
      // Default: recent tracks with feedback
      const recentFeedback = await ctx.db
        .query("feedback")
        .withIndex("by_timestamp")
        .order("desc")
        .take(limit * 2); // Get more to account for duplicates
      
      const uniqueTrackIds = [...new Set(recentFeedback.map(f => f.trackId))];
      const trackIds = uniqueTrackIds.slice(offset, offset + limit);
      
      tracks = await Promise.all(
        trackIds.map(async (trackId) => {
          const track = await ctx.db.get(trackId);
          const stats = await ctx.db
            .query("feedbackStats")
            .withIndex("by_track", (q) => q.eq("trackId", trackId))
            .first();
          return track ? { ...track, feedbackStats: stats } : null;
        })
      );
    }

    // Add URLs and uploader info
    const tracksWithUrls = await Promise.all(
      tracks.filter((track): track is NonNullable<typeof track> => track !== null).map(async (track) => {
        const audioUrl = await ctx.storage.getUrl(track.audioFileId);
        const coverArtUrl = track.coverArtId
          ? await ctx.storage.getUrl(track.coverArtId)
          : null;

        let uploaderName = "Anonymous User";
        if (track.uploadedBy) {
          const user = await ctx.db.get(track.uploadedBy);
          uploaderName = user?.name || user?.email || "Anonymous User";
        }

        return {
          ...track,
          audioUrl,
          coverArtUrl,
          uploaderName,
        };
      })
    );

    return tracksWithUrls;
  },
});

// Trending calculation function (to be run periodically)
export const calculateTrendingScores = mutation({
  args: {
    timeframe: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const timeframes = {
      "1h": 60 * 60 * 1000,
      "24h": 24 * 60 * 60 * 1000,
      "7d": 7 * 24 * 60 * 60 * 1000,
      "30d": 30 * 24 * 60 * 60 * 1000,
    };
    
    const timeWindow = timeframes[args.timeframe as keyof typeof timeframes] || timeframes["24h"];
    const cutoffTime = now - timeWindow;

    // Get recent feedback within timeframe
    const recentFeedback = await ctx.db
      .query("feedback")
      .withIndex("by_timestamp", (q) => q.gt("timestamp", cutoffTime))
      .collect();

    // Calculate scores per track
    const trackScores = new Map();
    
    for (const feedback of recentFeedback) {
      const current = trackScores.get(feedback.trackId) || { score: 0, count: 0 };
      const timeWeight = (feedback.timestamp - cutoffTime) / timeWindow; // More recent = higher weight
      const feedbackScore = FEEDBACK_SCORES[feedback.type];
      
      current.score += feedbackScore * timeWeight;
      current.count += 1;
      trackScores.set(feedback.trackId, current);
    }

    // Sort and rank tracks
    const sortedTracks = Array.from(trackScores.entries())
      .map(([trackId, data]) => ({
        trackId,
        score: data.score / Math.max(data.count, 1), // Average weighted score
        totalFeedback: data.count,
      }))
      .sort((a, b) => b.score - a.score);

    // Clear existing trending data for this timeframe
    const existingTrending = await ctx.db
      .query("trendingTracks")
      .withIndex("by_timeframe_score", (q) => q.eq("timeframe", args.timeframe))
      .collect();
    
    for (const trending of existingTrending) {
      await ctx.db.delete(trending._id);
    }

    // Insert new trending data
    for (let i = 0; i < Math.min(sortedTracks.length, 100); i++) {
      const track = sortedTracks[i];
      await ctx.db.insert("trendingTracks", {
        trackId: track.trackId,
        score: track.score,
        timeframe: args.timeframe,
        category: "all", // Can be extended for genre-specific trending
        rank: i + 1,
        lastCalculated: now,
      });
    }

    return { processed: sortedTracks.length, timeframe: args.timeframe };
  },
});
