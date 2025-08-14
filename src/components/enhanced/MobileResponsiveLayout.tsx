import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDeviceDetection } from '../../hooks/useDeviceDetection';
import { MobileSwipeNavigation } from './MobileSwipeNavigation';
import { 
  Play, 
  Upload, 
  Library, 
  Search, 
  User,
  Menu,
  X,
  Home,
  TrendingUp,
  Radio
} from 'lucide-react';

interface MobileResponsiveLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tabId: string) => void;
  tabs: Array<{
    id: string;
    label: string;
    icon: React.ComponentType<any>;
    description: string;
  }>;
  isAdmin?: boolean;
}

export function MobileResponsiveLayout({ 
  children, 
  activeTab, 
  onTabChange, 
  tabs: _tabs,
  isAdmin = false 
}: MobileResponsiveLayoutProps) {
  const deviceInfo = useDeviceDetection();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [safeAreaInsets, setSafeAreaInsets] = useState({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
  });

  // Detect safe area insets for devices with notches
  useEffect(() => {
    const updateSafeArea = () => {
      const computedStyle = getComputedStyle(document.documentElement);
      setSafeAreaInsets({
        top: parseInt(computedStyle.getPropertyValue('--sat') || '0'),
        bottom: parseInt(computedStyle.getPropertyValue('--sab') || '0'),
        left: parseInt(computedStyle.getPropertyValue('--sal') || '0'),
        right: parseInt(computedStyle.getPropertyValue('--sar') || '0')
      });
    };

    updateSafeArea();
    window.addEventListener('resize', updateSafeArea);
    return () => window.removeEventListener('resize', updateSafeArea);
  }, []);

  // Mobile-specific tabs with better organization
  const mobileTabsConfig = [
    { id: "home", label: "Home", icon: Home, description: "Discover music" },
    { id: "trending", label: "Trending", icon: TrendingUp, description: "What's hot" },
    { id: "radio", label: "Radio", icon: Radio, description: "Live stations" },
    { id: "library", label: "Library", icon: Library, description: "Your music" },
    { id: "search", label: "Search", icon: Search, description: "Find tracks" },
    ...(isAdmin ? [{ id: "upload", label: "Upload", icon: Upload, description: "Share music" }] : [])
  ];

  const currentTab = mobileTabsConfig.find(tab => tab.id === activeTab) || mobileTabsConfig[0];

  if (deviceInfo.type !== 'mobile') {
    return <>{children}</>;
  }

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden safe-area-insets"
      data-safe-top={safeAreaInsets.top}
      data-safe-bottom={safeAreaInsets.bottom}
      data-safe-left={safeAreaInsets.left}
      data-safe-right={safeAreaInsets.right}
    >
      {/* Mobile Header */}
      <motion.header 
        className="sticky top-0 z-40 glass-pod-minimal border-b border-slate-600/20"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowMobileMenu(true)}
              className="w-10 h-10 rounded-xl glass-pod-micro flex items-center justify-center"
            >
              <Menu className="w-5 h-5 text-slate-300" />
            </motion.button>
            
            <div>
              <h1 className="text-lg font-bold text-white">
                {currentTab.label}
              </h1>
              <p className="text-xs text-slate-400">
                {currentTab.description}
              </p>
            </div>
          </div>

          <motion.div
            className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center"
            whileTap={{ scale: 0.95 }}
          >
            <User className="w-4 h-4 text-white" />
          </motion.div>
        </div>
      </motion.header>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {showMobileMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50"
            onClick={() => setShowMobileMenu(false)}
          >
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-80 h-full glass-pod-minimal border-r border-slate-600/20"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <Play className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white">SoundWave</h2>
                      <p className="text-xs text-slate-400">Music Streaming</p>
                    </div>
                  </div>
                  
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowMobileMenu(false)}
                    className="w-8 h-8 rounded-lg glass-pod-micro flex items-center justify-center"
                  >
                    <X className="w-4 h-4 text-slate-300" />
                  </motion.button>
                </div>

                <nav className="space-y-2">
                  {mobileTabsConfig.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = tab.id === activeTab;
                    
                    return (
                      <motion.button
                        key={tab.id}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          onTabChange(tab.id);
                          setShowMobileMenu(false);
                        }}
                        className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all ${
                          isActive 
                            ? 'glass-pod text-white' 
                            : 'glass-pod-micro text-slate-300 hover:text-white'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          isActive 
                            ? 'bg-gradient-to-r from-blue-500 to-purple-600' 
                            : 'glass-pod-micro'
                        }`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        
                        <div className="text-left">
                          <div className="font-medium">{tab.label}</div>
                          <div className="text-xs opacity-70">{tab.description}</div>
                        </div>
                      </motion.button>
                    );
                  })}
                </nav>

                {/* User Profile Section */}
                <div className="mt-8 pt-6 border-t border-slate-600/20">
                  <div className="flex items-center gap-3 p-4 glass-pod-micro rounded-xl">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-white">Music Lover</div>
                      <div className="text-xs text-slate-400">Premium Member</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content with Swipe Navigation */}
      <MobileSwipeNavigation
        tabs={mobileTabsConfig}
        activeTab={activeTab}
        onTabChange={onTabChange}
      >
        <main className="flex-1 pb-32">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="p-4"
          >
            {children}
          </motion.div>
        </main>
      </MobileSwipeNavigation>

      {/* Bottom Tab Bar */}
      <motion.div 
        className="fixed bottom-0 left-0 right-0 z-30 glass-pod-minimal border-t border-slate-600/20"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300, delay: 0.2 }}
        style={{ paddingBottom: `${Math.max(safeAreaInsets.bottom, 8)}px` }}
      >
        <div className="flex items-center justify-around px-2 py-2">
          {mobileTabsConfig.slice(0, 5).map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.id === activeTab;
            
            return (
              <motion.button
                key={tab.id}
                whileTap={{ scale: 0.9 }}
                onClick={() => onTabChange(tab.id)}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${
                  isActive ? 'text-white' : 'text-slate-400'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                  isActive 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg' 
                    : 'hover:bg-slate-700/40'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-xs font-medium">{tab.label}</span>
                
                {isActive && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="w-1 h-1 bg-blue-400 rounded-full"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Floating Action Button */}
      <motion.button
        className="fixed bottom-24 right-4 z-40 w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 shadow-xl flex items-center justify-center"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", delay: 0.5 }}
      >
        <Search className="w-6 h-6 text-white" />
      </motion.button>
    </div>
  );
}