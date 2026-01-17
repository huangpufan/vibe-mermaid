import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { translations, formatTranslation, type Locale, type TranslationKeys } from './i18n';
import { generateUniqueId } from './errorDetection';
import type { ErrorInfo } from '@/types/error';

export type { Locale } from './i18n';

/**
 * 性能优化提示：
 * 
 * 使用 shallow 比较避免不必要的重渲染：
 * 
 * ❌ 不好的做法 - 会导致不必要的重渲染
 * const { settings, chatMessages, activeTab } = useAppStore();
 * 
 * ✅ 好的做法 - 只订阅需要的状态
 * const settings = useAppStore((state) => state.settings);
 * const activeTab = useAppStore((state) => state.activeTab);
 * 
 * ✅ 使用 shallow 比较避免引用变化导致的重渲染
 * import { useShallow } from 'zustand/react/shallow';
 * 
 * const { apiKey, model } = useAppStore(
 *   useShallow((state) => ({ 
 *     apiKey: state.settings.apiKey, 
 *     model: state.settings.model 
 *   }))
 * );
 */

interface Settings {
  apiKey: string;
  baseUrl: string;
  model: string;
}

// AI 修改建议类型
export interface Suggestion {
  title: string;
  description: string;
  code: string;
}

// 对话消息类型
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  mermaidCode?: string;
  timestamp: number;
}

// 图表引用类型
export interface DiagramReference {
  nodeId: string;      // 节点 ID
  nodeText: string;    // 节点文本内容
  nodeType?: string;   // 节点类型（如 decision, process 等）
}

// 主题配置类型
export interface ThemeConfig {
  id: string;
  name: string;
  description: string;
  base: 'default' | 'forest' | 'dark' | 'neutral' | 'base';
  themeVariables?: Record<string, string>;
}

