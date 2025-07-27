import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Upload, Music, Image, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export function UploadTab() {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverArt, setCoverArt] = useState<File | null>(null);

  const audioInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const audioFile = files.find(file => file.type.startsWith("audio/"));
    const imageFile = files.find(file => file.type.startsWith("image/"));

    if (audioFile) {
      setAudioFile(audioFile);
      if (!title) {
        setTitle(audioFile.name.replace(/\.[^/.]+$/, ""));
      }
    }
    if (imageFile) {
      setCoverArt(imageFile);
    }
  };

  const handleAudioFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleCoverArtChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverArt(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!audioFile || !title || !artist) {
      toast.error("Please fill in all required fields and select an audio file");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload process
    const simulateUpload = async () => {
      try {
        for (let i = 0; i <= 100; i += 10) {
          setUploadProgress(i);
          await new Promise(resolve => setTimeout(resolve, 200));
        }

        toast.success("Track uploaded successfully!");

        // Reset form
        setTitle("");
        setArtist("");
        setAudioFile(null);
        setCoverArt(null);
        if (audioInputRef.current) audioInputRef.current.value = "";
        if (coverInputRef.current) coverInputRef.current.value = "";

      } catch (error) {
        console.error("Upload error:", error);
        toast.error("Failed to upload track. Please try again.");
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    };

    void simulateUpload();
  };

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Upload className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-slate-100 mb-2">Upload Your Music</h2>
          <p className="text-slate-300">Add new tracks to your collection</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Drag and Drop Zone */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${isDragging
              ? "border-blue-400 bg-blue-500/10 scale-105"
              : "border-slate-600/60 hover:border-slate-500/60 hover:bg-slate-700/20"
              }`}
          >
            <div className="space-y-6">
              <motion.div
                animate={{
                  scale: isDragging ? [1, 1.1, 1] : 1,
                  rotate: isDragging ? [0, 5, -5, 0] : 0
                }}
                transition={{ duration: 0.5 }}
                className="text-6xl"
              >
                🎵
              </motion.div>
              <div>
                <p className="text-xl font-semibold text-slate-100 mb-2">
                  Drop your music files here
                </p>
                <p className="text-slate-300">
                  or click to browse for files
                </p>
              </div>
              <div className="flex gap-4 justify-center">
                <button
                  type="button"
                  onClick={() => audioInputRef.current?.click()}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Music className="w-4 h-4" />
                  <span>Select Audio</span>
                </button>
                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <Image className="w-4 h-4" />
                  <span>Select Cover Art</span>
                </button>
              </div>
            </div>
          </motion.div>

          <input
            ref={audioInputRef}
            type="file"
            accept="audio/*"
            onChange={handleAudioFileChange}
            className="hidden"
            aria-label="Select audio file"
          />
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            onChange={handleCoverArtChange}
            className="hidden"
            aria-label="Select cover art image"
          />

          {/* File Preview */}
          {(audioFile || coverArt) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="glass rounded-2xl p-6"
            >
              <h3 className="font-semibold text-slate-100 mb-4 flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                Selected Files
              </h3>
              <div className="space-y-3">
                {audioFile && (
                  <div className="flex items-center gap-3 p-3 bg-slate-800/40 rounded-xl">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <Music className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-100">{audioFile.name}</p>
                      <p className="text-sm text-slate-300">{(audioFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                )}
                {coverArt && (
                  <div className="flex items-center gap-3 p-3 bg-slate-800/40 rounded-xl">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <Image className="w-5 h-5 text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-100">{coverArt.name}</p>
                      <p className="text-sm text-slate-300">{(coverArt.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Track Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="title" className="block text-sm font-semibold text-slate-200 mb-2">
                Track Title *
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input-field"
                placeholder="Enter track title"
                required
              />
            </div>
            <div>
              <label htmlFor="artist" className="block text-sm font-semibold text-slate-200 mb-2">
                Artist Name *
              </label>
              <input
                id="artist"
                type="text"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                className="input-field"
                placeholder="Enter artist name"
                required
              />
            </div>
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-3"
            >
              <div className="flex justify-between text-sm font-medium">
                <span className="text-slate-200">Uploading...</span>
                <span className="text-blue-400">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-slate-700/60 rounded-full h-3 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                  transition={{ duration: 0.3 }}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-full rounded-full"
                />
              </div>
            </motion.div>
          )}

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isUploading || !audioFile || !title || !artist}
            className="w-full py-4 px-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {isUploading ? (
              <div className="flex items-center justify-center space-x-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
                <span>Uploading...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <Upload className="w-5 h-5" />
                <span>Upload Track</span>
              </div>
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}