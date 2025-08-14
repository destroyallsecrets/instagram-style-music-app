import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Wifi, WifiOff } from "lucide-react";

interface PerformanceStats {
  loadTime: number;
  networkStatus: 'online' | 'offline';
  audioBuffering: boolean;
  memoryUsage?: number;
}

export function PerformanceMonitor() {
  const [stats, setStats] = useState<PerformanceStats>({
    loadTime: 0,
    networkStatus: 'online',
    audioBuffering: false
  });
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    // Monitor network status
    const updateNetworkStatus = () => {
      setStats(prev => ({
        ...prev,
        networkStatus: navigator.onLine ? 'online' : 'offline'
      }));
    };

    // Monitor performance
    const updatePerformance = () => {
      if ('performance' in window) {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        setStats(prev => ({
          ...prev,
          loadTime: navigation.loadEventEnd - navigation.loadEventStart
        }));
      }

      // Memory usage (if available)
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        setStats(prev => ({
          ...prev,
          memoryUsage: memory.usedJSHeapSize / 1024 / 1024 // MB
        }));
      }
    };

    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);
    
    updateNetworkStatus();
    updatePerformance();

    return () => {
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);
    };
  }, []);

  // Show warning for poor network conditions
  const showNetworkWarning = stats.networkStatus === 'offline';

  return (
    <>
      {/* Network Status Indicator */}
      <AnimatePresence>
        {showNetworkWarning && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
          >
            <div className="glass rounded-full px-4 py-2 bg-red-500/20 border border-red-500/30 flex items-center gap-2">
              <WifiOff className="w-4 h-4 text-red-400" />
              <span className="text-red-300 text-sm font-medium">No internet connection</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Performance Stats Toggle */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowStats(!showStats)}
        className="fixed bottom-4 left-4 w-10 h-10 glass rounded-full flex items-center justify-center text-slate-400 hover:text-blue-400 transition-colors z-40"
        title="Performance Stats"
      >
        <Activity className="w-4 h-4" />
      </motion.button>

      {/* Performance Stats Panel */}
      <AnimatePresence>
        {showStats && (
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="fixed bottom-16 left-4 glass rounded-xl p-4 backdrop-blur-xl bg-slate-900/90 border border-slate-600/40 z-40"
          >
            <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Performance
            </h4>
            
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Network:</span>
                <div className="flex items-center gap-1">
                  {stats.networkStatus === 'online' ? (
                    <Wifi className="w-3 h-3 text-green-400" />
                  ) : (
                    <WifiOff className="w-3 h-3 text-red-400" />
                  )}
                  <span className={stats.networkStatus === 'online' ? 'text-green-400' : 'text-red-400'}>
                    {stats.networkStatus}
                  </span>
                </div>
              </div>
              
              {stats.loadTime > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Load Time:</span>
                  <span className="text-slate-300">{stats.loadTime.toFixed(0)}ms</span>
                </div>
              )}
              
              {stats.memoryUsage && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Memory:</span>
                  <span className="text-slate-300">{stats.memoryUsage.toFixed(1)}MB</span>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Audio:</span>
                <span className={stats.audioBuffering ? 'text-yellow-400' : 'text-green-400'}>
                  {stats.audioBuffering ? 'Buffering' : 'Ready'}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}