// 预定义的主题配色方案
export const THEME_PRESETS: ThemeConfig[] = [
  {
    id: 'default',
    name: 'Default',
    description: 'Mermaid default blue',
    base: 'base',
    themeVariables: {
      primaryColor: '#ECECFF',
      primaryTextColor: '#333',
      primaryBorderColor: '#9370DB',
      secondaryColor: '#ffffde',
      secondaryTextColor: '#333',
      secondaryBorderColor: '#aaaa33',
      tertiaryColor: '#fff',
      tertiaryTextColor: '#333',
      tertiaryBorderColor: '#ccc',
      lineColor: '#333',
      textColor: '#333',
      mainBkg: '#ECECFF',
      nodeBorder: '#9370DB',
      clusterBkg: '#ffffde',
      clusterBorder: '#aaaa33',
      titleColor: '#333',
      edgeLabelBackground: '#e8e8e8',
    },
  },
  {
    id: 'forest',
    name: 'Forest',
    description: 'Green tones',
    base: 'base',
    themeVariables: {
      primaryColor: '#cde498',
      primaryTextColor: '#13540c',
      primaryBorderColor: '#13540c',
      secondaryColor: '#cdffb2',
      secondaryTextColor: '#13540c',
      secondaryBorderColor: '#6eaa49',
      tertiaryColor: '#fff',
      tertiaryTextColor: '#13540c',
      tertiaryBorderColor: '#ccc',
      lineColor: '#13540c',
      textColor: '#13540c',
      mainBkg: '#cde498',
      nodeBorder: '#13540c',
      clusterBkg: '#cdffb2',
      clusterBorder: '#6eaa49',
      titleColor: '#13540c',
      edgeLabelBackground: '#e8e8e8',
    },
  },
  {
    id: 'dark',
    name: 'Dark',
    description: 'Dark background',
    base: 'base',
    themeVariables: {
      primaryColor: '#1f2020',
      primaryTextColor: '#ccc',
      primaryBorderColor: '#81B1DB',
      secondaryColor: '#383838',
      secondaryTextColor: '#ccc',
      secondaryBorderColor: '#81B1DB',
      tertiaryColor: '#1f2020',
      tertiaryTextColor: '#ccc',
      tertiaryBorderColor: '#81B1DB',
      lineColor: '#81B1DB',
      textColor: '#ccc',
      mainBkg: '#1f2020',
      nodeBorder: '#81B1DB',
      clusterBkg: '#383838',
      clusterBorder: '#81B1DB',
      titleColor: '#F9FFFE',
      edgeLabelBackground: '#1f2020',
      background: '#121212',
    },
  },
  {
    id: 'dark-blue',
    name: 'Dark Blue',
    description: 'Dark blue tones',
    base: 'base',
    themeVariables: {
      primaryColor: '#1e3a5f',
      primaryTextColor: '#93c5fd',
      primaryBorderColor: '#3b82f6',
      secondaryColor: '#1e293b',
      secondaryTextColor: '#93c5fd',
      secondaryBorderColor: '#60a5fa',
      tertiaryColor: '#0f172a',
      tertiaryTextColor: '#bfdbfe',
      tertiaryBorderColor: '#3b82f6',
      lineColor: '#60a5fa',
      textColor: '#e0e7ff',
      mainBkg: '#1e3a5f',
      nodeBorder: '#3b82f6',
      clusterBkg: '#1e293b',
      clusterBorder: '#60a5fa',
      titleColor: '#dbeafe',
      edgeLabelBackground: '#0f172a',
      background: '#020617',
    },
  },
  {
    id: 'dark-purple',
    name: 'Dark Purple',
    description: 'Dark purple tones',
    base: 'base',
    themeVariables: {
      primaryColor: '#3b2a5f',
      primaryTextColor: '#c4b5fd',
      primaryBorderColor: '#8b5cf6',
      secondaryColor: '#2e1065',
      secondaryTextColor: '#c4b5fd',
      secondaryBorderColor: '#a78bfa',
      tertiaryColor: '#1e1b4b',
      tertiaryTextColor: '#ddd6fe',
      tertiaryBorderColor: '#8b5cf6',
      lineColor: '#a78bfa',
      textColor: '#ede9fe',
      mainBkg: '#3b2a5f',
      nodeBorder: '#8b5cf6',
      clusterBkg: '#2e1065',
      clusterBorder: '#a78bfa',
      titleColor: '#ede9fe',
      edgeLabelBackground: '#1e1b4b',
      background: '#0f0a1f',
    },
  },
  {
    id: 'neutral',
    name: 'Neutral',
    description: 'Gray tones',
    base: 'base',
    themeVariables: {
      primaryColor: '#eee',
      primaryTextColor: '#333',
      primaryBorderColor: '#999',
      secondaryColor: '#f4f4f4',
      secondaryTextColor: '#333',
      secondaryBorderColor: '#bbb',
      tertiaryColor: '#fff',
      tertiaryTextColor: '#333',
      tertiaryBorderColor: '#ccc',
      lineColor: '#666',
      textColor: '#333',
      mainBkg: '#eee',
      nodeBorder: '#999',
      clusterBkg: '#f4f4f4',
      clusterBorder: '#bbb',
      titleColor: '#333',
      edgeLabelBackground: '#e8e8e8',
    },
  },
  {
    id: 'tech-blue',
    name: 'Sky Blue',
    description: 'Light blue tones',
    base: 'base',
    themeVariables: {
      primaryColor: '#bfdbfe',
      primaryTextColor: '#1e3a8a',
      primaryBorderColor: '#2563eb',
      secondaryColor: '#dbeafe',
      secondaryTextColor: '#1e3a8a',
      secondaryBorderColor: '#3b82f6',
      tertiaryColor: '#eff6ff',
      tertiaryTextColor: '#1e40af',
      tertiaryBorderColor: '#60a5fa',
      lineColor: '#2563eb',
      textColor: '#1e293b',
      mainBkg: '#eff6ff',
      nodeBorder: '#2563eb',
      clusterBkg: '#dbeafe',
      clusterBorder: '#3b82f6',
      titleColor: '#1e40af',
      edgeLabelBackground: '#ffffff',
      labelTextColor: '#1e293b',
      actorTextColor: '#1e3a8a',
      signalTextColor: '#1e3a8a',
      noteBkgColor: '#dbeafe',
      noteTextColor: '#1e3a8a',
      noteBorderColor: '#3b82f6',
      nodeBkg: '#bfdbfe',
      nodeTextColor: '#1e3a8a',
    },
  },
  {
    id: 'ocean-teal',
    name: 'Teal',
    description: 'Teal tones',
    base: 'base',
    themeVariables: {
      primaryColor: '#99f6e4',
      primaryTextColor: '#115e59',
      primaryBorderColor: '#14b8a6',
      secondaryColor: '#ccfbf1',
      secondaryTextColor: '#115e59',
      secondaryBorderColor: '#2dd4bf',
      tertiaryColor: '#f0fdfa',
      tertiaryTextColor: '#0f766e',
      tertiaryBorderColor: '#5eead4',
      lineColor: '#0d9488',
      textColor: '#134e4a',
      mainBkg: '#f0fdfa',
      nodeBorder: '#14b8a6',
      clusterBkg: '#ccfbf1',
      clusterBorder: '#2dd4bf',
      titleColor: '#0f766e',
      edgeLabelBackground: '#ffffff',
      labelTextColor: '#134e4a',
      actorTextColor: '#115e59',
      signalTextColor: '#115e59',
      noteBkgColor: '#ccfbf1',
      noteTextColor: '#115e59',
      noteBorderColor: '#2dd4bf',
      nodeBkg: '#99f6e4',
      nodeTextColor: '#115e59',
    },
  },
  {
    id: 'sunset-orange',
    name: 'Orange',
    description: 'Orange tones',
    base: 'base',
    themeVariables: {
      primaryColor: '#fed7aa',
      primaryTextColor: '#7c2d12',
      primaryBorderColor: '#f97316',
      secondaryColor: '#ffedd5',
      secondaryTextColor: '#7c2d12',
      secondaryBorderColor: '#fb923c',
      tertiaryColor: '#fff7ed',
      tertiaryTextColor: '#9a3412',
      tertiaryBorderColor: '#fdba74',
      lineColor: '#ea580c',
      textColor: '#431407',
      mainBkg: '#fff7ed',
      nodeBorder: '#f97316',
      clusterBkg: '#ffedd5',
      clusterBorder: '#fb923c',
      titleColor: '#9a3412',
      edgeLabelBackground: '#ffffff',
      labelTextColor: '#431407',
      actorTextColor: '#7c2d12',
      signalTextColor: '#7c2d12',
      noteBkgColor: '#ffedd5',
      noteTextColor: '#7c2d12',
      noteBorderColor: '#fb923c',
      nodeBkg: '#fed7aa',
      nodeTextColor: '#7c2d12',
    },
  },
  {
    id: 'purple-dream',
    name: 'Purple',
    description: 'Purple tones',
    base: 'base',
    themeVariables: {
      primaryColor: '#ddd6fe',
      primaryTextColor: '#4c1d95',
      primaryBorderColor: '#8b5cf6',
      secondaryColor: '#ede9fe',
      secondaryTextColor: '#4c1d95',
      secondaryBorderColor: '#a78bfa',
      tertiaryColor: '#f5f3ff',
      tertiaryTextColor: '#5b21b6',
      tertiaryBorderColor: '#c4b5fd',
      lineColor: '#7c3aed',
      textColor: '#2e1065',
      mainBkg: '#f5f3ff',
      nodeBorder: '#8b5cf6',
      clusterBkg: '#ede9fe',
      clusterBorder: '#a78bfa',
      titleColor: '#5b21b6',
      edgeLabelBackground: '#ffffff',
      labelTextColor: '#2e1065',
      actorTextColor: '#4c1d95',
      signalTextColor: '#4c1d95',
      noteBkgColor: '#ede9fe',
      noteTextColor: '#4c1d95',
      noteBorderColor: '#a78bfa',
      nodeBkg: '#ddd6fe',
      nodeTextColor: '#4c1d95',
    },
  },
  {
    id: 'rose-pink',
    name: 'Pink',
    description: 'Pink tones',
    base: 'base',
    themeVariables: {
      primaryColor: '#fecdd3',
      primaryTextColor: '#881337',
      primaryBorderColor: '#f43f5e',
      secondaryColor: '#ffe4e6',
      secondaryTextColor: '#881337',
      secondaryBorderColor: '#fb7185',
      tertiaryColor: '#fff1f2',
      tertiaryTextColor: '#9f1239',
      tertiaryBorderColor: '#fda4af',
      lineColor: '#e11d48',
      textColor: '#4c0519',
      mainBkg: '#fff1f2',
      nodeBorder: '#f43f5e',
      clusterBkg: '#ffe4e6',
      clusterBorder: '#fb7185',
      titleColor: '#9f1239',
      edgeLabelBackground: '#ffffff',
      labelTextColor: '#4c0519',
      actorTextColor: '#881337',
      signalTextColor: '#881337',
      noteBkgColor: '#ffe4e6',
      noteTextColor: '#881337',
      noteBorderColor: '#fb7185',
      nodeBkg: '#fecdd3',
      nodeTextColor: '#881337',
    },
  },
  {
    id: 'emerald-green',
    name: 'Green',
    description: 'Light green tones',
    base: 'base',
    themeVariables: {
      primaryColor: '#a7f3d0',
      primaryTextColor: '#065f46',
      primaryBorderColor: '#10b981',
      secondaryColor: '#d1fae5',
      secondaryTextColor: '#065f46',
      secondaryBorderColor: '#34d399',
      tertiaryColor: '#ecfdf5',
      tertiaryTextColor: '#047857',
      tertiaryBorderColor: '#6ee7b7',
      lineColor: '#059669',
      textColor: '#064e3b',
      mainBkg: '#ecfdf5',
      nodeBorder: '#10b981',
      clusterBkg: '#d1fae5',
      clusterBorder: '#34d399',
      titleColor: '#047857',
      edgeLabelBackground: '#ffffff',
      labelTextColor: '#064e3b',
      actorTextColor: '#065f46',
      signalTextColor: '#065f46',
      noteBkgColor: '#d1fae5',
      noteTextColor: '#065f46',
      noteBorderColor: '#34d399',
      nodeBkg: '#a7f3d0',
      nodeTextColor: '#065f46',
    },
  },
  {
    id: 'amber-gold',
    name: 'Gold',
    description: 'Yellow tones',
    base: 'base',
    themeVariables: {
      primaryColor: '#fde68a',
      primaryTextColor: '#78350f',
      primaryBorderColor: '#f59e0b',
      secondaryColor: '#fef3c7',
      secondaryTextColor: '#78350f',
      secondaryBorderColor: '#fbbf24',
      tertiaryColor: '#fffbeb',
      tertiaryTextColor: '#92400e',
      tertiaryBorderColor: '#fcd34d',
      lineColor: '#d97706',
      textColor: '#451a03',
      mainBkg: '#fffbeb',
      nodeBorder: '#f59e0b',
      clusterBkg: '#fef3c7',
      clusterBorder: '#fbbf24',
      titleColor: '#92400e',
      edgeLabelBackground: '#ffffff',
      labelTextColor: '#451a03',
      actorTextColor: '#78350f',
      signalTextColor: '#78350f',
      noteBkgColor: '#fef3c7',
      noteTextColor: '#78350f',
      noteBorderColor: '#fbbf24',
      nodeBkg: '#fde68a',
      nodeTextColor: '#78350f',
    },
  },
  {
    id: 'slate-modern',
    name: 'Slate',
    description: 'Dark gray tones',
    base: 'base',
    themeVariables: {
      primaryColor: '#cbd5e1',
      primaryTextColor: '#1e293b',
      primaryBorderColor: '#64748b',
      secondaryColor: '#e2e8f0',
      secondaryTextColor: '#1e293b',
      secondaryBorderColor: '#94a3b8',
      tertiaryColor: '#f1f5f9',
      tertiaryTextColor: '#334155',
      tertiaryBorderColor: '#cbd5e1',
      lineColor: '#475569',
      textColor: '#0f172a',
      mainBkg: '#f1f5f9',
      nodeBorder: '#64748b',
      clusterBkg: '#e2e8f0',
      clusterBorder: '#94a3b8',
      titleColor: '#1e293b',
      edgeLabelBackground: '#ffffff',
      labelTextColor: '#0f172a',
      actorTextColor: '#1e293b',
      signalTextColor: '#1e293b',
      noteBkgColor: '#e2e8f0',
      noteTextColor: '#1e293b',
      noteBorderColor: '#94a3b8',
      nodeBkg: '#cbd5e1',
      nodeTextColor: '#1e293b',
    },
  },
];

