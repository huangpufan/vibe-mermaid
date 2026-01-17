'use client';

import { memo, useRef, useEffect } from 'react';
import { THEME_PRESETS, type ThemeConfig } from '@/lib/store';
import type { TranslationKeys } from '@/lib/i18n';

interface ThemeSelectorProps {
  currentTheme: ThemeConfig;
  themeId: string;
  showThemeMenu: boolean;
  onToggleMenu: () => void;
  onSelectTheme: (themeId: string) => void;
  onCloseMenu: () => void;
  t: TranslationKeys;
  tf: (template: string, params: Record<string, number | string>) => string;
}

// Map theme ID to translation keys
const themeTranslationMap: Record<string, keyof TranslationKeys['themes']> = {
  'default': 'default',
  'forest': 'forest',
  'dark': 'dark',
  'dark-blue': 'darkBlue',
  'dark-purple': 'darkPurple',
  'neutral': 'neutral',
  'tech-blue': 'techBlue',
  'ocean-teal': 'oceanTeal',
  'sunset-orange': 'sunsetOrange',
  'purple-dream': 'purpleDream',
  'rose-pink': 'rosePink',
  'emerald-green': 'emeraldGreen',
  'amber-gold': 'amberGold',
  'slate-modern': 'slateModern',
};

function getThemeTranslation(themeId: string, t: TranslationKeys) {
  const key = themeTranslationMap[themeId];
  if (!key) return { name: themeId, description: '' };
  return {
    name: t.themes[key] as string,
    description: t.themes[`${key}Desc` as keyof TranslationKeys['themes']] as string,
  };
}

export const ThemeSelector = memo(function ThemeSelector({
  currentTheme,
  themeId,
  showThemeMenu,
  onToggleMenu,
  onSelectTheme,
  onCloseMenu,
  t,
  tf,
}: ThemeSelectorProps) {
  const themeMenuRef = useRef<HTMLDivElement>(null);

  // Click outside to close menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (themeMenuRef.current && !themeMenuRef.current.contains(e.target as Node)) {
        onCloseMenu();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onCloseMenu]);

  return (
    <div className="relative" ref={themeMenuRef}>
      <button
        onClick={onToggleMenu}
        className="flex items-center gap-1.5 px-2.5 h-8 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
        title={t.preview.selectTheme}
      >
        <div
          className="w-4 h-4 rounded-full border-2 border-white dark:border-gray-700 shadow-sm"
          style={{
            background: currentTheme.themeVariables?.primaryColor ||
              (currentTheme.base === 'default' ? '#4169e1' :
               currentTheme.base === 'forest' ? '#228b22' :
               currentTheme.base === 'dark' ? '#1f2937' :
               '#6b7280'),
          }}
        />
        <span className="text-xs font-medium hidden sm:inline">{getThemeTranslation(currentTheme.id, t).name}</span>
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Theme Dropdown Menu */}
      {showThemeMenu && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{t.preview.selectTheme}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{tf(t.preview.themeCount, { count: THEME_PRESETS.length })}</p>
          </div>
          <div className="max-h-80 overflow-y-auto p-2">
            {THEME_PRESETS.map((theme) => {
              const themeT = getThemeTranslation(theme.id, t);
              return (
              <button
                key={theme.id}
                onClick={() => {
                  onSelectTheme(theme.id);
                  onCloseMenu();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                  themeId === theme.id
                    ? 'bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800/50'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800 border border-transparent'
                }`}
              >
                <div
                  className="w-8 h-8 rounded-lg flex-shrink-0 shadow-sm border border-white/20"
                  style={{
                    background: theme.themeVariables?.primaryColor ||
                      (theme.base === 'default' ? 'linear-gradient(135deg, #4169e1, #6b8dd6)' :
                       theme.base === 'forest' ? 'linear-gradient(135deg, #228b22, #3cb371)' :
                       theme.base === 'dark' ? 'linear-gradient(135deg, #1f2937, #374151)' :
                       theme.base === 'neutral' ? 'linear-gradient(135deg, #6b7280, #9ca3af)' :
                       theme.themeVariables?.primaryColor || '#6b7280'),
                  }}
                />
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${
                      themeId === theme.id
                        ? 'text-cyan-700 dark:text-cyan-300'
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {themeT.name}
                    </span>
                    {themeId === theme.id && (
                      <svg className="w-4 h-4 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{themeT.description}</span>
                </div>
              </button>
            );})}
          </div>
        </div>
      )}
    </div>
  );
});
