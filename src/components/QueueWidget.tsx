import { motion, AnimatePresence } from "framer-motion";
import { Music, X, GripVertical } from "lucide-react";
import { useState } from "react";

interface QueueWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  queue: any[];
  currentIndex: number;
  onReorder: (newQueue: any[]) => void;
  onSelectTrack: (index: number) => void;
}

export function QueueWidget({ isOpen, onClose, queue, currentIndex, onReorder: _onReorder, onSelectTrack }: QueueWidgetProps) {
  const [_draggedItem, _setDraggedItem] = useState<number | null>(null);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed right-4 top-20 bottom-20 w-80 z-40"
        >
          <div className="glass rounded-2xl h-full flex flex-col backdrop-blur-xl bg-slate-900/90">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-600/40">
              <h3 className="text-lg font-semibold text-white">Up Next</h3>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-800/60 flex items-center justify-center text-slate-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Queue List */}
            <div className="flex-1 overflow-y-auto p-2">
              {queue.map((track, index) => (
                <motion.div
                  key={`${track._id}-${index}`}
                  layout
                  className={`flex items-center gap-3 p-3 rounded-xl mb-2 cursor-pointer transition-all ${
                    index === currentIndex 
                      ? 'bg-blue-500/20 border border-blue-500/30' 
                      : 'hover:bg-slate-800/40'
                  }`}
                  onClick={() => onSelectTrack(index)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="cursor-grab active:cursor-grabbing">
                    <GripVertical className="w-4 h-4 text-slate-400" />
                  </div>
                  
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-700/60 flex-shrink-0">
                    {track.coverArtUrl ? (
                      <img src={track.coverArtUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Music className="w-4 h-4 text-slate-400" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium truncate text-sm ${
                      index === currentIndex ? 'text-blue-300' : 'text-white'
                    }`}>
                      {track.title}
                    </p>
                    <p className="text-slate-400 truncate text-xs">{track.artist}</p>
                  </div>
                  
                  {index === currentIndex && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}