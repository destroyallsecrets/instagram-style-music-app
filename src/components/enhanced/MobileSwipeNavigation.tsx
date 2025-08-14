import { useState, useRef } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { useDeviceDetection } from '../../hooks/useDeviceDetection';

interface SwipeNavigationProps {
  tabs: Array<{
    id: string;
    label: string;
    icon: React.ComponentType<any>;
    description: string;
  }>;
  activeTab: string;
  onTabChange: (tabId: string) => void;
  children: React.ReactNode;
}

export function MobileSwipeNavigation({ 
  tabs, 
  activeTab, 
  onTabChange, 
  children 
}: SwipeNavigationProps) {
  const deviceInfo = useDeviceDetection();
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Only enable on mobile
  if (deviceInfo.type !== 'mobile') {
    return <>{children}</>;
  }

  const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
  const swipeThreshold = 100;

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDrag = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setDragOffset(info.offset.x);
  };

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false);
    setDragOffset(0);

    const { offset, velocity } = info;
    const swipe = Math.abs(offset.x) > swipeThreshold || Math.abs(velocity.x) > 500;

    if (swipe) {
      if (offset.x > 0 && currentIndex > 0) {
        // Swipe right - go to previous tab
        onTabChange(tabs[currentIndex - 1].id);
        // Haptic feedback
        if ('vibrate' in navigator) {
          navigator.vibrate(30);
        }
      } else if (offset.x < 0 && currentIndex < tabs.length - 1) {
        // Swipe left - go to next tab
        onTabChange(tabs[currentIndex + 1].id);
        // Haptic feedback
        if ('vibrate' in navigator) {
          navigator.vibrate(30);
        }
      }
    }
  };

  return (
    <div className="relative overflow-hidden">
      {/* Swipe indicator */}
      <AnimatePresence>
        {isDragging && Math.abs(dragOffset) > 20 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none"
          >
            <div className="glass-pod rounded-full p-4">
              <div className="flex items-center gap-3 text-white">
                {dragOffset > 0 && currentIndex > 0 && (
                  <>
                    <div className="w-2 h-2 rounded-full bg-blue-400" />
                    <span className="text-sm font-medium">
                      {tabs[currentIndex - 1].label}
                    </span>
                  </>
                )}
                {dragOffset < 0 && currentIndex < tabs.length - 1 && (
                  <>
                    <span className="text-sm font-medium">
                      {tabs[currentIndex + 1].label}
                    </span>
                    <div className="w-2 h-2 rounded-full bg-blue-400" />
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Swipeable content */}
      <motion.div
        ref={containerRef}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        animate={{
          x: isDragging ? dragOffset * 0.5 : 0,
          scale: isDragging ? 0.98 : 1
        }}
        transition={{
          type: "spring",
          damping: 25,
          stiffness: 300
        }}
        className="touch-pan-x"
        style={{
          touchAction: 'pan-x',
          userSelect: 'none',
          WebkitUserSelect: 'none'
        }}
      >
        {children}
      </motion.div>

      {/* Tab indicators */}
      <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-40">
        <div className="glass-pod-minimal rounded-full px-4 py-2">
          <div className="flex items-center gap-2">
            {tabs.map((tab, index) => (
              <motion.div
                key={tab.id}
                className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                  index === currentIndex 
                    ? 'bg-blue-400' 
                    : 'bg-slate-500'
                }`}
                animate={{
                  scale: index === currentIndex ? 1.2 : 1,
                  opacity: index === currentIndex ? 1 : 0.6
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Edge swipe hints */}
      <AnimatePresence>
        {!isDragging && (
          <>
            {currentIndex > 0 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 0.3, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="fixed left-2 top-1/2 transform -translate-y-1/2 z-30 pointer-events-none"
              >
                <div className="w-1 h-16 bg-gradient-to-b from-transparent via-blue-400 to-transparent rounded-full" />
              </motion.div>
            )}
            
            {currentIndex < tabs.length - 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 0.3, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="fixed right-2 top-1/2 transform -translate-y-1/2 z-30 pointer-events-none"
              >
                <div className="w-1 h-16 bg-gradient-to-b from-transparent via-blue-400 to-transparent rounded-full" />
              </motion.div>
            )}
          </>
        )}
      </AnimatePresence>
    </div>
  );
}