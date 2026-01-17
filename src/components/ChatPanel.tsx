'use client';

import { useAppStore, ChatMessage } from '@/lib/store';
import { useCallback, useState, useEffect, useRef, useMemo } from 'react';
import React from 'react';
import { validateMermaidCode } from '@/lib/mermaid';
import { translations, type Locale } from '@/lib/i18n';
import { useShallow } from 'zustand/react/shallow';

// 获取快捷建议
const getQuickSuggestions = (locale: Locale) => [
  { label: translations[locale].chat.quickFlowchart, icon: '📊', prompt: translations[locale].chat.quickFlowchartPrompt },
  { label: translations[locale].chat.quickSequence, icon: '🔄', prompt: translations[locale].chat.quickSequencePrompt },
  { label: translations[locale].chat.quickClass, icon: '🏗️', prompt: translations[locale].chat.quickClassPrompt },
  { label: translations[locale].chat.quickMindmap, icon: '🧠', prompt: translations[locale].chat.quickMindmapPrompt },
];

// 检测是否为错误消息
function isErrorMessage(content: string, t: { chat: { errorOccurred?: string } }): boolean {
  const errorIndicators = [
    t.chat.errorOccurred,
    'error',
    'failed',
    '错误',
    '失败',
    'timeout',
    '超时',
    'invalid',
    '无效',
  ].filter((indicator): indicator is string => indicator !== undefined);
  
  const lowerContent = content.toLowerCase();
  return errorIndicators.some(indicator => 
    lowerContent.includes(indicator.toLowerCase())
  );
}

// 消息气泡组件 - 使用 React.memo 优化渲染性能
interface MessageBubbleProps {
  message: ChatMessage;
  suggestions?: string[];
  isLoadingSuggestions?: boolean;
  onSuggestionClick?: (suggestion: string) => void;
}

