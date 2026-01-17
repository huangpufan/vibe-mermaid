'use client';

import { useEffect, useCallback } from 'react';

interface ShortcutHandlers {
  onGenerate?: () => void;
  onDownloadSVG?: () => void;
  onDownloadPNG?: () => void;
  onCopyCode?: () => void;
  onCopyMarkdown?: () => void;
  onSwitchToPrompt?: () => void;
  onSwitchToCode?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onResetZoom?: () => void;
  onToggleFullscreen?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const modifier = isMac ? e.metaKey : e.ctrlKey;

    if (!modifier) return;

    // Ctrl/Cmd + Enter: Generate
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handlers.onGenerate?.();
      return;
    }

    // Ctrl/Cmd + S: Download SVG
    if (e.key === 's' && !e.shiftKey) {
      e.preventDefault();
      handlers.onDownloadSVG?.();
      return;
    }

    // Ctrl/Cmd + Shift + S: Download PNG
    if (e.key === 'S' && e.shiftKey) {
      e.preventDefault();
      handlers.onDownloadPNG?.();
      return;
    }

    // Ctrl/Cmd + C: Copy code (only when not in text input)
    // Note: We skip this to not interfere with normal copy

    // Ctrl/Cmd + Shift + C: Copy Markdown
    if (e.key === 'C' && e.shiftKey) {
      e.preventDefault();
      handlers.onCopyMarkdown?.();
      return;
    }

    // Ctrl/Cmd + 1: Switch to Prompt tab
    if (e.key === '1') {
      e.preventDefault();
      handlers.onSwitchToPrompt?.();
      return;
    }

    // Ctrl/Cmd + 2: Switch to Code tab
    if (e.key === '2') {
      e.preventDefault();
      handlers.onSwitchToCode?.();
      return;
    }

    // Ctrl/Cmd + =: Zoom in
    if (e.key === '=' || e.key === '+') {
      e.preventDefault();
      handlers.onZoomIn?.();
      return;
    }

    // Ctrl/Cmd + -: Zoom out
    if (e.key === '-') {
      e.preventDefault();
      handlers.onZoomOut?.();
      return;
    }

    // Ctrl/Cmd + 0: Reset zoom
    if (e.key === '0') {
      e.preventDefault();
      handlers.onResetZoom?.();
      return;
    }

    // Ctrl/Cmd + Z: Undo
    if (e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      handlers.onUndo?.();
      return;
    }

    // Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y: Redo
    if ((e.key === 'Z' && e.shiftKey) || e.key === 'y') {
      e.preventDefault();
      handlers.onRedo?.();
      return;
    }

    // F11 or Ctrl/Cmd + Shift + F: Toggle fullscreen
    if ((e.key === 'F11') || (e.key === 'F' && e.shiftKey)) {
      e.preventDefault();
      handlers.onToggleFullscreen?.();
      return;
    }
  }, [handlers]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

// Keyboard shortcuts help data
export const KEYBOARD_SHORTCUTS = [
  { keys: ['Ctrl/Cmd', 'Enter'], description: '生成图表' },
  { keys: ['Ctrl/Cmd', 'Z'], description: '撤销' },
  { keys: ['Ctrl/Cmd', 'Shift', 'Z'], description: '重做' },
  { keys: ['Ctrl/Cmd', 'Y'], description: '重做' },
  { keys: ['Ctrl/Cmd', 'S'], description: '下载 SVG' },
  { keys: ['Ctrl/Cmd', 'Shift', 'S'], description: '下载 PNG' },
  { keys: ['Ctrl/Cmd', 'Shift', 'C'], description: '复制 Markdown' },
  { keys: ['Ctrl/Cmd', '1'], description: '切换到自然语言' },
  { keys: ['Ctrl/Cmd', '2'], description: '切换到代码' },
  { keys: ['Ctrl/Cmd', '+/-'], description: '缩放' },
  { keys: ['Ctrl/Cmd', '0'], description: '重置缩放' },
];
