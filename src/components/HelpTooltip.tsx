import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, X } from "lucide-react";
import { useState } from "react";

interface HelpTooltipProps {
  title: string;
  content: string;
  shortcuts?: string[];
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export function HelpTooltip({ title, content, shortcuts, position = 'top' }: HelpTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getPositionClasses = () => {
    switch (position) {
      case 'bottom':
        return 'top-full left-1/2 transform -translate-x-1/2 mt-2';
      case 'left':
        return 'right-full top-1/2 transform -translate-y-1/2 mr-2';
      case 'right':
        return 'left-full top-1/2 transform -translate-y-1/2 ml-2';
      default:
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
    }
  };

  return (
    <div className="relative inline-block">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-5 h-5 rounded-full bg-slate-700/60 flex items-center justify-center text-slate-400 hover:text-blue-400 transition-colors"
      >
        <HelpCircle className="w-3 h-3" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className={`absolute z-50 w-64 ${getPositionClasses()}`}
          >
            <div className="glass rounded-xl p-4 backdrop-blur-xl bg-slate-900/95 border border-slate-600/40 shadow-xl">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-white text-sm">{title}</h4>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="text-slate-400 hover:text-white transition-colors"
                  aria-label="Close help tooltip"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
              
              <p className="text-slate-300 text-xs mb-3 leading-relaxed">{content}</p>
              
              {shortcuts && shortcuts.length > 0 && (
                <div className="space-y-1">
                  <p className="text-slate-400 text-xs font-medium">Shortcuts:</p>
                  {shortcuts.map((shortcut, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <code className="px-2 py-1 bg-slate-800/60 rounded text-xs text-blue-300 font-mono">
                        {shortcut.split(':')[0]}
                      </code>
                      <span className="text-slate-400 text-xs">{shortcut.split(':')[1]}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}