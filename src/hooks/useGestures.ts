import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

export interface GestureConfig {
  swipeThreshold: number;
  pinchThreshold: number;
  doubleTapDelay: number;
  longPressDelay: number;
  velocityThreshold: number;
}

export interface GestureState {
  isGesturing: boolean;
  gestureType: 'swipe' | 'pinch' | 'tap' | 'double-tap' | 'long-press' | 'pan' | null;
  direction: 'up' | 'down' | 'left' | 'right' | null;
  distance: number;
  velocity: number;
  scale: number;
  center: { x: number; y: number };
}

export interface GestureCallbacks {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onPinchIn?: (scale: number) => void;
  onPinchOut?: (scale: number) => void;
  onDoubleTap?: () => void;
  onLongPress?: () => void;
  onPan?: (deltaX: number, deltaY: number) => void;
  onGestureStart?: (type: string) => void;
  onGestureEnd?: () => void;
}

const defaultConfig: GestureConfig = {
  swipeThreshold: 50,
  pinchThreshold: 0.1,
  doubleTapDelay: 300,
  longPressDelay: 500,
  velocityThreshold: 0.5
};

export function useGestures(
  elementRef: React.RefObject<HTMLElement>,
  callbacks: GestureCallbacks,
  config: Partial<GestureConfig> = {}
) {
  const fullConfig = useMemo(() => ({ ...defaultConfig, ...config }), [config]);
  const [gestureState, setGestureState] = useState<GestureState>({
    isGesturing: false,
    gestureType: null,
    direction: null,
    distance: 0,
    velocity: 0,
    scale: 1,
    center: { x: 0, y: 0 }
  });

  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const lastTouchRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const tapCountRef = useRef(0);
  const tapTimerRef = useRef<NodeJS.Timeout | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const initialDistanceRef = useRef<number | null>(null);
  const lastScaleRef = useRef(1);

  const getTouchDistance = useCallback((touches: TouchList) => {
    if (touches.length < 2) return 0;
    const touch1 = touches[0];
    const touch2 = touches[1];
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) + 
      Math.pow(touch2.clientY - touch1.clientY, 2)
    );
  }, []);

  const getTouchCenter = useCallback((touches: TouchList) => {
    if (touches.length === 0) return { x: 0, y: 0 };
    if (touches.length === 1) return { x: touches[0].clientX, y: touches[0].clientY };
    
    const x = (touches[0].clientX + touches[1].clientX) / 2;
    const y = (touches[0].clientY + touches[1].clientY) / 2;
    return { x, y };
  }, []);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    const now = Date.now();
    
    touchStartRef.current = { x: touch.clientX, y: touch.clientY, time: now };
    lastTouchRef.current = { x: touch.clientX, y: touch.clientY, time: now };

    // Handle multi-touch (pinch)
    if (e.touches.length === 2) {
      initialDistanceRef.current = getTouchDistance(e.touches);
      lastScaleRef.current = 1;
      setGestureState(prev => ({
        ...prev,
        isGesturing: true,
        gestureType: 'pinch',
        center: getTouchCenter(e.touches)
      }));
      callbacks.onGestureStart?.('pinch');
    } else {
      // Single touch - potential tap, swipe, or long press
      setGestureState(prev => ({
        ...prev,
        isGesturing: true,
        center: { x: touch.clientX, y: touch.clientY }
      }));

      // Start long press timer
      longPressTimerRef.current = setTimeout(() => {
        setGestureState(prev => ({ ...prev, gestureType: 'long-press' }));
        callbacks.onLongPress?.();
        // Haptic feedback for long press
        if ('vibrate' in navigator) {
          navigator.vibrate(50);
        }
      }, fullConfig.longPressDelay);
    }
  }, [callbacks, fullConfig, getTouchDistance, getTouchCenter]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!touchStartRef.current || !lastTouchRef.current) return;

    const touch = e.touches[0];
    const now = Date.now();

    if (e.touches.length === 2 && initialDistanceRef.current) {
      // Handle pinch gesture
      const currentDistance = getTouchDistance(e.touches);
      const scale = currentDistance / initialDistanceRef.current;
      const scaleDelta = scale - lastScaleRef.current;

      setGestureState(prev => ({
        ...prev,
        gestureType: 'pinch',
        scale,
        center: getTouchCenter(e.touches)
      }));

      if (Math.abs(scaleDelta) > fullConfig.pinchThreshold) {
        if (scale > lastScaleRef.current) {
          callbacks.onPinchOut?.(scale);
        } else {
          callbacks.onPinchIn?.(scale);
        }
        lastScaleRef.current = scale;
      }
    } else {
      // Handle single touch movement (pan/swipe)
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const timeDelta = now - lastTouchRef.current.time;
      const velocity = timeDelta > 0 ? distance / timeDelta : 0;

      // Clear long press timer if moving
      if (distance > 10 && longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }

      setGestureState(prev => ({
        ...prev,
        gestureType: distance > fullConfig.swipeThreshold ? 'swipe' : 'pan',
        distance,
        velocity,
        center: { x: touch.clientX, y: touch.clientY }
      }));

      // Call pan callback for continuous movement
      if (callbacks.onPan) {
        const panDeltaX = touch.clientX - lastTouchRef.current.x;
        const panDeltaY = touch.clientY - lastTouchRef.current.y;
        callbacks.onPan(panDeltaX, panDeltaY);
      }

      lastTouchRef.current = { x: touch.clientX, y: touch.clientY, time: now };
    }
  }, [callbacks, fullConfig, getTouchDistance, getTouchCenter]);

  const handleTouchEnd = useCallback((_e: TouchEvent) => {
    if (!touchStartRef.current) return;

    const now = Date.now();
    const touchDuration = now - touchStartRef.current.time;

    // Clear timers
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    // Handle different gesture types
    if (gestureState.gestureType === 'swipe' && lastTouchRef.current) {
      const deltaX = lastTouchRef.current.x - touchStartRef.current.x;
      const deltaY = lastTouchRef.current.y - touchStartRef.current.y;
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      let direction: 'up' | 'down' | 'left' | 'right' | null = null;

      if (absX > absY) {
        direction = deltaX > 0 ? 'right' : 'left';
        if (direction === 'left') callbacks.onSwipeLeft?.();
        if (direction === 'right') callbacks.onSwipeRight?.();
      } else {
        direction = deltaY > 0 ? 'down' : 'up';
        if (direction === 'up') callbacks.onSwipeUp?.();
        if (direction === 'down') callbacks.onSwipeDown?.();
      }

      setGestureState(prev => ({ ...prev, direction }));

      // Haptic feedback for swipes
      if ('vibrate' in navigator) {
        navigator.vibrate(20);
      }
    } else if (gestureState.gestureType !== 'long-press' && touchDuration < 200) {
      // Handle tap gestures
      tapCountRef.current++;

      if (tapCountRef.current === 1) {
        tapTimerRef.current = setTimeout(() => {
          tapCountRef.current = 0;
          // Single tap - no callback, just visual feedback
        }, fullConfig.doubleTapDelay);
      } else if (tapCountRef.current === 2) {
        // Double tap
        if (tapTimerRef.current) {
          clearTimeout(tapTimerRef.current);
          tapTimerRef.current = null;
        }
        tapCountRef.current = 0;
        
        setGestureState(prev => ({ ...prev, gestureType: 'double-tap' }));
        callbacks.onDoubleTap?.();

        // Haptic feedback for double tap
        if ('vibrate' in navigator) {
          navigator.vibrate([30, 50, 30]);
        }
      }
    }

    // Reset state
    setTimeout(() => {
      setGestureState({
        isGesturing: false,
        gestureType: null,
        direction: null,
        distance: 0,
        velocity: 0,
        scale: 1,
        center: { x: 0, y: 0 }
      });
      callbacks.onGestureEnd?.();
    }, 100);

    touchStartRef.current = null;
    lastTouchRef.current = null;
    initialDistanceRef.current = null;
  }, [callbacks, fullConfig, gestureState.gestureType]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Add touch event listeners
    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: false });

    // Prevent default touch behaviors
    const preventDefaults = (_e: TouchEvent) => {
      _e.preventDefault();
    };

    element.addEventListener('touchstart', preventDefaults, { passive: false });
    element.addEventListener('touchmove', preventDefaults, { passive: false });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('touchstart', preventDefaults);
      element.removeEventListener('touchmove', preventDefaults);

      if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
      if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, elementRef]);

  return gestureState;
}