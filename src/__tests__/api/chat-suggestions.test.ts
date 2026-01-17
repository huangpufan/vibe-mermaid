import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { POST } from '@/app/api/chat-suggestions/route';
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

describe('Chat Suggestions API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  const createRequest = (body: Record<string, unknown>) => {
    return new NextRequest('http://localhost:3000/api/chat-suggestions', {
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
        messages: [{ role: 'user', content: 'Hello' }],
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it('缺少 messages 应该返回 400 错误', async () => {
      const request = createRequest({
        apiKey: 'test-key',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it('空的 messages 数组应该返回 400 错误', async () => {
      const request = createRequest({
        apiKey: 'test-key',
        messages: [],
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it('messages 不是数组应该返回 400 错误', async () => {
      const request = createRequest({
        apiKey: 'test-key',
        messages: 'not an array',
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
        suggestions: ['添加更多节点', '修改颜色', '调整布局'],
      });

      mockCreate.mockResolvedValue({
        choices: [{ message: { content: suggestionsResponse } }],
      });

      const request = createRequest({
        apiKey: 'test-key',
        messages: [
          { role: 'user', content: '画一个流程图' },
          { role: 'assistant', content: '好的，已生成流程图' },
        ],
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.suggestions).toHaveLength(3);
      expect(data.suggestions[0]).toBe('添加更多节点');
    });

    it('应该限制最多返回 3 个建议', async () => {
      const suggestionsResponse = JSON.stringify({
        suggestions: ['建议1', '建议2', '建议3', '建议4', '建议5'],
      });

      mockCreate.mockResolvedValue({
        choices: [{ message: { content: suggestionsResponse } }],
      });

      const request = createRequest({
        apiKey: 'test-key',
        messages: [{ role: 'user', content: 'Hello' }],
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.suggestions).toHaveLength(3);
    });

    it('应该过滤空字符串建议', async () => {
      const suggestionsResponse = JSON.stringify({
        suggestions: ['有效建议', '', '  ', '另一个有效建议'],
      });

      mockCreate.mockResolvedValue({
        choices: [{ message: { content: suggestionsResponse } }],
      });

      const request = createRequest({
        apiKey: 'test-key',
        messages: [{ role: 'user', content: 'Hello' }],
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.suggestions).toHaveLength(2);
      expect(data.suggestions).toContain('有效建议');
      expect(data.suggestions).toContain('另一个有效建议');
    });

    it('应该去除建议的首尾空格', async () => {
      const suggestionsResponse = JSON.stringify({
        suggestions: ['  建议1  ', '  建议2  '],
      });

      mockCreate.mockResolvedValue({
        choices: [{ message: { content: suggestionsResponse } }],
      });

      const request = createRequest({
        apiKey: 'test-key',
        messages: [{ role: 'user', content: 'Hello' }],
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.suggestions[0]).toBe('建议1');
      expect(data.suggestions[1]).toBe('建议2');
    });

    it('应该处理带 JSON 代码块的响应', async () => {
      const suggestionsResponse = `\`\`\`json
{
  "suggestions": ["建议1", "建议2"]
}
\`\`\``;

      mockCreate.mockResolvedValue({
        choices: [{ message: { content: suggestionsResponse } }],
      });

      const request = createRequest({
        apiKey: 'test-key',
        messages: [{ role: 'user', content: 'Hello' }],
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.suggestions).toHaveLength(2);
    });
  });

  describe('错误处理', () => {
    it('JSON 解析失败应该返回空建议列表', async () => {
      mockCreate.mockResolvedValue({
        choices: [{ message: { content: 'invalid json' } }],
      });

      const request = createRequest({
        apiKey: 'test-key',
        messages: [{ role: 'user', content: 'Hello' }],
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
        messages: [{ role: 'user', content: 'Hello' }],
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
        messages: [{ role: 'user', content: 'Hello' }],
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
        suggestions: ['中文建议1', '中文建议2'],
      });

      mockCreate.mockResolvedValue({
        choices: [{ message: { content: suggestionsResponse } }],
      });

      const request = createRequest({
        apiKey: 'test-key',
        messages: [{ role: 'user', content: '你好' }],
        locale: 'zh',
      });

      const response = await POST(request);
      expect(response.status).toBe(200);
    });

    it('应该支持英文 locale', async () => {
      const suggestionsResponse = JSON.stringify({
        suggestions: ['English suggestion 1', 'English suggestion 2'],
      });

      mockCreate.mockResolvedValue({
        choices: [{ message: { content: suggestionsResponse } }],
      });

      const request = createRequest({
        apiKey: 'test-key',
        messages: [{ role: 'user', content: 'Hello' }],
        locale: 'en',
      });

      const response = await POST(request);
      expect(response.status).toBe(200);
    });
  });

  describe('对话上下文', () => {
    it('应该正确构建对话上下文', async () => {
      const suggestionsResponse = JSON.stringify({
        suggestions: ['建议'],
      });

      mockCreate.mockResolvedValue({
        choices: [{ message: { content: suggestionsResponse } }],
      });

      const request = createRequest({
        apiKey: 'test-key',
        messages: [
          { role: 'user', content: '画一个流程图' },
          { role: 'assistant', content: '好的' },
          { role: 'user', content: '添加更多节点' },
          { role: 'assistant', content: '已添加' },
        ],
        locale: 'zh',
      });

      await POST(request);

      // 验证调用参数包含对话历史
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            expect.objectContaining({ role: 'system' }),
            expect.objectContaining({ role: 'user' }),
          ]),
        })
      );
    });
  });
});