interface AppState {
  // Locale / i18n
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: TranslationKeys;
  tf: (text: string, params: Record<string, string | number>) => string;

  // Dark mode
  darkMode: 'system' | 'light' | 'dark';
  setDarkMode: (mode: 'system' | 'light' | 'dark') => void;

  // Onboarding
  hasCompletedOnboarding: boolean;
  completeOnboarding: () => void;
  resetOnboarding: () => void;

  // Mermaid code
  code: string;
  setCode: (code: string, options?: { skipHistory?: boolean }) => void;

  // History (Undo/Redo)
  history: {
    past: string[];
    future: string[];
  };
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;

  // Natural language input
  prompt: string;
  setPrompt: (prompt: string) => void;

  // Chat messages
  chatMessages: ChatMessage[];
  addChatMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  clearChatMessages: () => void;
  isChatLoading: boolean;
  setIsChatLoading: (loading: boolean) => void;

  // Theme
  themeId: string;
  setThemeId: (themeId: string) => void;

  // Settings
  settings: Settings;
  setSettings: (settings: Partial<Settings>) => void;

  // UI state
  isGenerating: boolean;
  setIsGenerating: (isGenerating: boolean) => void;

  isOptimizing: boolean;
  setIsOptimizing: (isOptimizing: boolean) => void;

