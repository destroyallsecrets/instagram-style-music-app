import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, X, Clock, TrendingUp, Music } from "lucide-react";

interface EnhancedSearchProps {
  onSearch: (query: string, filters: any) => void;
  recentSearches?: string[];
  trendingSearches?: string[];
}

export function EnhancedSearch({ onSearch, recentSearches = [], trendingSearches = [] }: EnhancedSearchProps) {
  const [query, setQuery] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filters, setFilters] = useState({
    genre: "",
    duration: "",
    year: ""
  });
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (query.trim()) {
        onSearch(query, filters);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query, filters, onSearch]);

  const handleQuickSearch = (searchTerm: string) => {
    setQuery(searchTerm);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  return (
    <div className="relative">
      {/* Main Search Bar */}
      <motion.div
        className="relative"
        animate={{ scale: isExpanded ? 1.02 : 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              setIsExpanded(true);
              setShowSuggestions(true);
            }}
            onBlur={() => {
              setTimeout(() => {
                setIsExpanded(false);
                setShowSuggestions(false);
              }, 200);
            }}
            placeholder="Search for tracks, artists, or albums..."
            className="w-full pl-12 pr-20 py-4 glass rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
          />
          
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
            {query && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setQuery("")}
                className="w-6 h-6 rounded-full bg-slate-700/60 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-3 h-3" />
              </motion.button>
            )}
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowSuggestions(!showSuggestions)}
              className="w-8 h-8 rounded-full bg-slate-700/60 flex items-center justify-center text-slate-400 hover:text-blue-400"
            >
              <Filter className="w-4 h-4" />
            </motion.button>
          </div>
        </div>

        {/* Search Progress Indicator */}
        {query && (
          <motion.div
            className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 0.3 }}
          />
        )}
      </motion.div>

      {/* Search Suggestions Dropdown */}
      <AnimatePresence>
        {showSuggestions && (isExpanded || query) && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute top-full left-0 right-0 mt-2 glass rounded-2xl backdrop-blur-xl bg-slate-900/95 border border-slate-600/40 shadow-xl z-50 max-h-80 overflow-y-auto"
          >
            {/* Quick Filters */}
            <div className="p-4 border-b border-slate-600/40">
              <h4 className="text-sm font-medium text-slate-300 mb-3">Quick Filters</h4>
              <div className="flex flex-wrap gap-2">
                {["Pop", "Rock", "Electronic", "Hip-Hop", "Jazz"].map((genre) => (
                  <motion.button
                    key={genre}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setFilters({ ...filters, genre });
                      setQuery(genre);
                    }}
                    className="px-3 py-1.5 text-xs bg-slate-800/60 hover:bg-blue-500/20 text-slate-300 hover:text-blue-300 rounded-full transition-colors"
                  >
                    {genre}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div className="p-4 border-b border-slate-600/40">
                <h4 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Recent Searches
                </h4>
                <div className="space-y-2">
                  {recentSearches.slice(0, 3).map((search, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.02, x: 4 }}
                      onClick={() => handleQuickSearch(search)}
                      className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800/40 rounded-lg transition-all flex items-center gap-3"
                    >
                      <Search className="w-3 h-3 text-slate-500" />
                      {search}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Trending Searches */}
            {trendingSearches.length > 0 && (
              <div className="p-4">
                <h4 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Trending
                </h4>
                <div className="space-y-2">
                  {trendingSearches.slice(0, 3).map((search, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.02, x: 4 }}
                      onClick={() => handleQuickSearch(search)}
                      className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800/40 rounded-lg transition-all flex items-center gap-3"
                    >
                      <Music className="w-3 h-3 text-blue-400" />
                      {search}
                      <span className="ml-auto text-xs text-blue-400">#{index + 1}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}