const MessageBubble = React.memo(({ message, suggestions, isLoadingSuggestions, onSuggestionClick }: MessageBubbleProps) => {
  // Optimized selector - i18n (rarely changes)
  const t = useAppStore((state) => state.t);
  const isUser = message.role === 'user';
  // 使用统一的错误检测函数
  const isError = message.role === 'assistant' && isErrorMessage(message.content, t);
  const showSuggestions = !isUser && (suggestions?.length || isLoadingSuggestions);

  return (
    <div
      className={`flex flex-col gap-2 animate-in slide-in-from-bottom-2 duration-300`}
      role="listitem"
      aria-label={isUser ? '用户消息' : 'AI助手消息'}
    >
      <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
        {/* 头像 */}
        {!isUser && (
          <div
            className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-lg ${
              isError
                ? 'bg-gradient-to-br from-red-500 to-orange-500 shadow-red-500/20'
                : 'bg-gradient-to-br from-cyan-500 to-teal-500 shadow-cyan-500/20'
            }`}
            aria-hidden="true"
          >
            {isError ? (
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            )}
          </div>
        )}

        {/* 消息内容 */}
        <div
          className={`max-w-[85%] rounded-2xl px-4 py-3 ${
            isUser
              ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-br-md'
              : isError
                ? 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-bl-md border border-red-200 dark:border-red-800'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-md border border-gray-200 dark:border-gray-700'
          }`}
        >
          <div className="text-sm leading-relaxed whitespace-pre-wrap">
            {formatMessageContent(message.content)}
          </div>

          {/* 如果生成了图表代码，显示提示 */}
          {message.mermaidCode && (
            <div className="mt-3 pt-3 border-t border-white/20 dark:border-gray-600">
              <div className="flex items-center gap-2 text-xs opacity-80">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>图表已生成，请查看右侧预览</span>
              </div>
            </div>
          )}
        </div>

        {/* 用户头像 */}
        {isUser && (
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center" aria-hidden="true">
            <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        )}
      </div>

      {/* 候选追问建议 - 显示在 assistant 消息下方 */}
      {showSuggestions && (
        <div className="ml-11">
          {isLoadingSuggestions ? (
            <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 py-1">
              <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>正在生成追问建议...</span>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {suggestions?.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => onSuggestionClick?.(suggestion)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:border-cyan-300 dark:hover:border-cyan-700 hover:bg-cyan-50/50 dark:hover:bg-cyan-900/20 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-1 dark:focus:ring-offset-gray-900"
                >
                  <svg className="w-3 h-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  // 自定义比较函数，只在必要时重新渲染
  return (
    prevProps.message.id === nextProps.message.id &&
    prevProps.message.content === nextProps.message.content &&
    prevProps.message.mermaidCode === nextProps.message.mermaidCode &&
    prevProps.suggestions === nextProps.suggestions &&
    prevProps.isLoadingSuggestions === nextProps.isLoadingSuggestions
  );
});

MessageBubble.displayName = 'MessageBubble';

// 格式化消息内容，处理 Markdown 样式
function formatMessageContent(content: string) {
  // 处理粗体
  const parts = content.split(/(\*\*[^*]+\*\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

// 打字动画组件
const TypingIndicator = () => {
  return (
    <div
      className="flex gap-3 animate-in slide-in-from-bottom-2 duration-300"
      role="status"
      aria-label="AI正在输入"
    >
      <div
        className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center shadow-lg shadow-cyan-500/20"
        aria-hidden="true"
      >
        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      </div>
      <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-bl-md px-4 py-3 border border-gray-200 dark:border-gray-700">
        <div className="flex gap-1.5" aria-hidden="true">
          <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        <span className="sr-only">AI正在思考中...</span>
      </div>
    </div>
  );
};

// 欢迎消息
const WelcomeMessage = ({ onSuggestionClick }: { onSuggestionClick: (prompt: string) => void }) => {
  // Optimized selectors - i18n (rarely changes)
  const { t, locale } = useAppStore(
    useShallow((state) => ({ t: state.t, locale: state.locale }))
  );
  const quickSuggestions = useMemo(() => getQuickSuggestions(locale), [locale]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
      {/* Logo */}
      <div
        className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center shadow-xl shadow-cyan-500/30 mb-6"
        aria-hidden="true"
      >
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      </div>

      {/* 标题 */}
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
        {t.chat.welcomeTitle}
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-xs mb-8">
        {t.chat.welcomeDesc}
      </p>

      {/* 快捷建议 */}
      <nav className="w-full max-w-sm space-y-2" aria-label={t.chat.tryThese}>
        <p className="text-xs text-gray-400 dark:text-gray-500 text-center mb-3">{t.chat.tryThese}</p>
        <div className="grid grid-cols-2 gap-2" role="list">
          {quickSuggestions.map((suggestion) => (
            <button
              key={suggestion.label}
              onClick={() => onSuggestionClick(suggestion.prompt)}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-cyan-300 dark:hover:border-cyan-700 hover:bg-cyan-50/50 dark:hover:bg-cyan-900/20 transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
              aria-label={suggestion.label}
            >
              <span className="text-lg" aria-hidden="true">{suggestion.icon}</span>
              <span className="text-sm text-gray-600 dark:text-gray-300 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                {suggestion.label}
              </span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default function ChatPanel() {
  // Optimized selectors - Group 1: Messages (main content, re-renders on message changes)
  const { chatMessages, isChatLoading } = useAppStore(
    useShallow((state) => ({
      chatMessages: state.chatMessages,
      isChatLoading: state.isChatLoading
    }))
  );
  
  // Group 2: Settings (rarely changes)
  const { apiKey, baseUrl, model } = useAppStore(
    useShallow((state) => ({
      apiKey: state.settings.apiKey,
      baseUrl: state.settings.baseUrl,
      model: state.settings.model
    }))
  );
  
  // Group 3: Suggestions (re-renders on suggestion changes)
  const { chatSuggestions, isLoadingChatSuggestions } = useAppStore(
    useShallow((state) => ({
      chatSuggestions: state.chatSuggestions,
      isLoadingChatSuggestions: state.isLoadingChatSuggestions
    }))
  );
  
  // Group 4: References (re-renders on reference changes)
  const pendingReferences = useAppStore((state) => state.pendingReferences);
  
  // Group 5: Actions (stable references, no re-renders)
  const addChatMessage = useAppStore((state) => state.addChatMessage);
  const clearChatMessages = useAppStore((state) => state.clearChatMessages);
  const setIsChatLoading = useAppStore((state) => state.setIsChatLoading);
  const setShowSettings = useAppStore((state) => state.setShowSettings);
  const setCode = useAppStore((state) => state.setCode);
  const setHasUnreadCode = useAppStore((state) => state.setHasUnreadCode);
  const setChatSuggestions = useAppStore((state) => state.setChatSuggestions);
  const setIsLoadingChatSuggestions = useAppStore((state) => state.setIsLoadingChatSuggestions);
  const removePendingReference = useAppStore((state) => state.removePendingReference);
  const clearPendingReferences = useAppStore((state) => state.clearPendingReferences);
  
  // Group 6: i18n (rarely changes)
  const { t, tf, locale } = useAppStore(
    useShallow((state) => ({ t: state.t, tf: state.tf, locale: state.locale }))
  );

  const [inputValue, setInputValue] = useState('');
  const [chatError, setChatError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // 滚动到底部 - 使用 requestAnimationFrame 优化性能
  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isChatLoading, scrollToBottom]);

  // 组件卸载时取消进行中的请求
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // 清除错误提示 - 延长到 8 秒
  useEffect(() => {
    if (chatError) {
      const timer = setTimeout(() => setChatError(null), 8000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [chatError]);

  // 获取候选追问建议
  const fetchChatSuggestions = useCallback(async (allMessages: { role: string; content: string }[]) => {
    if (!apiKey || allMessages.length < 2) return;

    setIsLoadingChatSuggestions(true);
    try {
      const response = await fetch('/api/chat-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: allMessages.slice(-6), // 只取最近 6 条消息作为上下文
          apiKey,
          baseUrl,
          model,
          locale,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.suggestions && Array.isArray(data.suggestions)) {
          setChatSuggestions(data.suggestions);
        }
      }
    } catch (err) {
      console.error('Failed to fetch chat suggestions:', err);
    } finally {
      setIsLoadingChatSuggestions(false);
    }
  }, [apiKey, baseUrl, model, locale, setChatSuggestions, setIsLoadingChatSuggestions]);

  // 发送消息
  const handleSend = useCallback(async (messageText?: string) => {
    const text = messageText || inputValue.trim();
    if (!text || isChatLoading) return;

    if (!apiKey) {
      setShowSettings(true);
      setChatError(t.chat.configApiFirst);
      return;
    }

    // 构建包含引用的消息内容
    let messageContent = text;
    const currentReferences = [...pendingReferences];
    if (currentReferences.length > 0) {
      const nodeTexts = currentReferences.map((r) => r.nodeText).join('", "');
      messageContent = `[引用图表节点: "${nodeTexts}"] ${text}`;
    }

    // 清空输入和错误，以及之前的候选建议和引用
    setInputValue('');
    setChatError(null);
    setChatSuggestions([]);
    clearPendingReferences();

    // 重置输入框高度
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }

    // 添加用户消息（显示原始文本，引用以特殊标记显示）
    const displayContent = currentReferences.length > 0
      ? `@[${currentReferences.map((r) => r.nodeText).join(', ')}] ${text}`
      : text;
    addChatMessage({ role: 'user', content: displayContent });

    // 开始加载
    setIsChatLoading(true);

    // 创建新的 AbortController
    abortControllerRef.current = new AbortController();

    try {
      // 获取当前所有消息（包括刚添加的用户消息，使用包含引用的内容）
      const allMessages = [
        ...chatMessages.map((m) => ({ role: m.role, content: m.content })),
        { role: 'user' as const, content: messageContent },
      ];

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: allMessages,
          apiKey,
          baseUrl,
          model,
          locale,
        }),
        signal: abortControllerRef.current.signal,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t.chat.chatFailed);
      }

      // 添加助手回复
      addChatMessage({
        role: 'assistant',
        content: data.reply,
        mermaidCode: data.mermaidCode,
      });

      // 如果生成了图表代码，更新主代码并验证
      if (data.mermaidCode) {
        const validation = await validateMermaidCode(data.mermaidCode);
        if (validation.valid) {
          setCode(data.mermaidCode);
          setHasUnreadCode(true);
        } else {
          // 如果验证失败，尝试修复
          try {
            const fixResponse = await fetch('/api/generate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                fix: true,
                code: data.mermaidCode,
                error: validation.error,
                apiKey,
                baseUrl,
                model,
                locale,
              }),
              signal: abortControllerRef.current.signal,
            });

            if (fixResponse.ok) {
              const fixData = await fixResponse.json();
              setCode(fixData.code);
            } else {
              setCode(data.mermaidCode);
            }
          } catch {
            // 修复失败时使用原始代码
            setCode(data.mermaidCode);
          }
          setHasUnreadCode(true);
        }
      }

      // 获取候选追问建议（后台异步执行）
      const messagesForSuggestions = [
        ...allMessages,
        { role: 'assistant' as const, content: data.reply },
      ];
      fetchChatSuggestions(messagesForSuggestions);
    } catch (err) {
      // 忽略取消请求的错误
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }

      const errorMessage = err instanceof Error ? err.message : (t.chat.unknownError || 'Unknown error');

      // 添加错误消息，使用统一格式便于识别
      const errorContent = `${t.chat.errorOccurred}: ${errorMessage}`;
      addChatMessage({
        role: 'assistant',
        content: errorContent,
      });

      setChatError(errorMessage);
    } finally {
      setIsChatLoading(false);
      abortControllerRef.current = null;
    }
  }, [inputValue, isChatLoading, apiKey, baseUrl, model, chatMessages, addChatMessage, setIsChatLoading, setShowSettings, setCode, setHasUnreadCode, setChatSuggestions, fetchChatSuggestions, pendingReferences, clearPendingReferences, locale, t.chat.chatFailed, t.chat.configApiFirst, t.chat.errorOccurred, t.chat.unknownError]);

  // 键盘事件
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  // 自动调整输入框高度
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    // 重置高度以获取正确的 scrollHeight
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
  }, []);

  const hasMessages = chatMessages.length > 0;

  // 取消正在进行的请求
  const handleCancelRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsChatLoading(false);
    }
  }, [setIsChatLoading]);

  // 清空对话的确认
  const handleClearMessages = useCallback(() => {
    if (isChatLoading) {
      handleCancelRequest();
    }
    clearChatMessages();
    setChatError(null);
  }, [isChatLoading, handleCancelRequest, clearChatMessages]);

  return (
    <div className="h-full flex flex-col bg-gray-50/50 dark:bg-gray-900/50">
      {/* 头部 */}
      <header className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${isChatLoading ? 'bg-yellow-500' : 'bg-green-500'} animate-pulse`}
            aria-hidden="true"
          />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {isChatLoading ? t.chat.aiThinking : t.chat.aiAssistant}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isChatLoading && (
            <button
              onClick={handleCancelRequest}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-gray-500 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-all duration-200"
              aria-label="取消请求"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>{t.chat.cancelRequest}</span>
            </button>
          )}
          {hasMessages && (
            <button
              onClick={handleClearMessages}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
              aria-label={t.chat.clearChat}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>{t.chat.clearChat}</span>
            </button>
          )}
        </div>
      </header>

      {/* 错误提示 */}
      {chatError && (
        <div
          className="mx-4 mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center justify-between animate-in slide-in-from-top-2 duration-200"
          role="alert"
        >
          <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{chatError}</span>
          </div>
          <button
            onClick={() => setChatError(null)}
            className="text-red-400 hover:text-red-600 dark:text-red-500 dark:hover:text-red-300"
            aria-label="关闭错误提示"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* 消息区域 */}
      <main className="flex-1 overflow-y-auto" role="log" aria-live="polite" aria-label="对话消息">
        {hasMessages ? (
          <div className="p-4 space-y-4" role="list">
            {chatMessages.map((message, index) => {
              // 找到最后一条 assistant 消息的索引
              const lastAssistantIndex = chatMessages.map((m, i) => m.role === 'assistant' ? i : -1).filter(i => i !== -1).pop();
              const isLastAssistant = message.role === 'assistant' && index === lastAssistantIndex;

              return (
                <MessageBubble
                  key={message.id}
                  message={message}
                  suggestions={isLastAssistant && !isChatLoading ? chatSuggestions : undefined}
                  isLoadingSuggestions={isLastAssistant && !isChatLoading ? isLoadingChatSuggestions : undefined}
                  onSuggestionClick={isLastAssistant ? handleSend : undefined}
                />
              );
            })}
            {isChatLoading && <TypingIndicator />}
            <div ref={messagesEndRef} aria-hidden="true" />
          </div>
        ) : (
          <WelcomeMessage onSuggestionClick={handleSend} />
        )}
      </main>

      {/* 引用卡片 - 支持多个引用 */}
      {pendingReferences.length > 0 && (
        <div className="flex-shrink-0 px-4 py-2 border-t border-gray-100 dark:border-gray-800 bg-cyan-50/50 dark:bg-cyan-900/10">
          <div className="flex items-start gap-2">
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg border border-cyan-200 dark:border-cyan-800 shadow-sm overflow-hidden">
              {/* 标题栏 */}
              <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-1.5 text-cyan-600 dark:text-cyan-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                  </svg>
                  <span className="text-xs font-medium">{t.chat.reference}</span>
                </div>
                <span className="px-1.5 py-0.5 text-xs font-medium bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300 rounded">
                  {tf(t.chat.nodeCount, { count: pendingReferences.length })}
                </span>
              </div>
              {/* 引用列表 */}
              <div className="max-h-24 overflow-y-auto">
                {pendingReferences.map((ref) => (
                  <div
                    key={ref.nodeId}
                    className="flex items-center justify-between gap-2 px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-700/50 group"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                        {ref.nodeText}
                      </span>
                      {ref.nodeType && (
                        <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">
                          ({ref.nodeType === 'decision' ? '判断' : ref.nodeType === 'event' ? '事件' : '节点'})
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => removePendingReference(ref.nodeId)}
                      className="p-1 text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                      title={t.chat.removeReference}
                      aria-label={t.chat.removeReference}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={clearPendingReferences}
              className="p-1.5 text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex-shrink-0"
              title={t.chat.clearAllReferences}
              aria-label={t.chat.clearAllReferences}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* 输入区域 */}
      <footer className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-2"
        >
          <div className="flex-1 relative">
            <label htmlFor="chat-input" className="sr-only">输入消息</label>
            <textarea
              id="chat-input"
              ref={inputRef}
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={pendingReferences.length > 0 ? tf(t.chat.inputPlaceholderWithRef, { count: pendingReferences.length }) : t.chat.inputPlaceholder}
              rows={1}
              disabled={isChatLoading}
              aria-describedby="chat-input-hint"
              className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:border-cyan-500 dark:focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 dark:focus:ring-cyan-500/20 transition-all duration-200 resize-none text-sm leading-relaxed overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ minHeight: '48px', maxHeight: '200px' }}
            />

            {/* 发送按钮 */}
            <button
              type="submit"
              disabled={!inputValue.trim() || isChatLoading}
              aria-label={isChatLoading ? '发送中' : '发送消息'}
              className="absolute right-2 bottom-2 w-8 h-8 rounded-lg bg-gradient-to-r from-cyan-500 to-teal-500 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:from-cyan-600 hover:to-teal-600 transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
            >
              {isChatLoading ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </div>
        </form>

        {/* 提示 */}
        <p id="chat-input-hint" className="mt-2 text-xs text-gray-400 dark:text-gray-500 text-center">
          {t.chat.sendHint}
        </p>
      </footer>
    </div>
  );
}
