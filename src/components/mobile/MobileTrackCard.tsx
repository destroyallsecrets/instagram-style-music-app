import { useAudio } from "../../hooks/useAudio";
import { formatDuration } from "../../lib/utils";
import { Id } from "../../../convex/_generated/dataModel";
import { motion } from "framer-motion";
import { Play, Pause, Music, User, Clock, Heart, MoreHorizontal } from "lucide-react";
import { useState } from "react";

interface Track {
  _id: Id<"tracks">;
  title: string;
  artist: string;
  duration?: number;
  audioUrl?: string;
  coverArtUrl?: string;
  uploader?: string;
  _creationTime: number;
}

interface MobileTrackCardProps {
  track: Track;
  showUploader?: boolean;
  index?: number;
}

export function MobileTrackCard({ track, showUploader = false, index = 0 }: MobileTrackCardProps) {
  const { currentTrack, isPlaying, playTrack, pauseTrack } = useAudio();
  const [isLiked, setIsLiked] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  
  const isCurrentTrack = currentTrack === track._id;
  const isCurrentlyPlaying = isCurrentTrack && isPlaying;

  const handlePlayPause = () => {
    if (isCurrentTrack) {
      pauseTrack();
    } else {
      playTrack(track.audioUrl || '', track._id, {
        id: track._id,
        title: track.title,
        artist: track.artist,
        coverArtUrl: track.coverArtUrl,
      });
    }

    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(15);
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(25);
    }
  };

  return (
    <motion.div
      className={`relative bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-4 transition-all duration-300 ${
        isCurrentTrack 
          ? 'border-blue-500/50 bg-blue-500/10 shadow-lg shadow-blue-500/20' 
          : 'hover:bg-slate-700/40 hover:border-slate-600/50'
      }`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      {/* Playing indicator */}
      {isCurrentlyPlaying && (
        <motion.div
          className="absolute top-2 right-2 flex space-x-1"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1 bg-blue-400 rounded-full"
              animate={{
                height: [4, 12, 4],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.1,
                ease: "easeInOut",
              }}
            />
          ))}
        </motion.div>
      )}

      <div className="flex items-center space-x-4">
        {/* Album Art */}
        <motion.div 
          className="relative w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-slate-700/60 to-slate-800/60 flex-shrink-0"
          animate={isCurrentlyPlaying ? { scale: [1, 1.05, 1] } : { scale: 1 }}
          transition={{ 
            duration: 2, 
            repeat: isCurrentlyPlaying ? Infinity : 0,
            ease: "easeInOut"
          }}
        >
          {track.coverArtUrl ? (
            <img
              src={track.coverArtUrl}
              alt={`${track.title} cover`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Music className="w-6 h-6 text-slate-400" />
            </div>
          )}
          
          {/* Play overlay */}
          <motion.div
            className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
            whileHover={{ opacity: 1 }}
          >
            <motion.button
              type="button"
              onClick={handlePlayPause}
              className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
              whileTap={{ scale: 0.9 }}
            >
              {isCurrentlyPlaying ? (
                <Pause className="w-4 h-4 text-white" />
              ) : (
                <Play className="w-4 h-4 text-white ml-0.5" />
              )}
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Track Info */}
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold truncate transition-colors ${
            isCurrentTrack ? 'text-blue-400' : 'text-slate-100'
          }`}>
            {track.title}
          </h3>
          <p className="text-slate-300 truncate text-sm">{track.artist}</p>
          
          {/* Metadata */}
          <div className="flex items-center space-x-3 mt-1 text-xs text-slate-400">
            {track.duration && (
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{formatDuration(track.duration)}</span>
              </div>
            )}
            {showUploader && track.uploader && (
              <div className="flex items-center space-x-1">
                <User className="w-3 h-3" />
                <span className="truncate max-w-20">{track.uploader}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          {/* Like Button */}
          <motion.button
            type="button"
            onClick={handleLike}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
              isLiked 
                ? 'bg-red-500/20 text-red-400' 
                : 'bg-slate-700/60 text-slate-400 hover:text-slate-300'
            }`}
            whileTap={{ scale: 0.9 }}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
          </motion.button>

          {/* Play/Pause Button */}
          <motion.button
            type="button"
            onClick={handlePlayPause}
            className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all ${
              isCurrentTrack
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-blue-500/30'
                : 'bg-slate-700/60 text-slate-300 hover:bg-slate-600/60'
            }`}
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
          >
            {isCurrentlyPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5 ml-0.5" />
            )}
          </motion.button>

          {/* More Options */}
          <motion.button
            type="button"
            onClick={() => setShowMenu(!showMenu)}
            className="w-10 h-10 rounded-full bg-slate-700/60 text-slate-400 hover:text-slate-300 flex items-center justify-center transition-colors"
            whileTap={{ scale: 0.9 }}
          >
            <MoreHorizontal className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* Waveform visualization for current track */}
      {isCurrentlyPlaying && (
        <motion.div
          className="mt-3 h-8 bg-slate-700/30 rounded-lg overflow-hidden"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 32 }}
          exit={{ opacity: 0, height: 0 }}
        >
          <div className="flex items-center justify-center h-full space-x-1">
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                className="w-1 bg-gradient-to-t from-blue-500 to-purple-600 rounded-full"
                animate={{
                  height: [2, Math.random() * 20 + 4, 2],
                }}
                transition={{
                  duration: 0.5 + Math.random() * 0.5,
                  repeat: Infinity,
                  delay: i * 0.05,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}