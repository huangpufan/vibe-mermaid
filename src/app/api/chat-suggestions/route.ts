import { NextRequest } from 'next/server';
import OpenAI from 'openai';
import { translations, type Locale } from '@/lib/i18n';
import { handleApiError, createErrorResponse, createSuccessResponse } from '@/lib/apiErrorHandler';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, apiKey, baseUrl, model, locale = 'zh' } = body;

    const t = translations[(locale as Locale) || 'zh'];

    if (!apiKey) {
      return createErrorResponse(t.api.chatSuggestionsConfigApiFirst, 400);
    }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return createErrorResponse(t.api.chatSuggestionsMissingHistory, 400);
    }

    const client = new OpenAI({
      apiKey,
      baseURL: baseUrl || 'https://ark.cn-beijing.volces.com/api/v3',
    });

    // 构建包含对话历史的 prompt
    const userLabel = locale === 'en' ? 'User' : '用户';
    const assistantLabel = locale === 'en' ? 'AI Assistant' : 'AI助手';
    const conversationContext = messages
      .map((m: ChatMessage) => `${m.role === 'user' ? userLabel : assistantLabel}: ${m.content}`)
      .join('\n');

    const userContent = locale === 'en'
      ? `Conversation history:\n${conversationContext}\n\nPlease generate 3 follow-up suggestions.`
      : `对话历史：\n${conversationContext}\n\n请生成 3 个候选追问建议。`;

    const response = await client.chat.completions.create({
      model: model || 'doubao-pro-32k',
      messages: [
        { role: 'system', content: t.api.chatSuggestionsSystemPrompt },
        { role: 'user', content: userContent },
      ],
      temperature: 0.8,
      max_tokens: 500,
    });

    let content = response.choices[0]?.message?.content || '';

    // Clean up the response - remove markdown code blocks if present
    content = content
      .replace(/^```json\n?/i, '')
      .replace(/^```\n?/i, '')
      .replace(/\n?```$/i, '')
      .trim();

    try {
      const parsed = JSON.parse(content);

      // Validate suggestions array
      if (parsed.suggestions && Array.isArray(parsed.suggestions)) {
        parsed.suggestions = parsed.suggestions
          .filter((s: unknown) => typeof s === 'string' && s.trim().length > 0)
          .slice(0, 3)
          .map((s: string) => s.trim());
      } else {
        return createSuccessResponse({ suggestions: [] });
      }

      return createSuccessResponse(parsed);
    } catch (parseError) {
      console.error('Failed to parse chat suggestions JSON:', parseError, 'Content:', content.substring(0, 200));
      return createSuccessResponse({ suggestions: [] });
    }
  } catch (error) {
    const locale = 'zh'; // Default locale for error handling
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    return handleApiError(error, locale, `${translations[locale].api.chatSuggestionsFailed}: ${errorMsg}`);
  }
}
