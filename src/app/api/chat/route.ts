import { NextRequest } from 'next/server';
import OpenAI from 'openai';
import { translations, type Locale } from '@/lib/i18n';
import { handleApiError, createErrorResponse, createSuccessResponse, identifyError } from '@/lib/apiErrorHandler';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatRequestBody {
  messages: Message[];
  apiKey: string;
  baseUrl?: string;
  model?: string;
  locale?: Locale;
}

// 限制对话历史长度，避免 token 超限
const MAX_HISTORY_MESSAGES = 15; // 保留最近 15 条消息
const MAX_TOKENS_PER_MESSAGE = 2000; // 单条消息最大 token 数（粗略估算：1 token ≈ 4 字符）

function truncateMessages(messages: Message[]): Message[] {
  // 只保留最近的消息
  const recentMessages = messages.slice(-MAX_HISTORY_MESSAGES);
  
  // 截断过长的消息
  return recentMessages.map((m) => {
    let content = m.content;
    const maxLength = MAX_TOKENS_PER_MESSAGE * 4; // 粗略估算
    
    if (content.length > maxLength) {
      content = content.slice(0, maxLength) + '\n...(内容过长已截断)';
    }
    
    return {
      role: m.role,
      content,
    };
  });
}

// 验证请求体
function validateRequestBody(body: unknown): body is ChatRequestBody {
  if (!body || typeof body !== 'object') return false;
  const b = body as Record<string, unknown>;
  if (!Array.isArray(b.messages)) return false;
  if (typeof b.apiKey !== 'string') return false;
  return true;
}

export async function POST(request: NextRequest) {
  let locale: Locale = 'zh';

  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return createErrorResponse(translations.zh.api.chatInvalidRequest, 400);
    }

    if (!validateRequestBody(body)) {
      return createErrorResponse(translations.zh.api.chatInvalidParams, 400);
    }

    const { messages, apiKey, baseUrl, model, locale: reqLocale } = body;
    locale = reqLocale || 'zh';
    const t = translations[locale];

    if (!apiKey || apiKey.trim() === '') {
      return createErrorResponse(t.api.configApiFirst, 400);
    }

    if (messages.length === 0) {
      return createErrorResponse(t.api.chatMessagesEmpty, 400);
    }

    const client = new OpenAI({
      apiKey,
      baseURL: baseUrl || 'https://ark.cn-beijing.volces.com/api/v3',
    });

    // 截断消息历史以避免 token 超限
    const truncatedMessages = truncateMessages(messages);

    const response = await client.chat.completions.create({
      model: model || 'doubao-1-5-pro-32k-250115',
      messages: [
        { role: 'system', content: t.api.chatSystemPrompt },
        ...truncatedMessages.map((m: Message) => ({
          role: m.role,
          content: m.content,
        })),
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content || '';

    // 检查是否包含 Mermaid 代码 - 支持两种格式
    // 格式1: ---MERMAID_CODE--- ... ---END_MERMAID_CODE---
    // 格式2: ```mermaid ... ```
    let mermaidCode: string | null = null;
    let replyText = content;

    // 优先检查 ---MERMAID_CODE--- 格式（系统提示词中定义的格式）
    const customFormatMatch = content.match(/---MERMAID_CODE---\s*\n?([\s\S]*?)---END_MERMAID_CODE---/);
    if (customFormatMatch) {
      mermaidCode = customFormatMatch[1].trim();
      // 移除代码块，保留回复文本
      replyText = content.replace(/---MERMAID_CODE---\s*\n?[\s\S]*?---END_MERMAID_CODE---/g, '').trim();
    } else {
      // 回退到 ```mermaid 格式
      const markdownFormatMatch = content.match(/```mermaid\s*\n?([\s\S]*?)```/);
      if (markdownFormatMatch) {
        mermaidCode = markdownFormatMatch[1].trim();
        // 移除代码块，保留回复文本
        replyText = content.replace(/```mermaid\s*\n?[\s\S]*?```/g, '').trim();
      }
    }

    // Default reply when chart is generated
    const defaultReply = locale === 'en'
      ? 'Chart generated, please check the preview.'
      : '图表已生成，请查看预览。';

    return createSuccessResponse({
      reply: replyText || (mermaidCode ? defaultReply : ''),
      mermaidCode,
    });
  } catch (error) {
    // 使用 identifyError 来获取更具体的错误信息
    const errorInfo = identifyError(error, locale);
    return handleApiError(error, locale, errorInfo.message);
  }
}
