import { useState } from "react";
import { motion } from "framer-motion";
import { StreamTab } from "./StreamTab";
import { AudioProvider } from "./AudioProvider";
import { Play, Upload, Library, Waves } from "lucide-react";

type Tab = "stream";

export function MusicApp() {
  const [activeTab, setActiveTab] = useState<Tab>("stream");

  const tabs = [
    { id: "stream" as const, label: "Discover", icon: Play, description: "Explore music" },
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
              <Waves className="w-8 h-8 text-blue-500" />
              <h2 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                Discover Amazing Music
              </h2>
            </div>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Explore a curated collection of tracks from artists around the world. 
              Immerse yourself in high-quality audio experiences.
            </p>
          </motion.div>
        </div>

        {/* Enhanced Tab Navigation */}
        <motion.nav 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex justify-center mb-8"
          role="tablist"
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-slate-200/60">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative px-6 py-3 rounded-xl font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    activeTab === tab.id
                      ? "text-white shadow-lg"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
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
        </motion.nav>

        {/* Tab Content */}
        <motion.div 
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          role="tabpanel"
        >
          {activeTab === "stream" && <StreamTab />}
        </motion.div>
      </div>
    </AudioProvider>
  );
}
