import { useState, useEffect } from 'react';

export type DeviceType = 'mobile' | 'tablet' | 'desktop';

interface DeviceInfo {
  type: DeviceType;
  isTouchDevice: boolean;
  screenWidth: number;
  screenHeight: number;
  pixelRatio: number;
  isLowPowerMode: boolean;
  supportsHaptics: boolean;
}

export function useDeviceDetection(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    // Enhanced mobile detection for 2015-2025 devices
    const isMobileDevice = () => {
      // Standard mobile breakpoints (320px - 767px)
      if (width >= 320 && width <= 767) return true;
      
      // Common mobile device resolutions (2015-2025)
      const mobileResolutions = [
        // iPhone resolutions
        { w: 375, h: 667 },   // iPhone 6/7/8
        { w: 414, h: 736 },   // iPhone 6/7/8 Plus
        { w: 375, h: 812 },   // iPhone X/XS/11 Pro
        { w: 414, h: 896 },   // iPhone XR/11/12/13 mini
        { w: 390, h: 844 },   // iPhone 12/13/14
        { w: 428, h: 926 },   // iPhone 12/13/14 Pro Max
        { w: 393, h: 852 },   // iPhone 14 Pro
        { w: 430, h: 932 },   // iPhone 14 Pro Max
        
        // Android resolutions
        { w: 360, h: 640 },   // Common Android
        { w: 360, h: 720 },   // HD Android
        { w: 412, h: 732 },   // Pixel
        { w: 412, h: 869 },   // Pixel XL
        { w: 360, h: 780 },   // Galaxy S8/S9
        { w: 412, h: 915 },   // Galaxy S10/S20
        { w: 384, h: 854 },   // OnePlus
      ];
      
      // Check if current resolution matches mobile patterns
      return mobileResolutions.some(res => 
        (width === res.w && height === res.h) || 
        (width === res.h && height === res.w) // Landscape
      );
    };
    
    return {
      type: isMobileDevice() ? 'mobile' : width < 1024 ? 'tablet' : 'desktop',
      isTouchDevice: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      screenWidth: width,
      screenHeight: height,
      pixelRatio: window.devicePixelRatio || 1,
      isLowPowerMode: false, // Will be detected dynamically
      supportsHaptics: 'vibrate' in navigator
    };
  });

  useEffect(() => {
    const updateDeviceInfo = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // Enhanced mobile detection for 2015-2025 devices
      const isMobileDevice = () => {
        // Standard mobile breakpoints (320px - 767px)
        if (width >= 320 && width <= 767) return true;
        
        // Common mobile device resolutions (2015-2025)
        const mobileResolutions = [
          // iPhone resolutions
          { w: 375, h: 667 },   // iPhone 6/7/8
          { w: 414, h: 736 },   // iPhone 6/7/8 Plus
          { w: 375, h: 812 },   // iPhone X/XS/11 Pro
          { w: 414, h: 896 },   // iPhone XR/11/12/13 mini
          { w: 390, h: 844 },   // iPhone 12/13/14
          { w: 428, h: 926 },   // iPhone 12/13/14 Pro Max
          { w: 393, h: 852 },   // iPhone 14 Pro
          { w: 430, h: 932 },   // iPhone 14 Pro Max
          
          // Android resolutions
          { w: 360, h: 640 },   // Common Android
          { w: 360, h: 720 },   // HD Android
          { w: 412, h: 732 },   // Pixel
          { w: 412, h: 869 },   // Pixel XL
          { w: 360, h: 780 },   // Galaxy S8/S9
          { w: 412, h: 915 },   // Galaxy S10/S20
          { w: 384, h: 854 },   // OnePlus
        ];
        
        // Check if current resolution matches mobile patterns
        return mobileResolutions.some(res => 
          (width === res.w && height === res.h) || 
          (width === res.h && height === res.w) // Landscape
        );
      };
      
      setDeviceInfo(prev => ({
        ...prev,
        type: isMobileDevice() ? 'mobile' : width < 1024 ? 'tablet' : 'desktop',
        screenWidth: width,
        screenHeight: height
      }));
    };

    // Detect low power mode (battery API)
    const detectLowPowerMode = async () => {
      if ('getBattery' in navigator) {
        try {
          const battery = await (navigator as any).getBattery();
          setDeviceInfo(prev => ({
            ...prev,
            isLowPowerMode: battery.level < 0.2 || battery.charging === false
          }));
          
          // Listen for battery changes
          battery.addEventListener('levelchange', () => {
            setDeviceInfo(prev => ({
              ...prev,
              isLowPowerMode: battery.level < 0.2 || battery.charging === false
            }));
          });
        } catch {
          console.log('Battery API not supported');
        }
      }
    };

    window.addEventListener('resize', updateDeviceInfo);
    void detectLowPowerMode();

    return () => {
      window.removeEventListener('resize', updateDeviceInfo);
    };
  }, []);

  return deviceInfo;
}

export function useGlassIntensity(deviceInfo: DeviceInfo) {
  return {
    blurIntensity: deviceInfo.type === 'mobile' ? 
      (deviceInfo.isLowPowerMode ? 20 : 40) : 
      deviceInfo.type === 'tablet' ? 30 : 25,
    opacity: deviceInfo.type === 'mobile' ? 0.8 : 0.7,
    borderWidth: deviceInfo.type === 'mobile' ? 0.5 : 1,
    shadowDepth: deviceInfo.type === 'mobile' ? 48 : 32,
    animationSpeed: deviceInfo.isLowPowerMode ? 'slow' : 'normal'
  };
}