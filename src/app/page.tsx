'use client';

import dynamic from 'next/dynamic';
import { useState, useCallback, useEffect, useRef, useSyncExternalStore } from 'react';
import Header from '@/components/Header';
import Settings from '@/components/Settings';
import Onboarding from '@/components/Onboarding';
import KeyboardShortcutsHelp from '@/components/KeyboardShortcutsHelp';
import { useKeyboardShortcuts } from '@/lib/useKeyboardShortcuts';
import { useAppStore } from '@/lib/store';
import { translations, type Locale } from '@/lib/i18n';

// Helper function to get locale from localStorage (runs on client only)
function getStoredLocale(): Locale {
  if (typeof window === 'undefined') return 'zh';
  try {
    const stored = localStorage.getItem('mermaid-editor-storage');
    if (stored) {
      const { state } = JSON.parse(stored);
      return (state?.locale || 'zh') as Locale;
    }
  } catch {
    // ignore
  }
  return 'zh';
}

// Loading components that read locale from localStorage
function EditorLoading() {
  const locale = getStoredLocale();
  const text = translations[locale].page.loadingEditor;
  return (
    <div className="h-full flex items-center justify-center bg-white dark:bg-gray-950">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-gray-500 dark:text-gray-400">{text}</span>
      </div>
    </div>
  );
}

function PreviewLoading() {
  const locale = getStoredLocale();
  const text = translations[locale].page.loadingPreview;
  return (
    <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-gray-500 dark:text-gray-400">{text}</span>
      </div>
    </div>
  );
}

const Editor = dynamic(() => import('@/components/Editor'), {
  ssr: false,
  loading: () => <EditorLoading />,
});

const Preview = dynamic(() => import('@/components/Preview'), {
  ssr: false,
  loading: () => <PreviewLoading />,
});

// Custom hook for hydration state (avoids setState in useEffect)
const emptySubscribe = () => () => {};
function useIsHydrated() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

export default function Home() {
  const [leftWidth, setLeftWidth] = useState(() => {
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      if (width < 768) return 100; // Mobile: full screen editor
      if (width < 1024) return 60;  // Tablet: prioritize editor
      return 50; // Desktop: split evenly
    }
    return 50;
  });
  const [isDragging, setIsDragging] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const isHydrated = useIsHydrated();
  const containerRef = useRef<HTMLElement>(null);

  const {
    hasCompletedOnboarding,
    setActiveTab,
    doTriggerGenerate,
    doTriggerDownloadSVG,
    doTriggerDownloadPNG,
    doTriggerCopyMarkdown,
    doTriggerZoomIn,
    doTriggerZoomOut,
    doTriggerResetZoom,
    doTriggerUndo,
    doTriggerRedo,
  } = useAppStore();

  // Global keyboard shortcuts
  useKeyboardShortcuts({
    onGenerate: doTriggerGenerate,
    onDownloadSVG: doTriggerDownloadSVG,
    onDownloadPNG: doTriggerDownloadPNG,
    onCopyMarkdown: doTriggerCopyMarkdown,
    onSwitchToPrompt: () => setActiveTab('prompt'),
    onSwitchToCode: () => setActiveTab('code'),
    onZoomIn: doTriggerZoomIn,
    onZoomOut: doTriggerZoomOut,
    onResetZoom: doTriggerResetZoom,
    onUndo: doTriggerUndo,
    onRedo: doTriggerRedo,
  });

  const handleMouseDown = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;

      const container = containerRef.current;
      const containerRect = container.getBoundingClientRect();
      const containerWidth = containerRect.width - 32; // 减去 padding (16px * 2)
      const mouseX = e.clientX - containerRect.left - 16; // 减去左边 padding

      let newWidth = (mouseX / containerWidth) * 100;
      // 限制宽度在 20% 到 80% 之间
      newWidth = Math.max(20, Math.min(80, newWidth));
      setLeftWidth(newWidth);
    },
    [isDragging]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Responsive layout adjustment
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const mobile = width < 768;
      setIsMobile(mobile);
      
      if (mobile && leftWidth !== 100 && leftWidth !== 0) {
        setLeftWidth(100); // Default to editor on mobile
      }
    };

    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [leftWidth]);

  // 显示加载状态，等待 hydration
  if (!isHydrated) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  // 显示引导页
  if (!hasCompletedOnboarding) {
    return <Onboarding />;
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-100 dark:bg-gray-950">
      <Header />

      <main ref={containerRef} className="flex-1 flex overflow-hidden p-4">
        {/* Left Panel - Editor */}
        <div
          style={{ width: isMobile ? (leftWidth === 100 ? '100%' : '0%') : `calc(${leftWidth}% - 8px)` }}
          className={`flex-shrink-0 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200/50 dark:border-gray-800/50 overflow-hidden transition-all duration-300 ${
            isMobile && leftWidth === 0 ? 'hidden' : ''
          }`}
        >
          <Editor />
        </div>

        {/* Resizer - Hidden on mobile */}
        {!isMobile && (
          <div
            className="w-4 flex-shrink-0 flex items-center justify-center cursor-col-resize group"
            onMouseDown={handleMouseDown}
          >
            <div
              className={`w-1 h-12 rounded-full transition-all duration-150 ${
                isDragging
                  ? 'bg-cyan-500 h-24'
                  : 'bg-gray-300 dark:bg-gray-600 group-hover:bg-cyan-400 group-hover:h-16'
              }`}
            />
          </div>
        )}

        {/* Right Panel - Preview */}
        <div
          style={{ width: isMobile ? (leftWidth === 0 ? '100%' : '0%') : `calc(${100 - leftWidth}% - 8px)` }}
          className={`flex-shrink-0 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200/50 dark:border-gray-800/50 overflow-hidden transition-all duration-300 ${
            isMobile && leftWidth === 100 ? 'hidden' : ''
          }`}
        >
          <Preview />
        </div>

        {/* Mobile toggle button */}
        {isMobile && (
          <button
            onClick={() => setLeftWidth(leftWidth === 100 ? 0 : 100)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
            aria-label={leftWidth === 100 ? '切换到预览' : '切换到编辑器'}
          >
            {leftWidth === 100 ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            )}
          </button>
        )}
      </main>

      <Settings />
      <KeyboardShortcutsHelp />
    </div>
  );
}
