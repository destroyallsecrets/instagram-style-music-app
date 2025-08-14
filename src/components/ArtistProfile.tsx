import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { motion } from "framer-motion";
import { User, Globe, Music, Edit3, Save, X, Upload } from "lucide-react";
import { TrackCard } from "./TrackCard";
import { toast } from "sonner";

interface ArtistProfileProps {
  artistName?: string;
  isOwnProfile?: boolean;
}

export function ArtistProfile({ artistName, isOwnProfile = false }: ArtistProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    displayName: "",
    bio: "",
    genre: "",
    website: "",
    socialLinks: {
      spotify: "",
      bandcamp: "",
      soundcloud: "",
      youtube: "",
    },
    customColors: {
      primary: "#3b82f6",
      secondary: "#8b5cf6", 
      accent: "#06b6d4",
    },
  });

  // Queries
  const myProfile = useQuery(api.artists.getMyArtistProfile);
  const artistByName = useQuery(
    api.artists.getArtistByName,
    artistName ? { displayName: artistName } : "skip"
  );
  
  const profile = isOwnProfile ? myProfile : artistByName;
  const artistTracks = useQuery(
    api.artists.getTracksByArtist,
    profile ? { userId: profile.userId } : "skip"
  );

  // Mutations
  const updateProfile = useMutation(api.artists.createOrUpdateArtistProfile);

  // Initialize form data when profile loads
  useState(() => {
    if (profile) {
      setFormData({
        displayName: profile.displayName || "",
        bio: profile.bio || "",
        genre: profile.genre || "",
        website: profile.website || "",
        socialLinks: {
          spotify: profile.socialLinks?.spotify || "",
          bandcamp: profile.socialLinks?.bandcamp || "",
          soundcloud: profile.socialLinks?.soundcloud || "",
          youtube: profile.socialLinks?.youtube || "",
        },
        customColors: profile.customColors || {
          primary: "#3b82f6",
          secondary: "#8b5cf6",
          accent: "#06b6d4",
        },
      });
    }
  });

  const handleSave = async () => {
    try {
      await updateProfile(formData);
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch {
      toast.error("Failed to update profile");
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        displayName: profile.displayName || "",
        bio: profile.bio || "",
        genre: profile.genre || "",
        website: profile.website || "",
        socialLinks: {
          spotify: profile.socialLinks?.spotify || "",
          bandcamp: profile.socialLinks?.bandcamp || "",
          soundcloud: profile.socialLinks?.soundcloud || "",
          youtube: profile.socialLinks?.youtube || "",
        },
        customColors: profile.customColors || {
          primary: "#3b82f6",
          secondary: "#8b5cf6",
          accent: "#06b6d4",
        },
      });
    }
    setIsEditing(false);
  };

  if (!profile && !isOwnProfile) {
    return (
      <div className="text-center py-16">
        <div className="glass rounded-3xl p-12 max-w-md mx-auto">
          <User className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-slate-100 mb-3">Artist Not Found</h3>
          <p className="text-slate-300">This artist profile doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Artist Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl overflow-hidden"
        style={{
          background: profile?.customColors ? 
            `linear-gradient(135deg, ${profile.customColors.primary}20, ${profile.customColors.secondary}20)` :
            undefined
        }}
      >
        {/* Banner Area */}
        <div className="h-32 sm:h-48 bg-gradient-to-r from-slate-700/60 to-slate-800/60 relative">
          {isEditing && isOwnProfile && (
            <button 
              type="button"
              className="absolute top-4 right-4 glass p-2 rounded-lg hover:bg-slate-600/40"
              aria-label="Upload banner image"
              title="Upload banner image"
            >
              <Upload className="w-4 h-4 text-slate-300" />
            </button>
          )}
        </div>

        {/* Profile Content */}
        <div className="p-6 -mt-16 relative">
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Profile Image */}
            <div className="relative">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-br from-slate-700/60 to-slate-800/60 flex items-center justify-center border-4 border-slate-800/60">
                <User className="w-8 h-8 sm:w-12 sm:h-12 text-slate-400" />
              </div>
              {isEditing && isOwnProfile && (
                <button 
                  type="button"
                  className="absolute -bottom-2 -right-2 glass p-2 rounded-lg hover:bg-slate-600/40"
                  aria-label="Upload profile image"
                  title="Upload profile image"
                >
                  <Upload className="w-3 h-3 text-slate-300" />
                </button>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 space-y-4">
              {isEditing && isOwnProfile ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    className="w-full bg-slate-800/60 border border-slate-600/40 rounded-lg px-4 py-2 text-white placeholder-slate-400"
                    placeholder="Artist Name"
                  />
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="w-full bg-slate-800/60 border border-slate-600/40 rounded-lg px-4 py-2 text-white placeholder-slate-400 h-24 resize-none"
                    placeholder="Tell your story..."
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={formData.genre}
                      onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                      className="bg-slate-800/60 border border-slate-600/40 rounded-lg px-4 py-2 text-white placeholder-slate-400"
                      placeholder="Genre"
                    />
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      className="bg-slate-800/60 border border-slate-600/40 rounded-lg px-4 py-2 text-white placeholder-slate-400"
                      placeholder="Website"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <h1 className="text-2xl sm:text-4xl font-bold text-white mb-2">
                    {profile?.displayName || "Set up your artist profile"}
                  </h1>
                  {profile?.bio && (
                    <p className="text-slate-300 mb-4">{profile.bio}</p>
                  )}
                  <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                    {profile?.genre && (
                      <div className="flex items-center gap-1">
                        <Music className="w-4 h-4" />
                        <span>{profile.genre}</span>
                      </div>
                    )}
                    {profile?.website && (
                      <div className="flex items-center gap-1">
                        <Globe className="w-4 h-4" />
                        <a href={profile.website} target="_blank" rel="noopener noreferrer" 
                           className="hover:text-blue-400 transition-colors">
                          Website
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {isOwnProfile && (
                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <button
                        type="button"
                        onClick={() => void handleSave()}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                      >
                        <Save className="w-4 h-4" />
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 px-4 py-2 glass hover:bg-slate-600/40 text-white rounded-lg transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                      Edit Profile
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Artist Tracks */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-xl font-bold text-white mb-4">
          {isOwnProfile ? "Your Tracks" : "Tracks"}
        </h2>
        {artistTracks && artistTracks.length > 0 ? (
          <div className="space-y-3">
            {artistTracks.map((track) => (
              <TrackCard key={track._id} track={track} />
            ))}
          </div>
        ) : (
          <div className="glass rounded-xl p-8 text-center">
            <Music className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-300">
              {isOwnProfile ? "Upload your first track to get started" : "No tracks available"}
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}