import { motion } from "framer-motion";
import { Waves, Settings, Bell } from "lucide-react";
import { AuthComponent } from "../AuthComponent";

interface MobileHeaderProps {
  isScrolled: boolean;
}

export function MobileHeader({ isScrolled }: MobileHeaderProps) {
  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-slate-900/95 backdrop-blur-xl border-b border-slate-700/50 shadow-lg' 
          : 'bg-transparent'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <motion.div 
            className="flex items-center space-x-3"
            whileTap={{ scale: 0.95 }}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Waves className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
                SoundWave
              </h1>
              <p className="text-xs text-slate-400 -mt-0.5">Your Music Universe</p>
            </div>
          </motion.div>

          {/* Right Actions */}
          <div className="flex items-center space-x-2">
            {/* Notifications */}
            <motion.button
              type="button"
              whileTap={{ scale: 0.9 }}
              className="w-10 h-10 rounded-xl bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 flex items-center justify-center"
            >
              <Bell className="w-5 h-5 text-slate-300" />
            </motion.button>

            {/* Settings */}
            <motion.button
              type="button"
              whileTap={{ scale: 0.9 }}
              className="w-10 h-10 rounded-xl bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 flex items-center justify-center"
            >
              <Settings className="w-5 h-5 text-slate-300" />
            </motion.button>

            {/* Auth Component */}
            <div className="ml-2">
              <AuthComponent />
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
}