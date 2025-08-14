import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { motion } from "framer-motion";
import { User, Music, Users, Globe } from "lucide-react";
import { SkeletonLoader } from "./SkeletonLoader";

export function ArtistsTab() {
  const artists = useQuery(api.artists.getAllArtistProfiles);

  if (artists === undefined) {
    return (
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8"
        >
          <p className="text-slate-300 font-medium mb-6">Loading artists...</p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <SkeletonLoader type="track-card" count={6} />
        </div>
      </div>
    );
  }

  if (artists.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
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
            🎤
          </motion.div>
          <h3 className="text-2xl font-bold text-slate-100 mb-3">No artists yet</h3>
          <p className="text-slate-300 leading-relaxed">
            Be the first to create an artist profile and share your music!
          </p>
        </div>
      </motion.div>
    );
  }

  const handleArtistClick = (artist: any) => {
    const artistSlug = artist.displayName.toLowerCase().replace(/\s+/g, '-');
    window.location.href = `/artist/${artistSlug}`;
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between px-1"
      >
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg sm:rounded-xl flex items-center justify-center">
            <Users className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg sm:text-2xl font-bold text-slate-100">Discover Artists</h2>
            <p className="text-xs sm:text-sm text-slate-300">{artists.length} artist{artists.length !== 1 ? 's' : ''} on the platform</p>
          </div>
        </div>
      </motion.div>

      {/* Artists Grid */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
      >
        {artists.map((artist, index) => (
          <motion.div
            key={artist._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.4, 
              delay: index * 0.1,
              ease: "easeOut"
            }}
            whileHover={{ y: -4 }}
            className="glass rounded-xl p-6 cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-black/20 hover:border-slate-500/60"
            onClick={() => handleArtistClick(artist)}
            style={{
              background: artist.customColors ? 
                `linear-gradient(135deg, ${artist.customColors.primary}15, ${artist.customColors.secondary}15)` :
                undefined
            }}
          >
            {/* Artist Avatar */}
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-slate-700/60 to-slate-800/60 flex items-center justify-center">
                <User className="w-8 h-8 text-slate-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg text-slate-100 truncate">
                  {artist.displayName}
                </h3>
                {artist.genre && (
                  <p className="text-sm text-slate-300 truncate">
                    {artist.genre}
                  </p>
                )}
              </div>
            </div>

            {/* Artist Bio */}
            {artist.bio && (
              <p className="text-sm text-slate-300 line-clamp-3 mb-4">
                {artist.bio}
              </p>
            )}

            {/* Artist Links */}
            <div className="flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1">
                  <Music className="w-3 h-3" />
                  <span>Tracks</span>
                </div>
                {artist.website && (
                  <div className="flex items-center space-x-1">
                    <Globe className="w-3 h-3" />
                    <span>Website</span>
                  </div>
                )}
              </div>
              <div className="text-xs text-slate-500">
                View Profile →
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}