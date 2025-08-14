import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Filter, Music, User } from "lucide-react";
import { TrackCard } from "./TrackCard";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

type SearchFilter = "all" | "tracks" | "artists" | "albums";

export function SearchTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<SearchFilter>("all");
  const [isSearching, setIsSearching] = useState(false);

  const searchResults = useQuery(api.tracks.searchTracks, { query: searchQuery });

  const filters = [
    { id: "all" as const, label: "All", icon: Search },
    { id: "tracks" as const, label: "Tracks", icon: Music },
    { id: "artists" as const, label: "Artists", icon: User },
  ];

  useEffect(() => {
    setIsSearching(true);
    const searchTimeout = setTimeout(() => {
      setIsSearching(false);
    }, 500);

    return () => clearTimeout(searchTimeout);
  }, [searchQuery]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Search className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-slate-100 mb-2">Search Music</h2>
        <p className="text-slate-300">Find your next favorite track</p>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative max-w-2xl mx-auto"
      >
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for tracks, artists..."
            className="w-full pl-12 pr-12 py-4 glass rounded-2xl focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none transition-all duration-300 shadow-sm hover:shadow-md text-lg text-slate-200 placeholder:text-slate-400"
          />
          {isSearching && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full"
            />
          )}
        </div>
      </motion.div>

      {/* Search Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex justify-center"
      >
        <div className="glass rounded-2xl p-2 shadow-lg">
          <div className="flex space-x-1">
            {filters.map((filter) => {
              const Icon = filter.icon;
              return (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => setActiveFilter(filter.id)}
                  className={`relative px-4 py-2 rounded-xl font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:ring-offset-2 focus:ring-offset-transparent ${
                    activeFilter === filter.id
                      ? "text-white shadow-lg"
                      : "text-slate-300 hover:text-white hover:bg-slate-700/40"
                  }`}
                >
                  {activeFilter === filter.id && (
                    <motion.div
                      layoutId="activeFilter"
                      className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <div className="relative flex items-center space-x-2">
                    <Icon className="w-4 h-4" />
                    <span>{filter.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Search Results */}
      {searchQuery && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-100">
              Search Results {searchResults && searchResults.length > 0 && `(${searchResults.length})`}
            </h3>
            <button type="button" className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors">
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">Filter</span>
            </button>
          </div>

          {isSearching ? (
            <div className="flex justify-center py-12">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full"
              />
            </div>
          ) : searchResults && searchResults.length > 0 ? (
            <div className="space-y-4">
              {searchResults.map((track, index) => (
                <motion.div
                  key={track._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <TrackCard track={track} showUploader />
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-slate-100 mb-2">No results found</h3>
              <p className="text-slate-300">Try searching with different keywords</p>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Default State - Trending & Recent */}
      {!searchQuery && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-8"
        >
          {/* Empty Search State */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <div className="glass rounded-3xl p-12 max-w-md mx-auto">
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="text-6xl mb-6"
              >
                🔍
              </motion.div>
              <h3 className="text-2xl font-bold text-slate-100 mb-3">Start searching</h3>
              <p className="text-slate-300 leading-relaxed">
                Use the search bar above to find tracks, artists, and more
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}