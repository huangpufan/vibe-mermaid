import { describe, it, expect, vi, beforeEach } from 'vitest';
import { THEME_PRESETS } from '@/lib/store';

// Mock mermaid 模块 - 使用 vi.hoisted 确保 mock 函数在 vi.mock 之前定义
const { mockInitialize, mockParse, mockRender } = vi.hoisted(() => ({
  mockInitialize: vi.fn(),
  mockParse: vi.fn(),
  mockRender: vi.fn(),
}));

vi.mock('mermaid', () => ({
  default: {
    initialize: mockInitialize,
    parse: mockParse,
    render: mockRender,
  },
}));

// 在 mock 之后导入被测试的模块
import { initMermaid, validateMermaidCode, renderMermaid, getThemeConfig } from '@/lib/mermaid';

describe('Mermaid 工具函数', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initMermaid', () => {
    it('应该初始化 mermaid', () => {
      initMermaid();
      // 初始化在模块加载时可能已经发生
      // 这里主要测试函数不会抛出错误
      expect(() => initMermaid()).not.toThrow();
    });
  });

  describe('getThemeConfig', () => {
    it('应该返回指定主题的配置', () => {
      const config = getThemeConfig('default');
      expect(config).toBeDefined();
      expect(config.id).toBe('default');
    });

    it('应该返回 forest 主题配置', () => {
      const config = getThemeConfig('forest');
      expect(config.id).toBe('forest');
    });

    it('应该返回 dark 主题配置', () => {
      const config = getThemeConfig('dark');
      expect(config.id).toBe('dark');
    });

    it('不存在的主题应该返回默认主题', () => {
      const config = getThemeConfig('nonexistent');
      expect(config.id).toBe('default');
    });

    it('所有预设主题都应该能获取到配置', () => {
      THEME_PRESETS.forEach((preset) => {
        const config = getThemeConfig(preset.id);
        expect(config.id).toBe(preset.id);
      });
    });
  });

  describe('validateMermaidCode', () => {
    it('有效代码应该返回 valid: true', async () => {
      mockParse.mockResolvedValue(undefined);

      const result = await validateMermaidCode('graph TD\n  A --> B');

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('无效代码应该返回 valid: false 和错误信息', async () => {
      mockParse.mockRejectedValue(new Error('Parse error: Invalid syntax'));

      const result = await validateMermaidCode('invalid code');

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Parse error: Invalid syntax');
    });

    it('应该处理非 Error 类型的异常', async () => {
      mockParse.mockRejectedValue('String error');

      const result = await validateMermaidCode('invalid code');

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Unknown error');
    });
  });

  describe('renderMermaid', () => {
    it('成功渲染应该返回 SVG', async () => {
      const mockSvg = '<svg>...</svg>';
      mockRender.mockResolvedValue({ svg: mockSvg });

      const result = await renderMermaid('graph TD\n  A --> B', 'test-id');

      expect('svg' in result).toBe(true);
      if ('svg' in result) {
        expect(result.svg).toBe(mockSvg);
      }
    });

    it('渲染失败应该返回错误信息', async () => {
      mockRender.mockRejectedValue(new Error('Render failed'));

      const result = await renderMermaid('invalid code', 'test-id');

      expect('error' in result).toBe(true);
      if ('error' in result) {
        expect(result.error).toBe('Render failed');
      }
    });

    it('应该使用指定的主题', async () => {
      const mockSvg = '<svg>...</svg>';
      mockRender.mockResolvedValue({ svg: mockSvg });

      await renderMermaid('graph TD\n  A --> B', 'test-id', 'forest');

      // 验证 render 被调用，且代码包含主题指令
      expect(mockRender).toHaveBeenCalled();
      const callArgs = mockRender.mock.calls[0];
      expect(callArgs[1]).toContain('%%{init:');
    });

    it('应该移除代码中已有的 init 指令', async () => {
      const mockSvg = '<svg>...</svg>';
      mockRender.mockResolvedValue({ svg: mockSvg });

      const codeWithDirective = '%%{init: {"theme": "dark"}}%%\ngraph TD\n  A --> B';
      await renderMermaid(codeWithDirective, 'test-id', 'forest');

      const callArgs = mockRender.mock.calls[0];
      // 应该只有一个 init 指令（新注入的）
      const initCount = (callArgs[1].match(/%%\{init:/g) || []).length;
      expect(initCount).toBe(1);
    });

    it('应该处理非 Error 类型的渲染异常', async () => {
      mockRender.mockRejectedValue('String error');

      const result = await renderMermaid('code', 'test-id');

      expect('error' in result).toBe(true);
      if ('error' in result) {
        expect(result.error).toBe('Unknown error');
      }
    });
  });
});

describe('Mermaid 代码验证测试用例', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('流程图 (flowchart)', () => {
    it('基本流程图应该有效', async () => {
      mockParse.mockResolvedValue(undefined);
      const code = `graph TD
        A[开始] --> B[处理]
        B --> C[结束]`;
      const result = await validateMermaidCode(code);
      expect(result.valid).toBe(true);
    });

    it('带条件的流程图应该有效', async () => {
      mockParse.mockResolvedValue(undefined);
      const code = `graph TD
        A[开始] --> B{判断}
        B -->|是| C[处理A]
        B -->|否| D[处理B]`;
      const result = await validateMermaidCode(code);
      expect(result.valid).toBe(true);
    });

    it('LR 方向流程图应该有效', async () => {
      mockParse.mockResolvedValue(undefined);
      const code = `graph LR
        A --> B --> C`;
      const result = await validateMermaidCode(code);
      expect(result.valid).toBe(true);
    });
  });

  describe('时序图 (sequenceDiagram)', () => {
    it('基本时序图应该有效', async () => {
      mockParse.mockResolvedValue(undefined);
      const code = `sequenceDiagram
        Alice->>Bob: Hello
        Bob-->>Alice: Hi`;
      const result = await validateMermaidCode(code);
      expect(result.valid).toBe(true);
    });

    it('带参与者的时序图应该有效', async () => {
      mockParse.mockResolvedValue(undefined);
      const code = `sequenceDiagram
        participant A as Alice
        participant B as Bob
        A->>B: Message`;
      const result = await validateMermaidCode(code);
      expect(result.valid).toBe(true);
    });
  });

  describe('类图 (classDiagram)', () => {
    it('基本类图应该有效', async () => {
      mockParse.mockResolvedValue(undefined);
      const code = `classDiagram
        class Animal {
          +String name
          +eat()
        }`;
      const result = await validateMermaidCode(code);
      expect(result.valid).toBe(true);
    });

    it('带继承关系的类图应该有效', async () => {
      mockParse.mockResolvedValue(undefined);
      const code = `classDiagram
        Animal <|-- Dog
        Animal <|-- Cat`;
      const result = await validateMermaidCode(code);
      expect(result.valid).toBe(true);
    });
  });

  describe('状态图 (stateDiagram)', () => {
    it('基本状态图应该有效', async () => {
      mockParse.mockResolvedValue(undefined);
      const code = `stateDiagram-v2
        [*] --> Active
        Active --> [*]`;
      const result = await validateMermaidCode(code);
      expect(result.valid).toBe(true);
    });
  });

  describe('ER 图 (erDiagram)', () => {
    it('基本 ER 图应该有效', async () => {
      mockParse.mockResolvedValue(undefined);
      const code = `erDiagram
        CUSTOMER ||--o{ ORDER : places
        ORDER ||--|{ LINE-ITEM : contains`;
      const result = await validateMermaidCode(code);
      expect(result.valid).toBe(true);
    });
  });

  describe('甘特图 (gantt)', () => {
    it('基本甘特图应该有效', async () => {
      mockParse.mockResolvedValue(undefined);
      const code = `gantt
        title 项目计划
        section 阶段1
        任务1 :a1, 2024-01-01, 30d`;
      const result = await validateMermaidCode(code);
      expect(result.valid).toBe(true);
    });
  });

  describe('饼图 (pie)', () => {
    it('基本饼图应该有效', async () => {
      mockParse.mockResolvedValue(undefined);
      const code = `pie title 分布
        "A" : 40
        "B" : 30
        "C" : 30`;
      const result = await validateMermaidCode(code);
      expect(result.valid).toBe(true);
    });
  });

  describe('思维导图 (mindmap)', () => {
    it('基本思维导图应该有效', async () => {
      mockParse.mockResolvedValue(undefined);
      const code = `mindmap
        root((中心))
          分支1
          分支2`;
      const result = await validateMermaidCode(code);
      expect(result.valid).toBe(true);
    });
  });

  describe('Git 图 (gitGraph)', () => {
    it('基本 Git 图应该有效', async () => {
      mockParse.mockResolvedValue(undefined);
      const code = `gitGraph
        commit
        branch develop
        checkout develop
        commit`;
      const result = await validateMermaidCode(code);
      expect(result.valid).toBe(true);
    });
  });
});
