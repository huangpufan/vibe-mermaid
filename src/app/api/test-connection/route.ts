import { NextRequest } from 'next/server';
import OpenAI from 'openai';
import { translations, type Locale } from '@/lib/i18n';
import { createSuccessResponse } from '@/lib/apiErrorHandler';

interface TestConnectionRequest {
  apiKey: string;
  baseUrl?: string;
  model?: string;
  locale?: Locale;
}

export async function POST(request: NextRequest) {
  let locale: Locale = 'zh';

  try {
    const body: TestConnectionRequest = await request.json();
    const { apiKey, baseUrl, model, locale: reqLocale } = body;
    locale = reqLocale || 'zh';
    const t = translations[locale];

    if (!apiKey || !apiKey.trim()) {
      return createSuccessResponse(
        { success: false, error: t.api.configApiFirst }
      );
    }

    // 如果没有提供 baseUrl 或 model，返回错误
    if (!baseUrl || !model) {
      return createSuccessResponse(
        { success: false, error: t.api.configApiFirst }
      );
    }

    const client = new OpenAI({
      apiKey,
      baseURL: baseUrl,
      timeout: 10000, // 10 秒超时
    });

    // 发送最简单的 chat completion 请求验证连通性
    await client.chat.completions.create({
      model: model,
      messages: [{ role: 'user', content: 'hi' }],
      max_tokens: 1,
    });

    return createSuccessResponse({ success: true });
  } catch (error) {
    console.error('Connection test error:', error);

    const t = translations[locale];
    
    // 根据错误类型返回更具体的错误信息
    let errorMessage = t.onboarding.connectionTestFailed;

    if (error instanceof Error) {
      const errorMsg = error.message.toLowerCase();
      if (errorMsg.includes('401') || errorMsg.includes('unauthorized')) {
        errorMessage = t.onboarding.apiKeyInvalid;
      } else if (errorMsg.includes('429') || errorMsg.includes('rate limit')) {
        errorMessage = t.onboarding.rateLimited;
      } else if (errorMsg.includes('timeout') || errorMsg.includes('etimedout')) {
        errorMessage = t.onboarding.connectionTimeout;
      } else if (errorMsg.includes('enotfound') || errorMsg.includes('network')) {
        errorMessage = t.onboarding.networkError;
      } else if (errorMsg.includes('404')) {
        errorMessage = t.onboarding.endpointNotFound;
      }
    }

    return createSuccessResponse(
      { success: false, error: errorMessage }
    );
  }
}
