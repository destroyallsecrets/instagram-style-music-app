import { createContext } from "react";

interface TrackMetadata {
  id: string;
  title: string;
  artist: string;
  coverArtUrl?: string | null;
}

interface AudioContextType {
  currentTrack: string | null;
  currentTrackMetadata: TrackMetadata | null;
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  playTrack: (url: string, trackId: string, metadata?: TrackMetadata) => void;
  pauseTrack: () => void;
  setVolume: (volume: number) => void;
  seekTo: (time: number) => void;
}

export const AudioContext = createContext<AudioContextType | null>(null);
export type { AudioContextType, TrackMetadata };