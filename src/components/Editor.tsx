'use client';

import { useAppStore } from '@/lib/store';
import { validateMermaidCode } from '@/lib/mermaid';
import { MERMAID_SNIPPETS, getSnippetDocumentation } from '@/lib/snippets';
import { useCallback, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Suggestions from './Suggestions';
import ChatPanel from './ChatPanel';
import { useShallow } from 'zustand/react/shallow';
import type { editor as MonacoEditorType } from 'monaco-editor';

// 使用 store 获取翻译需要在组件内部
const MonacoEditorLoading = () => {
  // Optimized selector - i18n (rarely changes)
  const t = useAppStore((state) => state.t);
  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900 p-4 animate-pulse">
      <div className="space-y-3">
        {[...Array(10)].map((_, i) => {
          const width = 40 + (i * 13) % 40; // Deterministic width based on index
          return (
            <div key={i} className="flex gap-2">
              <div className="w-8 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
              <div 
                className="h-4 bg-gray-200 dark:bg-gray-700 rounded"
                style={{ width: `${width}%` }}
              />
            </div>
          );
        })}
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 bg-white/90 dark:bg-gray-900/90 px-6 py-4 rounded-xl shadow-lg">
          <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-gray-600 dark:text-gray-400">{t.editor.loadingEditor}</span>
        </div>
      </div>
    </div>
  );
};

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => <MonacoEditorLoading />,
});

