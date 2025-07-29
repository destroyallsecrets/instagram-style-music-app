import { Toaster } from "sonner";
import { MusicApp } from "./components/MusicApp";
import { AuthComponent, AutoLogin } from "./components";
import { AdminLogin } from "./components/AdminLogin";
import { Music } from "lucide-react";

export default function App() {
  // Check if we're on the admin route
  const isAdminRoute = window.location.pathname === '/admin';

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

  // Normal app layout
  return (
    <div className="min-h-screen flex flex-col">
      <AutoLogin />
      <header className="sticky top-0 z-50 glass border-b border-slate-600/40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Music className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
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
