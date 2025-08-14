import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useDeviceDetection } from '../../hooks/useDeviceDetection';

interface MobileAudioVisualizerProps {
  audioElement: HTMLAudioElement | null;
  isPlaying: boolean;
  style?: 'micro-glass' | 'glass-particles' | 'minimal-bars' | 'glass-ripple';
  className?: string;
}

export function MobileAudioVisualizer({
  audioElement,
  isPlaying,
  style = 'micro-glass',
  className = ''
}: MobileAudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const [touchPosition, setTouchPosition] = useState<{ x: number; y: number } | null>(null);
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; time: number; id: number }>>([]);
  const deviceInfo = useDeviceDetection();

  // Initialize Web Audio API
  useEffect(() => {
    if (!audioElement) return;

    const initAudio = async () => {
      try {
        // Create audio context with mobile-optimized settings
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
          sampleRate: deviceInfo.isLowPowerMode ? 22050 : 44100,
        });

        const analyzer = audioContext.createAnalyser();
        analyzer.fftSize = deviceInfo.type === 'mobile' ? 128 : 256;
        analyzer.smoothingTimeConstant = 0.8;

        // Check if audio element already has a source
        if (!(audioElement as any).audioSourceConnected) {
          const source = audioContext.createMediaElementSource(audioElement);
          source.connect(analyzer);
          analyzer.connect(audioContext.destination);
          (audioElement as any).audioSourceConnected = true;
        }

        audioContextRef.current = audioContext;
        analyzerRef.current = analyzer;
      } catch (error) {
        console.warn('Web Audio API not supported:', error);
      }
    };

    void initAudio();

    return () => {
      if (audioContextRef.current) {
        void audioContextRef.current.close();
      }
    };
  }, [audioElement, deviceInfo]);

  // Handle touch interactions for glass ripple effect
  const handleTouch = (e: React.TouchEvent) => {
    if (style !== 'glass-ripple') return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    setTouchPosition({ x, y });

    // Add ripple effect
    const newRipple = {
      x,
      y,
      time: Date.now(),
      id: Math.random()
    };

    setRipples(prev => [...prev, newRipple]);

    // Haptic feedback
    if (deviceInfo.supportsHaptics) {
      navigator.vibrate(15);
    }

    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, 1000);
  };

  // Micro-glass waveform visualization
  const drawMicroGlassWaveform = useCallback((ctx: CanvasRenderingContext2D, dataArray: Uint8Array, width: number, height: number) => {
    const centerY = height / 2;
    const amplitude = height * 0.3;

    ctx.strokeStyle = 'rgba(59, 130, 246, 0.8)';
    ctx.lineWidth = 1;
    ctx.shadowBlur = 10;
    ctx.shadowColor = 'rgba(59, 130, 246, 0.5)';

    ctx.beginPath();
    ctx.moveTo(0, centerY);

    for (let i = 0; i < dataArray.length; i++) {
      const x = (i / dataArray.length) * width;
      const y = centerY + (dataArray[i] / 255 - 0.5) * amplitude;
      ctx.lineTo(x, y);
    }

    ctx.stroke();

    // Add glass reflection effect
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 0.5;
    ctx.shadowBlur = 5;
    ctx.stroke();
  }, []);

  // Glass particles visualization
  const drawGlassParticles = useCallback((ctx: CanvasRenderingContext2D, dataArray: Uint8Array, width: number, height: number) => {
    const particleCount = deviceInfo.isLowPowerMode ? 20 : 40;

    for (let i = 0; i < particleCount; i++) {
      const dataIndex = Math.floor((i / particleCount) * dataArray.length);
      const intensity = dataArray[dataIndex] / 255;

      const x = (i / particleCount) * width;
      const y = height / 2 + (Math.sin(Date.now() * 0.001 + i) * intensity * height * 0.2);
      const size = 2 + intensity * 4;

      // Glass particle with glow
      ctx.fillStyle = `rgba(139, 92, 246, ${0.3 + intensity * 0.5})`;
      ctx.shadowBlur = 8;
      ctx.shadowColor = 'rgba(139, 92, 246, 0.8)';

      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();

      // Inner glass highlight
      ctx.fillStyle = `rgba(255, 255, 255, ${0.2 + intensity * 0.3})`;
      ctx.beginPath();
      ctx.arc(x - size * 0.3, y - size * 0.3, size * 0.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [deviceInfo.isLowPowerMode]);

  // Minimal bars visualization
  const drawMinimalBars = useCallback((ctx: CanvasRenderingContext2D, dataArray: Uint8Array, width: number, height: number) => {
    const barCount = deviceInfo.type === 'mobile' ? 16 : 32;
    const barWidth = width / barCount;

    for (let i = 0; i < barCount; i++) {
      const dataIndex = Math.floor((i / barCount) * dataArray.length);
      const barHeight = (dataArray[dataIndex] / 255) * height * 0.8;

      const x = i * barWidth;
      const y = height - barHeight;

      // Glass bar with gradient
      const gradient = ctx.createLinearGradient(0, y, 0, height);
      gradient.addColorStop(0, 'rgba(59, 130, 246, 0.8)');
      gradient.addColorStop(1, 'rgba(139, 92, 246, 0.8)');

      ctx.fillStyle = gradient;
      ctx.shadowBlur = 6;
      ctx.shadowColor = 'rgba(59, 130, 246, 0.4)';

      ctx.fillRect(x + 1, y, barWidth - 2, barHeight);

      // Glass highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.fillRect(x + 1, y, barWidth - 2, Math.max(2, barHeight * 0.1));
    }
  }, [deviceInfo.type]);

  // Glass ripple visualization with touch interaction
  const drawGlassRipple = useCallback((
    ctx: CanvasRenderingContext2D,
    dataArray: Uint8Array,
    width: number,
    height: number,
    _touchPos: { x: number; y: number } | null,
    rippleArray: Array<{ x: number; y: number; time: number; id: number }>
  ) => {
    const centerX = width / 2;
    const centerY = height / 2;

    // Draw frequency-based ripples from center
    const avgFrequency = dataArray.reduce((sum, val) => sum + val, 0) / dataArray.length;
    const rippleRadius = (avgFrequency / 255) * Math.min(width, height) * 0.4;

    if (rippleRadius > 5) {
      ctx.strokeStyle = `rgba(59, 130, 246, ${0.3 + (avgFrequency / 255) * 0.4})`;
      ctx.lineWidth = 2;
      ctx.shadowBlur = 10;
      ctx.shadowColor = 'rgba(59, 130, 246, 0.6)';

      ctx.beginPath();
      ctx.arc(centerX, centerY, rippleRadius, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Draw touch-based ripples
    rippleArray.forEach(ripple => {
      const age = Date.now() - ripple.time;
      const progress = age / 1000; // 1 second animation
      const radius = progress * 100;
      const opacity = Math.max(0, 1 - progress);

      ctx.strokeStyle = `rgba(139, 92, 246, ${opacity * 0.6})`;
      ctx.lineWidth = 3 * (1 - progress);
      ctx.shadowBlur = 15;
      ctx.shadowColor = `rgba(139, 92, 246, ${opacity * 0.8})`;

      ctx.beginPath();
      ctx.arc(ripple.x, ripple.y, radius, 0, Math.PI * 2);
      ctx.stroke();
    });
  }, []);

  // Animation loop
  useEffect(() => {
    if (!isPlaying || !analyzerRef.current || !canvasRef.current) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyzer = analyzerRef.current;
    const bufferLength = analyzer.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const animate = () => {
      analyzer.getByteFrequencyData(dataArray);

      // Clear canvas with glass background
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Apply glass background effect
      ctx.fillStyle = 'rgba(30, 41, 59, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      switch (style) {
        case 'micro-glass':
          drawMicroGlassWaveform(ctx, dataArray, canvas.width, canvas.height);
          break;
        case 'glass-particles':
          drawGlassParticles(ctx, dataArray, canvas.width, canvas.height);
          break;
        case 'minimal-bars':
          drawMinimalBars(ctx, dataArray, canvas.width, canvas.height);
          break;
        case 'glass-ripple':
          drawGlassRipple(ctx, dataArray, canvas.width, canvas.height, touchPosition, ripples);
          break;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, style, touchPosition, ripples, drawMicroGlassWaveform, drawGlassParticles, drawMinimalBars, drawGlassRipple]);

  // Responsive canvas sizing
  const canvasSize = {
    width: deviceInfo.type === 'mobile' ? 280 : 320,
    height: deviceInfo.type === 'mobile' ? 60 : 80
  };

  return (
    <motion.div
      className={`relative ${className}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        className={`w-full h-full rounded-lg glass-pod-minimal ${
          deviceInfo.isLowPowerMode ? '' : 'mobile-visualizer-blur'
        }`}
        onTouchStart={handleTouch}
      />

      {/* Mobile-specific touch hint */}
      {deviceInfo.type === 'mobile' && style === 'glass-ripple' && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0.6 }}
          animate={{ opacity: touchPosition ? 0 : 0.3 }}
          transition={{ duration: 0.5 }}
        >
          <span className="text-xs text-slate-400 font-medium">
            Touch to create ripples
          </span>
        </motion.div>
      )}
    </motion.div>
  );
}