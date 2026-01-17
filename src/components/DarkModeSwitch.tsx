'use client';

import { useAppStore } from '@/lib/store';
import { useShallow } from 'zustand/react/shallow';
import { useEffect } from 'react';

export function DarkModeSwitch() {
  const { darkMode, setDarkMode, t } = useAppStore(
    useShallow((state) => ({
      darkMode: state.darkMode,
      setDarkMode: state.setDarkMode,
      t: state.t,
    }))
  );

  // 应用深色模式
  useEffect(() => {
    const applyDarkMode = () => {
      const isDark =
        darkMode === 'dark' ||
        (darkMode === 'system' &&
          window.matchMedia('(prefers-color-scheme: dark)').matches);

      // 移除所有主题类
      document.documentElement.classList.remove('dark', 'light');
      
      // 添加对应的主题类
      if (darkMode === 'light') {
        document.documentElement.classList.add('light');
      } else if (darkMode === 'dark') {
        document.documentElement.classList.add('dark');
      } else if (isDark) {
        // system 模式且系统是深色
        document.documentElement.classList.add('dark');
      } else {
        // system 模式且系统是浅色
        document.documentElement.classList.add('light');
      }
    };

    applyDarkMode();

    // 监听系统主题变化
    if (darkMode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => applyDarkMode();
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
    return undefined;
  }, [darkMode]);

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setDarkMode('light')}
        className={`p-2 rounded-lg transition-colors ${
          darkMode === 'light'
            ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
            : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
        }`}
        title={t.darkMode.light}
        aria-label={t.darkMode.light}
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      </button>

      <button
        onClick={() => setDarkMode('system')}
        className={`p-2 rounded-lg transition-colors ${
          darkMode === 'system'
            ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
            : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
        }`}
        title={t.darkMode.system}
        aria-label={t.darkMode.system}
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      </button>

      <button
        onClick={() => setDarkMode('dark')}
        className={`p-2 rounded-lg transition-colors ${
          darkMode === 'dark'
            ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
            : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
        }`}
        title={t.darkMode.dark}
        aria-label={t.darkMode.dark}
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      </button>
    </div>
  );
}
