import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDeviceDetection } from '../../hooks/useDeviceDetection';
import { ChevronDown, Wifi } from 'lucide-react';

interface MobileNavigationEnhancerProps {
  children: React.ReactNode;
  title?: string;
  showBackButton?: boolean;
  onBack?: () => void;
  actions?: React.ReactNode;
}

export function MobileNavigationEnhancer({
  children,
  title = "SoundWave",
  showBackButton = false,
  onBack,
  actions
}: MobileNavigationEnhancerProps) {
  const deviceInfo = useDeviceDetection();
  const [statusBarVisible] = useState(true);
  const [batteryLevel, setBatteryLevel] = useState(100);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Monitor battery level
  useEffect(() => {
    const updateBattery = async () => {
      if ('getBattery' in navigator) {
        try {
          const battery = await (navigator as any).getBattery();
          setBatteryLevel(Math.round(battery.level * 100));
          
          battery.addEventListener('levelchange', () => {
            setBatteryLevel(Math.round(battery.level * 100));
          });
        } catch {
          // Battery API not supported
        }
      }
    };
    
    void updateBattery();
  }, []);

  // Only apply mobile enhancements on mobile devices
  if (deviceInfo.type !== 'mobile') {
    return <>{children}</>;
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: false 
    });
  };

  return (
    <div className="relative min-h-screen">
      {/* Custom Status Bar */}
      <AnimatePresence>
        {statusBarVisible && (
          <motion.div
            initial={{ y: -30 }}
            animate={{ y: 0 }}
            exit={{ y: -30 }}
            className="fixed top-0 left-0 right-0 z-50 h-8 glass-pod-minimal border-b border-slate-600/10"
          >
            <div className="flex items-center justify-between px-4 h-full text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <span className="font-medium">{formatTime(currentTime)}</span>
                {!isOnline && (
                  <span className="text-orange-400 text-xs">Offline</span>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {/* Signal strength */}
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4].map((bar) => (
                    <div
                      key={bar}
                      className={`w-1 rounded-full ${
                        bar <= 3 ? 'bg-slate-300 h-2' : 'bg-slate-500 h-1'
                      }`}
                    />
                  ))}
                </div>
                
                {/* WiFi */}
                <Wifi className={`w-3 h-3 ${isOnline ? 'text-slate-300' : 'text-slate-500'}`} />
                
                {/* Battery */}
                <div className="flex items-center gap-1">
                  <div className="w-6 h-3 border border-slate-400 rounded-sm relative">
                    <div 
                      className={`h-full rounded-sm transition-all battery-level ${
                        batteryLevel > 20 ? 'bg-green-400' : 'bg-red-400'
                      }`}
                      data-battery={batteryLevel}
                    />
                    <div className="absolute -right-0.5 top-0.5 w-0.5 h-1 bg-slate-400 rounded-r-sm" />
                  </div>
                  <span className="text-xs">{batteryLevel}%</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Navigation Bar */}
      <motion.div
        className="sticky top-8 z-40 glass-pod-minimal border-b border-slate-600/20"
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            {showBackButton && (
              <motion.button
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={onBack}
                className="w-10 h-10 rounded-xl glass-pod-micro flex items-center justify-center"
              >
                <ChevronDown className="w-5 h-5 text-slate-300 rotate-90" />
              </motion.button>
            )}
            
            <div>
              <h1 className="text-lg font-bold text-white">{title}</h1>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <span>Live</span>
              </div>
            </div>
          </div>

          {actions && (
            <div className="flex items-center gap-2">
              {actions}
            </div>
          )}
        </div>

        {/* Connection Status Banner */}
        <AnimatePresence>
          {!isOnline && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-orange-500/20 border-t border-orange-500/30 px-4 py-2"
            >
              <div className="flex items-center gap-2 text-orange-300 text-sm">
                <Wifi className="w-4 h-4" />
                <span>You're offline. Some features may be limited.</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Main Content */}
      <div className="pt-2">
        {children}
      </div>

      {/* Pull-to-refresh indicator */}
      <motion.div
        className="fixed top-20 left-1/2 transform -translate-x-1/2 z-30 pointer-events-none"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0, scale: 0.8 }}
      >
        <div className="glass-pod-minimal rounded-full p-3">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full"
          />
        </div>
      </motion.div>

      {/* Scroll to top button */}
      <motion.button
        type="button"
        className="fixed bottom-32 right-4 z-30 w-12 h-12 rounded-full glass-pod shadow-lg flex items-center justify-center"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 0, scale: 0 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <ChevronDown className="w-5 h-5 text-slate-300 rotate-180" />
      </motion.button>

      {/* Bottom safe area */}
      <div className="h-8" />
    </div>
  );
}