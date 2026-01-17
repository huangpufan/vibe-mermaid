/**
 * 测试 Chat API 的 Mermaid 代码提取功能
 * 验证两种格式都能正确提取：
 * 1. ---MERMAID_CODE--- ... ---END_MERMAID_CODE---
 * 2. ```mermaid ... ```
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
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

describe('Chat API - Mermaid Code Extraction', () => {
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

  it('应该正确提取 ---MERMAID_CODE--- 格式的代码', async () => {
    const aiResponse = `我已为你拆解西红柿炒鸡蛋的常规流程并生成流程图：

---MERMAID_CODE---
flowchart TD
    A[开始] --> B[准备食材]
    B --> C[结束]
---END_MERMAID_CODE---

这个流程图展示了完整步骤。`;

    mockCreate.mockResolvedValue({
      choices: [{ message: { content: aiResponse } }],
    });

    const request = createRequest({
      messages: [{ role: 'user', content: '帮我画一个西红柿炒鸡蛋的流程图' }],
      apiKey: 'test-key',
      locale: 'zh',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.mermaidCode).toBe('flowchart TD\n    A[开始] --> B[准备食材]\n    B --> C[结束]');
    expect(data.reply).toContain('我已为你拆解西红柿炒鸡蛋的常规流程并生成流程图');
    expect(data.reply).toContain('这个流程图展示了完整步骤');
    expect(data.reply).not.toContain('---MERMAID_CODE---');
    expect(data.reply).not.toContain('---END_MERMAID_CODE---');
  });

  it('应该正确提取 ```mermaid 格式的代码（回退格式）', async () => {
    const aiResponse = `好的，我来帮你画一个流程图：

\`\`\`mermaid
flowchart TD
    A[开始] --> B[结束]
\`\`\`

这是一个简单的流程图。`;

    mockCreate.mockResolvedValue({
      choices: [{ message: { content: aiResponse } }],
    });

    const request = createRequest({
      messages: [{ role: 'user', content: '画一个简单的流程图' }],
      apiKey: 'test-key',
      locale: 'zh',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.mermaidCode).toBe('flowchart TD\n    A[开始] --> B[结束]');
    expect(data.reply).toContain('好的，我来帮你画一个流程图');
    expect(data.reply).toContain('这是一个简单的流程图');
    expect(data.reply).not.toContain('```mermaid');
    expect(data.reply).not.toContain('```');
  });

  it('当没有代码时应该只返回回复文本', async () => {
    const aiResponse = `我需要更多信息才能帮你画图。请告诉我：
1. 你想画什么类型的图？
2. 有哪些主要步骤？`;

    mockCreate.mockResolvedValue({
      choices: [{ message: { content: aiResponse } }],
    });

    const request = createRequest({
      messages: [{ role: 'user', content: '帮我画个图' }],
      apiKey: 'test-key',
      locale: 'zh',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.mermaidCode).toBeNull();
    expect(data.reply).toBe(aiResponse);
  });

  it('应该优先使用 ---MERMAID_CODE--- 格式而不是 ```mermaid', async () => {
    // 如果两种格式都存在，应该优先使用 ---MERMAID_CODE---
    const aiResponse = `这是主要的代码：

---MERMAID_CODE---
flowchart TD
    A[主要流程]
---END_MERMAID_CODE---

这是备用格式：
\`\`\`mermaid
flowchart TD
    B[备用流程]
\`\`\``;

    mockCreate.mockResolvedValue({
      choices: [{ message: { content: aiResponse } }],
    });

    const request = createRequest({
      messages: [{ role: 'user', content: '测试' }],
      apiKey: 'test-key',
      locale: 'zh',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.mermaidCode).toContain('主要流程');
    expect(data.mermaidCode).not.toContain('备用流程');
  });

  it('应该处理带有额外空白的代码块', async () => {
    const aiResponse = `流程图如下：

---MERMAID_CODE---

flowchart TD
    A[开始] --> B[结束]

---END_MERMAID_CODE---

完成。`;

    mockCreate.mockResolvedValue({
      choices: [{ message: { content: aiResponse } }],
    });

    const request = createRequest({
      messages: [{ role: 'user', content: '测试' }],
      apiKey: 'test-key',
      locale: 'zh',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.mermaidCode).toBe('flowchart TD\n    A[开始] --> B[结束]');
    expect(data.reply).toContain('流程图如下');
    expect(data.reply).toContain('完成');
  });
});
