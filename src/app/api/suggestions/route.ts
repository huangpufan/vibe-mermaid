import { NextRequest } from 'next/server';
import OpenAI from 'openai';
import { translations, type Locale } from '@/lib/i18n';
import { handleApiError, createErrorResponse, createSuccessResponse } from '@/lib/apiErrorHandler';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, code, apiKey, baseUrl, model, locale = 'zh' } = body;

    const t = translations[(locale as Locale) || 'zh'];

    if (!apiKey) {
      return createErrorResponse(t.api.suggestionsConfigApiFirst, 400);
    }

    if (!code) {
      return createErrorResponse(t.api.suggestionsMissingCode, 400);
    }

    const client = new OpenAI({
      apiKey,
      baseURL: baseUrl || 'https://ark.cn-beijing.volces.com/api/v3',
    });

    const defaultPrompt = locale === 'en' ? '(User wrote code directly)' : '（用户直接编写了代码）';
    const systemPrompt = t.api.suggestionsSystemPrompt
      .replace('{prompt}', prompt || defaultPrompt)
      .replace('{code}', code);

    const userContent = locale === 'en' ? 'Please provide modification suggestions' : '请提供修改建议';

    const response = await client.chat.completions.create({
      model: model || 'doubao-pro-32k',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent },
      ],
      temperature: 0.8,
      max_tokens: 4000,
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

      // Validate and clean up each suggestion's code
      if (parsed.suggestions && Array.isArray(parsed.suggestions)) {
        parsed.suggestions = parsed.suggestions
          .filter((suggestion: unknown): suggestion is { title: string; description: string; code: string } => {
            if (typeof suggestion !== 'object' || suggestion === null) return false;
            const s = suggestion as Record<string, unknown>;
            return typeof s.title === 'string' &&
                   typeof s.description === 'string' &&
                   typeof s.code === 'string';
          })
          .map((suggestion: { title: string; description: string; code: string }) => ({
            title: suggestion.title.trim(),
            description: suggestion.description.trim(),
            code: suggestion.code
              .replace(/^```(?:mermaid)?\n?/i, '')
              .replace(/\n?```$/i, '')
              .trim()
          }));
      } else {
        // If suggestions is missing or not an array, return empty array
        return createSuccessResponse({ suggestions: [] });
      }

      return createSuccessResponse(parsed);
    } catch (parseError) {
      // Log JSON parsing failure for debugging
      console.error('Failed to parse suggestions JSON:', parseError, 'Content:', content.substring(0, 200));
      return createSuccessResponse({ suggestions: [] });
    }
  } catch (error) {
    const locale = 'zh'; // Default locale for error handling
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    return handleApiError(error, locale, `${translations[locale].api.suggestionsFailed}: ${errorMsg}`);
  }
}
