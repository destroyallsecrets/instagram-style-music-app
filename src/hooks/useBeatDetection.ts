import { useState, useEffect, useRef } from 'react';

interface BeatDetectionConfig {
  sensitivity: number;
  minInterval: number;
  maxInterval: number;
}

interface BeatInfo {
  bpm: number;
  beatInterval: number;
  lastBeatTime: number;
  isBeating: boolean;
  confidence: number;
}

export function useBeatDetection(
  audioElement: HTMLAudioElement | null,
  config: BeatDetectionConfig = {
    sensitivity: 0.3,
    minInterval: 300, // 200 BPM max
    maxInterval: 2000, // 30 BPM min
  }
) {
  const [beatInfo, setBeatInfo] = useState<BeatInfo>({
    bpm: 120,
    beatInterval: 500,
    lastBeatTime: 0,
    isBeating: false,
    confidence: 0,
  });

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number>();
  const beatHistoryRef = useRef<number[]>([]);
  const lastEnergyRef = useRef<number>(0);

  useEffect(() => {
    if (!audioElement) return;

    const initializeAudioContext = async () => {
      try {
        // Create audio context
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        // Create analyser
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 1024;
        analyserRef.current.smoothingTimeConstant = 0.3;

        // Create source and connect
        sourceRef.current = audioContextRef.current.createMediaElementSource(audioElement);
        sourceRef.current.connect(analyserRef.current);
        analyserRef.current.connect(audioContextRef.current.destination);

        startBeatDetection();
      } catch (error) {
        console.warn('Beat detection not available:', error);
        // Fallback to simple timer-based beat
        startFallbackBeat();
      }
    };

    const startBeatDetection = () => {
      if (!analyserRef.current) return;

      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const detectBeat = () => {
        if (!analyserRef.current) return;

        analyserRef.current.getByteFrequencyData(dataArray);

        // Calculate energy in low-mid frequency range (bass/kick drum)
        const lowMidStart = Math.floor(bufferLength * 0.05);
        const lowMidEnd = Math.floor(bufferLength * 0.3);
        
        let energy = 0;
        for (let i = lowMidStart; i < lowMidEnd; i++) {
          energy += dataArray[i] * dataArray[i];
        }
        energy = Math.sqrt(energy / (lowMidEnd - lowMidStart));

        // Beat detection algorithm
        const energyThreshold = lastEnergyRef.current * (1 + config.sensitivity);
        const currentTime = Date.now();
        
        if (energy > energyThreshold && 
            currentTime - beatInfo.lastBeatTime > config.minInterval) {
          
          // Record beat
          beatHistoryRef.current.push(currentTime);
          
          // Keep only recent beats (last 10 seconds)
          beatHistoryRef.current = beatHistoryRef.current.filter(
            time => currentTime - time < 10000
          );

          // Calculate BPM from recent beats
          if (beatHistoryRef.current.length > 2) {
            const intervals = [];
            for (let i = 1; i < beatHistoryRef.current.length; i++) {
              intervals.push(beatHistoryRef.current[i] - beatHistoryRef.current[i - 1]);
            }
            
            const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
            const bpm = Math.round(60000 / avgInterval);
            
            // Validate BPM range
            if (bpm >= 30 && bpm <= 200) {
              setBeatInfo(prev => ({
                ...prev,
                bpm,
                beatInterval: avgInterval,
                lastBeatTime: currentTime,
                isBeating: true,
                confidence: Math.min(1, beatHistoryRef.current.length / 8),
              }));

              // Reset beat flag after short duration
              setTimeout(() => {
                setBeatInfo(prev => ({ ...prev, isBeating: false }));
              }, Math.min(200, avgInterval * 0.3));
            }
          }
        }

        lastEnergyRef.current = energy * 0.9 + lastEnergyRef.current * 0.1;
        animationFrameRef.current = requestAnimationFrame(detectBeat);
      };

      detectBeat();
    };

    const startFallbackBeat = () => {
      // Simple fallback beat at 120 BPM
      const interval = 500; // 120 BPM
      const beatTimer = setInterval(() => {
        setBeatInfo(prev => ({
          ...prev,
          bpm: 120,
          beatInterval: interval,
          lastBeatTime: Date.now(),
          isBeating: true,
          confidence: 0.5,
        }));

        setTimeout(() => {
          setBeatInfo(prev => ({ ...prev, isBeating: false }));
        }, 100);
      }, interval);

      return () => {
        clearInterval(beatTimer);
      };
    };

    void initializeAudioContext();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        void audioContextRef.current.close();
      }
    };
  }, [audioElement, config.sensitivity, config.minInterval, beatInfo.lastBeatTime]);

  // Update CSS custom property for breathing animation
  useEffect(() => {
    document.documentElement.style.setProperty(
      '--beat-interval',
      `${beatInfo.beatInterval}ms`
    );
  }, [beatInfo.beatInterval]);

  return beatInfo;
}