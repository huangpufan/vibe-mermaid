import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from '@/lib/store';
import { translations } from '@/lib/i18n';

describe('用户工作流集成测试', () => {
  beforeEach(() => {
    // 重置 store 到初始状态
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
    });
  });

  describe('新用户引导流程', () => {
    it('新用户应该看到引导页', () => {
      const { hasCompletedOnboarding } = useAppStore.getState();
      expect(hasCompletedOnboarding).toBe(false);
    });

    it('配置 API 后应该能完成引导', () => {
      const { setSettings, completeOnboarding } = useAppStore.getState();

      // 用户配置 API
      setSettings({
        apiKey: 'test-api-key',
        baseUrl: 'https://api.deepseek.com',
        model: 'deepseek-chat',
      });

      // 完成引导
      completeOnboarding();

      const state = useAppStore.getState();
      expect(state.hasCompletedOnboarding).toBe(true);
      expect(state.settings.apiKey).toBe('test-api-key');
    });
  });

  describe('对话生成图表流程', () => {
    beforeEach(() => {
      const { setSettings, completeOnboarding } = useAppStore.getState();
      setSettings({ apiKey: 'test-key' });
      completeOnboarding();
    });

    it('用户发送消息后应该添加到聊天记录', () => {
      const { addChatMessage } = useAppStore.getState();

      addChatMessage({ role: 'user', content: '画一个登录流程图' });

      const { chatMessages } = useAppStore.getState();
      expect(chatMessages).toHaveLength(1);
      expect(chatMessages[0].role).toBe('user');
      expect(chatMessages[0].content).toBe('画一个登录流程图');
    });

    it('AI 回复后应该添加到聊天记录', () => {
      const { addChatMessage } = useAppStore.getState();

      addChatMessage({ role: 'user', content: '画一个登录流程图' });
      addChatMessage({
        role: 'assistant',
        content: '好的，这是登录流程图',
        mermaidCode: 'graph TD\n  A[开始] --> B[输入用户名]',
      });

      const { chatMessages } = useAppStore.getState();
      expect(chatMessages).toHaveLength(2);
      expect(chatMessages[1].mermaidCode).toBeDefined();
    });

    it('生成代码后应该更新主代码区', () => {
      const { setCode, setHasUnreadCode } = useAppStore.getState();

      const generatedCode = 'graph TD\n  A --> B';
      setCode(generatedCode);
      setHasUnreadCode(true);

      const state = useAppStore.getState();
      expect(state.code).toBe(generatedCode);
      expect(state.hasUnreadCode).toBe(true);
    });

    it('切换到代码标签后应该标记为已读', () => {
      const { setCode, setHasUnreadCode, setActiveTab, markCodeAsRead } = useAppStore.getState();

      setCode('graph TD\n  A --> B');
      setHasUnreadCode(true);
      setActiveTab('code');
      markCodeAsRead();

      const state = useAppStore.getState();
      expect(state.activeTab).toBe('code');
      expect(state.hasUnreadCode).toBe(false);
    });
  });

  describe('图表引用流程', () => {
    beforeEach(() => {
      const { setSettings, completeOnboarding, setCode } = useAppStore.getState();
      setSettings({ apiKey: 'test-key' });
      completeOnboarding();
      setCode('graph TD\n  A[开始] --> B[处理] --> C[结束]');
    });

    it('进入引用模式', () => {
      const { setIsReferenceMode } = useAppStore.getState();

      setIsReferenceMode(true);

      expect(useAppStore.getState().isReferenceMode).toBe(true);
    });

    it('选择节点添加引用', () => {
      const { setIsReferenceMode, addPendingReference } = useAppStore.getState();

      setIsReferenceMode(true);
      addPendingReference({ nodeId: 'node-A', nodeText: '开始' });
      addPendingReference({ nodeId: 'node-B', nodeText: '处理' });

      const { pendingReferences } = useAppStore.getState();
      expect(pendingReferences).toHaveLength(2);
    });

    it('发送带引用的消息', () => {
      const { addPendingReference, addChatMessage, clearPendingReferences } = useAppStore.getState();

      // 添加引用
      addPendingReference({ nodeId: 'node-A', nodeText: '开始' });

      // 发送消息（模拟）
      addChatMessage({
        role: 'user',
        content: '@[开始] 把这个节点改成"启动"',
      });

      // 清除引用
      clearPendingReferences();

      const state = useAppStore.getState();
      expect(state.chatMessages).toHaveLength(1);
      expect(state.pendingReferences).toHaveLength(0);
    });
  });

  describe('主题切换流程', () => {
    it('切换主题应该更新 themeId', () => {
      const { setThemeId } = useAppStore.getState();

      setThemeId('dark');
      expect(useAppStore.getState().themeId).toBe('dark');

      setThemeId('forest');
      expect(useAppStore.getState().themeId).toBe('forest');
    });
  });

  describe('语言切换流程', () => {
    it('切换到英文', () => {
      const { setLocale } = useAppStore.getState();

      setLocale('en');

      const state = useAppStore.getState();
      expect(state.locale).toBe('en');
      expect(state.t.common.cancel).toBe('Cancel');
    });

    it('切换回中文', () => {
      const { setLocale } = useAppStore.getState();

      setLocale('en');
      setLocale('zh');

      const state = useAppStore.getState();
      expect(state.locale).toBe('zh');
      expect(state.t.common.cancel).toBe('取消');
    });
  });

  describe('AI 建议流程', () => {
    beforeEach(() => {
      const { setSettings, completeOnboarding, setCode } = useAppStore.getState();
      setSettings({ apiKey: 'test-key' });
      completeOnboarding();
      setCode('graph TD\n  A --> B');
    });

    it('加载建议状态', () => {
      const { setIsLoadingSuggestions } = useAppStore.getState();

      setIsLoadingSuggestions(true);
      expect(useAppStore.getState().isLoadingSuggestions).toBe(true);

      setIsLoadingSuggestions(false);
      expect(useAppStore.getState().isLoadingSuggestions).toBe(false);
    });

    it('设置建议列表', () => {
      const { setSuggestions } = useAppStore.getState();

      const suggestions = [
        { title: '添加颜色', description: '为节点添加颜色', code: 'graph TD\n  A:::green --> B' },
        { title: '添加注释', description: '添加说明', code: 'graph TD\n  A --> B\n  %% 注释' },
      ];

      setSuggestions(suggestions);

      expect(useAppStore.getState().suggestions).toHaveLength(2);
    });

    it('应用建议后更新代码', () => {
      const { setSuggestions, setCode, setActiveTab, markCodeAsRead } = useAppStore.getState();

      const suggestions = [
        { title: '添加颜色', description: '为节点添加颜色', code: 'graph TD\n  A:::green --> B' },
      ];

      setSuggestions(suggestions);

      // 应用建议
      setCode(suggestions[0].code);
      setActiveTab('code');
      markCodeAsRead();
      setSuggestions([]);

      const state = useAppStore.getState();
      expect(state.code).toBe('graph TD\n  A:::green --> B');
      expect(state.suggestions).toHaveLength(0);
    });
  });

  describe('聊天建议流程', () => {
    it('设置聊天建议', () => {
      const { setChatSuggestions } = useAppStore.getState();

      setChatSuggestions(['添加更多节点', '修改颜色', '调整布局']);

      expect(useAppStore.getState().chatSuggestions).toHaveLength(3);
    });

    it('点击建议后发送消息', () => {
      const { setChatSuggestions, addChatMessage } = useAppStore.getState();

      setChatSuggestions(['添加更多节点']);

      // 用户点击建议
      addChatMessage({ role: 'user', content: '添加更多节点' });
      setChatSuggestions([]);

      const state = useAppStore.getState();
      expect(state.chatMessages).toHaveLength(1);
      expect(state.chatSuggestions).toHaveLength(0);
    });
  });

  describe('错误处理流程', () => {
    it('设置错误信息', () => {
      const { setError } = useAppStore.getState();

      setError('API 调用失败');
      expect(useAppStore.getState().error).toBe('API 调用失败');
    });

    it('清除错误信息', () => {
      const { setError } = useAppStore.getState();

      setError('API 调用失败');
      setError(null);

      expect(useAppStore.getState().error).toBeNull();
    });
  });

  describe('设置弹窗流程', () => {
    it('打开设置弹窗', () => {
      const { setShowSettings } = useAppStore.getState();

      setShowSettings(true);
      expect(useAppStore.getState().showSettings).toBe(true);
    });

    it('修改设置后关闭弹窗', () => {
      const { setShowSettings, setSettings } = useAppStore.getState();

      setShowSettings(true);
      setSettings({ apiKey: 'new-key', model: 'new-model' });
      setShowSettings(false);

      const state = useAppStore.getState();
      expect(state.showSettings).toBe(false);
      expect(state.settings.apiKey).toBe('new-key');
      expect(state.settings.model).toBe('new-model');
    });
  });

  describe('清空对话流程', () => {
    it('清空所有聊天消息', () => {
      const { addChatMessage, clearChatMessages } = useAppStore.getState();

      addChatMessage({ role: 'user', content: '消息1' });
      addChatMessage({ role: 'assistant', content: '回复1' });
      addChatMessage({ role: 'user', content: '消息2' });

      clearChatMessages();

      expect(useAppStore.getState().chatMessages).toHaveLength(0);
    });
  });
});
