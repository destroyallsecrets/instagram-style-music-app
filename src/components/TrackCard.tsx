import { useAudio } from "../hooks/useAudio";
import { formatDuration } from "../lib/utils";
import { Id } from "../../convex/_generated/dataModel";
import { motion } from "framer-motion";
import { Play, Pause, Music, User, Clock, Heart, Share, Plus, MoreHorizontal } from "lucide-react";
import { ContextMenu } from "./ContextMenu";
import { createTrackContextMenuItems } from "../utils/contextMenuItems";
import { HapticFeedback } from "../utils/haptics";
import { useUndoRedo } from "../hooks/useUndoRedo";
import { showMusicNotification } from "../utils/notifications";
import { useState } from "react";

interface Track {
  _id: Id<"tracks">;
  title: string;
  artist: string;
  duration: number;
  audioUrl: string | null;
  coverArtUrl: string | null;
  uploaderName?: string;
  uploadedAt: number;
}

interface TrackCardProps {
  track: Track;
  showUploader?: boolean;
  onDelete?: () => void;
  isDeleting?: boolean;
}

export function TrackCard({ track, showUploader, onDelete, isDeleting }: TrackCardProps) {
  const { currentTrack, isPlaying, playTrack, pauseTrack } = useAudio();
  const isCurrentTrack = currentTrack === track._id;
  const [isFavorited, setIsFavorited] = useState(false);
  const [_isLoading, setIsLoading] = useState(false);
  const undoRedo = useUndoRedo();

  const handlePlayPause = async () => {
    if (!track.audioUrl) return;

    setIsLoading(true);
    HapticFeedback.light();

    try {
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
    } catch {
      showMusicNotification('Failed to play track', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Context menu actions
  const contextActions = {
    playTrack: (_track: Track) => handlePlayPause(),
    toggleFavorite: (_track: Track) => {
      const previousState = isFavorited;
      setIsFavorited(!isFavorited);
      
      undoRedo.addAction(
        'favorite',
        `${isFavorited ? 'Removed from' : 'Added to'} favorites`,
        () => setIsFavorited(previousState),
        () => setIsFavorited(!previousState)
      );
      
      HapticFeedback.success();
      showMusicNotification(
        `${isFavorited ? 'Removed from' : 'Added to'} favorites`,
        'success'
      );
    },
    addToPlaylist: (_track: Track) => {
      showMusicNotification('Added to playlist', 'success');
      HapticFeedback.medium();
    },
    shareTrack: (track: Track) => {
      if (navigator.share) {
        void navigator.share({
          title: track.title,
          text: `Check out "${track.title}" by ${track.artist}`,
          url: window.location.href,
        });
      } else {
        void navigator.clipboard.writeText(window.location.href);
        showMusicNotification('Link copied to clipboard', 'success');
      }
      HapticFeedback.light();
    },
    downloadTrack: (_track: Track) => {
      showMusicNotification('Download started', 'info');
    },
    showTrackInfo: (_track: Track) => {
      showMusicNotification('Track info opened', 'info');
    },
  };

  // Create context menu items with icons
  const contextMenuItems = createTrackContextMenuItems(track, contextActions, {
    Play: <Play className="w-4 h-4" />,
    Heart: <Heart className="w-4 h-4" />,
    Plus: <Plus className="w-4 h-4" />,
    Share: <Share className="w-4 h-4" />,
    Download: <MoreHorizontal className="w-4 h-4" />,
    Info: <MoreHorizontal className="w-4 h-4" />,
  });

  return (
    <ContextMenu items={contextMenuItems}>
      <motion.div
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className={`group relative glass rounded-lg sm:rounded-xl transition-all duration-300 overflow-hidden ${
        isCurrentTrack 
          ? "border-blue-400/60 shadow-lg shadow-blue-500/20 bg-gradient-to-r from-blue-500/20 to-purple-500/20" 
          : "hover:shadow-lg hover:shadow-black/20 hover:border-slate-500/60"
      }`}
    >
      {/* Animated background for current track */}
      {isCurrentTrack && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-gradient-to-r from-blue-500/15 to-purple-500/15"
        />
      )}

      <div className="relative p-3 sm:p-4">
        <div className="flex items-center gap-3">
          {/* Enhanced Cover Art */}
          <div className="relative flex-shrink-0">
            <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden transition-all duration-300 ${
              isCurrentTrack ? "ring-2 ring-blue-400/50 shadow-lg" : "group-hover:shadow-md"
            }`}>
              {track.coverArtUrl ? (
                <img
                  src={track.coverArtUrl}
                  alt={`${track.title} cover`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-slate-700/60 to-slate-800/60 flex items-center justify-center">
                  <Music className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400" />
                </div>
              )}
            </div>
            
            {/* Play indicator overlay */}
            {isCurrentTrack && isPlaying && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center shadow-lg"
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="w-1.5 h-1.5 bg-white rounded-full"
                />
              </motion.div>
            )}
          </div>

          {/* Enhanced Track Info */}
          <div className="flex-1 min-w-0 space-y-0.5 sm:space-y-1">
            <h3 className={`font-semibold text-sm sm:text-base truncate transition-colors ${
              isCurrentTrack ? "text-blue-200" : "text-slate-100 group-hover:text-white"
            }`}>
              {track.title}
            </h3>
            <p className={`text-xs sm:text-sm truncate transition-colors ${
              isCurrentTrack ? "text-blue-300" : "text-slate-300"
            }`}>
              {track.artist}
            </p>
            
            {/* Metadata */}
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{formatDuration(track.duration)}</span>
              </div>
              {showUploader && (
                <div className="hidden sm:flex items-center gap-1">
                  <User className="w-3 h-3" />
                  <span className="truncate max-w-20">{track.uploaderName}</span>
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Controls */}
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => void handlePlayPause()}
              disabled={!track.audioUrl}
              className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed ${
                isCurrentTrack
                  ? "bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/30 focus:ring-blue-400/50"
                  : "bg-slate-700/60 hover:bg-slate-600/60 text-slate-200 group-hover:bg-slate-600/60 focus:ring-slate-400/50"
              }`}
              aria-label={isCurrentTrack && isPlaying ? "Pause" : "Play"}
            >
              {isCurrentTrack && isPlaying ? (
                <Pause className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : (
                <Play className="w-4 h-4 sm:w-5 sm:h-5 ml-0.5" />
              )}
            </motion.button>

            {onDelete && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onDelete}
                disabled={isDeleting}
                className="w-10 h-10 text-red-500 hover:bg-red-50 rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                aria-label="Delete track"
              >
                {isDeleting ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full"
                  />
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                )}
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
    </ContextMenu>
  );
}
