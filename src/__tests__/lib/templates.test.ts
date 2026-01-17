import { describe, it, expect } from 'vitest';
import {
  DIAGRAM_TEMPLATES,
  TEMPLATE_CATEGORIES,
  getTemplatesByCategory,
  searchTemplatesByTag,
  searchTemplates,
} from '@/lib/templates';

describe('Templates Library', () => {
  describe('DIAGRAM_TEMPLATES', () => {
    it('should have at least 10 templates', () => {
      expect(DIAGRAM_TEMPLATES.length).toBeGreaterThanOrEqual(10);
    });

    it('should have valid template structure', () => {
      DIAGRAM_TEMPLATES.forEach((template) => {
        expect(template).toHaveProperty('id');
        expect(template).toHaveProperty('name');
        expect(template).toHaveProperty('nameZh');
        expect(template).toHaveProperty('category');
        expect(template).toHaveProperty('description');
        expect(template).toHaveProperty('descriptionZh');
        expect(template).toHaveProperty('code');
        expect(template).toHaveProperty('tags');
        expect(Array.isArray(template.tags)).toBe(true);
      });
    });

    it('should have unique template IDs', () => {
      const ids = DIAGRAM_TEMPLATES.map((t) => t.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have valid Mermaid code', () => {
      DIAGRAM_TEMPLATES.forEach((template) => {
        expect(template.code.trim().length).toBeGreaterThan(0);
        // Check if code starts with valid Mermaid keywords
        const validKeywords = [
          'graph',
          'flowchart',
          'sequenceDiagram',
          'classDiagram',
          'stateDiagram',
          'erDiagram',
          'gantt',
          'pie',
          'mindmap',
          'gitGraph',
        ];
        const startsWithValidKeyword = validKeywords.some((keyword) =>
          template.code.trim().startsWith(keyword)
        );
        expect(startsWithValidKeyword).toBe(true);
      });
    });
  });

  describe('TEMPLATE_CATEGORIES', () => {
    it('should have 8 categories', () => {
      expect(TEMPLATE_CATEGORIES.length).toBe(8);
    });

    it('should have valid category structure', () => {
      TEMPLATE_CATEGORIES.forEach((category) => {
        expect(category).toHaveProperty('id');
        expect(category).toHaveProperty('name');
        expect(category).toHaveProperty('nameZh');
      });
    });
  });

  describe('getTemplatesByCategory', () => {
    it('should return flowchart templates', () => {
      const templates = getTemplatesByCategory('flowchart');
      expect(templates.length).toBeGreaterThan(0);
      templates.forEach((template) => {
        expect(template.category).toBe('flowchart');
      });
    });

    it('should return sequence templates', () => {
      const templates = getTemplatesByCategory('sequence');
      expect(templates.length).toBeGreaterThan(0);
      templates.forEach((template) => {
        expect(template.category).toBe('sequence');
      });
    });

    it('should return empty array for non-existent category', () => {
      const templates = getTemplatesByCategory('nonexistent' as 'flowchart');
      expect(templates).toEqual([]);
    });
  });

  describe('searchTemplatesByTag', () => {
    it('should find templates by tag', () => {
      const templates = searchTemplatesByTag('basic');
      expect(templates.length).toBeGreaterThan(0);
      templates.forEach((template) => {
        expect(template.tags).toContain('basic');
      });
    });

    it('should be case insensitive', () => {
      const lowerCase = searchTemplatesByTag('basic');
      const upperCase = searchTemplatesByTag('BASIC');
      expect(lowerCase.length).toBe(upperCase.length);
    });

    it('should return empty array for non-existent tag', () => {
      const templates = searchTemplatesByTag('nonexistenttag123');
      expect(templates).toEqual([]);
    });
  });

  describe('searchTemplates', () => {
    it('should search by name in English', () => {
      const templates = searchTemplates('flowchart', 'en');
      expect(templates.length).toBeGreaterThan(0);
      templates.forEach((template) => {
        const matchesName = template.name.toLowerCase().includes('flowchart');
        const matchesDescription = template.description.toLowerCase().includes('flowchart');
        const matchesTags = template.tags.some((tag) => tag.includes('flowchart'));
        expect(matchesName || matchesDescription || matchesTags).toBe(true);
      });
    });

    it('should search by name in Chinese', () => {
      const templates = searchTemplates('流程图', 'zh');
      expect(templates.length).toBeGreaterThan(0);
      templates.forEach((template) => {
        const matchesName = template.nameZh.includes('流程图');
        const matchesDescription = template.descriptionZh.includes('流程图');
        const matchesTags = template.tags.some((tag) => tag.includes('流程图'));
        expect(matchesName || matchesDescription || matchesTags).toBe(true);
      });
    });

    it('should search by description', () => {
      const templates = searchTemplates('decision', 'en');
      expect(templates.length).toBeGreaterThan(0);
    });

    it('should search by tags', () => {
      const templates = searchTemplates('api', 'en');
      expect(templates.length).toBeGreaterThan(0);
    });

    it('should be case insensitive', () => {
      const lowerCase = searchTemplates('flowchart', 'en');
      const upperCase = searchTemplates('FLOWCHART', 'en');
      expect(lowerCase.length).toBe(upperCase.length);
    });

    it('should return empty array for non-matching query', () => {
      const templates = searchTemplates('xyznonexistent123', 'en');
      expect(templates).toEqual([]);
    });

    it('should return all templates for empty query', () => {
      const templates = searchTemplates('', 'en');
      expect(templates.length).toBe(DIAGRAM_TEMPLATES.length);
    });
  });

  describe('Template Content Quality', () => {
    it('should have templates for all major diagram types', () => {
      const categories = new Set(DIAGRAM_TEMPLATES.map((t) => t.category));
      expect(categories.has('flowchart')).toBe(true);
      expect(categories.has('sequence')).toBe(true);
      expect(categories.has('class')).toBe(true);
      expect(categories.has('state')).toBe(true);
    });

    it('should have both English and Chinese names', () => {
      DIAGRAM_TEMPLATES.forEach((template) => {
        expect(template.name.length).toBeGreaterThan(0);
        expect(template.nameZh.length).toBeGreaterThan(0);
        expect(template.name).not.toBe(template.nameZh);
      });
    });

    it('should have both English and Chinese descriptions', () => {
      DIAGRAM_TEMPLATES.forEach((template) => {
        expect(template.description.length).toBeGreaterThan(0);
        expect(template.descriptionZh.length).toBeGreaterThan(0);
      });
    });

    it('should have at least one tag per template', () => {
      DIAGRAM_TEMPLATES.forEach((template) => {
        expect(template.tags.length).toBeGreaterThan(0);
      });
    });
  });
});
