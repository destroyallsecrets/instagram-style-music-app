import { motion } from "framer-motion";
import { Play, Upload, Library, Search } from "lucide-react";

type Tab = "stream" | "upload" | "playlists" | "search";

interface TabConfig {
  id: Tab;
  label: string;
  description: string;
}

interface MobileBottomNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  tabs: TabConfig[];
}

const iconMap = {
  stream: Play,
  upload: Upload,
  playlists: Library,
  search: Search,
};

export function MobileBottomNav({ activeTab, onTabChange, tabs }: MobileBottomNavProps) {
  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-xl border-t border-slate-700/50"
    >
      <div className="px-4 py-2">
        <div className="flex justify-around">
          {tabs.map((tab) => {
            const Icon = iconMap[tab.id];
            const isActive = activeTab === tab.id;
            
            return (
              <motion.button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-all duration-300 ${
                  isActive
                    ? "text-white"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                whileTap={{ scale: 0.95 }}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-lg"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <div className="relative z-10 flex flex-col items-center">
                  <Icon className={`w-5 h-5 mb-1 ${isActive ? "text-blue-400" : ""}`} />
                  <span className="text-xs font-medium">{tab.label}</span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.nav>
  );
}