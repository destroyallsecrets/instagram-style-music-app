import { useAudio } from "../../hooks/useAudio";
import { formatDuration } from "../../lib/utils";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { Play, Pause, Music, SkipBack, SkipForward, Heart, MoreHorizontal } from "lucide-react";
import { useState, useRef } from "react";
import { MobileAudioVisualizer } from "../enhanced/MobileAudioVisualizer";

export function MobileMusicWidget() {
  const { 
    currentTrack, 
    currentTrackMetadata, 
    isPlaying, 
    pauseTrack, 
    currentTime, 
    duration, 
    seekTo 
  } = useAudio();
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

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
    
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  };

  const handlePlayPause = () => {
    pauseTrack();
    
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(20);
    }
  };

  const handlePan = (_: any, info: PanInfo) => {
    const { offset, velocity } = info;
    
    // Swipe up to expand
    if (offset.y < -50 || velocity.y < -500) {
      setIsExpanded(true);
    }
    // Swipe down to collapse
    else if (offset.y > 50 || velocity.y > 500) {
      setIsExpanded(false);
    }
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <AnimatePresence>
      <motion.div
        className={`fixed left-4 right-4 z-30 ${isExpanded ? 'top-20 bottom-28' : 'bottom-28'}`}
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >
        <motion.div
          className={`bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 shadow-2xl ${
            isExpanded ? 'rounded-3xl' : 'rounded-2xl'
          } overflow-hidden`}
          layout
          drag={!isExpanded ? "y" : false}
          dragConstraints={{ top: -100, bottom: 0 }}
          dragElastic={0.2}
          onPan={handlePan}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          whileDrag={{ scale: 0.98 }}
          style={{
            cursor: isDragging ? 'grabbing' : 'grab'
          }}
        >
          {/* Drag Handle */}
          {!isExpanded && (
            <div className="flex justify-center pt-2 pb-1">
              <div className="w-8 h-1 bg-slate-600 rounded-full" />
            </div>
          )}

          {/* Progress Bar */}
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

          {isExpanded ? (
            // Expanded Player
            <div className="p-6 space-y-6">
              {/* Close Button */}
              <div className="flex justify-between items-center">
                <motion.button
                  type="button"
                  onClick={() => setIsExpanded(false)}
                  className="w-10 h-10 rounded-full bg-slate-800/60 flex items-center justify-center"
                  whileTap={{ scale: 0.9 }}
                >
                  <MoreHorizontal className="w-5 h-5 text-slate-300" />
                </motion.button>
                
                <motion.button
                  type="button"
                  className="w-10 h-10 rounded-full bg-slate-800/60 flex items-center justify-center"
                  whileTap={{ scale: 0.9 }}
                >
                  <Heart className="w-5 h-5 text-slate-300" />
                </motion.button>
              </div>

              {/* Large Album Art */}
              <div className="flex justify-center">
                <motion.div 
                  className="w-64 h-64 rounded-3xl overflow-hidden bg-gradient-to-br from-slate-700/60 to-slate-800/60 shadow-2xl"
                  animate={isPlaying ? { scale: [1, 1.02, 1] } : { scale: 1 }}
                  transition={{ 
                    duration: 2, 
                    repeat: isPlaying ? Infinity : 0,
                    ease: "easeInOut"
                  }}
                >
                  {currentTrackMetadata.coverArtUrl ? (
                    <img
                      src={currentTrackMetadata.coverArtUrl}
                      alt={`${currentTrackMetadata.title} cover`}
                      className="w--full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Music className="w-16 h-16 text-slate-400" />
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Audio Visualizer */}
              {isPlaying && (
                <div className="flex justify-center">
                  <MobileAudioVisualizer
                    audioElement={audioElementRef.current}
                    isPlaying={isPlaying}
                    style="glass-ripple"
                    className="w-full max-w-sm"
                  />
                </div>
              )}

              {/* Track Info */}
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-bold text-slate-100">
                  {currentTrackMetadata.title}
                </h3>
                <p className="text-lg text-slate-300">
                  {currentTrackMetadata.artist}
                </p>
                <div className="flex items-center justify-center space-x-2 text-slate-400">
                  <span>{formatDuration(currentTime)}</span>
                  <span>/</span>
                  <span>{formatDuration(duration)}</span>
                </div>
              </div>

              {/* Large Controls */}
              <div className="flex items-center justify-center space-x-8">
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.9 }}
                  className="w-14 h-14 rounded-full bg-slate-800/60 flex items-center justify-center"
                >
                  <SkipBack className="w-6 h-6 text-slate-300" />
                </motion.button>

                <motion.button
                  type="button"
                  onClick={handlePlayPause}
                  whileTap={{ scale: 0.9 }}
                  className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white flex items-center justify-center shadow-2xl"
                >
                  {isPlaying ? (
                    <Pause className="w-8 h-8" />
                  ) : (
                    <Play className="w-8 h-8 ml-1" />
                  )}
                </motion.button>

                <motion.button
                  type="button"
                  whileTap={{ scale: 0.9 }}
                  className="w-14 h-14 rounded-full bg-slate-800/60 flex items-center justify-center"
                >
                  <SkipForward className="w-6 h-6 text-slate-300" />
                </motion.button>
              </div>
            </div>
          ) : (
            // Compact Player
            <div className="p-4">
              <div className="flex items-center space-x-3">
                {/* Album Art */}
                <motion.div 
                  className="w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-slate-700/60 to-slate-800/60 flex-shrink-0"
                  animate={isPlaying ? { scale: [1, 1.05, 1] } : { scale: 1 }}
                  transition={{ 
                    duration: 2, 
                    repeat: isPlaying ? Infinity : 0,
                    ease: "easeInOut"
                  }}
                >
                  {currentTrackMetadata.coverArtUrl ? (
                    <img
                      src={currentTrackMetadata.coverArtUrl}
                      alt={`${currentTrackMetadata.title} cover`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Music className="w-6 h-6 text-slate-400" />
                    </div>
                  )}
                </motion.div>

                {/* Track Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-slate-100 truncate text-sm">
                    {currentTrackMetadata.title}
                  </h4>
                  <p className="text-slate-300 truncate text-xs">
                    {currentTrackMetadata.artist}
                  </p>
                </div>

                {/* Play/Pause Button */}
                <motion.button
                  type="button"
                  onClick={handlePlayPause}
                  whileTap={{ scale: 0.9 }}
                  className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white flex items-center justify-center shadow-lg"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5 ml-0.5" />
                  )}
                </motion.button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}