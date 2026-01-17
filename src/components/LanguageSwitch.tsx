'use client';

import { useAppStore } from '@/lib/store';

export default function LanguageSwitch() {
  // Optimized selectors
  const locale = useAppStore((state) => state.locale);
  const setLocale = useAppStore((state) => state.setLocale);

  return (
    <button
      onClick={() => setLocale(locale === 'zh' ? 'en' : 'zh')}
      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
      title={locale === 'zh' ? 'Switch to English' : '切换到中文'}
      aria-label={locale === 'zh' ? '切换语言为英文' : 'Switch language to Chinese'}
    >
      <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span className="hidden sm:flex items-center gap-1">
        <span className={locale === 'zh' ? 'text-cyan-600 dark:text-cyan-400 font-semibold' : 'text-gray-400 dark:text-gray-500'}>
          中文
        </span>
        <span className="text-gray-300 dark:text-gray-600">/</span>
        <span className={locale === 'en' ? 'text-cyan-600 dark:text-cyan-400 font-semibold' : 'text-gray-400 dark:text-gray-500'}>
          EN
        </span>
      </span>
    </button>
  );
}
