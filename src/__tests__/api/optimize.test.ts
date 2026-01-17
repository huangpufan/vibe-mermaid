import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { POST } from '@/app/api/optimize/route';
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

describe('Optimize API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  const createRequest = (body: Record<string, unknown>) => {
    return new NextRequest('http://localhost:3000/api/optimize', {
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
        prompt: '画一个流程图',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it('缺少 prompt 应该返回 400 错误', async () => {
      const request = createRequest({
        apiKey: 'test-key',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it('空的 prompt 应该返回 400 错误', async () => {
      const request = createRequest({
        apiKey: 'test-key',
        prompt: '',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it('只有空格的 prompt 应该返回 400 错误', async () => {
      const request = createRequest({
        apiKey: 'test-key',
        prompt: '   ',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });
  });

  describe('优化功能', () => {
    it('应该成功返回优化后的提示词', async () => {
      const optimizedPrompt = '一个包含开始、处理、判断和结束节点的用户登录流程图';

      mockCreate.mockResolvedValue({
        choices: [{ message: { content: optimizedPrompt } }],
      });

      const request = createRequest({
        apiKey: 'test-key',
        prompt: '登录流程',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.optimizedPrompt).toBe(optimizedPrompt);
    });

    it('应该去除优化结果的首尾空格', async () => {
      mockCreate.mockResolvedValue({
        choices: [{ message: { content: '  优化后的提示词  ' } }],
      });

      const request = createRequest({
        apiKey: 'test-key',
        prompt: '原始提示词',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.optimizedPrompt).toBe('优化后的提示词');
    });
  });

  describe('错误处理', () => {
    it('空响应应该返回 500 错误', async () => {
      mockCreate.mockResolvedValue({
        choices: [{ message: { content: '' } }],
      });

      const request = createRequest({
        apiKey: 'test-key',
        prompt: '原始提示词',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBeDefined();
    });

    it('API 错误应该返回 500', async () => {
      mockCreate.mockRejectedValue(new Error('API Error'));

      const request = createRequest({
        apiKey: 'test-key',
        prompt: '原始提示词',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toContain('API Error');
    });

    it('null 响应应该返回 500 错误', async () => {
      mockCreate.mockResolvedValue({
        choices: [{ message: { content: null } }],
      });

      const request = createRequest({
        apiKey: 'test-key',
        prompt: '原始提示词',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBeDefined();
    });
  });

  describe('多语言支持', () => {
    it('应该支持中文 locale', async () => {
      mockCreate.mockResolvedValue({
        choices: [{ message: { content: '优化后的中文提示词' } }],
      });

      const request = createRequest({
        apiKey: 'test-key',
        prompt: '中文提示词',
        locale: 'zh',
      });

      const response = await POST(request);
      expect(response.status).toBe(200);
    });

    it('应该支持英文 locale', async () => {
      mockCreate.mockResolvedValue({
        choices: [{ message: { content: 'Optimized English prompt' } }],
      });

      const request = createRequest({
        apiKey: 'test-key',
        prompt: 'English prompt',
        locale: 'en',
      });

      const response = await POST(request);
      expect(response.status).toBe(200);
    });
  });

  describe('自定义配置', () => {
    it('应该使用自定义的 baseUrl', async () => {
      mockCreate.mockResolvedValue({
        choices: [{ message: { content: '优化结果' } }],
      });

      const request = createRequest({
        apiKey: 'test-key',
        prompt: '提示词',
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
        choices: [{ message: { content: '优化结果' } }],
      });

      const request = createRequest({
        apiKey: 'test-key',
        prompt: '提示词',
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
