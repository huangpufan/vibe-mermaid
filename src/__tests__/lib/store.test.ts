import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore, THEME_PRESETS } from '@/lib/store';
import { translations } from '@/lib/i18n';

describe('Zustand Store', () => {
  beforeEach(() => {
    // 重置 store 状态
    useAppStore.setState({
      locale: 'zh',
      t: translations['zh'],
      hasCompletedOnboarding: false,
      code: '',
      prompt: '',
      chatMessages: [],
      isChatLoading: false,
      themeId: 'default',
      settings: {
        apiKey: '',
        baseUrl: 'https://api.deepseek.com',
        model: 'deepseek-chat',
      },
      isGenerating: false,
      isOptimizing: false,
      error: null,
      showSettings: false,
      activeTab: 'prompt',
      hasUnreadCode: false,
      suggestions: [],
      isLoadingSuggestions: false,
      lastGeneratedPrompt: '',
      chatSuggestions: [],
      isLoadingChatSuggestions: false,
      isReferenceMode: false,
      pendingReferences: [],
      triggerGenerate: 0,
      triggerDownloadSVG: 0,
      triggerDownloadPNG: 0,
      triggerCopyMarkdown: 0,
      triggerZoomIn: 0,
      triggerZoomOut: 0,
      triggerResetZoom: 0,
    });
  });

  describe('Locale / i18n', () => {
    it('默认语言应该是中文', () => {
      const { locale } = useAppStore.getState();
      expect(locale).toBe('zh');
    });

    it('应该能够切换语言到英文', () => {
      const { setLocale } = useAppStore.getState();
      setLocale('en');
      const { locale, t } = useAppStore.getState();
      expect(locale).toBe('en');
      expect(t).toEqual(translations['en']);
    });

    it('应该能够切换语言回中文', () => {
      const { setLocale } = useAppStore.getState();
      setLocale('en');
      setLocale('zh');
      const { locale, t } = useAppStore.getState();
      expect(locale).toBe('zh');
      expect(t).toEqual(translations['zh']);
    });

    it('tf 函数应该正确格式化翻译', () => {
      const { tf } = useAppStore.getState();
      const result = tf('共 {count} 种配色方案', { count: 12 });
      expect(result).toBe('共 12 种配色方案');
    });
  });

  describe('Onboarding', () => {
    it('默认应该未完成引导', () => {
      const { hasCompletedOnboarding } = useAppStore.getState();
      expect(hasCompletedOnboarding).toBe(false);
    });

    it('应该能够完成引导', () => {
      const { completeOnboarding } = useAppStore.getState();
      completeOnboarding();
      const { hasCompletedOnboarding } = useAppStore.getState();
      expect(hasCompletedOnboarding).toBe(true);
    });

    it('应该能够重置引导状态', () => {
      const { completeOnboarding, resetOnboarding } = useAppStore.getState();
      completeOnboarding();
      resetOnboarding();
      const { hasCompletedOnboarding } = useAppStore.getState();
      expect(hasCompletedOnboarding).toBe(false);
    });
  });

  describe('Mermaid Code', () => {
    it('应该能够设置代码', () => {
      const { setCode } = useAppStore.getState();
      const testCode = 'graph TD\n  A --> B';
      setCode(testCode);
      const { code } = useAppStore.getState();
      expect(code).toBe(testCode);
    });

    it('应该能够设置空代码', () => {
      const { setCode } = useAppStore.getState();
      setCode('some code');
      setCode('');
      const { code } = useAppStore.getState();
      expect(code).toBe('');
    });
  });

  describe('Prompt', () => {
    it('应该能够设置提示词', () => {
      const { setPrompt } = useAppStore.getState();
      const testPrompt = '画一个流程图';
      setPrompt(testPrompt);
      const { prompt } = useAppStore.getState();
      expect(prompt).toBe(testPrompt);
    });
  });

  describe('Chat Messages', () => {
    it('应该能够添加聊天消息', () => {
      const { addChatMessage } = useAppStore.getState();
      addChatMessage({ role: 'user', content: 'Hello' });
      const { chatMessages } = useAppStore.getState();
      expect(chatMessages).toHaveLength(1);
      expect(chatMessages[0].role).toBe('user');
      expect(chatMessages[0].content).toBe('Hello');
      expect(chatMessages[0].id).toBeDefined();
      expect(chatMessages[0].timestamp).toBeDefined();
    });

    it('应该能够添加带 mermaidCode 的消息', () => {
      const { addChatMessage } = useAppStore.getState();
      addChatMessage({
        role: 'assistant',
        content: '这是图表',
        mermaidCode: 'graph TD\n  A --> B',
      });
      const { chatMessages } = useAppStore.getState();
      expect(chatMessages[0].mermaidCode).toBe('graph TD\n  A --> B');
    });

    it('应该能够清空聊天消息', () => {
      const { addChatMessage, clearChatMessages } = useAppStore.getState();
      addChatMessage({ role: 'user', content: 'Hello' });
      addChatMessage({ role: 'assistant', content: 'Hi' });
      clearChatMessages();
      const { chatMessages } = useAppStore.getState();
      expect(chatMessages).toHaveLength(0);
    });

    it('每条消息应该有唯一的 ID', () => {
      const { addChatMessage } = useAppStore.getState();
      addChatMessage({ role: 'user', content: 'Message 1' });
      addChatMessage({ role: 'user', content: 'Message 2' });
      addChatMessage({ role: 'user', content: 'Message 3' });
      const { chatMessages } = useAppStore.getState();
      const ids = chatMessages.map((m) => m.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('应该能够设置聊天加载状态', () => {
      const { setIsChatLoading } = useAppStore.getState();
      setIsChatLoading(true);
      expect(useAppStore.getState().isChatLoading).toBe(true);
      setIsChatLoading(false);
      expect(useAppStore.getState().isChatLoading).toBe(false);
    });
  });

  describe('Theme', () => {
    it('默认主题应该是 default', () => {
      const { themeId } = useAppStore.getState();
      expect(themeId).toBe('default');
    });

    it('应该能够切换主题', () => {
      const { setThemeId } = useAppStore.getState();
      setThemeId('forest');
      const { themeId } = useAppStore.getState();
      expect(themeId).toBe('forest');
    });

    it('THEME_PRESETS 应该包含所有预定义主题', () => {
      expect(THEME_PRESETS.length).toBeGreaterThan(0);
      const themeIds = THEME_PRESETS.map((t) => t.id);
      expect(themeIds).toContain('default');
      expect(themeIds).toContain('forest');
      expect(themeIds).toContain('dark');
      expect(themeIds).toContain('neutral');
    });

    it('每个主题应该有必要的属性', () => {
      THEME_PRESETS.forEach((theme) => {
        expect(theme).toHaveProperty('id');
        expect(theme).toHaveProperty('name');
        expect(theme).toHaveProperty('description');
        expect(theme).toHaveProperty('base');
      });
    });
  });

  describe('Settings', () => {
    it('应该有默认设置', () => {
      const { settings } = useAppStore.getState();
      expect(settings).toHaveProperty('apiKey');
      expect(settings).toHaveProperty('baseUrl');
      expect(settings).toHaveProperty('model');
    });

    it('应该能够更新部分设置', () => {
      const { setSettings } = useAppStore.getState();
      setSettings({ apiKey: 'test-key' });
      const { settings } = useAppStore.getState();
      expect(settings.apiKey).toBe('test-key');
      expect(settings.baseUrl).toBe('https://api.deepseek.com'); // 保持不变
    });

    it('应该能够更新多个设置', () => {
      const { setSettings } = useAppStore.getState();
      setSettings({
        apiKey: 'new-key',
        baseUrl: 'https://new-url.com',
        model: 'new-model',
      });
      const { settings } = useAppStore.getState();
      expect(settings.apiKey).toBe('new-key');
      expect(settings.baseUrl).toBe('https://new-url.com');
      expect(settings.model).toBe('new-model');
    });
  });

  describe('UI State', () => {
    it('应该能够设置生成状态', () => {
      const { setIsGenerating } = useAppStore.getState();
      setIsGenerating(true);
      expect(useAppStore.getState().isGenerating).toBe(true);
      setIsGenerating(false);
      expect(useAppStore.getState().isGenerating).toBe(false);
    });

    it('应该能够设置优化状态', () => {
      const { setIsOptimizing } = useAppStore.getState();
      setIsOptimizing(true);
      expect(useAppStore.getState().isOptimizing).toBe(true);
    });

    it('应该能够设置错误信息', () => {
      const { setError } = useAppStore.getState();
      setError('Test error');
      expect(useAppStore.getState().error).toBe('Test error');
      setError(null);
      expect(useAppStore.getState().error).toBeNull();
    });

    it('应该能够控制设置弹窗显示', () => {
      const { setShowSettings } = useAppStore.getState();
      setShowSettings(true);
      expect(useAppStore.getState().showSettings).toBe(true);
      setShowSettings(false);
      expect(useAppStore.getState().showSettings).toBe(false);
    });
  });

  describe('Active Tab', () => {
    it('默认标签应该是 prompt', () => {
      const { activeTab } = useAppStore.getState();
      expect(activeTab).toBe('prompt');
    });

    it('应该能够切换到 code 标签', () => {
      const { setActiveTab } = useAppStore.getState();
      setActiveTab('code');
      const { activeTab } = useAppStore.getState();
      expect(activeTab).toBe('code');
    });

    it('应该能够切换回 prompt 标签', () => {
      const { setActiveTab } = useAppStore.getState();
      setActiveTab('code');
      setActiveTab('prompt');
      const { activeTab } = useAppStore.getState();
      expect(activeTab).toBe('prompt');
    });
  });

  describe('Unread Code Indicator', () => {
    it('默认应该没有未读代码', () => {
      const { hasUnreadCode } = useAppStore.getState();
      expect(hasUnreadCode).toBe(false);
    });

    it('应该能够设置未读代码状态', () => {
      const { setHasUnreadCode } = useAppStore.getState();
      setHasUnreadCode(true);
      expect(useAppStore.getState().hasUnreadCode).toBe(true);
    });

    it('应该能够标记代码为已读', () => {
      const { setHasUnreadCode, markCodeAsRead } = useAppStore.getState();
      setHasUnreadCode(true);
      markCodeAsRead();
      expect(useAppStore.getState().hasUnreadCode).toBe(false);
    });
  });

  describe('AI Suggestions', () => {
    it('默认应该没有建议', () => {
      const { suggestions } = useAppStore.getState();
      expect(suggestions).toHaveLength(0);
    });

    it('应该能够设置建议', () => {
      const { setSuggestions } = useAppStore.getState();
      const testSuggestions = [
        { title: '建议1', description: '描述1', code: 'code1' },
        { title: '建议2', description: '描述2', code: 'code2' },
      ];
      setSuggestions(testSuggestions);
      const { suggestions } = useAppStore.getState();
      expect(suggestions).toHaveLength(2);
      expect(suggestions[0].title).toBe('建议1');
    });

    it('应该能够设置建议加载状态', () => {
      const { setIsLoadingSuggestions } = useAppStore.getState();
      setIsLoadingSuggestions(true);
      expect(useAppStore.getState().isLoadingSuggestions).toBe(true);
    });

    it('应该能够设置最后生成的提示词', () => {
      const { setLastGeneratedPrompt } = useAppStore.getState();
      setLastGeneratedPrompt('test prompt');
      expect(useAppStore.getState().lastGeneratedPrompt).toBe('test prompt');
    });
  });

  describe('Chat Suggestions', () => {
    it('默认应该没有聊天建议', () => {
      const { chatSuggestions } = useAppStore.getState();
      expect(chatSuggestions).toHaveLength(0);
    });

    it('应该能够设置聊天建议', () => {
      const { setChatSuggestions } = useAppStore.getState();
      setChatSuggestions(['建议1', '建议2', '建议3']);
      const { chatSuggestions } = useAppStore.getState();
      expect(chatSuggestions).toHaveLength(3);
    });

    it('应该能够设置聊天建议加载状态', () => {
      const { setIsLoadingChatSuggestions } = useAppStore.getState();
      setIsLoadingChatSuggestions(true);
      expect(useAppStore.getState().isLoadingChatSuggestions).toBe(true);
    });
  });

  describe('Diagram Reference', () => {
    it('默认应该不在引用模式', () => {
      const { isReferenceMode } = useAppStore.getState();
      expect(isReferenceMode).toBe(false);
    });

    it('应该能够切换引用模式', () => {
      const { setIsReferenceMode } = useAppStore.getState();
      setIsReferenceMode(true);
      expect(useAppStore.getState().isReferenceMode).toBe(true);
    });

    it('应该能够添加待处理引用', () => {
      const { addPendingReference } = useAppStore.getState();
      addPendingReference({ nodeId: 'node1', nodeText: '节点1' });
      const { pendingReferences } = useAppStore.getState();
      expect(pendingReferences).toHaveLength(1);
      expect(pendingReferences[0].nodeId).toBe('node1');
    });

    it('不应该添加重复的引用', () => {
      const { addPendingReference } = useAppStore.getState();
      addPendingReference({ nodeId: 'node1', nodeText: '节点1' });
      addPendingReference({ nodeId: 'node1', nodeText: '节点1' });
      const { pendingReferences } = useAppStore.getState();
      expect(pendingReferences).toHaveLength(1);
    });

    it('应该能够移除引用', () => {
      const { addPendingReference, removePendingReference } = useAppStore.getState();
      addPendingReference({ nodeId: 'node1', nodeText: '节点1' });
      addPendingReference({ nodeId: 'node2', nodeText: '节点2' });
      removePendingReference('node1');
      const { pendingReferences } = useAppStore.getState();
      expect(pendingReferences).toHaveLength(1);
      expect(pendingReferences[0].nodeId).toBe('node2');
    });

    it('应该能够设置引用列表', () => {
      const { setPendingReferences } = useAppStore.getState();
      setPendingReferences([
        { nodeId: 'a', nodeText: 'A' },
        { nodeId: 'b', nodeText: 'B' },
      ]);
      const { pendingReferences } = useAppStore.getState();
      expect(pendingReferences).toHaveLength(2);
    });

    it('应该能够清空引用', () => {
      const { addPendingReference, clearPendingReferences } = useAppStore.getState();
      addPendingReference({ nodeId: 'node1', nodeText: '节点1' });
      clearPendingReferences();
      const { pendingReferences } = useAppStore.getState();
      expect(pendingReferences).toHaveLength(0);
    });
  });

  describe('Keyboard Shortcut Triggers', () => {
    it('应该能够触发生成', () => {
      const initialValue = useAppStore.getState().triggerGenerate;
      const { doTriggerGenerate } = useAppStore.getState();
      doTriggerGenerate();
      expect(useAppStore.getState().triggerGenerate).toBe(initialValue + 1);
    });

    it('应该能够触发下载 SVG', () => {
      const initialValue = useAppStore.getState().triggerDownloadSVG;
      const { doTriggerDownloadSVG } = useAppStore.getState();
      doTriggerDownloadSVG();
      expect(useAppStore.getState().triggerDownloadSVG).toBe(initialValue + 1);
    });

    it('应该能够触发下载 PNG', () => {
      const initialValue = useAppStore.getState().triggerDownloadPNG;
      const { doTriggerDownloadPNG } = useAppStore.getState();
      doTriggerDownloadPNG();
      expect(useAppStore.getState().triggerDownloadPNG).toBe(initialValue + 1);
    });

    it('应该能够触发复制 Markdown', () => {
      const initialValue = useAppStore.getState().triggerCopyMarkdown;
      const { doTriggerCopyMarkdown } = useAppStore.getState();
      doTriggerCopyMarkdown();
      expect(useAppStore.getState().triggerCopyMarkdown).toBe(initialValue + 1);
    });

    it('应该能够触发放大', () => {
      const initialValue = useAppStore.getState().triggerZoomIn;
      const { doTriggerZoomIn } = useAppStore.getState();
      doTriggerZoomIn();
      expect(useAppStore.getState().triggerZoomIn).toBe(initialValue + 1);
    });

    it('应该能够触发缩小', () => {
      const initialValue = useAppStore.getState().triggerZoomOut;
      const { doTriggerZoomOut } = useAppStore.getState();
      doTriggerZoomOut();
      expect(useAppStore.getState().triggerZoomOut).toBe(initialValue + 1);
    });

    it('应该能够触发重置缩放', () => {
      const initialValue = useAppStore.getState().triggerResetZoom;
      const { doTriggerResetZoom } = useAppStore.getState();
      doTriggerResetZoom();
      expect(useAppStore.getState().triggerResetZoom).toBe(initialValue + 1);
    });
  });
});
