import { describe, it, expect } from 'vitest';
import { THEME_PRESETS } from '@/lib/store';
import { getThemeConfig } from '@/lib/mermaid';

describe('主题系统集成测试', () => {
  describe('主题预设完整性', () => {
    it('应该有至少 10 个主题', () => {
      expect(THEME_PRESETS.length).toBeGreaterThanOrEqual(10);
    });

    it('每个主题应该有唯一的 ID', () => {
      const ids = THEME_PRESETS.map((t) => t.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('每个主题应该有名称和描述', () => {
      THEME_PRESETS.forEach((theme) => {
        expect(theme.name).toBeTruthy();
        expect(theme.description).toBeTruthy();
      });
    });

    it('每个主题应该有有效的 base 值', () => {
      const validBases = ['default', 'forest', 'dark', 'neutral', 'base'];
      THEME_PRESETS.forEach((theme) => {
        expect(validBases).toContain(theme.base);
      });
    });
  });

  describe('主题变量', () => {
    it('每个主题应该有 themeVariables', () => {
      THEME_PRESETS.forEach((theme) => {
        expect(theme.themeVariables).toBeDefined();
        expect(typeof theme.themeVariables).toBe('object');
      });
    });

    it('主题变量应该包含基本颜色', () => {
      const requiredColors = ['primaryColor', 'primaryTextColor', 'lineColor'];
      THEME_PRESETS.forEach((theme) => {
        requiredColors.forEach((color) => {
          expect(theme.themeVariables).toHaveProperty(color);
        });
      });
    });

    it('颜色值应该是有效的格式', () => {
      const colorRegex = /^#[0-9A-Fa-f]{3,8}$/;
      THEME_PRESETS.forEach((theme) => {
        Object.entries(theme.themeVariables || {}).forEach(([key, value]) => {
          if (key.toLowerCase().includes('color') || key.toLowerCase().includes('bkg')) {
            expect(value).toMatch(colorRegex);
          }
        });
      });
    });
  });

  describe('getThemeConfig 与 THEME_PRESETS 一致性', () => {
    it('getThemeConfig 应该返回与 THEME_PRESETS 相同的配置', () => {
      THEME_PRESETS.forEach((preset) => {
        const config = getThemeConfig(preset.id);
        expect(config).toEqual(preset);
      });
    });
  });

  describe('特定主题测试', () => {
    describe('默认主题 (default)', () => {
      it('应该存在', () => {
        const theme = THEME_PRESETS.find((t) => t.id === 'default');
        expect(theme).toBeDefined();
      });

      it('应该使用 base 作为基础', () => {
        const theme = THEME_PRESETS.find((t) => t.id === 'default');
        expect(theme?.base).toBe('base');
      });
    });

    describe('深色主题 (dark)', () => {
      it('应该存在', () => {
        const theme = THEME_PRESETS.find((t) => t.id === 'dark');
        expect(theme).toBeDefined();
      });

      it('应该有深色背景', () => {
        const theme = THEME_PRESETS.find((t) => t.id === 'dark');
        const bgColor = theme?.themeVariables?.background || theme?.themeVariables?.mainBkg;
        // 深色背景通常是较暗的颜色
        expect(bgColor).toBeDefined();
      });
    });

    describe('森林主题 (forest)', () => {
      it('应该存在', () => {
        const theme = THEME_PRESETS.find((t) => t.id === 'forest');
        expect(theme).toBeDefined();
      });

      it('应该有绿色调', () => {
        const theme = THEME_PRESETS.find((t) => t.id === 'forest');
        const primaryColor = theme?.themeVariables?.primaryColor;
        // 绿色通常包含较高的绿色分量
        expect(primaryColor).toBeDefined();
      });
    });

    describe('天蓝主题 (tech-blue)', () => {
      it('应该存在', () => {
        const theme = THEME_PRESETS.find((t) => t.id === 'tech-blue');
        expect(theme).toBeDefined();
      });
    });

    describe('紫色主题 (purple-dream)', () => {
      it('应该存在', () => {
        const theme = THEME_PRESETS.find((t) => t.id === 'purple-dream');
        expect(theme).toBeDefined();
      });
    });
  });

  describe('主题切换场景', () => {
    it('从默认主题切换到深色主题', () => {
      const defaultTheme = getThemeConfig('default');
      const darkTheme = getThemeConfig('dark');

      expect(defaultTheme.id).not.toBe(darkTheme.id);
      expect(defaultTheme.themeVariables).not.toEqual(darkTheme.themeVariables);
    });

    it('切换到不存在的主题应该回退到默认', () => {
      const theme = getThemeConfig('nonexistent-theme');
      expect(theme.id).toBe('default');
    });
  });
});
