'use client';

import { useState } from 'react';
import type { ErrorInfo } from '@/types/error';
import { useAppStore } from '@/lib/store';

interface ErrorDisplayProps {
  error: ErrorInfo;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export default function ErrorDisplay({ error, onRetry, onDismiss }: ErrorDisplayProps) {
  const [showDetails, setShowDetails] = useState(false);
  const { locale } = useAppStore((state) => ({ locale: state.locale }));

  // 根据错误级别设置样式
  const levelStyles = {
    warning: {
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      border: 'border-yellow-200 dark:border-yellow-800',
      text: 'text-yellow-800 dark:text-yellow-200',
      icon: '⚠️',
    },
    error: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-200 dark:border-red-800',
      text: 'text-red-800 dark:text-red-200',
      icon: '❌',
    },
    fatal: {
      bg: 'bg-red-100 dark:bg-red-900/30',
      border: 'border-red-300 dark:border-red-700',
      text: 'text-red-900 dark:text-red-100',
      icon: '🚨',
    },
  };

  const style = levelStyles[error.level];

  const labels = {
    en: {
      details: 'Details',
      hideDetails: 'Hide Details',
      suggestions: 'Suggestions',
      retry: 'Retry',
      dismiss: 'Dismiss',
    },
    zh: {
      details: '详情',
      hideDetails: '隐藏详情',
      suggestions: '建议',
      retry: '重试',
      dismiss: '关闭',
    },
  };

  const t = labels[locale];

  return (
    <div
      className={`rounded-lg border p-4 ${style.bg} ${style.border} ${style.text}`}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0" aria-hidden="true">
          {style.icon}
        </span>
        <div className="flex-1 min-w-0">
          {/* 错误消息 */}
          <p className="font-medium">{error.message}</p>

          {/* 错误代码 */}
          {error.code && (
            <p className="text-sm opacity-75 mt-1">
              {locale === 'zh' ? '错误代码' : 'Error Code'}: {error.code}
            </p>
          )}

          {/* 详情按钮 */}
          {error.details && (
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-sm underline mt-2 hover:opacity-80"
            >
              {showDetails ? t.hideDetails : t.details}
            </button>
          )}

          {/* 详情内容 */}
          {showDetails && error.details && (
            <div className="mt-2 p-3 rounded bg-black/5 dark:bg-white/5">
              <pre className="text-xs whitespace-pre-wrap break-words font-mono">
                {error.details}
              </pre>
            </div>
          )}

          {/* 修复建议 */}
          {error.suggestions && error.suggestions.length > 0 && (
            <div className="mt-3">
              <p className="text-sm font-medium mb-1">{t.suggestions}:</p>
              <ul className="text-sm space-y-1 list-disc list-inside">
                {error.suggestions.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex gap-2 mt-3">
            {error.recoverable && onRetry && (
              <button
                onClick={onRetry}
                className="px-3 py-1 text-sm rounded bg-white dark:bg-gray-800 border border-current hover:opacity-80 transition-opacity"
              >
                {t.retry}
              </button>
            )}
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="px-3 py-1 text-sm rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                {t.dismiss}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
