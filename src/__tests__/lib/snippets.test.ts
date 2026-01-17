import { describe, it, expect } from 'vitest';
import { MERMAID_SNIPPETS, getSnippetDocumentation, searchSnippets } from '@/lib/snippets';

describe('Mermaid Snippets', () => {
  describe('MERMAID_SNIPPETS', () => {
    it('should have at least 10 snippets', () => {
      expect(MERMAID_SNIPPETS.length).toBeGreaterThanOrEqual(10);
    });

    it('should have valid snippet structure', () => {
      MERMAID_SNIPPETS.forEach((snippet) => {
        expect(snippet).toHaveProperty('label');
        expect(snippet).toHaveProperty('insertText');
        expect(snippet).toHaveProperty('documentation');
        expect(snippet).toHaveProperty('documentationZh');
        expect(typeof snippet.label).toBe('string');
        expect(typeof snippet.insertText).toBe('string');
        expect(typeof snippet.documentation).toBe('string');
        expect(typeof snippet.documentationZh).toBe('string');
      });
    });

    it('should have unique labels', () => {
      const labels = MERMAID_SNIPPETS.map((s) => s.label);
      const uniqueLabels = new Set(labels);
      expect(uniqueLabels.size).toBe(labels.length);
    });

    it('should contain flowchart snippets', () => {
      const flowchartSnippets = MERMAID_SNIPPETS.filter((s) =>
        s.label.includes('flowchart')
      );
      expect(flowchartSnippets.length).toBeGreaterThan(0);
    });

    it('should contain sequence diagram snippets', () => {
      const sequenceSnippets = MERMAID_SNIPPETS.filter((s) =>
        s.label.includes('sequence')
      );
      expect(sequenceSnippets.length).toBeGreaterThan(0);
    });

    it('should contain class diagram snippets', () => {
      const classSnippets = MERMAID_SNIPPETS.filter((s) =>
        s.label.includes('class')
      );
      expect(classSnippets.length).toBeGreaterThan(0);
    });

    it('should have placeholder syntax in insertText', () => {
      const snippetsWithPlaceholders = MERMAID_SNIPPETS.filter((s) =>
        s.insertText.includes('${')
      );
      expect(snippetsWithPlaceholders.length).toBeGreaterThan(0);
    });

    it('should have valid Mermaid syntax in insertText', () => {
      MERMAID_SNIPPETS.forEach((snippet) => {
        // Check for common Mermaid keywords
        const hasValidSyntax =
          snippet.insertText.includes('graph') ||
          snippet.insertText.includes('sequenceDiagram') ||
          snippet.insertText.includes('classDiagram') ||
          snippet.insertText.includes('stateDiagram') ||
          snippet.insertText.includes('erDiagram') ||
          snippet.insertText.includes('gantt') ||
          snippet.insertText.includes('pie') ||
          snippet.insertText.includes('gitGraph') ||
          snippet.insertText.includes('journey') ||
          snippet.insertText.includes('mindmap') ||
          snippet.insertText.includes('timeline');
        
        expect(hasValidSyntax).toBe(true);
      });
    });
  });

  describe('getSnippetDocumentation', () => {
    it('should return English documentation for "en" locale', () => {
      const snippet = MERMAID_SNIPPETS[0];
      const doc = getSnippetDocumentation(snippet, 'en');
      expect(doc).toBe(snippet.documentation);
    });

    it('should return Chinese documentation for "zh" locale', () => {
      const snippet = MERMAID_SNIPPETS[0];
      const doc = getSnippetDocumentation(snippet, 'zh');
      expect(doc).toBe(snippet.documentationZh);
    });

    it('should handle all snippets', () => {
      MERMAID_SNIPPETS.forEach((snippet) => {
        const enDoc = getSnippetDocumentation(snippet, 'en');
        const zhDoc = getSnippetDocumentation(snippet, 'zh');
        expect(enDoc).toBeTruthy();
        expect(zhDoc).toBeTruthy();
      });
    });
  });

  describe('searchSnippets', () => {
    it('should find snippets by label', () => {
      const results = searchSnippets('flowchart');
      expect(results.length).toBeGreaterThan(0);
      results.forEach((snippet) => {
        expect(snippet.label.toLowerCase()).toContain('flowchart');
      });
    });

    it('should find snippets by English documentation', () => {
      const results = searchSnippets('sequence');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should find snippets by Chinese documentation', () => {
      const results = searchSnippets('流程图');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should be case-insensitive for English', () => {
      const lowerResults = searchSnippets('flowchart');
      const upperResults = searchSnippets('FLOWCHART');
      const mixedResults = searchSnippets('FlowChart');
      expect(lowerResults.length).toBe(upperResults.length);
      expect(lowerResults.length).toBe(mixedResults.length);
    });

    it('should return empty array for non-matching query', () => {
      const results = searchSnippets('nonexistent-snippet-xyz');
      expect(results).toEqual([]);
    });

    it('should return all snippets for empty query', () => {
      const results = searchSnippets('');
      expect(results.length).toBe(MERMAID_SNIPPETS.length);
    });

    it('should find specific diagram types', () => {
      const diagramTypes = ['class', 'state', 'gantt', 'pie', 'git'];
      diagramTypes.forEach((type) => {
        const results = searchSnippets(type);
        expect(results.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Snippet Content Validation', () => {
    it('flowchart snippet should have valid syntax', () => {
      const flowchart = MERMAID_SNIPPETS.find((s) => s.label === 'flowchart');
      expect(flowchart).toBeDefined();
      expect(flowchart!.insertText).toContain('graph TD');
      expect(flowchart!.insertText).toContain('-->');
    });

    it('sequence snippet should have valid syntax', () => {
      const sequence = MERMAID_SNIPPETS.find((s) => s.label === 'sequence');
      expect(sequence).toBeDefined();
      expect(sequence!.insertText).toContain('sequenceDiagram');
      expect(sequence!.insertText).toContain('participant');
    });

    it('class snippet should have valid syntax', () => {
      const classDiagram = MERMAID_SNIPPETS.find((s) => s.label === 'class');
      expect(classDiagram).toBeDefined();
      expect(classDiagram!.insertText).toContain('classDiagram');
    });

    it('state snippet should have valid syntax', () => {
      const state = MERMAID_SNIPPETS.find((s) => s.label === 'state');
      expect(state).toBeDefined();
      expect(state!.insertText).toContain('stateDiagram-v2');
      expect(state!.insertText).toContain('[*]');
    });

    it('er snippet should have valid syntax', () => {
      const er = MERMAID_SNIPPETS.find((s) => s.label === 'er');
      expect(er).toBeDefined();
      expect(er!.insertText).toContain('erDiagram');
    });

    it('gantt snippet should have valid syntax', () => {
      const gantt = MERMAID_SNIPPETS.find((s) => s.label === 'gantt');
      expect(gantt).toBeDefined();
      expect(gantt!.insertText).toContain('gantt');
      expect(gantt!.insertText).toContain('title');
    });

    it('pie snippet should have valid syntax', () => {
      const pie = MERMAID_SNIPPETS.find((s) => s.label === 'pie');
      expect(pie).toBeDefined();
      expect(pie!.insertText).toContain('pie title');
    });

    it('git snippet should have valid syntax', () => {
      const git = MERMAID_SNIPPETS.find((s) => s.label === 'git');
      expect(git).toBeDefined();
      expect(git!.insertText).toContain('gitGraph');
      expect(git!.insertText).toContain('commit');
    });
  });
});
