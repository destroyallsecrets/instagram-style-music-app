import { useState, useRef } from "react";
import { toast } from "sonner";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Upload, Shield, Lock } from "lucide-react";
import { isAdminUser } from "../utils/auth";

export function UploadTab() {
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverArt, setCoverArt] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const audioInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const user = useQuery(api.auth.loggedInUser);
  const generateUploadUrl = useMutation(api.tracks.generateUploadUrl);
  const createTrack = useMutation(api.tracks.createTrack);

  const validAudioTypes = ["audio/mpeg", "audio/mp3", "audio/wav"];
  const validImageTypes = ["image/jpeg", "image/png", "image/webp"];

  const handleAudioFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validAudioTypes.includes(file.type)) {
      setAudioFile(file);
      if (!title) setTitle(file.name.replace(/\.[^/.]+$/, ""));
    } else {
      toast.error("Unsupported audio format");
    }
  };

  const handleCoverArtChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validImageTypes.includes(file.type)) {
      setCoverArt(file);
    } else {
      toast.error("Unsupported image format");
    }
  };

  const uploadFile = async (file: File): Promise<Id<"_storage">> => {
    const uploadUrl = await generateUploadUrl();
    if (!uploadUrl || typeof uploadUrl !== "string") {
      throw new Error("Invalid upload URL");
    }

    const response = await fetch(uploadUrl, {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const { storageId } = await response.json();
    return storageId as Id<"_storage">;
  };

  const getAudioDuration = (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      const audio = document.createElement("audio");
      const url = URL.createObjectURL(file);
      audio.addEventListener("loadedmetadata", () => {
        audio.pause();
        audio.src = "";
        URL.revokeObjectURL(url);
        resolve(audio.duration);
      });
      audio.addEventListener("error", () => {
        URL.revokeObjectURL(url);
        reject(new Error("Failed to load audio metadata"));
      });
      audio.src = url;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please sign in to upload tracks");
      return;
    }

    if (!audioFile || !title.trim() || !artist.trim()) {
      toast.error("Please fill in all required fields and select an audio file");
      return;
    }

    setIsUploading(true);
    try {
      toast.info("Uploading audio file...");
      const audioFileId = await uploadFile(audioFile);

      toast.info("Getting audio duration...");
      const duration = await getAudioDuration(audioFile);

      let coverArtId: Id<"_storage"> | undefined;
      if (coverArt) {
        toast.info("Uploading cover art...");
        coverArtId = await uploadFile(coverArt);
      }

      toast.info("Creating track...");
      await createTrack({ title, artist, duration, audioFileId, coverArtId });

      toast.success("Track uploaded successfully 🎉");

      // Reset form
      setTitle("");
      setArtist("");
      setAudioFile(null);
      setCoverArt(null);
      if (audioInputRef.current) audioInputRef.current.value = "";
      if (coverInputRef.current) coverInputRef.current.value = "";
    } catch (err) {
      console.error("Upload error:", err);
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      if (errorMessage.includes("Not authenticated")) {
        toast.error("Please sign in to upload tracks");
      } else {
        toast.error(`Upload failed: ${errorMessage}`);
      }
    } finally {
      setIsUploading(false);
    }
  };

  // Show loading state while user is being auto-signed in
  if (!user) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="glass rounded-2xl p-8 shadow-lg text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Upload className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Loading...</h2>
          <p className="text-slate-300">
            Setting up your session...
          </p>
        </div>
      </div>
    );
  }

  // Check if user is admin
  const isAdmin = isAdminUser(user.email);
  
  // Show admin-only message if not admin
  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="glass rounded-2xl p-8 shadow-lg text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Admin Access Required</h2>
          <p className="text-slate-300 mb-6">
            Upload functionality is restricted to administrators only.
          </p>
          <p className="text-sm text-slate-400">
            Contact an administrator if you need access to upload music.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="glass rounded-2xl p-8 shadow-lg">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">Admin Upload Panel</h2>
        </div>

        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
          <p className="text-sm text-green-300">
            <span className="font-medium">Admin Access:</span> {user.email}
          </p>
          <p className="text-xs text-green-400 mt-1">
            You have administrator privileges to upload music
          </p>
        </div>

        <form onSubmit={(e) => { void handleSubmit(e); }} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-slate-300 mb-2">
              Title *
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Track title"
              title="Enter the name of the track"
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label htmlFor="artist" className="block text-sm font-medium text-slate-300 mb-2">
              Artist *
            </label>
            <input
              id="artist"
              type="text"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              placeholder="Artist name"
              title="Enter the name of the artist"
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label htmlFor="audio-upload" className="block text-sm font-medium text-slate-300 mb-2">
              Audio File *
            </label>
            <input
              id="audio-upload"
              type="file"
              accept="audio/*"
              ref={audioInputRef}
              onChange={handleAudioFileChange}
              title="Choose an audio file to upload"
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-500 file:text-white hover:file:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              required
            />
            {audioFile && (
              <p className="mt-2 text-sm text-green-400">
                Selected: {audioFile.name}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="cover-upload" className="block text-sm font-medium text-slate-300 mb-2">
              Cover Art (Optional)
            </label>
            <input
              id="cover-upload"
              type="file"
              accept="image/*"
              ref={coverInputRef}
              onChange={handleCoverArtChange}
              title="Choose an image for the cover art"
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-purple-500 file:text-white hover:file:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            />
            {coverArt && (
              <p className="mt-2 text-sm text-green-400">
                Selected: {coverArt.name}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3 px-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!audioFile || !title.trim() || !artist.trim() || isUploading}
          >
            {isUploading ? "Uploading..." : "Upload Track"}
          </button>
        </form>
      </div>
    </div>
  );
}
