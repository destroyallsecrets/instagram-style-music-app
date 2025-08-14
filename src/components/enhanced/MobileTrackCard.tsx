import { useState, useRef } from 'react';
import { motion, PanInfo, AnimatePresence } from 'framer-motion';
import { Play, Pause, Heart, MoreHorizontal, Plus, Share } from 'lucide-react';
import { useAudio } from '../../hooks/useAudio';
import { useDeviceDetection } from '../../hooks/useDeviceDetection';
import { formatDuration } from '../../lib/utils';

interface MobileTrackCardProps {
  track: {
    _id: string;
    title: string;
    artist: string;
    duration?: number;
    coverArtUrl?: string | null;
    audioUrl: string;
  };
  isPlaying?: boolean;
  onPlay?: () => void;
  onAddToPlaylist?: () => void;
  onToggleFavorite?: () => void;
  onShare?: () => void;
  className?: string;
}

export function MobileTrackCard({
  track,
  isPlaying = false,
  onPlay,
  onAddToPlaylist,
  onToggleFavorite,
  onShare,
  className = ''
}: MobileTrackCardProps) {
  const { currentTrack, playTrack, pauseTrack } = useAudio();
  const deviceInfo = useDeviceDetection();
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const isCurrentTrack = currentTrack === track._id;
  const swipeThreshold = 80;

  const handlePlay = () => {
    if (isCurrentTrack) {
      pauseTrack();
    } else {
      playTrack(track.audioUrl, track._id, {
        id: track._id,
        title: track.title,
        artist: track.artist,
        coverArtUrl: track.coverArtUrl
      });
    }
    onPlay?.();
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDrag = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setDragOffset(info.offset.x);
  };

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false);
    const { offset, velocity } = info;
    const swipe = Math.abs(offset.x) > swipeThreshold || Math.abs(velocity.x) > 500;

    if (swipe) {
      if (offset.x > 0) {
        // Swipe right - add to favorites
        onToggleFavorite?.();
        if ('vibrate' in navigator) {
          navigator.vibrate(30);
        }
      } else if (offset.x < 0) {
        // Swipe left - show actions
        setShowActions(true);
        if ('vibrate' in navigator) {
          navigator.vibrate(20);
        }
      }
    }
    
    setDragOffset(0);
  };

  const actionButtons = [
    {
      icon: Heart,
      label: 'Favorite',
      color: 'from-pink-500 to-red-500',
      action: onToggleFavorite
    },
    {
      icon: Plus,
      label: 'Add to Playlist',
      color: 'from-green-500 to-emerald-500',
      action: onAddToPlaylist
    },
    {
      icon: Share,
      label: 'Share',
      color: 'from-blue-500 to-indigo-500',
      action: onShare
    }
  ];

  return (
    <>
      <motion.div
        ref={cardRef}
        drag={deviceInfo.type === 'mobile' ? 'x' : false}
        dragConstraints={{ left: -200, right: 200 }}
        dragElastic={0.2}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        animate={{
          x: isDragging ? dragOffset * 0.8 : 0,
          scale: isDragging ? 0.95 : 1,
          rotateY: isDragging ? dragOffset * 0.1 : 0
        }}
        transition={{
          type: "spring",
          damping: 25,
          stiffness: 300
        }}
        className={`relative glass-pod rounded-2xl overflow-hidden ${className}`}
        style={{
          touchAction: deviceInfo.type === 'mobile' ? 'pan-x' : 'auto',
          userSelect: 'none',
          WebkitUserSelect: 'none'
        }}
      >
        {/* Swipe action indicators */}
        <AnimatePresence>
          {isDragging && (
            <>
              {/* Right swipe - favorite */}
              {dragOffset > 20 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 to-red-500 flex items-center justify-center">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                </motion.div>
              )}
              
              {/* Left swipe - actions */}
              {dragOffset < -20 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-slate-600 to-slate-700 flex items-center justify-center">
                    <MoreHorizontal className="w-6 h-6 text-white" />
                  </div>
                </motion.div>
              )}
            </>
          )}
        </AnimatePresence>

        {/* Card content */}
        <div className="p-4">
          <div className="flex items-center gap-4">
            {/* Album Art */}
            <motion.div 
              className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-slate-700/60 to-slate-800/60 relative"
              whileTap={{ scale: 0.95 }}
              onClick={handlePlay}
            >
              {track.coverArtUrl ? (
                <img
                  src={track.coverArtUrl}
                  alt={`${track.title} cover`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Play className="w-6 h-6 text-slate-400" />
                </div>
              )}
              
              {/* Play overlay */}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                {isCurrentTrack && isPlaying ? (
                  <Pause className="w-6 h-6 text-white" />
                ) : (
                  <Play className="w-6 h-6 text-white ml-1" />
                )}
              </div>
            </motion.div>

            {/* Track Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-100 truncate text-base">
                {track.title}
              </h3>
              <p className="text-slate-300 truncate text-sm">
                {track.artist}
              </p>
              {track.duration && (
                <p className="text-slate-400 text-xs mt-1">
                  {formatDuration(track.duration)}
                </p>
              )}
            </div>

            {/* Quick play button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePlay}
              className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all ${
                isCurrentTrack && isPlaying
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                  : 'glass-pod-minimal text-slate-300 hover:text-white'
              }`}
            >
              {isCurrentTrack && isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5 ml-0.5" />
              )}
            </motion.button>
          </div>

          {/* Progress bar for current track */}
          {isCurrentTrack && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-3"
            >
              <div className="w-full h-1 bg-slate-700/60 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                  initial={{ width: 0 }}
                  animate={{ width: '40%' }} // This would be dynamic based on actual progress
                  transition={{ duration: 0.3 }}
                />
              </div>
            </motion.div>
          )}
        </div>

        {/* Swipe hints */}
        {!isDragging && deviceInfo.type === 'mobile' && (
          <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-transparent via-pink-400/30 to-transparent" />
        )}
      </motion.div>

      {/* Action menu */}
      <AnimatePresence>
        {showActions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end"
            onClick={() => setShowActions(false)}
          >
            <motion.div
              initial={{ y: 300 }}
              animate={{ y: 0 }}
              exit={{ y: 300 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full glass-pod rounded-t-3xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-1 bg-slate-400 rounded-full mx-auto mb-6" />
              
              <h3 className="text-lg font-semibold text-white mb-4 text-center">
                {track.title}
              </h3>
              
              <div className="grid grid-cols-3 gap-4">
                {actionButtons.map((button, index) => {
                  const Icon = button.icon;
                  return (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        button.action?.();
                        setShowActions(false);
                      }}
                      className="flex flex-col items-center gap-3 p-4 rounded-2xl glass-pod-minimal"
                    >
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${button.color} flex items-center justify-center`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-sm text-slate-300 font-medium">
                        {button.label}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}