import { useAudio } from "../../hooks/useAudio";
import { formatDuration } from "../../lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Music, Volume2, VolumeX, SkipBack, SkipForward } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useDeviceDetection, useGlassIntensity } from "../../hooks/useDeviceDetection";
import { MobileGestureControls } from "./MobileGestureControls";
import { MobileAudioVisualizer } from "./MobileAudioVisualizer";

export function MobileEnhancedMusicWidget() {
  const { 
    currentTrack, 
    currentTrackMetadata, 
    isPlaying, 
    pauseTrack, 
    volume, 
    setVolume, 
    currentTime, 
    duration, 
    seekTo 
  } = useAudio();
  
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [glassState, setGlassState] = useState<'idle' | 'interaction' | 'playing' | 'paused'>('idle');
  const [visualizerStyle, setVisualizerStyle] = useState<'micro-glass' | 'glass-particles' | 'minimal-bars' | 'glass-ripple'>('micro-glass');
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  
  const deviceInfo = useDeviceDetection();
  const glassConfig = useGlassIntensity(deviceInfo);

  // Get audio element for visualization
  useEffect(() => {
    const audioElements = document.querySelectorAll('audio');
    if (audioElements.length > 0) {
      audioElementRef.current = audioElements[0];
    }
  }, [currentTrack]);

  // Update glass state based on playing status
  useEffect(() => {
    setGlassState(isPlaying ? 'playing' : 'paused');
  }, [isPlaying]);

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
    
    // Haptic feedback on mobile
    if (deviceInfo.supportsHaptics) {
      navigator.vibrate(10);
    }
  };

  const handlePlayPause = () => {
    pauseTrack();
    setGlassState('interaction');
    
    // Haptic feedback
    if (deviceInfo.supportsHaptics) {
      navigator.vibrate(20);
    }
    
    setTimeout(() => setGlassState(isPlaying ? 'paused' : 'playing'), 200);
  };

  // Mobile swipe gestures
  const handleSwipe = (direction: 'left' | 'right' | 'up' | 'down') => {
    switch (direction) {
      case 'left':
        // Skip to next track (placeholder)
        if (deviceInfo.supportsHaptics) {
          navigator.vibrate([10, 50, 10]);
        }
        break;
      case 'right':
        // Skip to previous track (placeholder)
        if (deviceInfo.supportsHaptics) {
          navigator.vibrate([10, 50, 10]);
        }
        break;
      case 'up': {
        // Increase volume
        const newVolumeUp = Math.min(1, volume + 0.1);
        setVolume(newVolumeUp);
        if (deviceInfo.supportsHaptics) {
          navigator.vibrate(10);
        }
        break;
      }
      case 'down': {
        // Decrease volume
        const newVolumeDown = Math.max(0, volume - 0.1);
        setVolume(newVolumeDown);
        if (deviceInfo.supportsHaptics) {
          navigator.vibrate(10);
        }
        break;
      }
    }
  };

  // Double tap to favorite (placeholder)
  const handleDoubleTap = () => {
    if (deviceInfo.supportsHaptics) {
      navigator.vibrate([50, 100, 50]);
    }
    // Add to favorites logic here
  };

  const getGlassClasses = () => {
    const baseClasses = "glass-pod";
    
    if (deviceInfo.type === 'mobile') {
      if (deviceInfo.isLowPowerMode) {
        return `${baseClasses}-micro`;
      }
      return glassState === 'interaction' ? `${baseClasses} glass-interaction` : 
             glassState === 'playing' ? `${baseClasses} glass-playing breathing-glass` :
             `${baseClasses} glass-${glassState}`;
    }
    
    return baseClasses;
  };

  // Mobile-specific floating pod positioning
  const podVariants = {
    collapsed: {
      y: 0,
      scale: 1,
      borderRadius: deviceInfo.type === 'mobile' ? 24 : 16
    },
    expanded: {
      y: -20,
      scale: deviceInfo.type === 'mobile' ? 1.05 : 1.02,
      borderRadius: deviceInfo.type === 'mobile' ? 32 : 20
    }
  };

  return (
    <MobileGestureControls>
      <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate="collapsed"
        exit={{ y: 100, opacity: 0 }}
        variants={podVariants}
        transition={{ 
          type: "spring", 
          damping: 25, 
          stiffness: 300,
          duration: deviceInfo.isLowPowerMode ? 0.6 : 0.4
        }}
        className={`fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto ${getGlassClasses()}`}
        onTouchStart={() => setGlassState('interaction')}
        onTouchEnd={() => setGlassState(isPlaying ? 'playing' : 'paused')}
        onPanEnd={(_, _info) => {
          const { offset, velocity } = _info;
          const threshold = 50;
          const velocityThreshold = 300;
          
          if (Math.abs(offset.x) > Math.abs(offset.y)) {
            // Horizontal swipe
            if (offset.x > threshold || velocity.x > velocityThreshold) {
              handleSwipe('right');
            } else if (offset.x < -threshold || velocity.x < -velocityThreshold) {
              handleSwipe('left');
            }
          } else {
            // Vertical swipe
            if (offset.y > threshold || velocity.y > velocityThreshold) {
              handleSwipe('down');
            } else if (offset.y < -threshold || velocity.y < -velocityThreshold) {
              handleSwipe('up');
            }
          }
        }}
        onTap={(_, _info) => {
          // Double tap detection
          const now = Date.now();
          const lastTap = (window as any).lastTapTime || 0;
          if (now - lastTap < 300) {
            handleDoubleTap();
          }
          (window as any).lastTapTime = now;
        }}
        style={{
          '--beat-interval': '2s', // Will be dynamic based on actual beat detection
          '--dynamic-blur': `${glassConfig.blurIntensity}px`
        } as React.CSSProperties}
      >
        {/* Ultra-thin progress bar for mobile */}
        <div 
          className="h-1 bg-slate-700/60 cursor-pointer hover:h-2 transition-all duration-200 rounded-t-2xl"
          onClick={handleProgressClick}
        >
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-2xl"
            style={{ width: `${progress}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>

        {/* Mobile Audio Visualizer */}
        {deviceInfo.type === 'mobile' && isPlaying && (
          <div className="px-4 pt-2">
            <MobileAudioVisualizer
              audioElement={audioElementRef.current}
              isPlaying={isPlaying}
              style={visualizerStyle}
              className="mb-2"
            />
            
            {/* Visualizer style switcher */}
            <div className="flex justify-center gap-1 mb-2">
              {(['micro-glass', 'glass-particles', 'minimal-bars', 'glass-ripple'] as const).map((style) => (
                <button
                  type="button"
                  key={style}
                  onClick={() => setVisualizerStyle(style)}
                  aria-label={`Switch to ${style} visualizer style`}
                  title={`Switch to ${style} visualizer style`}
                  className={`w-2 h-2 rounded-full transition-all ${
                    visualizerStyle === style 
                      ? 'bg-blue-400 scale-125' 
                      : 'bg-slate-600 hover:bg-slate-500'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        <div className={`p-${deviceInfo.type === 'mobile' ? '4' : '3'}`}>
          <div className="flex items-center gap-3">
            {/* Enhanced Album Art with breathing effect */}
            <motion.div 
              className={`${deviceInfo.type === 'mobile' ? 'w-14 h-14' : 'w-12 h-12'} rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-slate-700/60 to-slate-800/60`}
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
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Music className={`${deviceInfo.type === 'mobile' ? 'w-6 h-6' : 'w-5 h-5'} text-slate-400`} />
                </div>
              )}
            </motion.div>

            {/* Track Info - Expandable on mobile */}
            <div className="flex-1 min-w-0">
              <h4 className={`font-semibold text-slate-100 truncate ${deviceInfo.type === 'mobile' ? 'text-base' : 'text-sm'}`}>
                {currentTrackMetadata.title}
              </h4>
              <p className={`text-slate-300 truncate ${deviceInfo.type === 'mobile' ? 'text-sm' : 'text-xs'}`}>
                {currentTrackMetadata.artist}
              </p>
              <div className={`flex items-center gap-2 text-slate-400 mt-1 ${deviceInfo.type === 'mobile' ? 'text-sm' : 'text-xs'}`}>
                <span>{formatDuration(currentTime)}</span>
                <span>/</span>
                <span>{formatDuration(duration)}</span>
              </div>
            </div>

            {/* Mobile-optimized controls */}
            <div className="flex items-center gap-2">
              {/* Skip Back (mobile only) */}
              {deviceInfo.type === 'mobile' && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-slate-300 hover:bg-slate-700/60 transition-colors"
                >
                  <SkipBack className="w-5 h-5" />
                </motion.button>
              )}

              {/* Play/Pause Button - Larger on mobile */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handlePlayPause}
                className={`${deviceInfo.type === 'mobile' ? 'w-12 h-12' : 'w-10 h-10'} rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow`}
              >
                {isPlaying ? (
                  <Pause className={`${deviceInfo.type === 'mobile' ? 'w-5 h-5' : 'w-4 h-4'}`} />
                ) : (
                  <Play className={`${deviceInfo.type === 'mobile' ? 'w-5 h-5 ml-0.5' : 'w-4 h-4 ml-0.5'}`} />
                )}
              </motion.button>

              {/* Skip Forward (mobile only) */}
              {deviceInfo.type === 'mobile' && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-slate-300 hover:bg-slate-700/60 transition-colors"
                >
                  <SkipForward className="w-5 h-5" />
                </motion.button>
              )}

              {/* Volume Control - Touch optimized */}
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowVolumeSlider(!showVolumeSlider)}
                  className={`${deviceInfo.type === 'mobile' ? 'w-10 h-10' : 'w-8 h-8'} rounded-lg flex items-center justify-center text-slate-300 hover:bg-slate-700/60 transition-colors`}
                >
                  {volume === 0 ? (
                    <VolumeX className={`${deviceInfo.type === 'mobile' ? 'w-5 h-5' : 'w-4 h-4'}`} />
                  ) : (
                    <Volume2 className={`${deviceInfo.type === 'mobile' ? 'w-5 h-5' : 'w-4 h-4'}`} />
                  )}
                </motion.button>

                <AnimatePresence>
                  {showVolumeSlider && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.9 }}
                      className={`absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 glass-pod-minimal rounded-lg shadow-lg p-3 ${deviceInfo.type === 'mobile' ? 'w-32' : 'w-24'}`}
                    >
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={(e) => setVolume(parseFloat(e.target.value))}
                        className={`${deviceInfo.type === 'mobile' ? 'w-24 h-2' : 'w-20 h-1'} bg-slate-200 rounded-lg appearance-none cursor-pointer slider`}
                        aria-label="Volume control"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
    </MobileGestureControls>
  );
}