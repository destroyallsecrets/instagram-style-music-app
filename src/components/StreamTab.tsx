import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { TrackCard } from "./TrackCard";

export function StreamTab() {
  const tracks = useQuery(api.tracks.getAllTracks);

  if (tracks === undefined) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (tracks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🎵</div>
        <h3 className="text-xl font-medium text-gray-900 mb-2">No tracks yet</h3>
        <p className="text-gray-500">Be the first to share your music!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Music Stream</h2>
      <div className="space-y-4">
        {tracks.map((track) => (
          <TrackCard key={track._id} track={track} showUploader />
        ))}
      </div>
    </div>
  );
}
