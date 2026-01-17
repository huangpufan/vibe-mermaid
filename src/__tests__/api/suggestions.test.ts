import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { POST } from '@/app/api/suggestions/route';
import { NextRequest } from 'next/server';

// 使用 vi.hoisted 确保 mock 函数在 vi.mock 之前定义
const { mockCreate, MockOpenAI } = vi.hoisted(() => {
  const mockCreate = vi.fn();
  const MockOpenAI = vi.fn(function(this: { chat: { completions: { create: typeof mockCreate } } }) {
    this.chat = {
      completions: {
        create: mockCreate,
      },
    };
  });
  return { mockCreate, MockOpenAI };
});

// Mock OpenAI
vi.mock('openai', () => ({
  default: MockOpenAI,
}));

describe('Suggestions API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  const createRequest = (body: Record<string, unknown>) => {
    return new NextRequest('http://localhost:3000/api/suggestions', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  };

  describe('参数验证', () => {
    it('缺少 apiKey 应该返回 400 错误', async () => {
      const request = createRequest({
        code: 'graph TD\n  A --> B',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it('缺少 code 应该返回 400 错误', async () => {
      const request = createRequest({
        apiKey: 'test-key',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });
  });

  describe('建议生成', () => {
    it('应该成功返回建议列表', async () => {
      const suggestionsResponse = JSON.stringify({
        suggestions: [
          { title: '添加颜色', description: '为节点添加颜色', code: 'graph TD\n  A[开始]:::green --> B' },
          { title: '添加注释', description: '添加说明文字', code: 'graph TD\n  A --> B\n  %% 注释' },
        ],
      });

      mockCreate.mockResolvedValue({
        choices: [{ message: { content: suggestionsResponse } }],
      });

      const request = createRequest({
        apiKey: 'test-key',
        code: 'graph TD\n  A --> B',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.suggestions).toHaveLength(2);
      expect(data.suggestions[0].title).toBe('添加颜色');
    });

    it('应该清理建议代码中的 markdown 标记', async () => {
      const suggestionsResponse = JSON.stringify({
        suggestions: [
          {
            title: '建议1',
            description: '描述1',
            code: '```mermaid\ngraph TD\n  A --> B\n```',
          },
        ],
      });

      mockCreate.mockResolvedValue({
        choices: [{ message: { content: suggestionsResponse } }],
      });

      const request = createRequest({
        apiKey: 'test-key',
        code: 'graph TD\n  A --> B',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.suggestions[0].code).toBe('graph TD\n  A --> B');
      expect(data.suggestions[0].code).not.toContain('```');
    });

    it('应该处理带 JSON 代码块的响应', async () => {
      const suggestionsResponse = `\`\`\`json
{
  "suggestions": [
    { "title": "建议1", "description": "描述1", "code": "graph TD\\n  A --> B" }
  ]
}
\`\`\``;

      mockCreate.mockResolvedValue({
        choices: [{ message: { content: suggestionsResponse } }],
      });

      const request = createRequest({
        apiKey: 'test-key',
        code: 'graph TD\n  A --> B',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.suggestions).toHaveLength(1);
    });

    it('应该过滤无效的建议', async () => {
      const suggestionsResponse = JSON.stringify({
        suggestions: [
          { title: '有效建议', description: '描述', code: 'graph TD\n  A --> B' },
          { title: '', description: '无标题', code: 'code' }, // 无效：空标题会被 trim 后变成空字符串
          { description: '无标题字段', code: 'code' }, // 无效：缺少标题
          null, // 无效：null
          'string', // 无效：字符串
        ],
      });

      mockCreate.mockResolvedValue({
        choices: [{ message: { content: suggestionsResponse } }],
      });

      const request = createRequest({
        apiKey: 'test-key',
        code: 'graph TD\n  A --> B',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      // 只有第一个有效建议会被保留（空标题的也会被过滤）
      expect(data.suggestions.length).toBeGreaterThanOrEqual(1);
      expect(data.suggestions[0].title).toBe('有效建议');
    });
  });

  describe('带 prompt 的建议', () => {
    it('应该在有 prompt 时使用它', async () => {
      const suggestionsResponse = JSON.stringify({
        suggestions: [
          { title: '建议', description: '描述', code: 'code' },
        ],
      });

      mockCreate.mockResolvedValue({
        choices: [{ message: { content: suggestionsResponse } }],
      });

      const request = createRequest({
        apiKey: 'test-key',
        code: 'graph TD\n  A --> B',
        prompt: '用户的原始描述',
      });

      const response = await POST(request);
      expect(response.status).toBe(200);
    });
  });

  describe('错误处理', () => {
    it('JSON 解析失败应该返回空建议列表', async () => {
      mockCreate.mockResolvedValue({
        choices: [{ message: { content: 'invalid json' } }],
      });

      const request = createRequest({
        apiKey: 'test-key',
        code: 'graph TD\n  A --> B',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.suggestions).toEqual([]);
    });

    it('suggestions 不是数组应该返回空列表', async () => {
      mockCreate.mockResolvedValue({
        choices: [{ message: { content: JSON.stringify({ suggestions: 'not an array' }) } }],
      });

      const request = createRequest({
        apiKey: 'test-key',
        code: 'graph TD\n  A --> B',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.suggestions).toEqual([]);
    });

    it('API 错误应该返回 500', async () => {
      mockCreate.mockRejectedValue(new Error('API Error'));

      const request = createRequest({
        apiKey: 'test-key',
        code: 'graph TD\n  A --> B',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toContain('API Error');
    });
  });

  describe('多语言支持', () => {
    it('应该支持中文 locale', async () => {
      const suggestionsResponse = JSON.stringify({
        suggestions: [
          { title: '中文建议', description: '中文描述', code: 'code' },
        ],
      });

      mockCreate.mockResolvedValue({
        choices: [{ message: { content: suggestionsResponse } }],
      });

      const request = createRequest({
        apiKey: 'test-key',
        code: 'graph TD\n  A --> B',
        locale: 'zh',
      });

      const response = await POST(request);
      expect(response.status).toBe(200);
    });

    it('应该支持英文 locale', async () => {
      const suggestionsResponse = JSON.stringify({
        suggestions: [
          { title: 'English suggestion', description: 'English description', code: 'code' },
        ],
      });

      mockCreate.mockResolvedValue({
        choices: [{ message: { content: suggestionsResponse } }],
      });

      const request = createRequest({
        apiKey: 'test-key',
        code: 'graph TD\n  A --> B',
        locale: 'en',
      });

      const response = await POST(request);
      expect(response.status).toBe(200);
    });
  });
});
