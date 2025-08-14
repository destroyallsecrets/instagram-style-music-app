import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { TrackCard } from "./TrackCard";
import { SkeletonLoader } from "./SkeletonLoader";
import { motion } from "framer-motion";
import { Music } from "lucide-react";

export function StreamTab() {
  const tracks = useQuery(api.tracks.getAllTracks);

  if (tracks === undefined) {
    return (
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8"
        >
          <p className="text-slate-300 font-medium mb-6">Loading tracks...</p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          <SkeletonLoader type="track-card" count={8} />
        </div>
      </div>
    );
  }

  if (tracks.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center py-16"
      >
        <div className="glass rounded-3xl p-12 max-w-md mx-auto">
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
            No tracks available yet
          </p>

        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between px-1"
      >
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center">
            <Music className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg sm:text-2xl font-bold text-slate-100">Music Stream</h2>
            <p className="text-xs sm:text-sm text-slate-300">{tracks.length} track{tracks.length !== 1 ? 's' : ''} available</p>
          </div>
        </div>
      </motion.div>

      {/* Tracks Grid */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="grid gap-3 sm:gap-4"
      >
        {tracks.map((track, index) => (
          <motion.div
            key={track._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.4, 
              delay: index * 0.1,
              ease: "easeOut"
            }}
          >
            <TrackCard track={track} showUploader />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
