'use client';

import { useAppStore } from '@/lib/store';
import { useState, useEffect } from 'react';

export default function Settings() {
  // Optimized selectors - Group 1: Modal state
  const showSettings = useAppStore((state) => state.showSettings);
  
  // Group 2: Settings data
  const settings = useAppStore((state) => state.settings);
  
  // Group 3: Actions (stable references)
  const setShowSettings = useAppStore((state) => state.setShowSettings);
  const setSettings = useAppStore((state) => state.setSettings);
  
  // Group 4: i18n (rarely changes)
  const t = useAppStore((state) => state.t);
  
  const [localSettings, setLocalSettings] = useState(settings);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  if (!showSettings) return null;

  const handleSave = () => {
    setSettings(localSettings);
    setShowSettings(false);
  };

  const presets = [
    // ===== 国内供应商 =====
    {
      name: 'DeepSeek',
      description: 'DeepSeek V3',
      baseUrl: 'https://api.deepseek.com',
      model: 'deepseek-chat',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.1"/>
          <path d="M12 6v12M6 12h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
      models: ['deepseek-chat', 'deepseek-reasoner', 'deepseek-coder'],
    },
    {
      name: '硅基流动',
      description: '多模型聚合',
      baseUrl: 'https://api.siliconflow.cn/v1',
      model: 'deepseek-ai/DeepSeek-V3',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L2 19h20L12 2z" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
          <circle cx="12" cy="14" r="2" fill="currentColor"/>
        </svg>
      ),
      models: [
        'deepseek-ai/DeepSeek-V3',
        'deepseek-ai/DeepSeek-R1',
        'Qwen/Qwen2.5-72B-Instruct',
        'Qwen/Qwen2.5-Coder-32B-Instruct',
        'THUDM/glm-4.7',
        'THUDM/glm-4-9b-chat',
        'deepseek-ai/DeepSeek-R1-Distill-Qwen-7B',
      ],
    },
    {
      name: '火山引擎',
      description: '豆包大模型',
      baseUrl: 'https://ark.cn-beijing.volces.com/api/v3',
      model: 'doubao-seed-1-6-251015',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L2 7l10 5 10-5-10-5z" fill="currentColor" fillOpacity="0.2"/>
          <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      models: ['doubao-seed-1-6-251015', 'doubao-1-5-pro-32k-250115', 'doubao-1-5-pro-256k-250115', 'doubao-1-5-lite-32k-250115'],
    },
    {
      name: '智谱 AI',
      description: 'GLM-4.7',
      baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
      model: 'glm-4.7',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="3" width="18" height="18" rx="3" fill="currentColor" fillOpacity="0.1"/>
          <path d="M8 12h8M12 8v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
      models: ['glm-4.7', 'glm-4.6', 'glm-4.5', 'glm-4-flash', 'glm-4-plus', 'glm-4-air', 'glm-4-long', 'glm-4-flashx', 'glm-4v-flash'],
    },
    {
      name: 'Kimi',
      description: 'Kimi K2 Thinking',
      baseUrl: 'https://api.moonshot.cn/v1',
      model: 'kimi-k2-thinking',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.1"/>
          <circle cx="12" cy="12" r="4" fill="currentColor"/>
        </svg>
      ),
      models: ['kimi-k2-thinking', 'kimi-k2-thinking-turbo', 'kimi-k2-0905-preview', 'kimi-k2-0711-preview', 'moonshot-v1-8k', 'moonshot-v1-32k', 'moonshot-v1-128k'],
    },
    {
      name: 'MiniMax',
      description: 'MiniMax M2.1',
      baseUrl: 'https://api.minimax.chat/v1',
      model: 'minimax-m2.1',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
          <path d="M4 8h4v8H4zM10 4h4v12h-4zM16 10h4v6h-4z" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.5"/>
        </svg>
      ),
      models: ['minimax-m2.1', 'abab6.5s-chat', 'abab6.5g-chat', 'abab5.5-chat'],
    },
    {
      name: '通义千问',
      description: 'Qwen Plus',
      baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
      model: 'qwen-plus',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L4 6v6c0 5.5 3.4 10.6 8 12 4.6-1.4 8-6.5 8-12V6l-8-4z" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      models: ['qwen-plus', 'qwen-max', 'qwen-turbo', 'qwen-long', 'qwq-32b-preview'],
    },
    // ===== 国外供应商 =====
    {
      name: 'OpenAI',
      description: 'GPT-4.1 Mini',
      baseUrl: 'https://api.openai.com/v1',
      model: 'gpt-4.1-mini',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z"/>
        </svg>
      ),
      models: ['gpt-4.1-mini', 'gpt-4.1', 'gpt-4.1-nano', 'gpt-4o-mini', 'gpt-4o', 'gpt-4-turbo', 'o1-mini', 'o1-preview'],
    },
    {
      name: 'Anthropic',
      description: 'Claude Sonnet 4.5',
      baseUrl: 'https://api.anthropic.com/v1',
      model: 'claude-sonnet-4-5-20250929',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fillOpacity="0.2"/>
          <path d="M8 14l2-6h4l2 6M9 12h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
        </svg>
      ),
      models: ['claude-sonnet-4-5-20250929', 'claude-opus-4-5-20251124', 'claude-opus-4-1-20250805', 'claude-haiku-4-5-20251001', 'claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022', 'claude-3-opus-20240229'],
    },
    {
      name: 'OpenRouter',
      description: '400+ 模型聚合',
      baseUrl: 'https://openrouter.ai/api/v1',
      model: 'anthropic/claude-3.5-sonnet',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L2 7l10 5 10-5-10-5z" fill="currentColor" fillOpacity="0.2"/>
          <path d="M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M2 17l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
      models: ['anthropic/claude-3.5-sonnet', 'openai/gpt-4.1', 'openai/gpt-4o', 'google/gemini-2.5-flash', 'google/gemini-2.0-flash-exp', 'deepseek/deepseek-chat', 'meta-llama/llama-3.3-70b-instruct'],
    },
    {
      name: 'Google',
      description: 'Gemini 3 Flash',
      baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',
      model: 'gemini-3-flash-preview',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
          <path d="M12 2l3 6 6 1-4 4 1 6-6-3-6 3 1-6-4-4 6-1 3-6z" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        </svg>
      ),
      models: ['gemini-3-flash-preview', 'gemini-3-pro-preview', 'gemini-2.0-flash-exp', 'gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-1.5-flash-8b'],
    },
  ];

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && setShowSettings(false)}
    >
      <div
        className={`bg-white dark:bg-gray-900 shadow-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200 ${
          isMobile ? 'h-full' : 'rounded-2xl max-w-lg max-h-[90vh]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 via-teal-500 to-emerald-500" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
          <div className="relative px-6 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">{t.settings.title}</h2>
                  <p className="text-white/70 text-sm">{t.settings.subtitle}</p>
                </div>
              </div>
              <button
                onClick={() => setShowSettings(false)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Presets */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
              {t.settings.selectProvider}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[280px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
              {presets.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() =>
                    setLocalSettings({
                      ...localSettings,
                      baseUrl: preset.baseUrl,
                      model: preset.model,
                    })
                  }
                  aria-label={`${t.settings.selectProvider}: ${preset.name}`}
                  aria-pressed={localSettings.baseUrl === preset.baseUrl}
                  className={`group relative flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-xl border-2 transition-all duration-200 ${
                    localSettings.baseUrl === preset.baseUrl
                      ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-cyan-300 dark:hover:border-cyan-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                    localSettings.baseUrl === preset.baseUrl
                      ? 'bg-cyan-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 group-hover:text-cyan-500'
                  }`}>
                    {preset.icon}
                  </div>
                  <div className="text-center">
                    <div className={`text-xs font-medium leading-tight ${
                      localSettings.baseUrl === preset.baseUrl
                        ? 'text-cyan-700 dark:text-cyan-300'
                        : 'text-gray-900 dark:text-gray-100'
                    }`}>
                      {preset.name}
                    </div>
                    <div className="text-[10px] leading-tight truncate max-w-[80px] text-gray-500 dark:text-gray-400">
                      {preset.description}
                    </div>
                  </div>
                  {localSettings.baseUrl === preset.baseUrl && (
                    <div className="absolute top-1 right-1">
                      <svg className="w-3.5 h-3.5 text-cyan-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* API Key */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              {t.settings.apiKey}
              <span className="text-red-500 text-xs">{t.common.required}</span>
            </label>
            <div className="relative">
              <input
                type="password"
                value={localSettings.apiKey}
                onChange={(e) =>
                  setLocalSettings({ ...localSettings, apiKey: e.target.value })
                }
                placeholder={t.settings.apiKeyPlaceholder}
                className="w-full pl-4 pr-10 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:border-cyan-500 dark:focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 dark:focus:ring-cyan-500/20 transition-all duration-200 text-gray-900 dark:text-gray-100 placeholder-gray-400"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Base URL */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
              {t.settings.baseUrl}
            </label>
            <input
              type="text"
              value={localSettings.baseUrl}
              onChange={(e) =>
                setLocalSettings({ ...localSettings, baseUrl: e.target.value })
              }
              placeholder="https://api.openai.com/v1"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:border-cyan-500 dark:focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 dark:focus:ring-cyan-500/20 transition-all duration-200 text-gray-900 dark:text-gray-100 placeholder-gray-400"
            />
          </div>

          {/* Model */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
              {t.settings.modelName}
            </label>
            <div className="relative">
              <input
                type="text"
                list="model-list"
                value={localSettings.model}
                onChange={(e) =>
                  setLocalSettings({ ...localSettings, model: e.target.value })
                }
                placeholder={t.settings.modelPlaceholder}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:border-cyan-500 dark:focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 dark:focus:ring-cyan-500/20 transition-all duration-200 text-gray-900 dark:text-gray-100 placeholder-gray-400"
              />
              <datalist id="model-list">
                {presets
                  .find((p) => p.baseUrl === localSettings.baseUrl)
                  ?.models?.map((model) => (
                    <option key={model} value={model} />
                  ))}
              </datalist>
            </div>
            <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
              {t.settings.modelHint}
            </p>
          </div>

          {/* Privacy Notice */}
          <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-xl">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <svg className="w-4 h-4 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-0.5">{t.settings.privacyTitle}</p>
              <p className="text-xs text-amber-700 dark:text-amber-300/80 leading-relaxed">
                {t.settings.privacyDesc}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end gap-3">
          <button
            onClick={() => setShowSettings(false)}
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 transition-all duration-200"
          >
            {t.common.cancel}
          </button>
          <button
            onClick={handleSave}
            disabled={!localSettings.apiKey}
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 shadow-lg shadow-cyan-500/25 hover:shadow-xl hover:shadow-cyan-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg"
          >
            {t.common.save}
          </button>
        </div>
      </div>
    </div>
  );
}
