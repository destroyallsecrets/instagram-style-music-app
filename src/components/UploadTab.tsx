import { useState, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
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
  
  const generateUploadUrl = useMutation(api.tracks.generateUploadUrl);
  const createTrack = useMutation(api.tracks.createTrack);

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

  const getAudioDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const audio = new Audio();
      audio.addEventListener("loadedmetadata", () => {
        resolve(audio.duration);
      });
      audio.src = URL.createObjectURL(file);
    });
  };

  const uploadFile = async (file: File): Promise<Id<"_storage">> => {
    const uploadUrl = await generateUploadUrl();
    
    const response = await fetch(uploadUrl, {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file,
    });
    
    if (!response.ok) {
      throw new Error("Upload failed");
    }
    
    const result = await response.json();
    return result.storageId;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!audioFile || !title || !artist) {
      toast.error("Please fill in all required fields and select an audio file");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Upload audio file
      setUploadProgress(25);
      const audioFileId = await uploadFile(audioFile);
      
      // Upload cover art if provided
      setUploadProgress(50);
      let coverArtId: Id<"_storage"> | undefined;
      if (coverArt) {
        coverArtId = await uploadFile(coverArt);
      }
      
      // Get audio duration
      setUploadProgress(75);
      const duration = await getAudioDuration(audioFile);
      
      // Create track record
      setUploadProgress(90);
      await createTrack({
        title,
        artist,
        duration,
        audioFileId,
        coverArtId,
      });
      
      setUploadProgress(100);
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

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-8">Upload Your Music</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Drag and Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging
              ? "border-primary bg-primary/5"
              : "border-gray-300 hover:border-gray-400"
          }`}
        >
          <div className="space-y-4">
            <div className="text-4xl">🎵</div>
            <div>
              <p className="text-lg font-medium text-gray-900">
                Drop your music files here
              </p>
              <p className="text-sm text-gray-500">
                or click to browse for audio files and cover art
              </p>
            </div>
            <div className="flex gap-4 justify-center">
              <button
                type="button"
                onClick={() => audioInputRef.current?.click()}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover transition-colors"
              >
                Select Audio
              </button>
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Select Cover Art
              </button>
            </div>
          </div>
        </div>

        <input
          ref={audioInputRef}
          type="file"
          accept="audio/*"
          onChange={handleAudioFileChange}
          className="hidden"
        />
        <input
          ref={coverInputRef}
          type="file"
          accept="image/*"
          onChange={handleCoverArtChange}
          className="hidden"
        />

        {/* File Preview */}
        {(audioFile || coverArt) && (
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <h3 className="font-medium text-gray-900">Selected Files:</h3>
            {audioFile && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center">
                  🎵
                </div>
                <span className="text-sm text-gray-700">{audioFile.name}</span>
              </div>
            )}
            {coverArt && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center">
                  🖼️
                </div>
                <span className="text-sm text-gray-700">{coverArt.name}</span>
              </div>
            )}
          </div>
        )}

        {/* Track Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Track Title *
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Enter track title"
              required
            />
          </div>
          <div>
            <label htmlFor="artist" className="block text-sm font-medium text-gray-700 mb-2">
              Artist Name *
            </label>
            <input
              id="artist"
              type="text"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Enter artist name"
              required
            />
          </div>
        </div>

        {/* Upload Progress */}
        {isUploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isUploading || !audioFile || !title || !artist}
          className="w-full py-3 px-4 bg-primary text-white font-medium rounded-md hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          {isUploading ? "Uploading..." : "Upload Track"}
        </button>
      </form>
    </div>
  );
}
