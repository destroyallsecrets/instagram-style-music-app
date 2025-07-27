import { Toaster } from "sonner";
import { MusicApp } from "./components/MusicApp";
import { Music } from "lucide-react";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-slate-200/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Music className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                SoundWave
              </h1>
            </div>
            <div className="text-sm text-slate-500 font-medium">
              Discover & Share Music
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <MusicApp />
      </main>
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: 'white',
            border: '1px solid #e2e8f0',
            color: '#1e293b',
          },
        }}
      />
    </div>
  );
}
