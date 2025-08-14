import { useState, useRef, ReactNode } from "react";
import { AudioContext, type TrackMetadata } from "../contexts/AudioContext";

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
