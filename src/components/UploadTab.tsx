import { useState, useRef } from "react";
import { toast } from "sonner";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel"; // ✅ Correct Convex type import

export function UploadTab() {
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverArt, setCoverArt] = useState<File | null>(null);

  const audioInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

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

    if (!audioFile || !title.trim() || !artist.trim()) {
      toast.error("Please fill in all required fields and select an audio file");
      return;
    }

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
      toast.error(`Upload failed: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  };

<form onSubmit={(e) => { void handleSubmit(e); }}>
  <label htmlFor="title">Title</label>
  <input
    id="title"
    type="text"
    value={title}
    onChange={(e) => setTitle(e.target.value)}
    placeholder="Track title"
    title="Enter the name of the track"
  />

  <label htmlFor="artist">Artist</label>
  <input
    id="artist"
    type="text"
    value={artist}
    onChange={(e) => setArtist(e.target.value)}
    placeholder="Artist name"
    title="Enter the name of the artist"
  />

  <label htmlFor="audio-upload">Audio File</label>
  <input
    id="audio-upload"
    type="file"
    accept="audio/*"
    ref={audioInputRef}
    onChange={handleAudioFileChange}
    title="Choose an audio file to upload"
  />

  <label htmlFor="cover-upload">Cover Art</label>
  <input
    id="cover-upload"
    type="file"
    accept="image/*"
    ref={coverInputRef}
    onChange={handleCoverArtChange}
    title="Choose an image for the cover art"
  />

  <button type="submit">Upload Track</button>
</form>
}
