'use client';

import { useAppStore, type Suggestion } from '@/lib/store';
import { validateMermaidCode } from '@/lib/mermaid';
import { useCallback, useState, useRef, useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';
import type { TranslationKeys } from '@/lib/i18n';

interface SuggestionCardProps {
  suggestion: Suggestion;
  index: number;
  onApply: (code: string) => void;
  isApplying: boolean;
  t: TranslationKeys;
}

function SuggestionCard({ suggestion, index, onApply, isApplying, t }: SuggestionCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  const colors = [
    { bg: 'from-cyan-500 to-teal-500', light: 'bg-cyan-50 dark:bg-cyan-900/20', border: 'border-cyan-200 dark:border-cyan-800/50', text: 'text-cyan-700 dark:text-cyan-300' },
    { bg: 'from-violet-500 to-purple-500', light: 'bg-violet-50 dark:bg-violet-900/20', border: 'border-violet-200 dark:border-violet-800/50', text: 'text-violet-700 dark:text-violet-300' },
    { bg: 'from-amber-500 to-orange-500', light: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-800/50', text: 'text-amber-700 dark:text-amber-300' },
    { bg: 'from-rose-500 to-pink-500', light: 'bg-rose-50 dark:bg-rose-900/20', border: 'border-rose-200 dark:border-rose-800/50', text: 'text-rose-700 dark:text-rose-300' },
  ];

  const color = colors[index % colors.length];

  return (
    <div 
      className={`group relative rounded-xl border ${color.border} ${color.light} p-4 transition-all duration-200 hover:shadow-md`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Index badge */}
      <div className={`absolute -top-2 -left-2 w-6 h-6 rounded-full bg-gradient-to-br ${color.bg} flex items-center justify-center text-white text-xs font-bold shadow-sm`}>
        {index + 1}
      </div>

      {/* Title */}
      <h4 className={`font-medium ${color.text} mb-1.5 pr-8`}>
        {suggestion.title}
      </h4>

      {/* Description */}
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">
        {suggestion.description}
      </p>

      {/* Apply button */}
      <button
        onClick={() => onApply(suggestion.code)}
        disabled={isApplying}
        className={`w-full py-2 px-3 rounded-lg text-sm font-medium bg-gradient-to-r ${color.bg} text-white opacity-90 hover:opacity-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2`}
      >
        {isApplying ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span>{t.common.applying}</span>
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>{t.suggestions.applyThis}</span>
          </>
        )}
      </button>

      {/* 悬浮预览（桌面端） - 低优先级优化 */}
      {isHovered && (
        <div className="hidden lg:block absolute left-full ml-2 top-0 w-96 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl p-4 z-50 animate-in fade-in zoom-in-95 duration-200">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium">
            {t.suggestions.codePreview || '代码预览'}:
          </div>
          <pre className="text-xs bg-gray-50 dark:bg-gray-900 p-3 rounded-lg overflow-auto max-h-48 font-mono border border-gray-200 dark:border-gray-700">
            {suggestion.code}
          </pre>
        </div>
      )}
    </div>
  );
}

export default function Suggestions() {
  // Optimized selectors - Group 1: Suggestions state
  const { suggestions, isLoadingSuggestions } = useAppStore(
    useShallow((state) => ({
      suggestions: state.suggestions,
      isLoadingSuggestions: state.isLoadingSuggestions
    }))
  );
  
  // Group 2: Actions (stable references)
  const setCode = useAppStore((state) => state.setCode);
  const setActiveTab = useAppStore((state) => state.setActiveTab);
  const setSuggestions = useAppStore((state) => state.setSuggestions);
  const markCodeAsRead = useAppStore((state) => state.markCodeAsRead);
  
  // Group 3: i18n (rarely changes)
  const t = useAppStore((state) => state.t);
  const [applyingIndex, setApplyingIndex] = useState<number | null>(null);
  const isMountedRef = useRef(true);

  // Track component mount state to prevent state updates after unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleApply = useCallback(async (code: string, index: number) => {
    setApplyingIndex(index);

    try {
      // Validate the code first (for logging purposes)
      const validation = await validateMermaidCode(code);

      if (!validation.valid) {
        console.warn('Applying suggestion with validation warning:', validation.error);
      }

      // Check if component is still mounted before updating state
      if (!isMountedRef.current) return;

      // Apply the code regardless of validation (user can fix issues)
      setCode(code);
      setActiveTab('code');
      markCodeAsRead();
      setSuggestions([]);
    } catch (error) {
      console.error('Error applying suggestion:', error);
      // Still apply the code even if validation throws
      if (isMountedRef.current) {
        setCode(code);
        setActiveTab('code');
        markCodeAsRead();
        setSuggestions([]);
      }
    } finally {
      if (isMountedRef.current) {
        setApplyingIndex(null);
      }
    }
  }, [setCode, setActiveTab, markCodeAsRead, setSuggestions]);

  if (isLoadingSuggestions) {
    return (
      <div className="flex-shrink-0 max-h-80 overflow-auto p-4 border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center">
            <svg className="w-4 h-4 text-white animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{t.suggestions.analyzing}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t.suggestions.generating}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-3" />
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="flex-shrink-0 max-h-80 overflow-auto p-4 border-t border-gray-100 dark:border-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{t.suggestions.title}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t.suggestions.desc}</p>
          </div>
        </div>
        <button
          onClick={() => setSuggestions([])}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title={t.suggestions.closeSuggestions}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Suggestions Grid */}
      <div className="grid grid-cols-2 gap-3">
        {suggestions.map((suggestion, index) => (
          <SuggestionCard
            key={`${suggestion.title}-${index}`}
            suggestion={suggestion}
            index={index}
            onApply={(code) => handleApply(code, index)}
            isApplying={applyingIndex === index}
            t={t}
          />
        ))}
      </div>
    </div>
  );
}
