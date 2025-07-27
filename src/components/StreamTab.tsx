import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { TrackCard } from "./TrackCard";
import { motion } from "framer-motion";
import { Music } from "lucide-react";

export function StreamTab() {
  const tracks = useQuery(api.tracks.getAllTracks);

  if (tracks === undefined) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
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
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Music className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-100">Music Stream</h2>
            <p className="text-slate-300">{tracks.length} track{tracks.length !== 1 ? 's' : ''} available</p>
          </div>
        </div>
      </motion.div>

      {/* Tracks Grid */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="grid gap-4 sm:gap-6"
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
