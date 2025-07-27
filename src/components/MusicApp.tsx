import { useState } from "react";
import { motion } from "framer-motion";
import {
  StreamTab,
  UploadTab,
  PlaylistsTab,
  SearchTab,
  AudioProvider,
  MusicWidget
} from "./index";
import { Play, Upload, Library, Search, Waves } from "lucide-react";

type Tab = "stream" | "upload" | "playlists" | "search";

export function MusicApp() {
  const [activeTab, setActiveTab] = useState<Tab>("stream");

  const tabs = [
    { id: "stream" as const, label: "Discover", icon: Play, description: "Explore music" },
    { id: "upload" as const, label: "Upload", icon: Upload, description: "Share your music" },
    { id: "playlists" as const, label: "Playlists", icon: Library, description: "Your collections" },
    { id: "search" as const, label: "Search", icon: Search, description: "Find tracks" },
  ];

  return (
    <AudioProvider>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Waves className="w-8 h-8 text-blue-400" />
              <h2 className="text-4xl font-bold bg-gradient-to-r from-slate-100 via-blue-300 to-purple-300 bg-clip-text text-transparent">
                Your Music Universe
              </h2>
            </div>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">
              Discover, upload, organize, and search through your music collection
            </p>
          </motion.div>
        </div>

        {/* Enhanced Tab Navigation */}
        <motion.nav
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex justify-center mb-8"
        >
          <div className="glass rounded-2xl p-2 shadow-lg">
            <div className="flex space-x-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative px-6 py-3 rounded-xl font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:ring-offset-2 focus:ring-offset-transparent ${activeTab === tab.id
                        ? "text-white shadow-lg"
                        : "text-slate-300 hover:text-white hover:bg-slate-700/40"
                      }`}
                  >
                    {activeTab === tab.id && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <div className="relative flex items-center space-x-2">
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
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
