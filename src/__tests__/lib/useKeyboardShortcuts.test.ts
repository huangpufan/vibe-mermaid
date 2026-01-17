import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useKeyboardShortcuts, KEYBOARD_SHORTCUTS } from '@/lib/useKeyboardShortcuts';

describe('useKeyboardShortcuts Hook', () => {
  const mockHandlers = {
    onGenerate: vi.fn(),
    onDownloadSVG: vi.fn(),
    onDownloadPNG: vi.fn(),
    onCopyCode: vi.fn(),
    onCopyMarkdown: vi.fn(),
    onSwitchToPrompt: vi.fn(),
    onSwitchToCode: vi.fn(),
    onZoomIn: vi.fn(),
    onZoomOut: vi.fn(),
    onResetZoom: vi.fn(),
    onToggleFullscreen: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock navigator.platform for Mac detection
    Object.defineProperty(navigator, 'platform', {
      value: 'Win32',
      writable: true,
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  const dispatchKeyEvent = (key: string, options: Partial<KeyboardEventInit> = {}) => {
    const event = new KeyboardEvent('keydown', {
      key,
      bubbles: true,
      cancelable: true,
      ...options,
    });
    window.dispatchEvent(event);
  };

  describe('Ctrl + Enter: 生成', () => {
    it('应该触发 onGenerate', () => {
      renderHook(() => useKeyboardShortcuts(mockHandlers));

      dispatchKeyEvent('Enter', { ctrlKey: true });

      expect(mockHandlers.onGenerate).toHaveBeenCalledTimes(1);
    });

    it('Shift + Ctrl + Enter 不应该触发 onGenerate', () => {
      renderHook(() => useKeyboardShortcuts(mockHandlers));

      dispatchKeyEvent('Enter', { ctrlKey: true, shiftKey: true });

      expect(mockHandlers.onGenerate).not.toHaveBeenCalled();
    });
  });

  describe('Ctrl + S: 下载 SVG', () => {
    it('应该触发 onDownloadSVG', () => {
      renderHook(() => useKeyboardShortcuts(mockHandlers));

      dispatchKeyEvent('s', { ctrlKey: true });

      expect(mockHandlers.onDownloadSVG).toHaveBeenCalledTimes(1);
    });
  });

  describe('Ctrl + Shift + S: 下载 PNG', () => {
    it('应该触发 onDownloadPNG', () => {
      renderHook(() => useKeyboardShortcuts(mockHandlers));

      dispatchKeyEvent('S', { ctrlKey: true, shiftKey: true });

      expect(mockHandlers.onDownloadPNG).toHaveBeenCalledTimes(1);
    });
  });

  describe('Ctrl + Shift + C: 复制 Markdown', () => {
    it('应该触发 onCopyMarkdown', () => {
      renderHook(() => useKeyboardShortcuts(mockHandlers));

      dispatchKeyEvent('C', { ctrlKey: true, shiftKey: true });

      expect(mockHandlers.onCopyMarkdown).toHaveBeenCalledTimes(1);
    });
  });

  describe('Ctrl + 1: 切换到 Prompt 标签', () => {
    it('应该触发 onSwitchToPrompt', () => {
      renderHook(() => useKeyboardShortcuts(mockHandlers));

      dispatchKeyEvent('1', { ctrlKey: true });

      expect(mockHandlers.onSwitchToPrompt).toHaveBeenCalledTimes(1);
    });
  });

  describe('Ctrl + 2: 切换到 Code 标签', () => {
    it('应该触发 onSwitchToCode', () => {
      renderHook(() => useKeyboardShortcuts(mockHandlers));

      dispatchKeyEvent('2', { ctrlKey: true });

      expect(mockHandlers.onSwitchToCode).toHaveBeenCalledTimes(1);
    });
  });

  describe('Ctrl + =: 放大', () => {
    it('应该触发 onZoomIn (使用 =)', () => {
      renderHook(() => useKeyboardShortcuts(mockHandlers));

      dispatchKeyEvent('=', { ctrlKey: true });

      expect(mockHandlers.onZoomIn).toHaveBeenCalledTimes(1);
    });

    it('应该触发 onZoomIn (使用 +)', () => {
      renderHook(() => useKeyboardShortcuts(mockHandlers));

      dispatchKeyEvent('+', { ctrlKey: true });

      expect(mockHandlers.onZoomIn).toHaveBeenCalledTimes(1);
    });
  });

  describe('Ctrl + -: 缩小', () => {
    it('应该触发 onZoomOut', () => {
      renderHook(() => useKeyboardShortcuts(mockHandlers));

      dispatchKeyEvent('-', { ctrlKey: true });

      expect(mockHandlers.onZoomOut).toHaveBeenCalledTimes(1);
    });
  });

  describe('Ctrl + 0: 重置缩放', () => {
    it('应该触发 onResetZoom', () => {
      renderHook(() => useKeyboardShortcuts(mockHandlers));

      dispatchKeyEvent('0', { ctrlKey: true });

      expect(mockHandlers.onResetZoom).toHaveBeenCalledTimes(1);
    });
  });

  describe('F11 / Ctrl + Shift + F: 全屏', () => {
    it('F11 应该触发 onToggleFullscreen', () => {
      renderHook(() => useKeyboardShortcuts(mockHandlers));

      dispatchKeyEvent('F11', { ctrlKey: true });

      expect(mockHandlers.onToggleFullscreen).toHaveBeenCalledTimes(1);
    });

    it('Ctrl + Shift + F 应该触发 onToggleFullscreen', () => {
      renderHook(() => useKeyboardShortcuts(mockHandlers));

      dispatchKeyEvent('F', { ctrlKey: true, shiftKey: true });

      expect(mockHandlers.onToggleFullscreen).toHaveBeenCalledTimes(1);
    });
  });

  describe('无修饰键', () => {
    it('没有 Ctrl/Cmd 键时不应该触发任何处理器', () => {
      renderHook(() => useKeyboardShortcuts(mockHandlers));

      dispatchKeyEvent('Enter');
      dispatchKeyEvent('s');
      dispatchKeyEvent('1');

      expect(mockHandlers.onGenerate).not.toHaveBeenCalled();
      expect(mockHandlers.onDownloadSVG).not.toHaveBeenCalled();
      expect(mockHandlers.onSwitchToPrompt).not.toHaveBeenCalled();
    });
  });

  describe('Mac 平台', () => {
    beforeEach(() => {
      Object.defineProperty(navigator, 'platform', {
        value: 'MacIntel',
        writable: true,
      });
    });

    it('Cmd + Enter 应该触发 onGenerate', () => {
      renderHook(() => useKeyboardShortcuts(mockHandlers));

      dispatchKeyEvent('Enter', { metaKey: true });

      expect(mockHandlers.onGenerate).toHaveBeenCalledTimes(1);
    });

    it('Cmd + S 应该触发 onDownloadSVG', () => {
      renderHook(() => useKeyboardShortcuts(mockHandlers));

      dispatchKeyEvent('s', { metaKey: true });

      expect(mockHandlers.onDownloadSVG).toHaveBeenCalledTimes(1);
    });
  });

  describe('可选处理器', () => {
    it('未提供的处理器不应该导致错误', () => {
      const partialHandlers = {
        onGenerate: vi.fn(),
      };

      renderHook(() => useKeyboardShortcuts(partialHandlers));

      // 这些不应该抛出错误
      expect(() => {
        dispatchKeyEvent('s', { ctrlKey: true });
        dispatchKeyEvent('1', { ctrlKey: true });
      }).not.toThrow();
    });
  });

  describe('事件清理', () => {
    it('卸载时应该移除事件监听器', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

      const { unmount } = renderHook(() => useKeyboardShortcuts(mockHandlers));
      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    });
  });
});

describe('KEYBOARD_SHORTCUTS 常量', () => {
  it('应该包含所有快捷键定义', () => {
    expect(KEYBOARD_SHORTCUTS).toBeInstanceOf(Array);
    expect(KEYBOARD_SHORTCUTS.length).toBeGreaterThan(0);
  });

  it('每个快捷键应该有 keys 和 description', () => {
    KEYBOARD_SHORTCUTS.forEach((shortcut) => {
      expect(shortcut).toHaveProperty('keys');
      expect(shortcut).toHaveProperty('description');
      expect(Array.isArray(shortcut.keys)).toBe(true);
      expect(typeof shortcut.description).toBe('string');
    });
  });

  it('应该包含生成图表快捷键', () => {
    const generateShortcut = KEYBOARD_SHORTCUTS.find((s) =>
      s.keys.includes('Enter')
    );
    expect(generateShortcut).toBeDefined();
  });

  it('应该包含下载快捷键', () => {
    const downloadShortcut = KEYBOARD_SHORTCUTS.find((s) =>
      s.keys.includes('S') || s.description.includes('下载')
    );
    expect(downloadShortcut).toBeDefined();
  });

  it('应该包含缩放快捷键', () => {
    const zoomShortcut = KEYBOARD_SHORTCUTS.find((s) =>
      s.description.includes('缩放')
    );
    expect(zoomShortcut).toBeDefined();
  });
});
