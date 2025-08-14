import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { motion } from "framer-motion";
import { Library, Plus, Play, Music, Clock, MoreHorizontal } from "lucide-react";
import { useState } from "react";

export function PlaylistsTab() {
  const playlists = useQuery(api.tracks.getPlaylists);
  const createPlaylist = useMutation(api.tracks.createPlaylist);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [newPlaylistDescription, setNewPlaylistDescription] = useState("");

  const handleCreatePlaylist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;

    void createPlaylist({
      name: newPlaylistName,
      description: newPlaylistDescription,
      isPublic: false,
    }).then(() => {
      setNewPlaylistName("");
      setNewPlaylistDescription("");
      setShowCreateModal(false);
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Library className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-slate-100">Your Playlists</h2>
            <p className="text-slate-300">Create and organize your music collections</p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create Playlist</span>
        </motion.button>
      </motion.div>

      {/* Empty State */}
      {playlists && playlists.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
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
              📚
            </motion.div>
            <h3 className="text-2xl font-bold text-slate-100 mb-3">No playlists yet</h3>
            <p className="text-slate-300 leading-relaxed mb-6">
              Create your first playlist to organize your favorite tracks
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateModal(true)}
              className="btn-primary flex items-center space-x-2 mx-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Create Playlist</span>
            </motion.button>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {playlists?.map((playlist, index) => (
            <motion.div
              key={playlist._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4 }}
              className="group glass rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
            >
              {/* Cover Art */}
              <div className="relative h-48 bg-gradient-to-br from-slate-700/60 to-slate-800/60 flex items-center justify-center">
                <Music className="w-16 h-16 text-slate-400" />

                {/* Play Button Overlay */}
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ opacity: 1, scale: 1 }}
                  className="absolute inset-0 bg-black/20 flex items-center justify-center group-hover:bg-black/40 transition-all duration-300"
                >
                  <div className="w-16 h-16 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
                    <Play className="w-6 h-6 text-slate-800 ml-1" />
                  </div>
                </motion.button>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-lg text-slate-100 truncate">{playlist.name}</h3>
                  <button type="button" className="text-slate-400 hover:text-slate-200 transition-colors" aria-label="More options">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>

                <p className="text-slate-300 text-sm mb-4 line-clamp-2">{playlist.description}</p>

                <div className="flex items-center justify-between text-sm text-slate-400">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Music className="w-3 h-3" />
                      <span>0 tracks</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>0m 0s</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Create Playlist Modal */}
      {showCreateModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowCreateModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-light rounded-2xl p-6 w-full max-w-md shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-slate-900 mb-4">Create New Playlist</h3>

            <form onSubmit={handleCreatePlaylist} className="space-y-4">
              <div>
                <label htmlFor="playlistName" className="block text-sm font-semibold text-slate-700 mb-2">
                  Playlist Name *
                </label>
                <input
                  id="playlistName"
                  type="text"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  className="input-field"
                  placeholder="Enter playlist name"
                  required
                />
              </div>

              <div>
                <label htmlFor="playlistDescription" className="block text-sm font-semibold text-slate-700 mb-2">
                  Description
                </label>
                <textarea
                  id="playlistDescription"
                  value={newPlaylistDescription}
                  onChange={(e) => setNewPlaylistDescription(e.target.value)}
                  className="input-field resize-none"
                  rows={3}
                  placeholder="Enter playlist description (optional)"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary"
                >
                  Create
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}