  // Loading states for different operations
  loadingState: {
    rendering: boolean;
    exporting: boolean;
    validating: boolean;
    themeChanging: boolean;
  };
  setLoadingState: (key: keyof AppState['loadingState'], value: boolean) => void;

  error: string | null;
  setError: (error: string | null) => void;

  // Enhanced error system
  errorInfo: ErrorInfo | null;
  setErrorInfo: (error: ErrorInfo | null) => void;
  clearError: () => void;

  // Settings modal
  showSettings: boolean;
  setShowSettings: (show: boolean) => void;

  // Active tab
  activeTab: 'prompt' | 'code';
  setActiveTab: (tab: 'prompt' | 'code') => void;

  // Unread code indicator
  hasUnreadCode: boolean;
  setHasUnreadCode: (hasUnread: boolean) => void;
  markCodeAsRead: () => void;

  // AI Suggestions (代码优化建议)
  suggestions: Suggestion[];
  setSuggestions: (suggestions: Suggestion[]) => void;
  isLoadingSuggestions: boolean;
  setIsLoadingSuggestions: (loading: boolean) => void;
  lastGeneratedPrompt: string;
  setLastGeneratedPrompt: (prompt: string) => void;

  // Chat Suggestions (对话候选追问)
  chatSuggestions: string[];
  setChatSuggestions: (suggestions: string[]) => void;
  isLoadingChatSuggestions: boolean;
  setIsLoadingChatSuggestions: (loading: boolean) => void;

