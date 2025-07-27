import { useAudio } from "./AudioProvider";
import { formatDuration } from "../lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Music, Volume2, VolumeX } from "lucide-react";
import { useState } from "react";

export function MusicWidget() {
  const { currentTrack, currentTrackMetadata, isPlaying, pauseTrack, volume, setVolume, currentTime, duration, seekTo } = useAudio();
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  // Don't render if no track is playing
  if (!currentTrack || !currentTrackMetadata) {
    return null;
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const clickProgress = clickX / width;
    const newTime = clickProgress * duration;
    seekTo(newTime);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto"
      >
        <div className="glass rounded-2xl shadow-xl overflow-hidden">
          {/* Progress bar */}
          <div 
            className="h-1 bg-slate-700/60 cursor-pointer hover:h-2 transition-all duration-200"
            onClick={handleProgressClick}
          >
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>

          <div className="p-4">
            <div className="flex items-center gap-3">
              {/* Album Art */}
              <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-slate-700/60 to-slate-800/60">
                {currentTrackMetadata.coverArtUrl ? (
                  <img
                    src={currentTrackMetadata.coverArtUrl}
                    alt={`${currentTrackMetadata.title} cover`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Music className="w-5 h-5 text-slate-400" />
                  </div>
                )}
              </div>

              {/* Track Info */}
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-slate-100 truncate text-sm">
                  {currentTrackMetadata.title}
                </h4>
                <p className="text-slate-300 truncate text-xs">
                  {currentTrackMetadata.artist}
                </p>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                  <span>{formatDuration(currentTime)}</span>
                  <span>/</span>
                  <span>{formatDuration(duration)}</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2">
                {/* Volume Control */}
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowVolumeSlider(!showVolumeSlider)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:bg-slate-700/60 transition-colors"
                  >
                    {volume === 0 ? (
                      <VolumeX className="w-4 h-4" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
                  </motion.button>

                  <AnimatePresence>
                    {showVolumeSlider && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 glass-light rounded-lg shadow-lg p-3"
                      >
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={volume}
                          onChange={(e) => setVolume(parseFloat(e.target.value))}
                          className="w-20 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer slider"
                          aria-label="Volume control"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Play/Pause Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={pauseTrack}
                  className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow"
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4 ml-0.5" />
                  )}
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}