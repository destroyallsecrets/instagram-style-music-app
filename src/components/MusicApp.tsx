import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  StreamTab,
  UploadTab,
  PlaylistsTab,
  SearchTab,
  AudioProvider,
  MusicWidget
} from "./index";
import { Play, Upload, Library, Search, Waves } from "lucide-react";
import { isAdminUser } from "../utils/auth";

type Tab = "stream" | "upload" | "playlists" | "search";

export function MusicApp() {
  const [activeTab, setActiveTab] = useState<Tab>("stream");
  const user = useQuery(api.auth.loggedInUser);
  const isAdmin = isAdminUser(user?.email);

  // Only show upload tab for admin users
  const baseTabs = [
    { id: "stream" as const, label: "Discover", icon: Play, description: "Explore music" },
    { id: "playlists" as const, label: "Playlists", icon: Library, description: "Your collections" },
    { id: "search" as const, label: "Search", icon: Search, description: "Find tracks" },
  ];

  const adminTabs = [
    { id: "upload" as const, label: "Upload", icon: Upload, description: "Share your music" },
  ];

  const tabs = isAdmin ? [...baseTabs.slice(0, 1), ...adminTabs, ...baseTabs.slice(1)] : baseTabs;

  return (
    <AudioProvider>
      <div className="w-full px-3 sm:px-4 lg:px-8 py-4 sm:py-8 max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-6 sm:mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-2 sm:space-y-4"
          >
            <div className="flex items-center justify-center space-x-2 mb-2 sm:mb-4">
              <Waves className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" />
              <h2 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-slate-100 via-blue-300 to-purple-300 bg-clip-text text-transparent">
                Your Music Universe
              </h2>
            </div>
            <p className="text-sm sm:text-lg text-slate-300 max-w-2xl mx-auto px-4">
              Discover, upload, organize, and search through your music collection
            </p>
          </motion.div>
        </div>

        {/* Enhanced Tab Navigation */}
        <motion.nav
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex justify-center mb-4 sm:mb-8"
        >
          <div className="glass rounded-xl sm:rounded-2xl p-1 sm:p-2 shadow-lg w-full max-w-sm sm:max-w-none sm:w-auto mx-3 sm:mx-0">
            <div className="flex space-x-0.5 sm:space-x-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex-1 sm:flex-none px-2 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-medium text-xs sm:text-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:ring-offset-2 focus:ring-offset-transparent ${activeTab === tab.id
                        ? "text-white shadow-lg"
                        : "text-slate-300 hover:text-white hover:bg-slate-700/40"
                      }`}
                  >
                    {activeTab === tab.id && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg sm:rounded-xl"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <div className="relative flex flex-col sm:flex-row items-center justify-center space-y-0.5 sm:space-y-0 sm:space-x-2">
                      <Icon className="w-4 h-4" />
                      <span className="text-xs sm:text-sm">{tab.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </motion.nav>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {activeTab === "stream" && <StreamTab />}
          {activeTab === "upload" && <UploadTab />}
          {activeTab === "playlists" && <PlaylistsTab />}
          {activeTab === "search" && <SearchTab />}
        </motion.div>

        {/* Universal Music Widget */}
        <MusicWidget />
      </div>
    </AudioProvider>
  );
}
