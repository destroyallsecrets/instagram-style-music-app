import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { TrackCard } from "./TrackCard";
import { toast } from "sonner";
import { useState } from "react";

export function MyMusicTab() {
  const tracks = useQuery(api.tracks.getUserTracks);
  const deleteTrack = useMutation(api.tracks.deleteTrack);
  const [deletingTrack, setDeletingTrack] = useState<Id<"tracks"> | null>(null);

  const handleDelete = async (trackId: Id<"tracks">, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingTrack(trackId);
    try {
      await deleteTrack({ trackId });
      toast.success("Track deleted successfully");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete track");
    } finally {
      setDeletingTrack(null);
    }
  };

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
        <div className="text-6xl mb-4">🎤</div>
        <h3 className="text-xl font-medium text-gray-900 mb-2">No tracks uploaded</h3>
        <p className="text-gray-500">Upload your first track to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">My Music</h2>
      <div className="space-y-4">
        {tracks.map((track) => (
          <TrackCard
            key={track._id}
            track={track}
            onDelete={() => handleDelete(track._id, track.title)}
            isDeleting={deletingTrack === track._id}
          />
        ))}
      </div>
    </div>
  );
}
