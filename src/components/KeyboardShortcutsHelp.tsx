'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';

export default function KeyboardShortcutsHelp() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMac] = useState(() => {
    if (typeof navigator !== 'undefined') {
      return navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    }
    return false;
  });
  
  // Optimized selector - i18n (rarely changes)
  const t = useAppStore((state) => state.t);

  const modKey = isMac ? '⌘' : 'Ctrl';

  const shortcuts = [
    { keys: [modKey, 'Enter'], desc: t.shortcuts?.generate || '生成图表', category: t.shortcuts?.editing || '编辑' },
    { keys: [modKey, 'S'], desc: t.shortcuts?.downloadSvg || '下载 SVG', category: t.shortcuts?.export || '导出' },
    { keys: [modKey, 'Shift', 'S'], desc: t.shortcuts?.downloadPng || '下载 PNG', category: t.shortcuts?.export || '导出' },
    { keys: [modKey, 'Shift', 'C'], desc: t.shortcuts?.copyMarkdown || '复制 Markdown', category: t.shortcuts?.export || '导出' },
    { keys: [modKey, '1'], desc: t.shortcuts?.switchToChat || '切换到对话', category: t.shortcuts?.navigation || '导航' },
    { keys: [modKey, '2'], desc: t.shortcuts?.switchToCode || '切换到代码', category: t.shortcuts?.navigation || '导航' },
    { keys: [modKey, '+'], desc: t.shortcuts?.zoomIn || '放大', category: t.shortcuts?.view || '视图' },
    { keys: [modKey, '-'], desc: t.shortcuts?.zoomOut || '缩小', category: t.shortcuts?.view || '视图' },
    { keys: [modKey, '0'], desc: t.shortcuts?.resetZoom || '重置缩放', category: t.shortcuts?.view || '视图' },
    { keys: ['?'], desc: t.shortcuts?.showHelp || '显示快捷键', category: t.shortcuts?.help || '帮助' },
    { keys: ['Esc'], desc: t.shortcuts?.exitReferenceMode || '退出引用模式', category: t.shortcuts?.editing || '编辑' },
  ];

  // 按类别分组
  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, typeof shortcuts>);

  // 监听 ? 键打开帮助
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        // 确保不在输入框中
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          setIsOpen(true);
        }
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <>
      {/* 浮动按钮 */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 w-10 h-10 rounded-full bg-gray-800 dark:bg-gray-700 text-white flex items-center justify-center hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors shadow-lg z-40 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
        title={t.shortcuts?.showHelp || '键盘快捷键 (?)'}
        aria-label={t.shortcuts?.showHelp || '显示键盘快捷键'}
      >
        <span className="text-lg font-bold">?</span>
      </button>

      {/* 帮助面板 */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 标题 */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {t.shortcuts?.title || '键盘快捷键'}
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="关闭"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 快捷键列表 */}
            <div className="space-y-6">
              {Object.entries(groupedShortcuts).map(([category, items]) => (
                <div key={category}>
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                    {category}
                  </h3>
                  <div className="space-y-2">
                    {items.map((shortcut, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {shortcut.desc}
                        </span>
                        <div className="flex items-center gap-1">
                          {shortcut.keys.map((key, keyIndex) => (
                            <span key={keyIndex} className="flex items-center gap-1">
                              <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded shadow-sm">
                                {key}
                              </kbd>
                              {keyIndex < shortcut.keys.length - 1 && (
                                <span className="text-gray-400 dark:text-gray-500 text-xs">+</span>
                              )}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* 提示 */}
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                {t.shortcuts?.tip || '按 ? 键随时打开此帮助面板'}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
