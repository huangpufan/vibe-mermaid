'use client';

import { memo } from 'react';
import type { TranslationKeys } from '@/lib/i18n';
import type { ThemeConfig, DiagramReference } from '@/lib/store';
import { ZoomControls } from './ZoomControls';
import { ThemeSelector } from './ThemeSelector';

interface PreviewToolbarProps {
  svg: string;
  zoom: number;
  copied: boolean;
  copiedMarkdown: boolean;
  isExportingPng: boolean;
  isReferenceMode: boolean;
  pendingReferences: DiagramReference[];
  currentTheme: ThemeConfig;
  themeId: string;
  showThemeMenu: boolean;
  t: TranslationKeys;
  tf: (template: string, params: Record<string, number | string>) => string;
  onZoomIn: (mousePos?: { x: number; y: number }) => void;
  onZoomOut: (mousePos?: { x: number; y: number }) => void;
  onResetZoom: () => void;
  onToggleReferenceMode: () => void;
  onToggleThemeMenu: () => void;
  onSelectTheme: (themeId: string) => void;
  onCloseThemeMenu: () => void;
  onCopyCode: () => void;
  onCopyMarkdown: () => void;
  onDownloadSVG: () => void;
  onDownloadPNG: () => void;
}

export const PreviewToolbar = memo(function PreviewToolbar({
  svg,
  zoom,
  copied,
  copiedMarkdown,
  isExportingPng,
  isReferenceMode,
  pendingReferences,
  currentTheme,
  themeId,
  showThemeMenu,
  t,
  tf,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onToggleReferenceMode,
  onToggleThemeMenu,
  onSelectTheme,
  onCloseThemeMenu,
  onCopyCode,
  onCopyMarkdown,
  onDownloadSVG,
  onDownloadPNG,
}: PreviewToolbarProps) {
  return (
    <div className="flex items-center justify-between h-14 px-4 border-b border-gray-100 dark:border-gray-800">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <span className="text-sm font-medium text-gray-900 dark:text-white">{t.preview.title}</span>
        </div>

        {svg && (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200/50 dark:border-emerald-800/30">
            <svg className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">{t.preview.renderSuccess}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        {/* Zoom Controls */}
        <ZoomControls
          zoom={zoom}
          onZoomIn={onZoomIn}
          onZoomOut={onZoomOut}
          onResetZoom={onResetZoom}
          t={t}
        />

        {/* Reference Mode Button */}
        {svg && (
          <>
            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />
            <div className="flex items-center gap-1">
              <button
                onClick={onToggleReferenceMode}
                className={`flex items-center gap-1.5 px-2.5 h-8 rounded-lg transition-all duration-200 ${
                  isReferenceMode
                    ? 'bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-700'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                title={isReferenceMode ? `${t.preview.escToExit}` : t.preview.referenceHint}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
                <span className="text-xs font-medium hidden sm:inline">
                  {isReferenceMode ? t.preview.selecting : t.preview.reference}
                </span>
              </button>

              {/* Display reference count */}
              {pendingReferences.length > 0 && (
                <span className="px-2 py-0.5 text-xs font-medium bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 rounded-full">
                  {pendingReferences.length}{t.preview.count}
                </span>
              )}
            </div>
          </>
        )}

        {/* Divider */}
        <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />

        {/* Theme Selector */}
        <ThemeSelector
          currentTheme={currentTheme}
          themeId={themeId}
          showThemeMenu={showThemeMenu}
          onToggleMenu={onToggleThemeMenu}
          onSelectTheme={onSelectTheme}
          onCloseMenu={onCloseThemeMenu}
          t={t}
          tf={tf}
        />

        {/* Divider */}
        <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />

        {/* Actions */}
        <button
          onClick={onCopyCode}
          className="relative w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
          title={t.preview.copyCode}
          aria-label={t.preview.copyCode}
        >
          {copied ? (
            <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          )}
        </button>
        <button
          onClick={onCopyMarkdown}
          className="relative w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
          title={t.preview.copyMarkdown}
          aria-label={t.preview.copyMarkdown}
        >
          {copiedMarkdown ? (
            <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-6 4h4" />
            </svg>
          )}
        </button>
        <button
          onClick={onDownloadSVG}
          disabled={!svg}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
          title={t.preview.downloadSvg}
          aria-label={t.preview.downloadSvg}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </button>
        <button
          onClick={onDownloadPNG}
          disabled={!svg || isExportingPng}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
          title={t.preview.downloadPng}
          aria-label={t.preview.downloadPng}
        >
          {isExportingPng ? (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
});
