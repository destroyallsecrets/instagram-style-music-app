import { useAudio } from "../hooks/useAudio";
import { formatDuration } from "../lib/utils";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { Play, Pause, Music, Volume2, SkipBack, SkipForward, Heart, Minimize2 } from "lucide-react";
import { useDeviceDetection } from "../hooks/useDeviceDetection";
import { useState, useEffect } from "react";
import "./VolumeSlider.css";

export function MusicWidget() {
  const { currentTrack, currentTrackMetadata, isPlaying, pauseTrack, volume, setVolume, currentTime, duration } = useAudio();
  const deviceInfo = useDeviceDetection();
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Keyboard shortcuts - moved before early return to follow Rules of Hooks
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return; // Don't interfere with input fields
      
      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          pauseTrack();
          break;
        case 'arrowup':
          e.preventDefault();
          setVolume(Math.min(1, volume + 0.1));
          break;
        case 'arrowdown':
          e.preventDefault();
          setVolume(Math.max(0, volume - 0.1));
          break;
        case 'm':
          e.preventDefault();
          setIsMinimized(!isMinimized);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [pauseTrack, volume, setVolume, isMinimized]);

  // Handle swipe gestures
  const handlePan = (_event: any, info: PanInfo) => {
    if (Math.abs(info.offset.x) > 100) {
      if (info.offset.x > 0) {
        // Swipe right - previous track
        console.log("Previous track");
      } else {
        // Swipe left - next track
        console.log("Next track");
      }
    }
    if (info.offset.y < -100) {
      // Swipe up - minimize
      setIsMinimized(true);
    }
  };

  // Don't render if no track is playing
  if (!currentTrack || !currentTrackMetadata) {
    return null;
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Responsive positioning and sizing based on device type
  const getWidgetClasses = () => {
    switch (deviceInfo.type) {
      case 'mobile':
        return "fixed bottom-4 left-4 right-4 z-50 max-w-sm mx-auto";
      case 'tablet':
        return "fixed bottom-6 left-6 right-6 z-50 max-w-md mx-auto";
      case 'desktop':
        return "fixed bottom-8 right-8 z-50 w-96";
      default:
        return "fixed bottom-4 left-4 right-4 z-50 max-w-sm mx-auto";
    }
  };

  const getContentClasses = () => {
    switch (deviceInfo.type) {
      case 'mobile':
        return "p-6 text-center";
      case 'tablet':
        return "p-7 text-center";
      case 'desktop':
        return "p-8 text-center";
      default:
        return "p-6 text-center";
    }
  };

  const getAlbumArtSize = () => {
    switch (deviceInfo.type) {
      case 'mobile':
        return "w-40 h-40";
      case 'tablet':
        return "w-44 h-44";
      case 'desktop':
        return "w-48 h-48";
      default:
        return "w-40 h-40";
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ 
          y: 0, 
          opacity: 1,
          scale: isMinimized ? 0.8 : 1,
          height: isMinimized ? "auto" : "auto"
        }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className={getWidgetClasses()}
        drag={deviceInfo.type === 'mobile'}
        dragConstraints={{ left: 0, right: 0, top: -50, bottom: 50 }}
        dragElastic={0.1}
        onPan={handlePan}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={() => setIsDragging(false)}
        whileDrag={{ scale: 1.05, rotate: isDragging ? 2 : 0 }}
      >
        <div className="glass rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl bg-slate-900/80 relative">
          {/* Quick Actions Bar */}
          <div className="absolute top-3 right-3 flex gap-2 z-10">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsMinimized(!isMinimized)}
              className="w-8 h-8 rounded-full bg-slate-800/60 backdrop-blur-sm flex items-center justify-center text-slate-300 hover:text-white transition-colors"
            >
              <Minimize2 className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-8 h-8 rounded-full bg-slate-800/60 backdrop-blur-sm flex items-center justify-center text-slate-300 hover:text-red-400 transition-colors"
            >
              <Heart className="w-4 h-4" />
            </motion.button>
          </div>
          {isMinimized ? (
            /* Minimized State */
            <div className="p-4 flex items-center gap-3">
              <div className="relative w-12 h-12">
                <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-slate-700/60 to-slate-800/60">
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
                </div>
                {/* Mini progress ring */}
                <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50" cy="50" r="46" fill="none"
                    stroke="url(#progressGradient)" strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 46}`}
                    strokeDashoffset={`${2 * Math.PI * 46 * (1 - progress / 100)}`}
                    className="transition-all duration-300"
                  />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate text-sm">{currentTrackMetadata.title}</p>
                <p className="text-slate-400 truncate text-xs">{currentTrackMetadata.artist}</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={pauseTrack}
                className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white flex items-center justify-center"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </motion.button>
            </div>
          ) : (
            <div className={getContentClasses()}>
              {/* Circular Album Art with Interactive Progress Ring */}
            <div className={`relative ${getAlbumArtSize()} mx-auto mb-6 group`}>
              {/* Interactive Progress Ring */}
              <svg 
                className="absolute inset-0 w-full h-full transform -rotate-90 cursor-pointer" 
                viewBox="0 0 100 100"
                onClick={(e) => {
                  // Calculate click position for seeking
                  const rect = e.currentTarget.getBoundingClientRect();
                  const centerX = rect.left + rect.width / 2;
                  const centerY = rect.top + rect.height / 2;
                  const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
                  const normalizedAngle = (angle + Math.PI / 2) / (2 * Math.PI);
                  const seekTime = Math.max(0, Math.min(1, normalizedAngle)) * duration;
                  // TODO: Implement seek functionality
                  console.log('Seek to:', seekTime);
                }}
              >
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
                  className="transition-all duration-300 group-hover:stroke-[4px]"
                />
                <defs>
                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </svg>
              
              {/* Album Art with Hover Effects */}
              <motion.div 
                className="absolute inset-4 rounded-full overflow-hidden bg-gradient-to-br from-slate-700/60 to-slate-800/60 cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={pauseTrack}
              >
                {currentTrackMetadata.coverArtUrl ? (
                  <img
                    src={currentTrackMetadata.coverArtUrl}
                    alt={`${currentTrackMetadata.title} cover`}
                    className="w-full h-full object-cover transition-all duration-300 group-hover:brightness-75"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Music className="w-16 h-16 text-slate-400" />
                  </div>
                )}
                
                {/* Play/Pause Overlay on Hover */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  {isPlaying ? (
                    <Pause className="w-12 h-12 text-white" />
                  ) : (
                    <Play className="w-12 h-12 text-white ml-1" />
                  )}
                </div>
              </motion.div>
            </div>

            {/* Track Info with Animation */}
            <motion.div 
              className="mb-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <motion.h2 
                className="text-xl font-bold text-white mb-2 truncate cursor-pointer hover:text-blue-300 transition-colors"
                whileHover={{ scale: 1.02 }}
                title={currentTrackMetadata.title}
              >
                {currentTrackMetadata.title}
              </motion.h2>
              <motion.p 
                className="text-slate-300 truncate cursor-pointer hover:text-slate-200 transition-colors"
                whileHover={{ scale: 1.02 }}
                title={currentTrackMetadata.artist}
              >
                {currentTrackMetadata.artist}
              </motion.p>

            </motion.div>

            {/* Time Display */}
            <div className="flex justify-center items-center gap-2 text-sm text-slate-400 mb-6">
              <span>{formatDuration(currentTime)}</span>
              <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
              <span>{formatDuration(duration)}</span>
            </div>

            {/* Enhanced Volume Control */}
            <motion.div 
              className="flex items-center justify-center mb-6 group"
              whileHover={{ scale: 1.02 }}
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="mr-3"
              >
                <Volume2 className={`w-4 h-4 transition-colors ${volume > 0.5 ? 'text-blue-400' : volume > 0 ? 'text-slate-300' : 'text-slate-500'}`} />
              </motion.div>
              <div className="flex-1 max-w-32 relative">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider group-hover:h-3 transition-all volume-slider"
                  aria-label="Volume control"
                  data-volume-percent={volume * 100}
                />
                {/* Volume percentage tooltip */}
                <motion.div
                  className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                  initial={{ opacity: 0, y: 5 }}
                  whileHover={{ opacity: 1, y: 0 }}
                >
                  {Math.round(volume * 100)}%
                </motion.div>
              </div>
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="ml-3"
              >
                <Volume2 className="w-4 h-4 text-slate-400" />
              </motion.div>
            </motion.div>

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
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}