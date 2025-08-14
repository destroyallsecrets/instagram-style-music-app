import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Filter, Music, User, X } from "lucide-react";
import { TrackCard } from "./TrackCard";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

type SearchFilter = "all" | "tracks" | "artists";

export function SearchTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<SearchFilter>("all");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const searchResults = useQuery(api.tracks.searchTracks, { query: searchQuery });
  const artists = useQuery(api.artists.getAllArtistProfiles);
  const allTracks = useQuery(api.tracks.getAllTracks);
  
  // Get unique genres from tracks
  const genres = allTracks ? [...new Set(allTracks.map(track => track.genre).filter(Boolean))] : [];

  const filters = [
    { id: "all" as const, label: "All", icon: Search },
    { id: "tracks" as const, label: "Tracks", icon: Music },
    { id: "artists" as const, label: "Artists", icon: User },
  ];

  // Filter results based on selected filters
  const filteredTracks = searchResults?.filter(track => 
    !selectedGenre || track.genre === selectedGenre
  ) || [];

  const filteredArtists = artists?.filter(artist =>
    artist.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (artist.genre && artist.genre.toLowerCase().includes(searchQuery.toLowerCase()))
  ).filter(artist =>
    !selectedGenre || artist.genre === selectedGenre
  ) || [];

  const handleArtistClick = (artist: any) => {
    const artistSlug = artist.displayName.toLowerCase().replace(/\s+/g, '-');
    window.location.href = `/artist/${artistSlug}`;
  };

  const clearFilters = () => {
    setSelectedGenre("");
  };

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

      {/* Advanced Filters */}
      {searchQuery && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="flex justify-center"
        >
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`glass px-4 py-2 rounded-xl transition-colors flex items-center gap-2 ${
              showFilters ? 'bg-blue-500/20 text-blue-400' : 'hover:bg-slate-600/40 text-slate-300'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span className="text-sm">Filters</span>
          </button>
        </motion.div>
      )}

      {/* Filters Panel */}
      {showFilters && searchQuery && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="glass rounded-xl p-4 max-w-md mx-auto"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-100">Filters</h3>
            {selectedGenre && (
              <button
                onClick={clearFilters}
                className="text-sm text-slate-400 hover:text-slate-200 flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                Clear
              </button>
            )}
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Genre</label>
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="w-full bg-slate-800/60 border border-slate-600/40 rounded-lg px-3 py-2 text-white"
                aria-label="Filter by genre"
              >
                <option value="">All Genres</option>
                {genres.map((genre) => (
                  <option key={genre} value={genre}>{genre}</option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>
      )}

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
          ) : activeFilter === "tracks" || activeFilter === "all" ? (
            filteredTracks.length > 0 ? (
              <div className="space-y-4">
                {filteredTracks.map((track, index) => (
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
                <div className="text-6xl mb-4">🎵</div>
                <h3 className="text-xl font-semibold text-slate-100 mb-2">No tracks found</h3>
                <p className="text-slate-300">
                  Try searching with different keywords
                  {selectedGenre && " or change the genre filter"}
                </p>
              </motion.div>
            )
          ) : activeFilter === "artists" ? (
            filteredArtists.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredArtists.map((artist, index) => (
                  <motion.div
                    key={artist._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="glass rounded-xl p-4 cursor-pointer hover:bg-slate-700/40 transition-colors"
                    onClick={() => handleArtistClick(artist)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-slate-700/60 to-slate-800/60 flex items-center justify-center">
                        <User className="w-6 h-6 text-slate-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-100 truncate">
                          {artist.displayName}
                        </h3>
                        {artist.genre && (
                          <p className="text-sm text-slate-300 truncate">
                            {artist.genre}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <div className="text-6xl mb-4">👤</div>
                <h3 className="text-xl font-semibold text-slate-100 mb-2">No artists found</h3>
                <p className="text-slate-300">
                  Try searching with different keywords
                  {selectedGenre && " or change the genre filter"}
                </p>
              </motion.div>
            )
          ) : (
            // Show both tracks and artists for "all" filter
            <div className="space-y-8">
              {filteredTracks.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-slate-100 mb-4">Tracks</h4>
                  <div className="space-y-4">
                    {filteredTracks.slice(0, 5).map((track, index) => (
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
                </div>
              )}
              
              {filteredArtists.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-slate-100 mb-4">Artists</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredArtists.slice(0, 6).map((artist, index) => (
                      <motion.div
                        key={artist._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="glass rounded-xl p-4 cursor-pointer hover:bg-slate-700/40 transition-colors"
                        onClick={() => handleArtistClick(artist)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-slate-700/60 to-slate-800/60 flex items-center justify-center">
                            <User className="w-6 h-6 text-slate-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-slate-100 truncate">
                              {artist.displayName}
                            </h3>
                            {artist.genre && (
                              <p className="text-sm text-slate-300 truncate">
                                {artist.genre}
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
              
              {filteredTracks.length === 0 && filteredArtists.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold text-slate-100 mb-2">No results found</h3>
                  <p className="text-slate-300">
                    Try searching with different keywords
                    {selectedGenre && " or change the genre filter"}
                  </p>
                </motion.div>
              )}
            </div>
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