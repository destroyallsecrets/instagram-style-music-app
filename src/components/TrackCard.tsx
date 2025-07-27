import { useAudio } from "./AudioProvider";
import { formatDuration } from "../lib/utils";
import { Id } from "../../convex/_generated/dataModel";
import { motion } from "framer-motion";
import { Play, Pause, Music, Calendar, User, Clock } from "lucide-react";

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

  const handlePlayPause = () => {
    if (!track.audioUrl) return;

    if (isCurrentTrack) {
      pauseTrack();
    } else {
      playTrack(track.audioUrl, track._id);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className={`group relative bg-white/80 backdrop-blur-sm rounded-2xl border transition-all duration-300 overflow-hidden ${
        isCurrentTrack 
          ? "border-blue-200 shadow-lg shadow-blue-100/50 bg-gradient-to-r from-blue-50/50 to-purple-50/50" 
          : "border-slate-200/60 shadow-sm hover:shadow-lg hover:shadow-slate-200/50 hover:border-slate-300/60"
      }`}
    >
      {/* Animated background for current track */}
      {isCurrentTrack && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5"
        />
      )}

      <div className="relative p-6">
        <div className="flex items-center gap-4">
          {/* Enhanced Cover Art */}
          <div className="relative flex-shrink-0">
            <div className={`w-20 h-20 rounded-xl overflow-hidden transition-all duration-300 ${
              isCurrentTrack ? "ring-2 ring-blue-400/50 shadow-lg" : "group-hover:shadow-md"
            }`}>
              {track.coverArtUrl ? (
                <img
                  src={track.coverArtUrl}
                  alt={`${track.title} cover`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                  <Music className="w-8 h-8 text-slate-400" />
                </div>
              )}
            </div>
            
            {/* Play indicator overlay */}
            {isCurrentTrack && isPlaying && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg"
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="w-2 h-2 bg-white rounded-full"
                />
              </motion.div>
            )}
          </div>

          {/* Enhanced Track Info */}
          <div className="flex-1 min-w-0 space-y-1">
            <h3 className={`font-semibold text-lg truncate transition-colors ${
              isCurrentTrack ? "text-blue-900" : "text-slate-900 group-hover:text-slate-800"
            }`}>
              {track.title}
            </h3>
            <p className={`text-base truncate transition-colors ${
              isCurrentTrack ? "text-blue-700" : "text-slate-600"
            }`}>
              {track.artist}
            </p>
            
            {/* Metadata */}
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{formatDuration(track.duration)}</span>
              </div>
              {showUploader && (
                <>
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span className="truncate max-w-24">{track.uploaderName}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(track.uploadedAt).toLocaleDateString()}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Enhanced Controls */}
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePlayPause}
              disabled={!track.audioUrl}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                isCurrentTrack
                  ? "bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-200 focus:ring-blue-500"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700 group-hover:bg-slate-200 focus:ring-slate-500"
              }`}
              aria-label={isCurrentTrack && isPlaying ? "Pause" : "Play"}
            >
              {isCurrentTrack && isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5 ml-0.5" />
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
  );
}