export default function Editor() {
  // Optimized selectors - Group 1: Editor state
  const { code, activeTab, hasUnreadCode } = useAppStore(
    useShallow((state) => ({
      code: state.code,
      activeTab: state.activeTab,
      hasUnreadCode: state.hasUnreadCode
    }))
  );
  
  // Group 2: Actions (stable references)
  const setCode = useAppStore((state) => state.setCode);
  const setActiveTab = useAppStore((state) => state.setActiveTab);
  const markCodeAsRead = useAppStore((state) => state.markCodeAsRead);
  const setLoadingState = useAppStore((state) => state.setLoadingState);
  const undo = useAppStore((state) => state.undo);
  const redo = useAppStore((state) => state.redo);
  
  // Group 3: i18n (rarely changes)
  const t = useAppStore((state) => state.t);
  
  // Group 4: Loading state
  const isValidating = useAppStore((state) => state.loadingState.validating);
  
  // Group 5: Triggers
  const triggerUndo = useAppStore((state) => state.triggerUndo);
  const triggerRedo = useAppStore((state) => state.triggerRedo);
  
  // Group 6: Undo/Redo state
  const canUndo = useAppStore((state) => state.canUndo);
  const canRedo = useAppStore((state) => state.canRedo);
  
  const [validationError, setValidationError] = useState<string | null>(null);
  const [editorTheme, setEditorTheme] = useState('light');

  // Listen to undo/redo triggers
  useEffect(() => {
    if (triggerUndo > 0) {
      undo();
    }
  }, [triggerUndo, undo]);

  useEffect(() => {
    if (triggerRedo > 0) {
      redo();
    }
  }, [triggerRedo, redo]);

  // Monaco Editor 主题跟随系统暗色模式
  useEffect(() => {
    const updateTheme = () => {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setEditorTheme(isDark ? 'vs-dark' : 'light');
    };
    
    // 初始设置
    updateTheme();
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setEditorTheme(e.matches ? 'vs-dark' : 'light');
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const handleCodeChange = useCallback(
    async (value: string | undefined) => {
      const newCode = value || '';
      setCode(newCode);

      // Validate on change (debounced naturally by Monaco)
      if (newCode.trim()) {
        setLoadingState('validating', true);
        const validation = await validateMermaidCode(newCode);
        setValidationError(validation.valid ? null : validation.error || null);
        setLoadingState('validating', false);
      } else {
        setValidationError(null);
        setLoadingState('validating', false);
      }
    },
    [setCode, setLoadingState]
  );

  // Monaco Editor 挂载时注册代码片段
  const handleEditorDidMount = useCallback(
    (_editor: MonacoEditorType.IStandaloneCodeEditor, monaco: typeof import('monaco-editor')) => {
      // 获取当前语言
      const locale = useAppStore.getState().locale;

      // 注册 Mermaid 代码片段补全提供器
      monaco.languages.registerCompletionItemProvider('markdown', {
        provideCompletionItems: (model, position) => {
          const word = model.getWordUntilPosition(position);
          const range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endColumn: word.endColumn,
          };

          const suggestions = MERMAID_SNIPPETS.map((snippet) => ({
            label: snippet.label,
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: snippet.insertText,
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: getSnippetDocumentation(snippet, locale),
            range,
          }));

          return { suggestions };
        },
      });
    },
    []
  );

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Tabs */}
      <div className="flex-shrink-0 flex items-center border-b border-gray-100 dark:border-gray-800 px-2">
        <button
          onClick={() => setActiveTab('prompt')}
          className={`relative flex items-center gap-2 px-4 py-3.5 text-sm font-medium transition-colors ${
            activeTab === 'prompt'
              ? 'text-cyan-600 dark:text-cyan-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          {t.editor.aiChat}
          {activeTab === 'prompt' && (
            <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-full" />
          )}
        </button>
        <button
          onClick={() => {
            setActiveTab('code');
            markCodeAsRead();
          }}
          className={`relative flex items-center gap-2 px-4 py-3.5 text-sm font-medium transition-colors ${
            activeTab === 'code'
              ? 'text-cyan-600 dark:text-cyan-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
          {t.editor.mermaidCode}
          {hasUnreadCode && (
            <span className="w-2 h-2 rounded-full bg-green-500" />
          )}
          {activeTab === 'code' && (
            <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-full" />
          )}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'prompt' ? (
          <ChatPanel />
        ) : (
          <div className="h-full flex flex-col">
            {/* Code Editor Toolbar */}
            <div className="flex-shrink-0 flex items-center justify-between px-4 py-2 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-1">
                {/* Undo Button */}
                <button
                  onClick={undo}
                  disabled={!canUndo}
                  className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
                  title={`${t.shortcuts.undo} (Ctrl/Cmd+Z)`}
                  aria-label={t.shortcuts.undo}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                </button>
                
                {/* Redo Button */}
                <button
                  onClick={redo}
                  disabled={!canRedo}
                  className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
                  title={`${t.shortcuts.redo} (Ctrl/Cmd+Shift+Z)`}
                  aria-label={t.shortcuts.redo}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" />
                  </svg>
                </button>
              </div>
              
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {code.split('\n').length} {t.shortcuts.editing === 'Editing' ? 'lines' : '行'}
              </div>
            </div>
            
            {validationError && (
              <div className="mx-4 mt-4 p-3.5 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/50 rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-red-800 dark:text-red-200 mb-0.5">{t.editor.syntaxError}</p>
                    <p className="text-sm text-red-600 dark:text-red-400 break-words">{validationError}</p>
                  </div>
                </div>
              </div>
            )}
            {isValidating && !validationError && (
              <div className="mx-4 mt-4 p-3 bg-cyan-50 dark:bg-cyan-900/10 border border-cyan-200 dark:border-cyan-900/50 rounded-xl">
                <div className="flex items-center gap-2.5">
                  <svg className="w-4 h-4 text-cyan-600 dark:text-cyan-400 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span className="text-sm text-cyan-700 dark:text-cyan-300">{t.editor.validating || '验证中...'}</span>
                </div>
              </div>
            )}
            <div className="flex-1 mt-2">
              <MonacoEditor
                height="100%"
                language="markdown"
                theme={editorTheme}
                value={code}
                onChange={handleCodeChange}
                onMount={handleEditorDidMount}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  fontFamily: 'var(--font-geist-mono), Monaco, Consolas, monospace',
                  lineNumbers: 'on',
                  wordWrap: 'on',
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  padding: { top: 16, bottom: 16 },
                  lineHeight: 1.6,
                  renderLineHighlight: 'line',
                  cursorBlinking: 'smooth',
                  cursorSmoothCaretAnimation: 'on',
                  smoothScrolling: true,
                  bracketPairColorization: { enabled: true },
                  // 启用代码片段建议
                  quickSuggestions: {
                    other: true,
                    comments: false,
                    strings: false,
                  },
                  suggestOnTriggerCharacters: true,
                  acceptSuggestionOnEnter: 'on',
                  tabCompletion: 'on',
                }}
              />
            </div>
          </div>
        )}

      </div>

      {/* AI Suggestions - Fixed at bottom */}
      <Suggestions />
    </div>
  );
}
