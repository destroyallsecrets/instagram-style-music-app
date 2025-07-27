import { useAudio } from "./AudioProvider";
import { formatDuration } from "../lib/utils";
import { Id } from "../../convex/_generated/dataModel";

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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4">
        {/* Cover Art */}
        <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
          {track.coverArtUrl ? (
            <img
              src={track.coverArtUrl}
              alt={`${track.title} cover`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl">
              🎵
            </div>
          )}
        </div>

        {/* Track Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 truncate">{track.title}</h3>
          <p className="text-sm text-gray-500 truncate">{track.artist}</p>
          {showUploader && (
            <p className="text-xs text-gray-400 truncate">
              by {track.uploaderName} • {new Date(track.uploadedAt).toLocaleDateString()}
            </p>
          )}
          <p className="text-xs text-gray-400">{formatDuration(track.duration)}</p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePlayPause}
            disabled={!track.audioUrl}
            className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            aria-label={isCurrentTrack && isPlaying ? "Pause" : "Play"}
          >
            {isCurrentTrack && isPlaying ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            )}
          </button>

          {onDelete && (
            <button
              onClick={onDelete}
              disabled={isDeleting}
              className="w-10 h-10 text-red-500 hover:bg-red-50 rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              aria-label="Delete track"
            >
              {isDeleting ? (
                <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
