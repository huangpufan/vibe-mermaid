'use client';

import { memo, useRef, useCallback } from 'react';
import type { TranslationKeys } from '@/lib/i18n';

interface ZoomControlsProps {
  zoom: number;
  onZoomIn: (mousePos?: { x: number; y: number }) => void;
  onZoomOut: (mousePos?: { x: number; y: number }) => void;
  onResetZoom: () => void;
  t: TranslationKeys;
}

export const ZoomControls = memo(function ZoomControls({
  zoom,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  t,
}: ZoomControlsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lastMousePosRef = useRef<{ x: number; y: number } | null>(null);

  // 跟踪鼠标位置
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (containerRef.current) {
      // 保存相对于视口的鼠标位置
      lastMousePosRef.current = {
        x: e.clientX,
        y: e.clientY,
      };
    }
  }, []);

  const handleZoomInClick = useCallback(() => {
    // 如果有最近的鼠标位置，使用它；否则使用画布中心
    onZoomIn(lastMousePosRef.current || undefined);
  }, [onZoomIn]);

  const handleZoomOutClick = useCallback(() => {
    // 如果有最近的鼠标位置，使用它；否则使用画布中心
    onZoomOut(lastMousePosRef.current || undefined);
  }, [onZoomOut]);

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1"
    >
      <button
        onClick={handleZoomOutClick}
        className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-all duration-200"
        title={t.preview.zoomOut}
        aria-label={t.preview.zoomOut}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
        </svg>
      </button>
      <button
        onClick={onResetZoom}
        className="h-7 px-2 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        title={t.preview.resetZoom}
        aria-label={`${t.preview.resetZoom} (${Math.round(zoom * 100)}%)`}
      >
        {Math.round(zoom * 100)}%
      </button>
      <button
        onClick={handleZoomInClick}
        className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-all duration-200"
        title={t.preview.zoomIn}
        aria-label={t.preview.zoomIn}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  );
});