  // Diagram Reference (图表引用) - 支持多选
  isReferenceMode: boolean;
  setIsReferenceMode: (mode: boolean) => void;
  pendingReferences: DiagramReference[];
  addPendingReference: (ref: DiagramReference) => void;
  removePendingReference: (nodeId: string) => void;
  setPendingReferences: (refs: DiagramReference[]) => void;
  clearPendingReferences: () => void;

  // Keyboard shortcut triggers (increment to trigger action)
  triggerGenerate: number;
  triggerDownloadSVG: number;
  triggerDownloadPNG: number;
  triggerCopyMarkdown: number;
  triggerZoomIn: number;
  triggerZoomOut: number;
  triggerResetZoom: number;
  triggerUndo: number;
  triggerRedo: number;

  // Trigger functions
  doTriggerGenerate: () => void;
  doTriggerDownloadSVG: () => void;
  doTriggerDownloadPNG: () => void;
  doTriggerCopyMarkdown: () => void;
  doTriggerZoomIn: () => void;
  doTriggerZoomOut: () => void;
  doTriggerResetZoom: () => void;
  doTriggerUndo: () => void;
  doTriggerRedo: () => void;
}

const DEFAULT_MERMAID = `graph TD
    A[开始] --> B{是否有想法?}
    B -->|是| C[输入自然语言描述]
    B -->|否| D[查看示例]
    C --> E[AI 生成 Mermaid 代码]
    D --> C
    E --> F[预览图表]
    F --> G{满意吗?}
    G -->|是| H[导出使用]
    G -->|否| C`;

