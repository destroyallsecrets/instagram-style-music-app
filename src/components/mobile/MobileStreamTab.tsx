import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { MobileTrackCard } from "./MobileTrackCard";
import { motion } from "framer-motion";
import { Music, TrendingUp, Clock } from "lucide-react";
import { useState } from "react";

type SortOption = "recent" | "trending" | "alphabetical";

export function MobileStreamTab() {
  const tracks = useQuery(api.tracks.getAllTracks);
  const [sortBy, setSortBy] = useState<SortOption>("recent");

  if (tracks === undefined) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full mb-4"
        />
        <p className="text-slate-300 font-medium">Loading tracks...</p>
      </div>
    );
  }

  if (tracks.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center py-20"
      >
        <div className="bg-slate-800/40 backdrop-blur-sm rounded-3xl p-8 mx-4 border border-slate-700/50">
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="text-6xl mb-6"
          >
            🎵
          </motion.div>
          <h3 className="text-2xl font-bold text-slate-100 mb-3">No tracks yet</h3>
          <p className="text-slate-300 leading-relaxed">
            No tracks available yet. Check back soon for new music!
          </p>
        </div>
      </motion.div>
    );
  }

  // Sort tracks based on selected option
  const sortedTracks = [...tracks].sort((a, b) => {
    switch (sortBy) {
      case "trending":
        // Sort by creation time for now (could be enhanced with play counts)
        return new Date(b._creationTime).getTime() - new Date(a._creationTime).getTime();
      case "alphabetical":
        return a.title.localeCompare(b.title);
      case "recent":
      default:
        return new Date(b._creationTime).getTime() - new Date(a._creationTime).getTime();
    }
  });

  const sortOptions = [
    { id: "recent" as const, label: "Recent", icon: Clock },
    { id: "trending" as const, label: "Trending", icon: TrendingUp },
    { id: "alphabetical" as const, label: "A-Z", icon: Music },
  ];

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-100">Discover Music</h2>
            <p className="text-sm text-slate-400">{tracks.length} track{tracks.length !== 1 ? 's' : ''} available</p>
          </div>
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
            <Music className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Sort Options */}
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {sortOptions.map((option) => {
            const Icon = option.icon;
            const isActive = sortBy === option.id;
            
            return (
              <motion.button
                key={option.id}
                type="button"
                onClick={() => setSortBy(option.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all duration-200 ${
                  isActive 
                    ? 'bg-gradient-to-r from-blue-500/20 to-purple-600/20 border border-blue-500/30 text-blue-400' 
                    : 'bg-slate-800/40 border border-slate-700/50 text-slate-300 hover:bg-slate-700/40'
                }`}
                whileTap={{ scale: 0.95 }}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{option.label}</span>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Tracks List */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="space-y-3"
      >
        {sortedTracks.map((track, index) => (
          <motion.div
            key={track._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.4, 
              delay: index * 0.05,
              ease: "easeOut"
            }}
          >
            <MobileTrackCard track={track} showUploader index={index} />
          </motion.div>
        ))}
      </motion.div>

      {/* Load More Button (placeholder for pagination) */}
      {tracks.length > 10 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex justify-center pt-4"
        >
          <button
            type="button"
            className="px-6 py-3 bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-xl text-slate-300 font-medium hover:bg-slate-700/60 transition-colors"
          >
            Load More Tracks
          </button>
        </motion.div>
      )}
    </div>
  );
}