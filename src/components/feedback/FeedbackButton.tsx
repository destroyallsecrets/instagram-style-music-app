import { motion } from "framer-motion";
import { useState } from "react";

export type FeedbackType = "love" | "like" | "meh" | "dislike";

interface FeedbackButtonProps {
  type: FeedbackType;
  isActive: boolean;
  count: number;
  onFeedback: (type: FeedbackType) => void;
  disabled?: boolean;
  size?: "compact" | "default" | "large";
}

const FEEDBACK_CONFIG = {
  love: {
    emoji: "❤️",
    color: "text-red-500",
    activeColor: "bg-red-500/20 border-red-500/50",
    hoverColor: "hover:bg-red-500/10",
    label: "Love this track",
  },
  like: {
    emoji: "👍",
    color: "text-blue-500",
    activeColor: "bg-blue-500/20 border-blue-500/50",
    hoverColor: "hover:bg-blue-500/10",
    label: "Like this track",
  },
  meh: {
    emoji: "😐",
    color: "text-yellow-500",
    activeColor: "bg-yellow-500/20 border-yellow-500/50",
    hoverColor: "hover:bg-yellow-500/10",
    label: "It's okay",
  },
  dislike: {
    emoji: "👎",
    color: "text-gray-500",
    activeColor: "bg-gray-500/20 border-gray-500/50",
    hoverColor: "hover:bg-gray-500/10",
    label: "Not for me",
  },
};

const SIZE_CONFIG = {
  compact: {
    button: "w-8 h-8 text-sm",
    emoji: "text-sm",
    count: "text-xs",
  },
  default: {
    button: "w-12 h-12 text-base",
    emoji: "text-lg",
    count: "text-sm",
  },
  large: {
    button: "w-16 h-16 text-lg",
    emoji: "text-2xl",
    count: "text-base",
  },
};

export function FeedbackButton({
  type,
  isActive,
  count,
  onFeedback,
  disabled = false,
  size = "default",
}: FeedbackButtonProps) {
  const [isPressed, setIsPressed] = useState(false);
  const config = FEEDBACK_CONFIG[type];
  const sizeConfig = SIZE_CONFIG[size];

  const handleClick = () => {
    if (disabled) return;
    
    // Haptic feedback for mobile devices
    if ("vibrate" in navigator) {
      navigator.vibrate(50);
    }
    
    onFeedback(type);
  };

  const handleTouchStart = () => {
    setIsPressed(true);
  };

  const handleTouchEnd = () => {
    setIsPressed(false);
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <motion.button
        type="button"
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        disabled={disabled}
        className={`
          ${sizeConfig.button}
          rounded-full border-2 border-transparent
          flex items-center justify-center
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:ring-offset-2 focus:ring-offset-transparent
          disabled:opacity-50 disabled:cursor-not-allowed
          ${isActive ? config.activeColor : "border-slate-600/40 bg-slate-800/40"}
          ${!disabled && !isActive ? config.hoverColor : ""}
          ${isPressed ? "scale-95" : ""}
        `}
        whileHover={!disabled ? { scale: 1.05 } : {}}
        whileTap={!disabled ? { scale: 0.95 } : {}}
        animate={{
          scale: isActive ? [1, 1.1, 1] : 1,
          boxShadow: isActive 
            ? "0 0 20px rgba(59, 130, 246, 0.3)" 
            : "0 0 0px rgba(59, 130, 246, 0)",
        }}
        transition={{
          scale: { duration: 0.3, ease: "easeOut" },
          boxShadow: { duration: 0.3 },
        }}
        aria-label={config.label}
        aria-pressed={isActive}
      >
        <motion.span
          className={`${sizeConfig.emoji} ${isActive ? config.color : "text-slate-400"}`}
          animate={{
            rotate: isActive ? [0, 10, -10, 0] : 0,
          }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          {config.emoji}
        </motion.span>
      </motion.button>
      
      {count > 0 && (
        <motion.span
          className={`${sizeConfig.count} font-medium ${
            isActive ? config.color : "text-slate-400"
          }`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          {count > 999 ? `${Math.floor(count / 1000)}k` : count}
        </motion.span>
      )}
    </div>
  );
}