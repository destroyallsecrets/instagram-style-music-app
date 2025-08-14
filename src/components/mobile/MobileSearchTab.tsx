import { SearchTab } from "../SearchTab";
import { motion } from "framer-motion";

export function MobileSearchTab() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Mobile-optimized header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-slate-100">Search Music</h2>
        <p className="text-sm text-slate-400">Find your favorite tracks and artists</p>
      </div>

      {/* Use existing search component with mobile styling */}
      <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-3xl p-6">
        <SearchTab />
      </div>
    </motion.div>
  );
}