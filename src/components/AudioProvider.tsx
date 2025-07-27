import { createContext, useContext, useState, useRef, ReactNode } from "react";

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

const AudioContext = createContext<AudioContextType | null>(null);

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error("useAudio must be used within AudioProvider");
  }
  return context;
}

interface AudioProviderProps {
  children: ReactNode;
}

export function AudioProvider({ children }: AudioProviderProps) {
  const [currentTrack, setCurrentTrack] = useState<string | null>(null);
  const [currentTrackMetadata, setCurrentTrackMetadata] = useState<TrackMetadata | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(0.7);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playTrack = (url: string, trackId: string, metadata?: TrackMetadata) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio(url);
    audioRef.current = audio;
    audio.volume = volume;

    audio.addEventListener("loadedmetadata", () => {
      setDuration(audio.duration);
    });

    audio.addEventListener("timeupdate", () => {
      setCurrentTime(audio.currentTime);
    });

    audio.addEventListener("ended", () => {
      setIsPlaying(false);
      setCurrentTime(0);
    });

    void audio.play();
    setCurrentTrack(trackId);
    setCurrentTrackMetadata(metadata || null);
    setIsPlaying(true);
  };

  const pauseTrack = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        void audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const setVolume = (newVolume: number) => {
    setVolumeState(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const seekTo = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  return (
    <AudioContext.Provider
      value={{
        currentTrack,
        currentTrackMetadata,
        isPlaying,
        volume,
        currentTime,
        duration,
        playTrack,
        pauseTrack,
        setVolume,
        seekTo,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}
