import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef, ReactNode } from "react";
// Icons are passed as props from parent components
import { HapticFeedback } from "../utils/haptics";

interface ContextMenuItem {
  id: string;
  label: string;
  icon: ReactNode;
  action: () => void;
  destructive?: boolean;
  disabled?: boolean;
}

interface ContextMenuProps {
  children: ReactNode;
  items: ContextMenuItem[];
  disabled?: boolean;
}

export function ContextMenu({ children, items, disabled = false }: ContextMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  // Handle right-click
  const handleContextMenu = (e: React.MouseEvent) => {
    if (disabled) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    HapticFeedback.medium();
    
    const rect = triggerRef.current?.getBoundingClientRect();
    if (rect) {
      setPosition({
        x: e.clientX,
        y: e.clientY
      });
      setIsOpen(true);
    }
  };

  // Handle long press start
  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled) return;
    
    const timer = setTimeout(() => {
      HapticFeedback.medium();
      
      const touch = e.touches[0];
      setPosition({
        x: touch.clientX,
        y: touch.clientY
      });
      setIsOpen(true);
    }, 500); // 500ms long press
    
    setLongPressTimer(timer);
  };

  // Handle long press end
  const handleTouchEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  // Handle menu item click
  const handleItemClick = (item: ContextMenuItem) => {
    if (item.disabled) return;
    
    HapticFeedback.light();
    item.action();
    setIsOpen(false);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  // Adjust menu position to stay within viewport
  const getMenuStyle = () => {
    if (!isOpen) return {};
    
    const menuWidth = 200;
    const menuHeight = items.length * 48 + 16; // Approximate height
    
    let x = position.x;
    let y = position.y;
    
    // Adjust horizontal position
    if (x + menuWidth > window.innerWidth) {
      x = window.innerWidth - menuWidth - 10;
    }
    
    // Adjust vertical position
    if (y + menuHeight > window.innerHeight) {
      y = window.innerHeight - menuHeight - 10;
    }
    
    return {
      left: `${x}px`,
      top: `${y}px`,
    };
  };

  return (
    <>
      <div
        ref={triggerRef}
        onContextMenu={handleContextMenu}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        className="cursor-pointer"
      >
        {children}
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-50" />
            
            {/* Menu */}
            <motion.div
              ref={menuRef}
              initial={{ opacity: 0, scale: 0.9, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              transition={{ type: "spring", damping: 25, stiffness: 400 }}
              className="fixed z-50 min-w-[200px] glass rounded-xl backdrop-blur-xl bg-slate-900/95 border border-slate-600/40 shadow-2xl py-2"
              style={getMenuStyle()}
            >
              {items.map((item, index) => (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleItemClick(item)}
                  disabled={item.disabled}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                    item.disabled
                      ? 'text-slate-500 cursor-not-allowed'
                      : item.destructive
                      ? 'text-red-300 hover:text-red-200 hover:bg-red-500/10'
                      : 'text-slate-200 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <span className="w-4 h-4 flex-shrink-0">
                    {item.icon}
                  </span>
                  <span className="text-sm font-medium">{item.label}</span>
                </motion.button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

