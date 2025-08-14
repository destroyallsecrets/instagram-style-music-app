import { UploadTab } from "../UploadTab";
import { motion } from "framer-motion";

export function MobileUploadTab() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Mobile-optimized header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-slate-100">Upload Music</h2>
        <p className="text-sm text-slate-400">Share your tracks with the community</p>
      </div>

      {/* Use existing upload component with mobile styling */}
      <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-3xl p-6">
        <UploadTab />
      </div>
    </motion.div>
  );
}