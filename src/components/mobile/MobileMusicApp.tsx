import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { AudioProvider } from "../AudioProvider";
import { MobileStreamTab } from "./MobileStreamTab";
import { MobileUploadTab } from "./MobileUploadTab";
import { MobilePlaylistsTab } from "./MobilePlaylistsTab";
import { MobileSearchTab } from "./MobileSearchTab";
import { MobileMusicWidget } from "./MobileMusicWidget";
import { MobileBottomNav } from "./MobileBottomNav";
import { MobileHeader } from "./MobileHeader";
import { isAdminUser } from "../../utils/auth";

type Tab = "stream" | "upload" | "playlists" | "search";

export function MobileMusicApp() {
  const [activeTab, setActiveTab] = useState<Tab>("stream");
  const [isScrolled, setIsScrolled] = useState(false);
  const user = useQuery(api.auth.loggedInUser);
  const isAdmin = isAdminUser(user?.email);

  // Handle scroll for header effects
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Only show upload tab for admin users
  const baseTabs = [
    { id: "stream" as const, label: "Discover", description: "Explore music" },
    { id: "playlists" as const, label: "Playlists", description: "Your collections" },
    { id: "search" as const, label: "Search", description: "Find tracks" },
  ];

  const adminTabs = [
    { id: "upload" as const, label: "Upload", description: "Share your music" },
  ];

  const tabs = isAdmin ? [...baseTabs.slice(0, 1), ...adminTabs, ...baseTabs.slice(1)] : baseTabs;

  return (
    <AudioProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-slate-900/20" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/30 via-transparent to-transparent" />
        
        {/* Mobile Header */}
        <MobileHeader isScrolled={isScrolled} />

        {/* Main Content */}
        <main className="pt-16 pb-24 px-4 relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              {activeTab === "stream" && <MobileStreamTab />}
              {activeTab === "upload" && <MobileUploadTab />}
              {activeTab === "playlists" && <MobilePlaylistsTab />}
              {activeTab === "search" && <MobileSearchTab />}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Bottom Navigation */}
        <MobileBottomNav 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
          tabs={tabs}
        />

        {/* Mobile Music Widget */}
        <MobileMusicWidget />
      </div>
    </AudioProvider>
  );
}