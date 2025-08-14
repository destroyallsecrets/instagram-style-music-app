import { useState, useCallback, useRef, useEffect } from 'react';
import { HapticFeedback } from '../utils/haptics';
import { showMusicNotification } from '../utils/notifications';

interface UndoRedoAction {
  id: string;
  type: string;
  description: string;
  undo: () => void;
  redo: () => void;
  timestamp: number;
}

interface UseUndoRedoOptions {
  maxHistorySize?: number;
  showNotifications?: boolean;
}

export function useUndoRedo(options: UseUndoRedoOptions = {}) {
  const { maxHistorySize = 50, showNotifications = true } = options;
  
  const [history, setHistory] = useState<UndoRedoAction[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const actionIdRef = useRef(0);

  // Add a new action to the history
  const addAction = useCallback((
    type: string,
    description: string,
    undoFn: () => void,
    redoFn: () => void
  ) => {
    const action: UndoRedoAction = {
      id: `action_${++actionIdRef.current}`,
      type,
      description,
      undo: undoFn,
      redo: redoFn,
      timestamp: Date.now(),
    };

    setHistory(prev => {
      // Remove any actions after current index (when adding new action after undo)
      const newHistory = prev.slice(0, currentIndex + 1);
      newHistory.push(action);
      
      // Limit history size
      if (newHistory.length > maxHistorySize) {
        newHistory.shift();
        return newHistory;
      }
      
      return newHistory;
    });

    setCurrentIndex(prev => {
      const newIndex = Math.min(prev + 1, maxHistorySize - 1);
      return newIndex;
    });

    if (showNotifications) {
      showMusicNotification(`${description} - Tap Ctrl+Z to undo`, 'info');
    }
  }, [currentIndex, maxHistorySize, showNotifications]);

  // Undo the last action
  const undo = useCallback(() => {
    if (currentIndex >= 0 && history[currentIndex]) {
      const action = history[currentIndex];
      
      try {
        action.undo();
        setCurrentIndex(prev => prev - 1);
        
        HapticFeedback.light();
        if (showNotifications) {
          showMusicNotification(`Undid: ${action.description}`, 'success');
        }
      } catch (error) {
        console.error('Undo failed:', error);
        if (showNotifications) {
          showMusicNotification('Undo failed', 'error');
        }
      }
    }
  }, [currentIndex, history, showNotifications]);

  // Redo the next action
  const redo = useCallback(() => {
    if (currentIndex < history.length - 1 && history[currentIndex + 1]) {
      const action = history[currentIndex + 1];
      
      try {
        action.redo();
        setCurrentIndex(prev => prev + 1);
        
        HapticFeedback.light();
        if (showNotifications) {
          showMusicNotification(`Redid: ${action.description}`, 'success');
        }
      } catch (error) {
        console.error('Redo failed:', error);
        if (showNotifications) {
          showMusicNotification('Redo failed', 'error');
        }
      }
    }
  }, [currentIndex, history, showNotifications]);

  // Clear all history
  const clearHistory = useCallback(() => {
    setHistory([]);
    setCurrentIndex(-1);
    
    if (showNotifications) {
      showMusicNotification('History cleared', 'info');
    }
  }, [showNotifications]);

  // Get current state
  const canUndo = currentIndex >= 0;
  const canRedo = currentIndex < history.length - 1;
  const lastAction = currentIndex >= 0 ? history[currentIndex] : null;
  const nextAction = currentIndex < history.length - 1 ? history[currentIndex + 1] : null;

  return {
    addAction,
    undo,
    redo,
    clearHistory,
    canUndo,
    canRedo,
    lastAction,
    nextAction,
    history: history.slice(0, currentIndex + 1), // Only show actions up to current index
    historySize: currentIndex + 1,
  };
}

// Keyboard shortcuts hook for undo/redo
export function useUndoRedoKeyboard(undoRedo: ReturnType<typeof useUndoRedo>) {
  const { undo, redo, canUndo, canRedo } = undoRedo;

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Don't interfere with input fields
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return;
    }

    const isCtrlOrCmd = e.ctrlKey || e.metaKey;

    if (isCtrlOrCmd && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      if (canUndo) {
        undo();
      }
    } else if (isCtrlOrCmd && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
      e.preventDefault();
      if (canRedo) {
        redo();
      }
    }
  }, [undo, redo, canUndo, canRedo]);

  // Set up keyboard listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}