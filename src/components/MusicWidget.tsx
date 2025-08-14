import { useAudio } from "../hooks/useAudio";
import { formatDuration } from "../lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Music, Volume2, SkipBack, SkipForward } from "lucide-react";

export function MusicWidget() {
  const { currentTrack, currentTrackMetadata, isPlaying, pauseTrack, volume, setVolume, currentTime, duration } = useAudio();

  // Don't render if no track is playing
  if (!currentTrack || !currentTrackMetadata) {
    return null;
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed bottom-4 left-4 right-4 z-50 max-w-sm mx-auto"
      >
        <div className="glass rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl bg-slate-900/80">
          <div className="p-8 text-center">
            {/* Circular Album Art with Progress Ring */}
            <div className="relative w-48 h-48 mx-auto mb-6">
              {/* Progress Ring */}
              <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Background Circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="46"
                  fill="none"
                  stroke="rgba(148, 163, 184, 0.2)"
                  strokeWidth="2"
                />
                {/* Progress Circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="46"
                  fill="none"
                  stroke="url(#progressGradient)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 46}`}
                  strokeDashoffset={`${2 * Math.PI * 46 * (1 - progress / 100)}`}
                  className="transition-all duration-300"
                />
                <defs>
                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </svg>
              
              {/* Album Art */}
              <div className="absolute inset-4 rounded-full overflow-hidden bg-gradient-to-br from-slate-700/60 to-slate-800/60">
                {currentTrackMetadata.coverArtUrl ? (
                  <img
                    src={currentTrackMetadata.coverArtUrl}
                    alt={`${currentTrackMetadata.title} cover`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Music className="w-16 h-16 text-slate-400" />
                  </div>
                )}
              </div>
            </div>

            {/* Track Info */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white mb-2 truncate">
                {currentTrackMetadata.title}
              </h2>
              <p className="text-slate-300 truncate">
                {currentTrackMetadata.artist}
              </p>
            </div>

            {/* Time Display */}
            <div className="flex justify-center items-center gap-2 text-sm text-slate-400 mb-6">
              <span>{formatDuration(currentTime)}</span>
              <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
              <span>{formatDuration(duration)}</span>
            </div>

            {/* Volume Control */}
            <div className="flex items-center justify-center mb-6">
              <Volume2 className="w-4 h-4 text-slate-400 mr-3" />
              <div className="flex-1 max-w-32">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                  aria-label="Volume control"
                />
              </div>
              <Volume2 className="w-4 h-4 text-slate-400 ml-3" />
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-center gap-6">
              {/* Previous Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-12 h-12 rounded-full flex items-center justify-center text-slate-300 hover:text-white transition-colors"
              >
                <SkipBack className="w-6 h-6" />
              </motion.button>

              {/* Play/Pause Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={pauseTrack}
                className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow"
              >
                {isPlaying ? (
                  <Pause className="w-7 h-7" />
                ) : (
                  <Play className="w-7 h-7 ml-1" />
                )}
              </motion.button>

              {/* Next Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-12 h-12 rounded-full flex items-center justify-center text-slate-300 hover:text-white transition-colors"
              >
                <SkipForward className="w-6 h-6" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}