// 历史记录最大长度（避免内存溢出）
const MAX_HISTORY_LENGTH = 50;

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Locale / i18n
      locale: 'zh' as Locale,
      setLocale: (locale: Locale) => set({ locale, t: translations[locale] }),
      t: translations['zh'],
      tf: (text: string, params: Record<string, string | number>) => formatTranslation(text, params),

      // Dark mode
      darkMode: 'system',
      setDarkMode: (darkMode) => set({ darkMode }),

      // Onboarding
      hasCompletedOnboarding: false,
      completeOnboarding: () => set({ hasCompletedOnboarding: true }),
      resetOnboarding: () => set({ hasCompletedOnboarding: false }),

      code: DEFAULT_MERMAID,
      setCode: (code, options) =>
        set((state) => {
          // 如果代码没有变化，不记录历史
          if (code === state.code) {
            return {};
          }

          // 如果指定跳过历史记录（如撤销/重做操作）
          if (options?.skipHistory) {
            return { code };
          }

          // 记录当前代码到历史
          const newPast = [...state.history.past, state.code];
          
          // 限制历史记录长度
          if (newPast.length > MAX_HISTORY_LENGTH) {
            newPast.shift(); // 移除最旧的记录
          }

          return {
            code,
            history: {
              past: newPast,
              future: [], // 新的修改会清空 future
            },
            canUndo: true,
            canRedo: false,
          };
        }),

      // History (Undo/Redo)
      history: {
        past: [],
        future: [],
      },
      canUndo: false,
      canRedo: false,

      undo: () =>
        set((state) => {
          if (state.history.past.length === 0) {
            return state;
          }

          const previous = state.history.past[state.history.past.length - 1];
          const newPast = state.history.past.slice(0, -1);
          const newFuture = [state.code, ...state.history.future];

          return {
            code: previous,
            history: {
              past: newPast,
              future: newFuture,
            },
            canUndo: newPast.length > 0,
            canRedo: true,
          };
        }),

      redo: () =>
        set((state) => {
          if (state.history.future.length === 0) {
            return state;
          }

          const next = state.history.future[0];
          const newFuture = state.history.future.slice(1);
          const newPast = [...state.history.past, state.code];

          return {
            code: next,
            history: {
              past: newPast,
              future: newFuture,
            },
            canUndo: true,
            canRedo: newFuture.length > 0,
          };
        }),

      prompt: '',
      setPrompt: (prompt) => set({ prompt }),

      // Chat messages
      chatMessages: [],
      addChatMessage: (message) =>
        set((state) => {
          // 使用统一的 ID 生成函数，确保唯一性
          const id = generateUniqueId('msg', state.chatMessages.length);
          return {
            chatMessages: [
              ...state.chatMessages,
              {
                ...message,
                id,
                timestamp: Date.now(),
              },
            ],
          };
        }),
      clearChatMessages: () => set({ chatMessages: [] }),
      isChatLoading: false,
      setIsChatLoading: (isChatLoading) => set({ isChatLoading }),

      themeId: 'default',
      setThemeId: (themeId) => set({ themeId }),

      settings: {
        apiKey: '',
        baseUrl: 'https://api.deepseek.com',
        model: 'deepseek-chat',
      },
      setSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),

      isGenerating: false,
      setIsGenerating: (isGenerating) => set({ isGenerating }),

      isOptimizing: false,
      setIsOptimizing: (isOptimizing) => set({ isOptimizing }),

      // Loading states
      loadingState: {
        rendering: false,
        exporting: false,
        validating: false,
        themeChanging: false,
      },
      setLoadingState: (key, value) =>
        set((state) => ({
          loadingState: { ...state.loadingState, [key]: value },
        })),

      error: null,
      setError: (error) => set({ error }),

      // Enhanced error system
      errorInfo: null,
      setErrorInfo: (errorInfo) => set({ errorInfo }),
      clearError: () => set({ errorInfo: null, error: null }),

      showSettings: false,
      setShowSettings: (showSettings) => set({ showSettings }),

      activeTab: 'prompt',
      setActiveTab: (activeTab) => set({ activeTab }),

      // Unread code indicator
      hasUnreadCode: false,
      setHasUnreadCode: (hasUnreadCode) => set({ hasUnreadCode }),
      markCodeAsRead: () => set({ hasUnreadCode: false }),

      // AI Suggestions (代码优化建议)
      suggestions: [],
      setSuggestions: (suggestions) => set({ suggestions }),
      isLoadingSuggestions: false,
      setIsLoadingSuggestions: (isLoadingSuggestions) => set({ isLoadingSuggestions }),
      lastGeneratedPrompt: '',
      setLastGeneratedPrompt: (lastGeneratedPrompt) => set({ lastGeneratedPrompt }),

      // Chat Suggestions (对话候选追问)
      chatSuggestions: [],
      setChatSuggestions: (chatSuggestions) => set({ chatSuggestions }),
      isLoadingChatSuggestions: false,
      setIsLoadingChatSuggestions: (isLoadingChatSuggestions) => set({ isLoadingChatSuggestions }),

      // Diagram Reference (图表引用) - 支持多选
      isReferenceMode: false,
      setIsReferenceMode: (isReferenceMode) => set({ isReferenceMode }),
      pendingReferences: [],
      addPendingReference: (ref) =>
        set((state) => {
          // 避免重复添加相同节点
          if (state.pendingReferences.some((r) => r.nodeId === ref.nodeId)) {
            return state;
          }
          return { pendingReferences: [...state.pendingReferences, ref] };
        }),
      removePendingReference: (nodeId) =>
        set((state) => ({
          pendingReferences: state.pendingReferences.filter((r) => r.nodeId !== nodeId),
        })),
      setPendingReferences: (pendingReferences) => set({ pendingReferences }),
      clearPendingReferences: () => set({ pendingReferences: [] }),

      // Triggers for keyboard shortcuts
      triggerGenerate: 0,
      triggerDownloadSVG: 0,
      triggerDownloadPNG: 0,
      triggerCopyMarkdown: 0,
      triggerZoomIn: 0,
      triggerZoomOut: 0,
      triggerResetZoom: 0,
      triggerUndo: 0,
      triggerRedo: 0,

      doTriggerGenerate: () => set((state) => ({ triggerGenerate: state.triggerGenerate + 1 })),
      doTriggerDownloadSVG: () => set((state) => ({ triggerDownloadSVG: state.triggerDownloadSVG + 1 })),
      doTriggerDownloadPNG: () => set((state) => ({ triggerDownloadPNG: state.triggerDownloadPNG + 1 })),
      doTriggerCopyMarkdown: () => set((state) => ({ triggerCopyMarkdown: state.triggerCopyMarkdown + 1 })),
      doTriggerZoomIn: () => set((state) => ({ triggerZoomIn: state.triggerZoomIn + 1 })),
      doTriggerZoomOut: () => set((state) => ({ triggerZoomOut: state.triggerZoomOut + 1 })),
      doTriggerResetZoom: () => set((state) => ({ triggerResetZoom: state.triggerResetZoom + 1 })),
      doTriggerUndo: () => set((state) => ({ triggerUndo: state.triggerUndo + 1 })),
      doTriggerRedo: () => set((state) => ({ triggerRedo: state.triggerRedo + 1 })),
    }),
    {
      name: 'vibe-mermaid-storage',
      partialize: (state) => ({
        settings: state.settings,
        code: state.code,
        themeId: state.themeId,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        locale: state.locale,
        darkMode: state.darkMode,
      }),
      onRehydrateStorage: () => (state) => {
        // 恢复状态后更新翻译对象
        if (state?.locale) {
          state.t = translations[state.locale];
        }
      },
    }
  )
);
