import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { POST } from '@/app/api/chat/route';
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

// 获取 mock 的 OpenAI 构造函数引用
const MockedOpenAI = MockOpenAI;

describe('Chat API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  const createRequest = (body: Record<string, unknown>) => {
    return new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  };

  describe('参数验证', () => {
    it('无效的请求体应该返回 400 错误', async () => {
      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: 'invalid json',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it('缺少 messages 数组应该返回 400 错误', async () => {
      const request = createRequest({
        apiKey: 'test-key',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it('缺少 apiKey 应该返回 400 错误', async () => {
      const request = createRequest({
        messages: [{ role: 'user', content: 'Hello' }],
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it('空的 apiKey 应该返回 400 错误', async () => {
      const request = createRequest({
        messages: [{ role: 'user', content: 'Hello' }],
        apiKey: '',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it('空的 messages 数组应该返回 400 错误', async () => {
      const request = createRequest({
        messages: [],
        apiKey: 'test-key',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });
  });

  describe('正常对话', () => {
    it('应该成功返回对话回复', async () => {
      mockCreate.mockResolvedValue({
        choices: [{ message: { content: '好的，我来帮你画一个流程图。' } }],
      });

      const request = createRequest({
        messages: [{ role: 'user', content: '帮我画一个流程图' }],
        apiKey: 'test-key',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.reply).toBe('好的，我来帮你画一个流程图。');
      expect(data.mermaidCode).toBeNull();
    });

    it('应该正确提取 Mermaid 代码', async () => {
      const responseContent = `好的，这是你的流程图：

\`\`\`mermaid
graph TD
  A[开始] --> B[结束]
\`\`\`

希望这个图表对你有帮助！`;

      mockCreate.mockResolvedValue({
        choices: [{ message: { content: responseContent } }],
      });

      const request = createRequest({
        messages: [{ role: 'user', content: '画一个简单的流程图' }],
        apiKey: 'test-key',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.mermaidCode).toBe('graph TD\n  A[开始] --> B[结束]');
      expect(data.reply).not.toContain('```mermaid');
    });

    it('只有 Mermaid 代码时应该返回默认回复', async () => {
      const responseContent = `\`\`\`mermaid
graph TD
  A --> B
\`\`\``;

      mockCreate.mockResolvedValue({
        choices: [{ message: { content: responseContent } }],
      });

      const request = createRequest({
        messages: [{ role: 'user', content: '画图' }],
        apiKey: 'test-key',
        locale: 'zh',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.mermaidCode).toBe('graph TD\n  A --> B');
      expect(data.reply).toBe('图表已生成，请查看预览。');
    });

    it('英文 locale 应该返回英文默认回复', async () => {
      const responseContent = `\`\`\`mermaid
graph TD
  A --> B
\`\`\``;

      mockCreate.mockResolvedValue({
        choices: [{ message: { content: responseContent } }],
      });

      const request = createRequest({
        messages: [{ role: 'user', content: 'Draw a chart' }],
        apiKey: 'test-key',
        locale: 'en',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.reply).toBe('Chart generated, please check the preview.');
    });
  });

  describe('多轮对话', () => {
    it('应该正确处理多轮对话历史', async () => {
      mockCreate.mockResolvedValue({
        choices: [{ message: { content: '好的，我来添加更多节点。' } }],
      });

      const request = createRequest({
        messages: [
          { role: 'user', content: '画一个流程图' },
          { role: 'assistant', content: '好的，这是流程图' },
          { role: 'user', content: '再添加几个节点' },
        ],
        apiKey: 'test-key',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.reply).toBeDefined();
    });
  });

  describe('错误处理', () => {
    it('401 错误应该返回 API Key 无效提示', async () => {
      mockCreate.mockRejectedValue(new Error('401 Unauthorized'));

      const request = createRequest({
        messages: [{ role: 'user', content: 'Hello' }],
        apiKey: 'invalid-key',
        locale: 'zh',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      // 检查错误消息包含 API Key 相关提示
      expect(data.error).toMatch(/无效|过期/);
    });

    it('429 错误应该返回限流提示', async () => {
      mockCreate.mockRejectedValue(new Error('429 rate limit'));

      const request = createRequest({
        messages: [{ role: 'user', content: 'Hello' }],
        apiKey: 'test-key',
        locale: 'zh',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toMatch(/频繁|稍后/);
    });

    it('超时错误应该返回超时提示', async () => {
      mockCreate.mockRejectedValue(new Error('timeout'));

      const request = createRequest({
        messages: [{ role: 'user', content: 'Hello' }],
        apiKey: 'test-key',
        locale: 'zh',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toMatch(/超时|重试/);
    });

    it('网络错误应该返回网络提示', async () => {
      mockCreate.mockRejectedValue(new Error('ENOTFOUND'));

      const request = createRequest({
        messages: [{ role: 'user', content: 'Hello' }],
        apiKey: 'test-key',
        locale: 'zh',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toMatch(/网络|连接/);
    });

    it('未知错误应该返回通用错误提示', async () => {
      mockCreate.mockRejectedValue(new Error('Unknown error'));

      const request = createRequest({
        messages: [{ role: 'user', content: 'Hello' }],
        apiKey: 'test-key',
        locale: 'zh',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBeDefined();
    });
  });

  describe('自定义配置', () => {
    it('应该使用自定义的 baseUrl', async () => {
      mockCreate.mockResolvedValue({
        choices: [{ message: { content: 'Response' } }],
      });

      const request = createRequest({
        messages: [{ role: 'user', content: 'Hello' }],
        apiKey: 'test-key',
        baseUrl: 'https://custom-api.com',
      });

      await POST(request);

      expect(MockedOpenAI).toHaveBeenCalledWith({
        apiKey: 'test-key',
        baseURL: 'https://custom-api.com',
      });
    });

    it('应该使用自定义的 model', async () => {
      mockCreate.mockResolvedValue({
        choices: [{ message: { content: 'Response' } }],
      });

      const request = createRequest({
        messages: [{ role: 'user', content: 'Hello' }],
        apiKey: 'test-key',
        model: 'custom-model',
      });

      await POST(request);

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'custom-model',
        })
      );
    });
  });
});
