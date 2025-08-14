
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { motion } from "framer-motion";
import { User, Users } from "lucide-react";
import { SkeletonLoader } from "../SkeletonLoader";

export function MobileArtistsTab() {
  const artists = useQuery(api.artists.getAllArtistProfiles);

  if (artists === undefined) {
    return (
      <div className="space-y-4">
        <SkeletonLoader type="track-card" count={5} />
      </div>
    );
  }

  if (artists.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center py-12"
      >
        <div className="glass rounded-2xl p-8 max-w-sm mx-auto">
          <motion.div
            animate={{ 
              scale: [1, 1.05, 1],
              rotate: [0, 3, -3, 0]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="text-5xl mb-5"
          >
            🎤
          </motion.div>
          <h3 className="text-xl font-bold text-slate-100 mb-2">No artists yet</h3>
          <p className="text-slate-300 text-sm">
            Be the first to create an artist profile!
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
    <div className="space-y-4">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center space-x-3"
      >
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
          <Users className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-100">Artists</h2>
          <p className="text-sm text-slate-300">{artists.length} on the platform</p>
        </div>
      </motion.div>

      {/* Artists List */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="space-y-3"
      >
        {artists.map((artist, index) => (
          <motion.div
            key={artist._id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ 
              duration: 0.4, 
              delay: index * 0.08,
              ease: "easeOut"
            }}
            className="glass rounded-lg p-3 cursor-pointer transition-all duration-300 flex items-center space-x-4"
            onClick={() => handleArtistClick(artist)}
            style={{
              background: artist.customColors ? 
                `linear-gradient(135deg, ${artist.customColors.primary}10, ${artist.customColors.secondary}10)` :
                undefined
            }}
          >
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-slate-700/60 to-slate-800/60 flex items-center justify-center">
              <User className="w-6 h-6 text-slate-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base text-slate-100 truncate">
                {artist.displayName}
              </h3>
              {artist.genre && (
                <p className="text-xs text-slate-300 truncate">
                  {artist.genre}
                </p>
              )}
            </div>
            <div className="text-xs text-slate-500">
              →
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
