import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGestures } from '../../hooks/useGestures';
import { useAudio } from '../../hooks/useAudio';
import { useDeviceDetection } from '../../hooks/useDeviceDetection';
import { 
  SkipForward, 
  SkipBack, 
  Volume2, 
  VolumeX, 
  Heart,
  Shuffle,
  Repeat,
  MoreHorizontal,
  Play
} from 'lucide-react';

interface GestureIndicatorProps {
  gestureType: string;
  direction?: string;
  visible: boolean;
}

function GestureIndicator({ gestureType, direction, visible }: GestureIndicatorProps) {
  const getIndicatorContent = () => {
    switch (gestureType) {
      case 'swipe':
        switch (direction) {
          case 'left': return { icon: SkipForward, text: 'Next Track', color: 'from-blue-500 to-purple-600' };
          case 'right': return { icon: SkipBack, text: 'Previous Track', color: 'from-purple-500 to-pink-600' };
          case 'up': return { icon: Volume2, text: 'Volume Up', color: 'from-green-500 to-blue-600' };
          case 'down': return { icon: VolumeX, text: 'Volume Down', color: 'from-orange-500 to-red-600' };
          default: return null;
        }
      case 'double-tap': return { icon: Play, text: 'Play/Pause', color: 'from-indigo-500 to-purple-600' };
      case 'long-press': return { icon: Heart, text: 'Add to Favorites', color: 'from-pink-500 to-red-600' };
      case 'pinch': return { icon: MoreHorizontal, text: 'Quick Menu', color: 'from-slate-500 to-slate-700' };
      default: return null;
    }
  };

  const content = getIndicatorContent();
  if (!content) return null;

  const Icon = content.icon;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none"
        >
          <div className={`glass-pod rounded-2xl p-6 text-center bg-gradient-to-br ${content.color} backdrop-blur-xl`}>
            <Icon className="w-8 h-8 text-white mx-auto mb-2" />
            <p className="text-white font-medium text-sm">{content.text}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface MobileGestureControlsProps {
  children: React.ReactNode;
  className?: string;
}

export function MobileGestureControls({ children, className = '' }: MobileGestureControlsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { 
    pauseTrack, 
    volume, 
    setVolume,
    // Add these when available in AudioProvider
    // nextTrack,
    // previousTrack,
    // toggleFavorite
  } = useAudio();
  
  const deviceInfo = useDeviceDetection();
  const [gestureIndicator, setGestureIndicator] = useState<{
    gestureType: string;
    direction?: string;
    visible: boolean;
  }>({ gestureType: '', visible: false });

  const [quickMenuVisible, setQuickMenuVisible] = useState(false);
  const [volumeAdjustment, setVolumeAdjustment] = useState(0);

  // Only enable gestures on mobile devices
  const gesturesEnabled = deviceInfo.type === 'mobile' && deviceInfo.isTouchDevice;

  const gestureCallbacks = {
    onSwipeLeft: () => {
      // Next track
      console.log('Next track gesture');
      showGestureIndicator('swipe', 'left');
      // nextTrack?.(); // Implement when available
    },
    
    onSwipeRight: () => {
      // Previous track  
      console.log('Previous track gesture');
      showGestureIndicator('swipe', 'right');
      // previousTrack?.(); // Implement when available
    },
    
    onSwipeUp: () => {
      // Volume up
      const newVolume = Math.min(1, volume + 0.1);
      setVolume(newVolume);
      setVolumeAdjustment(0.1);
      showGestureIndicator('swipe', 'up');
      
      // Visual feedback
      setTimeout(() => setVolumeAdjustment(0), 1000);
    },
    
    onSwipeDown: () => {
      // Volume down
      const newVolume = Math.max(0, volume - 0.1);
      setVolume(newVolume);
      setVolumeAdjustment(-0.1);
      showGestureIndicator('swipe', 'down');
      
      // Visual feedback
      setTimeout(() => setVolumeAdjustment(0), 1000);
    },
    
    onDoubleTap: () => {
      // Play/pause
      pauseTrack();
      showGestureIndicator('double-tap');
    },
    
    onLongPress: () => {
      // Add to favorites
      console.log('Add to favorites gesture');
      showGestureIndicator('long-press');
      // toggleFavorite?.(currentTrack); // Implement when available
    },
    
    onPinchOut: (scale: number) => {
      // Show quick menu on pinch out
      if (scale > 1.2 && !quickMenuVisible) {
        setQuickMenuVisible(true);
        showGestureIndicator('pinch');
      }
    },
    
    onPinchIn: (scale: number) => {
      // Hide quick menu on pinch in
      if (scale < 0.8 && quickMenuVisible) {
        setQuickMenuVisible(false);
      }
    },

    onGestureStart: (_type: string) => {
      // Add visual feedback for gesture start
      if (containerRef.current) {
        containerRef.current.style.transform = 'scale(0.98)';
        containerRef.current.style.transition = 'transform 0.1s ease-out';
      }
    },

    onGestureEnd: () => {
      // Reset visual feedback
      if (containerRef.current) {
        containerRef.current.style.transform = 'scale(1)';
        containerRef.current.style.transition = 'transform 0.2s ease-out';
      }
      
      // Hide gesture indicator after delay
      setTimeout(() => {
        setGestureIndicator(prev => ({ ...prev, visible: false }));
      }, 1500);
    }
  };

  const _gestureState = useGestures(
    containerRef,
    gesturesEnabled ? gestureCallbacks : {},
    {
      swipeThreshold: 60,
      pinchThreshold: 0.15,
      doubleTapDelay: 300,
      longPressDelay: 600,
      velocityThreshold: 0.3
    }
  );

  const showGestureIndicator = (gestureType: string, direction?: string) => {
    setGestureIndicator({
      gestureType,
      direction,
      visible: true
    });
  };

  // Auto-hide quick menu after inactivity
  useEffect(() => {
    if (quickMenuVisible) {
      const timer = setTimeout(() => {
        setQuickMenuVisible(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [quickMenuVisible]);

  return (
    <>
      <div
        ref={containerRef}
        className={`relative ${className} ${
          gesturesEnabled ? 'touch-none select-none' : 'touch-auto'
        }`}
      >
        {children}
        
        {/* Volume adjustment indicator */}
        <AnimatePresence>
          {volumeAdjustment !== 0 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="fixed top-20 right-4 z-40 glass-pod-minimal rounded-lg p-2"
            >
              <div className="flex items-center gap-2 text-white">
                {volumeAdjustment > 0 ? (
                  <Volume2 className="w-4 h-4" />
                ) : (
                  <VolumeX className="w-4 h-4" />
                )}
                <div className="w-16 h-1 bg-slate-600 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300 volume-bar"
                    data-volume={Math.round(volume * 100)}
                  />
                </div>
                <span className="text-xs font-medium">{Math.round(volume * 100)}%</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick menu */}
        <AnimatePresence>
          {quickMenuVisible && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed bottom-24 left-4 right-4 z-40"
            >
              <div className="glass-pod rounded-2xl p-4 mx-auto max-w-sm">
                <div className="grid grid-cols-4 gap-4">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl glass-pod-minimal"
                    onClick={() => console.log('Shuffle toggle')}
                  >
                    <Shuffle className="w-5 h-5 text-slate-300" />
                    <span className="text-xs text-slate-400">Shuffle</span>
                  </motion.button>
                  
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl glass-pod-minimal"
                    onClick={() => console.log('Repeat toggle')}
                  >
                    <Repeat className="w-5 h-5 text-slate-300" />
                    <span className="text-xs text-slate-400">Repeat</span>
                  </motion.button>
                  
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl glass-pod-minimal"
                    onClick={() => console.log('Add to favorites')}
                  >
                    <Heart className="w-5 h-5 text-slate-300" />
                    <span className="text-xs text-slate-400">Favorite</span>
                  </motion.button>
                  
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl glass-pod-minimal"
                    onClick={() => setQuickMenuVisible(false)}
                  >
                    <MoreHorizontal className="w-5 h-5 text-slate-300" />
                    <span className="text-xs text-slate-400">More</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Gesture indicator overlay */}
      <GestureIndicator 
        gestureType={gestureIndicator.gestureType}
        direction={gestureIndicator.direction}
        visible={gestureIndicator.visible}
      />

      {/* Gesture tutorial overlay (show on first use) */}
      {gesturesEnabled && (
        <GestureTutorial />
      )}
    </>
  );
}

function GestureTutorial() {
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    // Check if user has seen tutorial before
    const hasSeenTutorial = localStorage.getItem('gesture-tutorial-seen');
    if (!hasSeenTutorial) {
      const timer = setTimeout(() => {
        setShowTutorial(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const closeTutorial = () => {
    setShowTutorial(false);
    localStorage.setItem('gesture-tutorial-seen', 'true');
  };

  return (
    <AnimatePresence>
      {showTutorial && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={closeTutorial}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="glass-pod rounded-2xl p-6 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-white mb-4 text-center">
              Music Gestures
            </h3>
            
            <div className="space-y-3 text-sm text-slate-300">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <SkipForward className="w-4 h-4 text-blue-400" />
                </div>
                <span>Swipe left for next track</span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <SkipBack className="w-4 h-4 text-purple-400" />
                </div>
                <span>Swipe right for previous track</span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Volume2 className="w-4 h-4 text-green-400" />
                </div>
                <span>Swipe up/down for volume</span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
                  <Play className="w-4 h-4 text-indigo-400" />
                </div>
                <span>Double tap to play/pause</span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center">
                  <Heart className="w-4 h-4 text-pink-400" />
                </div>
                <span>Long press to favorite</span>
              </div>
            </div>
            
            <button
              type="button"
              onClick={closeTutorial}
              className="w-full mt-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium"
            >
              Got it!
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}