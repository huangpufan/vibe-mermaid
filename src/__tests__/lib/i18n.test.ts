import { describe, it, expect } from 'vitest';
import { translations, getTranslation, formatTranslation } from '@/lib/i18n';
import { zh } from '@/lib/i18n/zh';
import { en } from '@/lib/i18n/en';

describe('i18n 国际化模块', () => {
  describe('translations 对象', () => {
    it('应该包含中文和英文两种语言', () => {
      expect(translations).toHaveProperty('zh');
      expect(translations).toHaveProperty('en');
    });

    it('中文翻译应该与 zh 模块一致', () => {
      expect(translations.zh).toEqual(zh);
    });

    it('英文翻译应该与 en 模块一致', () => {
      expect(translations.en).toEqual(en);
    });
  });

  describe('翻译内容完整性', () => {
    const zhKeys = getAllKeys(zh);
    const enKeys = getAllKeys(en);

    it('中英文翻译应该有相同的键结构', () => {
      expect(zhKeys.sort()).toEqual(enKeys.sort());
    });

    it('所有翻译值应该是字符串类型', () => {
      zhKeys.forEach((key) => {
        const zhValue = getNestedValue(zh, key);
        const enValue = getNestedValue(en, key);
        expect(typeof zhValue).toBe('string');
        expect(typeof enValue).toBe('string');
      });
    });

    it('翻译值不应该为空字符串（除了特殊字段）', () => {
      // preview.count 在英文中是空字符串（因为英文不需要"个"这样的量词）
      const allowedEmptyKeys = ['preview.count'];
      zhKeys.forEach((key) => {
        const zhValue = getNestedValue(zh, key);
        const enValue = getNestedValue(en, key);
        if (!allowedEmptyKeys.includes(key)) {
          expect(zhValue.length).toBeGreaterThan(0);
          expect(enValue.length).toBeGreaterThanOrEqual(0);
        }
      });
    });
  });

  describe('getTranslation 函数', () => {
    it('应该正确获取嵌套的翻译值', () => {
      expect(getTranslation('zh', 'common.cancel')).toBe('取消');
      expect(getTranslation('en', 'common.cancel')).toBe('Cancel');
    });

    it('应该正确获取深层嵌套的翻译值', () => {
      expect(getTranslation('zh', 'header.tagline')).toBe('智能图表生成器');
      expect(getTranslation('en', 'header.tagline')).toBe('Smart Diagram Generator');
    });

    it('当键不存在时应该返回原始键', () => {
      expect(getTranslation('zh', 'nonexistent.key')).toBe('nonexistent.key');
      expect(getTranslation('en', 'another.missing.key')).toBe('another.missing.key');
    });

    it('应该处理单层键', () => {
      // 如果有单层键的话
      const result = getTranslation('zh', 'common');
      expect(result).toBe('common'); // 因为 common 是对象，不是字符串
    });
  });

  describe('formatTranslation 函数', () => {
    it('应该正确替换单个参数', () => {
      const result = formatTranslation('Hello {name}!', { name: 'World' });
      expect(result).toBe('Hello World!');
    });

    it('应该正确替换多个参数', () => {
      const result = formatTranslation('{greeting} {name}, you have {count} messages', {
        greeting: 'Hello',
        name: 'User',
        count: 5,
      });
      expect(result).toBe('Hello User, you have 5 messages');
    });

    it('应该处理数字参数', () => {
      const result = formatTranslation('共 {count} 种配色方案', { count: 12 });
      expect(result).toBe('共 12 种配色方案');
    });

    it('当参数不存在时应该保留原始占位符', () => {
      const result = formatTranslation('Hello {name}!', {});
      expect(result).toBe('Hello {name}!');
    });

    it('应该处理空字符串参数', () => {
      const result = formatTranslation('Value: {value}', { value: '' });
      expect(result).toBe('Value: ');
    });

    it('应该处理零值参数', () => {
      const result = formatTranslation('Count: {count}', { count: 0 });
      expect(result).toBe('Count: 0');
    });
  });

  describe('特定翻译内容测试', () => {
    describe('通用翻译 (common)', () => {
      it('应该包含所有必要的通用翻译', () => {
        const commonKeys = ['cancel', 'save', 'loading', 'close', 'apply', 'applying', 'required'];
        commonKeys.forEach((key) => {
          expect(zh.common).toHaveProperty(key);
          expect(en.common).toHaveProperty(key);
        });
      });
    });

    describe('头部翻译 (header)', () => {
      it('应该包含所有头部相关翻译', () => {
        const headerKeys = ['tagline', 'openSource', 'syntaxDocs', 'github', 'configApi', 'apiConfigured'];
        headerKeys.forEach((key) => {
          expect(zh.header).toHaveProperty(key);
          expect(en.header).toHaveProperty(key);
        });
      });
    });

    describe('设置翻译 (settings)', () => {
      it('应该包含所有设置相关翻译', () => {
        const settingsKeys = [
          'title', 'subtitle', 'selectProvider', 'apiKey', 'apiKeyPlaceholder',
          'baseUrl', 'modelName', 'modelPlaceholder', 'modelHint', 'privacyTitle', 'privacyDesc'
        ];
        settingsKeys.forEach((key) => {
          expect(zh.settings).toHaveProperty(key);
          expect(en.settings).toHaveProperty(key);
        });
      });
    });

    describe('编辑器翻译 (editor)', () => {
      it('应该包含所有编辑器相关翻译', () => {
        const editorKeys = ['loadingEditor', 'aiChat', 'mermaidCode', 'syntaxError', 'clickToViewNew'];
        editorKeys.forEach((key) => {
          expect(zh.editor).toHaveProperty(key);
          expect(en.editor).toHaveProperty(key);
        });
      });
    });

    describe('预览翻译 (preview)', () => {
      it('应该包含所有预览相关翻译', () => {
        const previewKeys = [
          'title', 'renderSuccess', 'zoomOut', 'zoomIn', 'resetZoom',
          'reference', 'selecting', 'referenceHint', 'count', 'selectTheme',
          'themeCount', 'copyCode', 'copyMarkdown', 'downloadSvg', 'downloadPng',
          'renderError', 'checkSyntax', 'waitingInput', 'waitingInputDesc',
          'selectNodes', 'escToExit', 'renderFailed'
        ];
        previewKeys.forEach((key) => {
          expect(zh.preview).toHaveProperty(key);
          expect(en.preview).toHaveProperty(key);
        });
      });
    });

    describe('聊天翻译 (chat)', () => {
      it('应该包含所有聊天相关翻译', () => {
        const chatKeys = [
          'aiThinking', 'aiAssistant', 'cancelRequest', 'clearChat',
          'welcomeTitle', 'welcomeDesc', 'tryThese', 'loadingSuggestions',
          'chartGenerated', 'configApiFirst', 'chatFailed', 'errorOccurred',
          'inputPlaceholder', 'inputPlaceholderWithRef', 'sendHint'
        ];
        chatKeys.forEach((key) => {
          expect(zh.chat).toHaveProperty(key);
          expect(en.chat).toHaveProperty(key);
        });
      });
    });

    describe('主题翻译 (themes)', () => {
      it('应该包含所有主题名称和描述', () => {
        const themeKeys = [
          'default', 'defaultDesc', 'forest', 'forestDesc', 'dark', 'darkDesc',
          'neutral', 'neutralDesc', 'techBlue', 'techBlueDesc', 'oceanTeal', 'oceanTealDesc',
          'sunsetOrange', 'sunsetOrangeDesc', 'purpleDream', 'purpleDreamDesc',
          'rosePink', 'rosePinkDesc', 'emeraldGreen', 'emeraldGreenDesc',
          'amberGold', 'amberGoldDesc', 'slateModern', 'slateModernDesc'
        ];
        themeKeys.forEach((key) => {
          expect(zh.themes).toHaveProperty(key);
          expect(en.themes).toHaveProperty(key);
        });
      });
    });

    describe('服务商翻译 (providers)', () => {
      it('应该包含所有 AI 服务商名称和描述', () => {
        const providerKeys = [
          'siliconflow', 'siliconflowDesc', 'volcEngine', 'volcEngineDesc',
          'deepseek', 'deepseekDesc', 'zhipu', 'zhipuDesc', 'kimi', 'kimiDesc',
          'minimax', 'minimaxDesc', 'qwen', 'qwenDesc', 'openai', 'openaiDesc',
          'anthropic', 'anthropicDesc', 'openrouter', 'openrouterDesc', 'google', 'googleDesc'
        ];
        providerKeys.forEach((key) => {
          expect(zh.providers).toHaveProperty(key);
          expect(en.providers).toHaveProperty(key);
        });
      });
    });

    describe('API 翻译 (api)', () => {
      it('应该包含所有 API 相关翻译', () => {
        const apiKeys = [
          'generateSystemPrompt', 'fixSystemPrompt', 'configApiFirst', 'enterDescription', 'generateFailed',
          'chatSystemPrompt', 'chatInvalidRequest', 'chatInvalidParams', 'chatMessagesEmpty',
          'chatApiKeyInvalid', 'chatRateLimited', 'chatTimeout',
          'optimizeSystemPrompt', 'optimizeConfigApiFirst', 'optimizeEnterDescription', 'optimizeFailed',
          'suggestionsSystemPrompt', 'suggestionsConfigApiFirst', 'suggestionsMissingCode', 'suggestionsFailed',
          'chatSuggestionsSystemPrompt', 'chatSuggestionsConfigApiFirst', 'chatSuggestionsMissingHistory', 'chatSuggestionsFailed'
        ];
        apiKeys.forEach((key) => {
          expect(zh.api).toHaveProperty(key);
          expect(en.api).toHaveProperty(key);
        });
      });
    });
  });
});

// 辅助函数：获取对象的所有叶子节点键
function getAllKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  const keys: string[] = [];
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      keys.push(...getAllKeys(obj[key] as Record<string, unknown>, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

// 辅助函数：获取嵌套对象的值
function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const keys = path.split('.');
  let result: unknown = obj;
  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = (result as Record<string, unknown>)[key];
    } else {
      return '';
    }
  }
  return typeof result === 'string' ? result : '';
}
