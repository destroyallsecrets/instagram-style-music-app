// Haptic feedback utilities for mobile devices
export class HapticFeedback {
  private static isSupported(): boolean {
    return 'vibrate' in navigator || 'hapticFeedback' in navigator;
  }

  private static vibrate(pattern: number | number[]): void {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }

  // Light tap feedback for button presses
  static light(): void {
    if (!this.isSupported()) return;
    
    // Try modern Haptic API first (iOS Safari)
    if ('hapticFeedback' in navigator) {
      try {
        (navigator as any).hapticFeedback.impact('light');
        return;
      } catch {
        // Fallback to vibration
      }
    }
    
    this.vibrate(10);
  }

  // Medium feedback for important actions
  static medium(): void {
    if (!this.isSupported()) return;
    
    if ('hapticFeedback' in navigator) {
      try {
        (navigator as any).hapticFeedback.impact('medium');
        return;
      } catch {
        // Fallback to vibration
      }
    }
    
    this.vibrate(25);
  }

  // Heavy feedback for significant actions
  static heavy(): void {
    if (!this.isSupported()) return;
    
    if ('hapticFeedback' in navigator) {
      try {
        (navigator as any).hapticFeedback.impact('heavy');
        return;
      } catch {
        // Fallback to vibration
      }
    }
    
    this.vibrate(50);
  }

  // Success feedback
  static success(): void {
    if (!this.isSupported()) return;
    
    if ('hapticFeedback' in navigator) {
      try {
        (navigator as any).hapticFeedback.notification('success');
        return;
      } catch {
        // Fallback to vibration
      }
    }
    
    this.vibrate([25, 50, 25]);
  }

  // Error feedback
  static error(): void {
    if (!this.isSupported()) return;
    
    if ('hapticFeedback' in navigator) {
      try {
        (navigator as any).hapticFeedback.notification('error');
        return;
      } catch {
        // Fallback to vibration
      }
    }
    
    this.vibrate([50, 25, 50, 25, 50]);
  }

  // Warning feedback
  static warning(): void {
    if (!this.isSupported()) return;
    
    if ('hapticFeedback' in navigator) {
      try {
        (navigator as any).hapticFeedback.notification('warning');
        return;
      } catch {
        // Fallback to vibration
      }
    }
    
    this.vibrate([25, 25, 50]);
  }

  // Selection feedback for swipes and gestures
  static selection(): void {
    if (!this.isSupported()) return;
    
    if ('hapticFeedback' in navigator) {
      try {
        (navigator as any).hapticFeedback.selection();
        return;
      } catch {
        // Fallback to vibration
      }
    }
    
    this.vibrate(15);
  }
}