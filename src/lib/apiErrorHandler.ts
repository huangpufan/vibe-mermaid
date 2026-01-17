import { NextResponse } from 'next/server';
import { translations, type Locale } from '@/lib/i18n';

/**
 * API 错误类型枚举
 */
export enum ApiErrorType {
  UNAUTHORIZED = 'UNAUTHORIZED',
  RATE_LIMITED = 'RATE_LIMITED',
  TIMEOUT = 'TIMEOUT',
  NETWORK_ERROR = 'NETWORK_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  INVALID_REQUEST = 'INVALID_REQUEST',
  INVALID_PARAMS = 'INVALID_PARAMS',
  MISSING_API_KEY = 'MISSING_API_KEY',
  UNKNOWN = 'UNKNOWN',
}

/**
 * API 错误信息接口
 */
export interface ApiErrorInfo {
  type: ApiErrorType;
  status: number;
  message: string;
}

/**
 * 根据错误对象和语言环境，识别错误类型并返回错误信息
 */
export function identifyError(error: unknown, locale: Locale = 'zh'): ApiErrorInfo {
  const t = translations[locale];

  // 默认错误信息
  let errorType = ApiErrorType.UNKNOWN;
  let status = 500;
  let message = locale === 'en'
    ? 'Service temporarily unavailable, please try again later'
    : '服务暂时不可用，请稍后重试';

  if (error instanceof Error) {
    const errorMessage = error.message.toLowerCase();

    // 401 未授权
    if (errorMessage.includes('401') || errorMessage.includes('unauthorized')) {
      errorType = ApiErrorType.UNAUTHORIZED;
      status = 401;
      message = t.api.chatApiKeyInvalid || message;
    }
    // 429 速率限制
    else if (errorMessage.includes('429') || errorMessage.includes('rate limit')) {
      errorType = ApiErrorType.RATE_LIMITED;
      status = 429;
      message = t.api.chatRateLimited || message;
    }
    // 超时错误
    else if (errorMessage.includes('timeout') || errorMessage.includes('etimedout')) {
      errorType = ApiErrorType.TIMEOUT;
      status = 504;
      message = t.api.chatTimeout || (locale === 'en'
        ? 'Request timeout, please try again'
        : '请求超时，请重试');
    }
    // 网络错误
    else if (errorMessage.includes('network') || errorMessage.includes('enotfound')) {
      errorType = ApiErrorType.NETWORK_ERROR;
      status = 503;
      message = locale === 'en'
        ? 'Network connection failed, please check your settings'
        : '网络连接失败，请检查网络设置';
    }
    // 404 未找到
    else if (errorMessage.includes('404')) {
      errorType = ApiErrorType.NOT_FOUND;
      status = 404;
      message = locale === 'en'
        ? 'API endpoint not found, please check your configuration'
        : 'API 端点未找到，请检查配置';
    }
  }

  return { type: errorType, status, message };
}

/**
 * 统一的 API 错误处理函数
 * 返回标准的 NextResponse 对象
 * @param error - 错误对象
 * @param locale - 语言环境
 * @param customMessage - 自定义错误消息前缀
 * @param useSpecificStatus - 是否使用具体的 HTTP 状态码（默认 false，统一返回 500）
 */
export function handleApiError(
  error: unknown,
  locale: Locale = 'zh',
  customMessage?: string,
  useSpecificStatus: boolean = false
): NextResponse {
  console.error('API Error:', error);

  const errorInfo = identifyError(error, locale);
  const message = customMessage || errorInfo.message;

  // 默认返回 500，除非明确指定使用具体状态码
  const status = useSpecificStatus ? errorInfo.status : 500;

  return NextResponse.json(
    { error: message },
    { status }
  );
}

/**
 * 验证请求体的通用函数
 */
export function validateRequestBody<T>(
  body: unknown,
  validator: (body: unknown) => body is T
): { valid: true; data: T } | { valid: false; error: string } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Invalid request body' };
  }

  if (!validator(body)) {
    return { valid: false, error: 'Invalid request parameters' };
  }

  return { valid: true, data: body };
}

/**
 * 创建标准的错误响应
 */
export function createErrorResponse(
  message: string,
  status: number = 400
): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

/**
 * 创建标准的成功响应
 */
export function createSuccessResponse<T>(data: T, status: number = 200): NextResponse {
  return NextResponse.json(data, { status });
}
