'use client';

import { memo, forwardRef } from 'react';
import type { TranslationKeys } from '@/lib/i18n';

interface SelectionBox {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

interface PreviewCanvasProps {
  svg: string;
  error: string | null;
  zoom: number;
  position: { x: number; y: number };
  isDragging: boolean;
  isReferenceMode: boolean;
  selectionBox: SelectionBox | null;
  t: TranslationKeys;
  onNodeClick?: (nodeElement: Element) => void;
  onNodeMouseMove?: (target: Element) => void;
  onNodeMouseLeave?: () => void;
  findNodeFromTarget?: (target: Element, svgElement: Element) => Element | null;
}

export const PreviewCanvas = memo(forwardRef<HTMLDivElement, PreviewCanvasProps>(
  function PreviewCanvas({
    svg,
    error,
    zoom,
    position,
    isDragging,
    isReferenceMode,
    selectionBox,
    t,
    onNodeClick,
    onNodeMouseMove,
    onNodeMouseLeave,
    findNodeFromTarget,
  }, containerRef) {
    const displayError = error;

    return (
      <div
        className={`flex-1 overflow-auto bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-50 via-gray-100/50 to-gray-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800/50 p-6 relative ${
          isReferenceMode ? 'cursor-crosshair' : ''
        }`}
      >
        {/* Reference Mode Overlay */}
        {isReferenceMode && svg && (
          <div className="absolute inset-0 z-10 pointer-events-none">
            <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-cyan-600 text-white text-sm font-medium rounded-full shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5" />
              </svg>
              <span>{t.preview.selectNodes}</span>
              <span className="text-cyan-200 text-xs ml-1">{t.preview.escToExit}</span>
            </div>
          </div>
        )}

        {/* Selection Box */}
        {isReferenceMode && selectionBox && (
          <div
            className="absolute pointer-events-none z-20 border-2 border-cyan-500 bg-cyan-500/10 rounded"
            style={{
              left: Math.min(selectionBox.startX, selectionBox.endX),
              top: Math.min(selectionBox.startY, selectionBox.endY),
              width: Math.abs(selectionBox.endX - selectionBox.startX),
              height: Math.abs(selectionBox.endY - selectionBox.startY),
            }}
          />
        )}

        {displayError ? (
          <div className="h-full flex items-center justify-center">
            <div className="max-w-md w-full">
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-red-100 dark:border-red-900/30 overflow-hidden">
                <div className="bg-gradient-to-r from-red-500 to-rose-500 px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">{t.preview.renderError}</h3>
                      <p className="text-white/70 text-sm">{t.preview.checkSyntax}</p>
                    </div>
                  </div>
                </div>
                <div className="p-5">
                  <div className="bg-red-50 dark:bg-red-900/10 rounded-xl p-4 border border-red-100 dark:border-red-900/30">
                    <pre className="text-sm text-red-700 dark:text-red-300 whitespace-pre-wrap font-mono leading-relaxed">
                      {displayError}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : svg ? (
          <div
            ref={containerRef}
            className={`min-h-full flex items-center justify-center ${isDragging ? '' : 'transition-transform duration-200'}`}
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
              transformOrigin: 'center center',
              cursor: isDragging ? 'grabbing' : (isReferenceMode ? 'crosshair' : 'default'),
            }}
          >
            <div
              className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50"
              dangerouslySetInnerHTML={{ __html: svg }}
              onClick={isReferenceMode && onNodeClick && findNodeFromTarget ? (e) => {
                const target = e.target as Element;
                const svgEl = (containerRef as React.RefObject<HTMLDivElement>).current?.querySelector('svg');
                if (!svgEl) return;
                const node = findNodeFromTarget(target, svgEl);
                if (node) {
                  e.preventDefault();
                  e.stopPropagation();
                  onNodeClick(node);
                }
              } : undefined}
              onMouseMove={isReferenceMode && onNodeMouseMove ? (e) => {
                const target = e.target as Element;
                onNodeMouseMove(target);
              } : undefined}
              onMouseLeave={isReferenceMode && onNodeMouseLeave ? onNodeMouseLeave : undefined}
            />
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-sm">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center">
                <svg className="w-10 h-10 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {t.preview.waitingInput}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                {t.preview.waitingInputDesc}
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }
));
