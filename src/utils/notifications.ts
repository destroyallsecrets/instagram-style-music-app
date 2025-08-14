import { toast } from "sonner";

export const showMusicNotification = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
  const options = {
    duration: 2000,
    style: {
      background: 'rgba(30, 41, 59, 0.95)',
      border: '1px solid rgba(148, 163, 184, 0.3)',
      color: '#e2e8f0',
      backdropFilter: 'blur(20px)',
      borderRadius: '12px',
    }
  };

  switch (type) {
    case 'success':
      toast.success(message, options);
      break;
    case 'error':
      toast.error(message, options);
      break;
    default:
      toast.info(message, options);
  }
};

export const showKeyboardShortcutHint = () => {
  toast.info("💡 Tip: Use Space/K to play/pause, ↑↓ for volume, M to minimize", {
    duration: 4000,
    style: {
      background: 'rgba(59, 130, 246, 0.1)',
      border: '1px solid rgba(59, 130, 246, 0.3)',
      color: '#93c5fd',
      backdropFilter: 'blur(20px)',
      borderRadius: '12px',
    }
  });
};