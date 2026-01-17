'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { useShallow } from 'zustand/react/shallow';

type TestingState = 'input' | 'testing' | 'success' | 'error';

export default function Onboarding() {
  // Optimized selectors - Group 1: Settings data
  const settings = useAppStore((state) => state.settings);
  
  // Group 2: Actions (stable references)
  const setSettings = useAppStore((state) => state.setSettings);
  const completeOnboarding = useAppStore((state) => state.completeOnboarding);
  
  // Group 3: i18n (rarely changes)
  const { t, tf, locale, setLocale } = useAppStore(
    useShallow((state) => ({ t: state.t, tf: state.tf, locale: state.locale, setLocale: state.setLocale }))
  );
  
  const [localSettings, setLocalSettings] = useState(settings);
  const [isAnimating, setIsAnimating] = useState(true);
  const [testingState, setTestingState] = useState<TestingState>('input');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setIsAnimating(false), 100);
    return () => clearTimeout(timer);
  }, []);

  const presets = useMemo(() => [
    {
      name: t.providers.deepseek,
      description: t.providers.deepseekDesc,
      baseUrl: 'https://api.deepseek.com',
      model: 'deepseek-chat',
      models: ['deepseek-chat', 'deepseek-reasoner', 'deepseek-coder'],
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      name: t.providers.siliconflow,
      description: t.providers.siliconflowDesc,
      baseUrl: 'https://api.siliconflow.cn/v1',
      model: 'deepseek-ai/DeepSeek-V3',
      models: [
        'deepseek-ai/DeepSeek-V3',
        'deepseek-ai/DeepSeek-R1',
        'Qwen/Qwen2.5-72B-Instruct',
        'THUDM/glm-4-9b-chat',
      ],
      gradient: 'from-emerald-500 to-teal-500',
    },
    {
      name: t.providers.volcEngine,
      description: t.providers.volcEngineDesc,
      baseUrl: 'https://ark.cn-beijing.volces.com/api/v3',
      model: 'doubao-seed-1-6-251015',
      models: ['doubao-seed-1-6-251015', 'doubao-1-5-pro-32k-250115', 'doubao-1-5-pro-256k-250115', 'doubao-1-5-lite-32k-250115'],
      gradient: 'from-orange-500 to-red-500',
    },
    {
      name: t.providers.zhipu,
      description: t.providers.zhipuDesc,
      baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
      model: 'glm-4-flash',
      models: ['glm-4-flash', 'glm-4-plus', 'glm-4-air', 'glm-4-long', 'glm-4-flashx', 'glm-4v-flash'],
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      name: t.providers.kimi,
      description: t.providers.kimiDesc,
      baseUrl: 'https://api.moonshot.cn/v1',
      model: 'kimi-k2-0711-preview',
      models: ['kimi-k2-0711-preview', 'moonshot-v1-8k', 'moonshot-v1-32k', 'moonshot-v1-128k'],
      gradient: 'from-indigo-500 to-purple-500',
    },
    {
      name: t.providers.qwen,
      description: t.providers.qwenDesc,
      baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
      model: 'qwen-plus',
      models: ['qwen-plus', 'qwen-max', 'qwen-turbo', 'qwen-long', 'qwq-32b-preview'],
      gradient: 'from-cyan-500 to-teal-500',
    },
    {
      name: t.providers.openai,
      description: t.providers.openaiDesc,
      baseUrl: 'https://api.openai.com/v1',
      model: 'gpt-4.1-mini',
      models: ['gpt-4.1-mini', 'gpt-4.1', 'gpt-4.1-nano', 'gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'o1-mini', 'o1-preview'],
      gradient: 'from-emerald-500 to-green-500',
    },
    {
      name: t.providers.anthropic,
      description: t.providers.anthropicDesc,
      baseUrl: 'https://api.anthropic.com/v1',
      model: 'claude-sonnet-4-5-20250929',
      models: ['claude-sonnet-4-5-20250929', 'claude-opus-4-1-20250805', 'claude-haiku-4-5-20251015', 'claude-3-7-sonnet-20250224', 'claude-3-5-sonnet-20241022'],
      gradient: 'from-amber-500 to-orange-500',
    },
    {
      name: t.providers.openrouter,
      description: t.providers.openrouterDesc,
      baseUrl: 'https://openrouter.ai/api/v1',
      model: 'anthropic/claude-sonnet-4.5',
      models: ['anthropic/claude-sonnet-4.5', 'openai/gpt-4.1', 'google/gemini-2.5-flash', 'deepseek/deepseek-v3.2', 'meta-llama/llama-3.3-70b'],
      gradient: 'from-rose-500 to-pink-500',
    },
    {
      name: t.providers.google,
      description: t.providers.googleDesc,
      baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',
      model: 'gemini-3-flash-preview',
      models: ['gemini-3-flash-preview', 'gemini-3-pro-preview', 'gemini-2.0-flash-exp', 'gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-1.5-flash-8b'],
      gradient: 'from-blue-500 to-indigo-500',
    },
  ], [t.providers]);

  const features = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      title: t.onboarding.feature1Title,
      description: t.onboarding.feature1Desc,
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      title: t.onboarding.feature2Title,
      description: t.onboarding.feature2Desc,
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      title: t.onboarding.feature3Title,
      description: t.onboarding.feature3Desc,
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      ),
      title: t.onboarding.feature4Title,
      description: t.onboarding.feature4Desc,
    },
  ];

  const handleStart = async () => {
    if (!localSettings.apiKey) return;

    setTestingState('testing');
    setErrorMessage('');

    try {
      const response = await fetch('/api/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: localSettings.apiKey,
          baseUrl: localSettings.baseUrl,
          model: localSettings.model,
          locale,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setTestingState('success');
        setSettings(localSettings);

        // 成功后延迟 1.5 秒进入主界面
        setTimeout(() => {
          completeOnboarding();
        }, 1500);
      } else {
        setTestingState('error');
        setErrorMessage(result.error || t.onboarding.connectionTestFailed);
      }
    } catch {
      setTestingState('error');
      setErrorMessage(t.onboarding.networkError);
    }
  };

  const handleRetry = () => {
    handleStart();
  };

  const handleBack = () => {
    setTestingState('input');
    setErrorMessage('');
  };

  const selectedPreset = useMemo(
    () => presets.find(p => p.baseUrl === localSettings.baseUrl),
    [presets, localSettings.baseUrl]
  );

  return (
    <div className={`fixed inset-0 z-50 overflow-hidden transition-opacity duration-500 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        {/* Gradient Orbs */}
        <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-cyan-500/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-teal-500/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-emerald-500/10 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '2s' }} />

        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '100px 100px',
          }}
        />

        {/* Floating Particles - decorative only */}
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/20 rounded-full animate-float"
              style={{
                left: `${(i * 7) % 100}%`,
                top: `${(i * 11) % 100}%`,
                animationDelay: `${(i * 0.5) % 5}s`,
                animationDuration: `${8 + (i % 5)}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 h-full overflow-y-auto">
        <div className="min-h-full flex flex-col">
          {/* Language Switch - Fixed Position */}
          <div className="fixed top-6 right-6 z-20">
            <button
              onClick={() => setLocale(locale === 'zh' ? 'en' : 'zh')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 hover:border-white/30 text-white transition-all duration-200 shadow-lg hover:shadow-xl"
              title={locale === 'zh' ? 'Switch to English' : '切换到中文'}
              aria-label={locale === 'zh' ? '切换语言为英文' : 'Switch language to Chinese'}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">{locale === 'zh' ? '中文' : 'English'}</span>
            </button>
          </div>

          {/* Hero Section */}
          <section className="flex-shrink-0 pt-16 pb-12 px-6">
            <div className="max-w-6xl mx-auto text-center">
              {/* Logo */}
              <div className="inline-flex items-center justify-center w-20 h-20 mb-8 rounded-3xl bg-gradient-to-br from-cyan-500 to-teal-500 shadow-2xl shadow-cyan-500/30">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                </svg>
              </div>

              {/* Title */}
              <h1 className="text-5xl md:text-7xl font-bold mb-6">
                <span className="bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 bg-clip-text text-transparent animate-gradient-x">
                  Vibe Mermaid
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-4 leading-relaxed">
                {t.onboarding.subtitle1}
                <br className="hidden md:block" />
                <span className="text-white font-medium">{t.onboarding.subtitle2}</span>
              </p>

              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-sm text-gray-400">{t.onboarding.badge}</span>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="flex-shrink-0 py-12 px-6">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="group relative p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="w-14 h-14 mb-4 rounded-xl bg-gradient-to-br from-cyan-500/20 to-teal-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform duration-300">
                      {feature.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Configuration Section */}
          <section className="flex-1 py-12 px-6">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-10">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{t.onboarding.configTitle}</h2>
                <p className="text-gray-400 text-lg">{t.onboarding.configSubtitle}</p>
              </div>

              <div className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-3xl p-8 space-y-8">
                {/* Input State - Configuration Form */}
                {testingState === 'input' && (
                  <>
                    {/* Provider Selection */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-4">
                        <span className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 text-xs font-bold">1</span>
                        {t.onboarding.selectProvider}
                      </label>
                      <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
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
                            className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${
                              localSettings.baseUrl === preset.baseUrl
                                ? 'border-cyan-500 bg-cyan-500/10'
                                : 'border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10'
                            }`}
                          >
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${preset.gradient} flex items-center justify-center`}>
                              <span className="text-white text-xs font-bold">{preset.name.slice(0, 2)}</span>
                            </div>
                            <span className={`text-xs font-medium text-center leading-tight ${
                              localSettings.baseUrl === preset.baseUrl ? 'text-cyan-400' : 'text-gray-400'
                            }`}>
                              {preset.name}
                            </span>
                            {localSettings.baseUrl === preset.baseUrl && (
                              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-cyan-500 flex items-center justify-center">
                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* API Key Input */}
                    <div>
                      <label htmlFor="onboarding-api-key" className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-4">
                        <span className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 text-xs font-bold">2</span>
                        {t.onboarding.enterApiKey}
                        <span className="ml-1 text-red-400 text-xs">{t.common.required}</span>
                      </label>
                      <div className="relative">
                        <input
                          id="onboarding-api-key"
                          type="password"
                          value={localSettings.apiKey}
                          onChange={(e) =>
                            setLocalSettings({ ...localSettings, apiKey: e.target.value })
                          }
                          placeholder={tf(t.onboarding.apiKeyPlaceholder, { provider: selectedPreset?.name || '' })}
                          className="w-full pl-5 pr-12 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all duration-200 text-lg"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                          <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Advanced Options */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="onboarding-base-url" className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-3">
                          <span className="w-6 h-6 rounded-full bg-gray-500/20 flex items-center justify-center text-gray-400 text-xs font-bold">3</span>
                          API Base URL
                        </label>
                        <input
                          id="onboarding-base-url"
                          type="text"
                          value={localSettings.baseUrl}
                          onChange={(e) =>
                            setLocalSettings({ ...localSettings, baseUrl: e.target.value })
                          }
                          className="w-full px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all duration-200"
                        />
                      </div>
                      <div>
                        <label htmlFor="onboarding-model" className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-3">
                          <span className="w-6 h-6 rounded-full bg-gray-500/20 flex items-center justify-center text-gray-400 text-xs font-bold">4</span>
                          {t.settings.modelName}
                        </label>
                        <input
                          id="onboarding-model"
                          type="text"
                          list="onboarding-model-list"
                          value={localSettings.model}
                          onChange={(e) =>
                            setLocalSettings({ ...localSettings, model: e.target.value })
                          }
                          className="w-full px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all duration-200"
                        />
                        <datalist id="onboarding-model-list">
                          {selectedPreset?.models?.map((model) => (
                            <option key={model} value={model} />
                          ))}
                        </datalist>
                      </div>
                    </div>

                    {/* Privacy Notice */}
                    <div className="flex items-start gap-4 p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                        <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-emerald-300 mb-1">{t.onboarding.privacyTitle}</p>
                        <p className="text-sm text-emerald-300/70 leading-relaxed">
                          {t.onboarding.privacyDesc}
                        </p>
                      </div>
                    </div>

                    {/* Start Button */}
                    <div className="space-y-2">
                      <button
                        onClick={handleStart}
                        disabled={!localSettings.apiKey}
                        aria-disabled={!localSettings.apiKey}
                        className="w-full py-5 rounded-xl text-lg font-semibold text-white bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 shadow-2xl shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-cyan-500/30 disabled:from-gray-600 disabled:to-gray-600 disabled:shadow-none flex items-center justify-center gap-3"
                      >
                        <span>{t.onboarding.startButton}</span>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </button>
                      {!localSettings.apiKey && (
                        <p className="text-center text-sm text-amber-400/80">{t.onboarding.enterApiKeyToContinue}</p>
                      )}
                    </div>
                  </>
                )}

                {/* Testing State - Pulse Ring Animation */}
                {testingState === 'testing' && (
                  <div className="flex flex-col items-center justify-center py-12 space-y-6">
                    {/* Pulse Ring Animation */}
                    <div className="relative w-24 h-24">
                      {/* Outer pulse */}
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 opacity-20 animate-ping" />
                      {/* Middle pulse (delayed) */}
                      <div
                        className="absolute inset-2 rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 opacity-30 animate-ping"
                        style={{ animationDelay: '0.2s' }}
                      />
                      {/* Inner spinning ring */}
                      <div className="absolute inset-4 rounded-full border-4 border-transparent border-t-cyan-500 border-r-teal-500 animate-spin" />
                      {/* Center dot */}
                      <div className="absolute inset-8 rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 animate-pulse" />
                    </div>

                    {/* Testing text */}
                    <div className="text-center">
                      <p className="text-lg font-medium text-white mb-2">
                        {t.onboarding.testingConnection}
                      </p>
                      <p className="text-sm text-gray-400">
                        {localSettings.baseUrl}
                      </p>
                    </div>
                  </div>
                )}

                {/* Success State */}
                {testingState === 'success' && (
                  <div className="flex flex-col items-center justify-center py-12 space-y-6">
                    {/* Success animation */}
                    <div className="relative w-24 h-24">
                      {/* Success glow */}
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 opacity-20 animate-pulse" />
                      {/* Success circle */}
                      <div className="absolute inset-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center">
                        {/* Checkmark icon */}
                        <svg
                          className="w-12 h-12 text-white animate-scale-in"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                    </div>

                    {/* Success text */}
                    <div className="text-center">
                      <p className="text-xl font-semibold text-emerald-400 mb-2">
                        {t.onboarding.connectionSuccess}
                      </p>
                      <p className="text-sm text-gray-400">
                        {t.onboarding.connectionSuccessDesc}
                      </p>
                    </div>
                  </div>
                )}

                {/* Error State */}
                {testingState === 'error' && (
                  <div className="flex flex-col items-center justify-center py-8 space-y-6">
                    {/* Error icon */}
                    <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center">
                      <svg
                        className="w-10 h-10 text-red-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                    </div>

                    {/* Error message */}
                    <div className="text-center max-w-md">
                      <p className="text-lg font-medium text-red-400 mb-2">
                        {t.onboarding.connectionTestFailed}
                      </p>
                      <p className="text-sm text-gray-400 mb-6">
                        {errorMessage}
                      </p>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-4">
                      <button
                        onClick={handleBack}
                        className="px-6 py-3 rounded-xl text-sm font-medium text-gray-300 bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-200"
                      >
                        {t.onboarding.changeSettings}
                      </button>
                      <button
                        onClick={handleRetry}
                        className="px-6 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 shadow-lg shadow-cyan-500/30 transition-all duration-200 flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        {t.onboarding.retryButton}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="flex-shrink-0 py-8 px-6 border-t border-white/5">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-sm text-gray-500">
                {t.onboarding.footer}
              </p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
