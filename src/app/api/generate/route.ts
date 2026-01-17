/*
 * @Date: 2026-01-17 16:53:41
 * @FilePath: \vibe-mermaid\src\app\api\generate\route.ts
 * @LastEditTime: 2026-01-17 17:46:26
 * @LastEditors: huangpufan 59730801@qq.com
 */
import { NextRequest } from 'next/server';
import OpenAI from 'openai';
import { translations, type Locale } from '@/lib/i18n';
import { handleApiError, createErrorResponse, createSuccessResponse } from '@/lib/apiErrorHandler';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, apiKey, baseUrl, model, fix, code, error, locale = 'zh' } = body;

    const t = translations[(locale as Locale) || 'zh'];

    if (!apiKey) {
      return createErrorResponse(t.api.configApiFirst, 400);
    }

    const client = new OpenAI({
      apiKey,
      baseURL: baseUrl || 'https://ark.cn-beijing.volces.com/api/v3',
    });

    let messages: { role: 'system' | 'user'; content: string }[];

    if (fix) {
      // Fix mode: fix existing code with error
      const fixPrompt = t.api.fixSystemPrompt
        .replace('{code}', code)
        .replace('{error}', error);
      messages = [
        {
          role: 'system',
          content: fixPrompt,
        },
        {
          role: 'user',
          content: locale === 'en' ? 'Please fix the Mermaid code above' : '请修复上述 Mermaid 代码',
        },
      ];
    } else {
      // Generate mode: generate new code from prompt
      if (!prompt) {
        return createErrorResponse(t.api.enterDescription, 400);
      }
      messages = [
        { role: 'system', content: t.api.generateSystemPrompt },
        { role: 'user', content: prompt },
      ];
    }

    const response = await client.chat.completions.create({
      model: model || 'doubao-pro-32k',
      messages,
      temperature: 0.7,
      max_tokens: 2000,
    });

    let generatedCode = response.choices[0]?.message?.content || '';

    // Clean up the response - remove markdown code blocks if present
    generatedCode = generatedCode
      .replace(/^```mermaid\n?/i, '')
      .replace(/^```\n?/i, '')
      .replace(/\n?```$/i, '')
      .trim();

    return createSuccessResponse({ code: generatedCode });
  } catch (err) {
    const locale = 'zh'; // Default locale for error handling
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return handleApiError(err, locale, `${translations[locale].api.generateFailed}: ${errorMsg}`);
  }
}
