import { useState } from "react";
import { UploadTab } from "./UploadTab";
import { StreamTab } from "./StreamTab";
import { MyMusicTab } from "./MyMusicTab";
import { AudioProvider } from "./AudioProvider";

type Tab = "upload" | "stream" | "my-music";

export function MusicApp() {
  const [activeTab, setActiveTab] = useState<Tab>("stream");

  return (
    <AudioProvider>
      <div className="max-w-4xl mx-auto p-4">
        {/* Tab Navigation */}
        <nav className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-8" role="tablist">
          <button
            role="tab"
            aria-selected={activeTab === "stream"}
            onClick={() => setActiveTab("stream")}
            className={`flex-1 py-3 px-4 text-sm font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
              activeTab === "stream"
                ? "bg-white text-primary shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            Stream
          </button>
          <button
            role="tab"
            aria-selected={activeTab === "upload"}
            onClick={() => setActiveTab("upload")}
            className={`flex-1 py-3 px-4 text-sm font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
              activeTab === "upload"
                ? "bg-white text-primary shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            Upload
          </button>
          <button
            role="tab"
            aria-selected={activeTab === "my-music"}
            onClick={() => setActiveTab("my-music")}
            className={`flex-1 py-3 px-4 text-sm font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
              activeTab === "my-music"
                ? "bg-white text-primary shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            My Music
          </button>
        </nav>

        {/* Tab Content */}
        <div role="tabpanel">
          {activeTab === "stream" && <StreamTab />}
          {activeTab === "upload" && <UploadTab />}
          {activeTab === "my-music" && <MyMusicTab />}
        </div>
      </div>
    </AudioProvider>
  );
}
