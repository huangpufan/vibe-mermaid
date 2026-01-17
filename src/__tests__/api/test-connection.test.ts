import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { POST } from '@/app/api/test-connection/route';
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

describe('Test Connection API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  const createRequest = (body: Record<string, unknown>) => {
    return new NextRequest('http://localhost:3000/api/test-connection', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  };

  describe('参数验证', () => {
    it('缺少 apiKey 应该返回失败', async () => {
      const request = createRequest({});

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    });

    it('空的 apiKey 应该返回失败', async () => {
      const request = createRequest({
        apiKey: '',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    });

    it('只有空格的 apiKey 应该返回失败', async () => {
      const request = createRequest({
        apiKey: '   ',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    });
  });

  describe('连接测试成功', () => {
    it('有效的 API Key 应该返回成功', async () => {
      mockCreate.mockResolvedValue({
        choices: [{ message: { content: 'hi' } }],
      });

      const request = createRequest({
        apiKey: 'valid-api-key',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('应该使用最小的 token 进行测试', async () => {
      mockCreate.mockResolvedValue({
        choices: [{ message: { content: 'hi' } }],
      });

      const request = createRequest({
        apiKey: 'valid-api-key',
      });

      await POST(request);

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          max_tokens: 1,
          messages: [{ role: 'user', content: 'hi' }],
        })
      );
    });
  });

  describe('错误处理', () => {
    it('401 错误应该返回 API Key 无效提示', async () => {
      mockCreate.mockRejectedValue(new Error('401 Unauthorized'));

      const request = createRequest({
        apiKey: 'invalid-key',
        locale: 'zh',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(false);
      expect(data.error).toMatch(/无效|过期/);
    });

    it('429 错误应该返回限流提示', async () => {
      mockCreate.mockRejectedValue(new Error('429 rate limit'));

      const request = createRequest({
        apiKey: 'test-key',
        locale: 'zh',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(false);
      expect(data.error).toMatch(/频繁|稍后/);
    });

    it('超时错误应该返回超时提示', async () => {
      mockCreate.mockRejectedValue(new Error('ETIMEDOUT'));

      const request = createRequest({
        apiKey: 'test-key',
        locale: 'zh',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(false);
      expect(data.error).toMatch(/超时|网络/);
    });

    it('网络错误应该返回网络提示', async () => {
      mockCreate.mockRejectedValue(new Error('ENOTFOUND'));

      const request = createRequest({
        apiKey: 'test-key',
        locale: 'zh',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(false);
      expect(data.error).toMatch(/网络|连接/);
    });

    it('404 错误应该返回端点不存在提示', async () => {
      mockCreate.mockRejectedValue(new Error('404 Not Found'));

      const request = createRequest({
        apiKey: 'test-key',
        locale: 'zh',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(false);
      expect(data.error).toMatch(/端点|不存在|URL/);
    });

    it('未知错误应该返回通用错误提示', async () => {
      mockCreate.mockRejectedValue(new Error('Unknown error'));

      const request = createRequest({
        apiKey: 'test-key',
        locale: 'zh',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    });
  });

  describe('多语言支持', () => {
    it('中文 locale 应该返回中文错误信息', async () => {
      mockCreate.mockRejectedValue(new Error('401'));

      const request = createRequest({
        apiKey: 'invalid-key',
        locale: 'zh',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.error).toMatch(/无效|过期|失败/);
    });

    it('英文 locale 应该返回英文错误信息', async () => {
      mockCreate.mockRejectedValue(new Error('401'));

      const request = createRequest({
        apiKey: 'invalid-key',
        locale: 'en',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.error).toMatch(/invalid|expired|failed/i);
    });
  });

  describe('自定义配置', () => {
    it('应该使用自定义的 baseUrl', async () => {
      mockCreate.mockResolvedValue({
        choices: [{ message: { content: 'hi' } }],
      });

      const request = createRequest({
        apiKey: 'test-key',
        baseUrl: 'https://custom-api.com',
      });

      await POST(request);

      expect(MockedOpenAI).toHaveBeenCalledWith(
        expect.objectContaining({
          apiKey: 'test-key',
          baseURL: 'https://custom-api.com',
          timeout: 10000,
        })
      );
    });

    it('应该使用自定义的 model', async () => {
      mockCreate.mockResolvedValue({
        choices: [{ message: { content: 'hi' } }],
      });

      const request = createRequest({
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

    it('应该使用默认的 baseUrl 和 model', async () => {
      mockCreate.mockResolvedValue({
        choices: [{ message: { content: 'hi' } }],
      });

      const request = createRequest({
        apiKey: 'test-key',
      });

      await POST(request);

      expect(MockedOpenAI).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: 'https://api.deepseek.com',
        })
      );

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'deepseek-chat',
        })
      );
    });
  });
});
