import { Toaster } from "sonner";
import { MusicApp } from "./components/MusicApp";
import { MobileMusicApp } from "./components/mobile/MobileMusicApp";
import { AuthComponent, AutoLogin } from "./components";
import { AdminLogin } from "./components/AdminLogin";
import { ArtistProfile } from "./components/ArtistProfile";
import { PWAInstallPrompt } from "./components/PWAInstallPrompt";
import { usePWA } from "./hooks/usePWA";
import { PerformanceMonitor } from "./components/PerformanceMonitor";
import { useDeviceDetection } from "./hooks/useDeviceDetection";
import { useUndoRedoKeyboard, useUndoRedo } from "./hooks/useUndoRedo";
import { Music, ArrowLeft } from "lucide-react";

export default function App() {
  const deviceInfo = useDeviceDetection();
  const { isOnline: _isOnline, updateAvailable: _updateAvailable, updateApp: _updateApp } = usePWA();
  const undoRedo = useUndoRedo();
  
  // Set up keyboard shortcuts for undo/redo
  useUndoRedoKeyboard(undoRedo);
  
  // Check routes
  const pathname = window.location.pathname;
  const isAdminRoute = pathname === '/admin';
  const isArtistRoute = pathname.startsWith('/artist/');
  const artistName = isArtistRoute ? pathname.split('/artist/')[1] : null;

  // If on admin route, show admin login page
  if (isAdminRoute) {
    return (
      <>
        <AdminLogin />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'rgba(30, 41, 59, 0.9)',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              color: '#e2e8f0',
              backdropFilter: 'blur(20px)',
            },
          }}
        />
      </>
    );
  }

  // If on artist route, show artist profile
  if (isArtistRoute && artistName) {
    const ArtistProfileContent = () => (
      <div className="min-h-screen flex flex-col">
        <AutoLogin />
        <header className="sticky top-0 z-50 glass border-b border-slate-600/40 shadow-sm">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
            <div className="flex justify-between items-center h-14 sm:h-16">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <button
                  type="button"
                  onClick={() => window.history.back()}
                  className="w-8 h-8 glass rounded-lg flex items-center justify-center hover:bg-slate-600/40 transition-colors mr-2"
                  aria-label="Go back"
                  title="Go back"
                >
                  <ArrowLeft className="w-4 h-4 text-slate-300" />
                </button>
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Music className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
                  SoundWave
                </h1>
              </div>
              <AuthComponent />
            </div>
          </div>
        </header>
        <main className="flex-1 px-3 sm:px-4 lg:px-8 py-4 sm:py-8 max-w-6xl mx-auto w-full">
          <ArtistProfile artistName={artistName} />
        </main>
        <PWAInstallPrompt />
        <PerformanceMonitor />
      </div>
    );

    return deviceInfo.type === 'mobile' ? (
      <>
        <ArtistProfileContent />
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: 'rgba(30, 41, 59, 0.95)',
              border: '1px solid rgba(148, 163, 184, 0.3)',
              color: '#e2e8f0',
              backdropFilter: 'blur(20px)',
              borderRadius: '12px',
              fontSize: '14px',
            },
          }}
        />
      </>
    ) : (
      <>
        <ArtistProfileContent />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'rgba(30, 41, 59, 0.9)',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              color: '#e2e8f0',
              backdropFilter: 'blur(20px)',
            },
          }}
        />
      </>
    );
  }

  // Mobile-first responsive layout
  if (deviceInfo.type === 'mobile') {
    return (
      <>
        <AutoLogin />
        <MobileMusicApp />
        <PWAInstallPrompt />
        <PerformanceMonitor />
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: 'rgba(30, 41, 59, 0.95)',
              border: '1px solid rgba(148, 163, 184, 0.3)',
              color: '#e2e8f0',
              backdropFilter: 'blur(20px)',
              borderRadius: '12px',
              fontSize: '14px',
            },
          }}
        />
      </>
    );
  }

  // Desktop/Tablet layout
  return (
    <div className="min-h-screen flex flex-col">
      <AutoLogin />
      <header className="sticky top-0 z-50 glass border-b border-slate-600/40 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Music className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
                SoundWave
              </h1>
            </div>
            <AuthComponent />
          </div>
        </div>
      </header>
      <main className="flex-1">
        <MusicApp />
      </main>
      <PWAInstallPrompt />
      <PerformanceMonitor />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(30, 41, 59, 0.9)',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            color: '#e2e8f0',
            backdropFilter: 'blur(20px)',
          },
        }}
      />
    </div>
  );
}
