import { NextRequest } from 'next/server';
import OpenAI from 'openai';
import { translations, type Locale } from '@/lib/i18n';
import { handleApiError, createErrorResponse, createSuccessResponse } from '@/lib/apiErrorHandler';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, apiKey, baseUrl, model, locale = 'zh' } = body;

    const t = translations[(locale as Locale) || 'zh'];

    if (!apiKey) {
      return createErrorResponse(t.api.optimizeConfigApiFirst, 400);
    }

    if (!prompt || !prompt.trim()) {
      return createErrorResponse(t.api.optimizeEnterDescription, 400);
    }

    const client = new OpenAI({
      apiKey,
      baseURL: baseUrl || 'https://ark.cn-beijing.volces.com/api/v3',
    });

    const userPrompt = locale === 'en'
      ? `Please optimize the following chart description:\n\n${prompt}`
      : `请优化以下图表描述：\n\n${prompt}`;

    const response = await client.chat.completions.create({
      model: model || 'doubao-pro-32k',
      messages: [
        { role: 'system', content: t.api.optimizeSystemPrompt },
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      temperature: 0.8,
      max_tokens: 500,
    });

    const optimizedPrompt = response.choices[0]?.message?.content?.trim() || '';

    if (!optimizedPrompt) {
      return createErrorResponse(t.api.optimizeFailed, 500);
    }

    return createSuccessResponse({ optimizedPrompt });
  } catch (error) {
    const locale = 'zh'; // Default locale for error handling
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    return handleApiError(error, locale, `${translations[locale].api.optimizeFailed}: ${errorMsg}`);
  }
}
