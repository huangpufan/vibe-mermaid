import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { POST } from '@/app/api/generate/route';
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

describe('Generate API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  const createRequest = (body: Record<string, unknown>) => {
    return new NextRequest('http://localhost:3000/api/generate', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  };

  describe('参数验证', () => {
    it('缺少 apiKey 时应该返回 400 错误', async () => {
      const request = createRequest({
        prompt: '画一个流程图',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it('生成模式下缺少 prompt 时应该返回 400 错误', async () => {
      const request = createRequest({
        apiKey: 'test-key',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it('修复模式下不需要 prompt', async () => {
      mockCreate.mockResolvedValue({
        choices: [{ message: { content: 'graph TD\n  A --> B' } }],
      });

      const request = createRequest({
        apiKey: 'test-key',
        fix: true,
        code: 'graph TD\n  A --> B',
        error: 'syntax error',
      });

      const response = await POST(request);
      expect(response.status).toBe(200);
    });
  });

  describe('生成模式', () => {
    it('应该成功生成 Mermaid 代码', async () => {
      const generatedCode = 'graph TD\n  A[开始] --> B[结束]';
      mockCreate.mockResolvedValue({
        choices: [{ message: { content: generatedCode } }],
      });

      const request = createRequest({
        apiKey: 'test-key',
        prompt: '画一个简单的流程图',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.code).toBe(generatedCode);
    });

    it('应该清理 markdown 代码块标记', async () => {
      const rawCode = '```mermaid\ngraph TD\n  A --> B\n```';
      mockCreate.mockResolvedValue({
        choices: [{ message: { content: rawCode } }],
      });

      const request = createRequest({
        apiKey: 'test-key',
        prompt: '画一个流程图',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.code).toBe('graph TD\n  A --> B');
      expect(data.code).not.toContain('```');
    });

    it('应该使用自定义的 baseUrl 和 model', async () => {
      mockCreate.mockResolvedValue({
        choices: [{ message: { content: 'graph TD\n  A --> B' } }],
      });

      const request = createRequest({
        apiKey: 'test-key',
        baseUrl: 'https://custom-api.com',
        model: 'custom-model',
        prompt: '画一个流程图',
      });

      await POST(request);

      // 验证 OpenAI 客户端被正确配置
      expect(MockedOpenAI).toHaveBeenCalledWith({
        apiKey: 'test-key',
        baseURL: 'https://custom-api.com',
      });
    });
  });

  describe('修复模式', () => {
    it('应该成功修复有错误的代码', async () => {
      const fixedCode = 'graph TD\n  A --> B';
      mockCreate.mockResolvedValue({
        choices: [{ message: { content: fixedCode } }],
      });

      const request = createRequest({
        apiKey: 'test-key',
        fix: true,
        code: 'graph TD\n  A -> B', // 错误的语法
        error: 'Parse error',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.code).toBe(fixedCode);
    });
  });

  describe('多语言支持', () => {
    it('应该支持中文 locale', async () => {
      mockCreate.mockResolvedValue({
        choices: [{ message: { content: 'graph TD\n  A --> B' } }],
      });

      const request = createRequest({
        apiKey: 'test-key',
        prompt: '画一个流程图',
        locale: 'zh',
      });

      const response = await POST(request);
      expect(response.status).toBe(200);
    });

    it('应该支持英文 locale', async () => {
      mockCreate.mockResolvedValue({
        choices: [{ message: { content: 'graph TD\n  A --> B' } }],
      });

      const request = createRequest({
        apiKey: 'test-key',
        prompt: 'Draw a flowchart',
        locale: 'en',
      });

      const response = await POST(request);
      expect(response.status).toBe(200);
    });
  });

  describe('错误处理', () => {
    it('API 调用失败时应该返回 500 错误', async () => {
      mockCreate.mockRejectedValue(new Error('API Error'));

      const request = createRequest({
        apiKey: 'test-key',
        prompt: '画一个流程图',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toContain('API Error');
    });

    it('应该处理空响应', async () => {
      mockCreate.mockResolvedValue({
        choices: [{ message: { content: '' } }],
      });

      const request = createRequest({
        apiKey: 'test-key',
        prompt: '画一个流程图',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.code).toBe('');
    });

    it('应该处理 null 响应', async () => {
      mockCreate.mockResolvedValue({
        choices: [{ message: { content: null } }],
      });

      const request = createRequest({
        apiKey: 'test-key',
        prompt: '画一个流程图',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.code).toBe('');
    });
  });
});
