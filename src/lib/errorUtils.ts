import { createErrorInfo, type ErrorInfo } from '@/types/error';
import type { Locale } from './i18n';

/**
 * 将 Mermaid 解析错误转换为 ErrorInfo
 */
export function createMermaidError(error: unknown, locale: Locale): ErrorInfo {
  const errorMessage = error instanceof Error ? error.message : String(error);

  const messages = {
    en: {
      title: 'Mermaid Syntax Error',
      suggestions: [
        'Check the Mermaid syntax documentation',
        'Verify node IDs and connections',
        'Ensure proper indentation',
      ],
    },
    zh: {
      title: 'Mermaid 语法错误',
      suggestions: [
        '检查 Mermaid 语法文档',
        '验证节点 ID 和连接',
        '确保正确的缩进',
      ],
    },
  };

  const t = messages[locale];

  return createErrorInfo('error', t.title, {
    details: errorMessage,
    suggestions: t.suggestions,
    recoverable: true,
    code: 'MERMAID_PARSE_ERROR',
  });
}

/**
 * 将 API 错误转换为 ErrorInfo
 */
export function createApiError(error: unknown, locale: Locale): ErrorInfo {
  const errorMessage = error instanceof Error ? error.message : String(error);

  const messages = {
    en: {
      unauthorized: {
        title: 'API Key Invalid',
        suggestions: [
          'Check if your API key is correct',
          'Verify the API key has not expired',
          'Try regenerating a new API key',
        ],
      },
      rateLimit: {
        title: 'Rate Limit Exceeded',
        suggestions: [
          'Wait a moment before trying again',
          'Consider upgrading your API plan',
          'Reduce request frequency',
        ],
      },
      timeout: {
        title: 'Request Timeout',
        suggestions: [
          'Check your network connection',
          'Try again later',
          'Simplify your request',
        ],
      },
      serverError: {
        title: 'Server Error',
        suggestions: [
          'The service may be temporarily unavailable',
          'Try again in a few minutes',
          'Contact support if the problem persists',
        ],
      },
      networkError: {
        title: 'Network Error',
        suggestions: [
          'Check your internet connection',
          'Verify firewall settings',
          'Try using a different network',
        ],
      },
      unknown: {
        title: 'Unknown Error',
        suggestions: [
          'Try again',
          'Check the console for more details',
          'Contact support if needed',
        ],
      },
    },
    zh: {
      unauthorized: {
        title: 'API 密钥无效',
        suggestions: [
          '检查 API 密钥是否正确',
          '验证 API 密钥是否已过期',
          '尝试重新生成新的 API 密钥',
        ],
      },
      rateLimit: {
        title: '请求频率超限',
        suggestions: [
          '稍等片刻后再试',
          '考虑升级 API 套餐',
          '降低请求频率',
        ],
      },
      timeout: {
        title: '请求超时',
        suggestions: [
          '检查网络连接',
          '稍后重试',
          '简化请求内容',
        ],
      },
      serverError: {
        title: '服务器错误',
        suggestions: [
          '服务可能暂时不可用',
          '几分钟后重试',
          '如果问题持续存在，请联系支持',
        ],
      },
      networkError: {
        title: '网络错误',
        suggestions: [
          '检查互联网连接',
          '验证防火墙设置',
          '尝试使用其他网络',
        ],
      },
      unknown: {
        title: '未知错误',
        suggestions: [
          '重试',
          '查看控制台获取更多详情',
          '如需帮助请联系支持',
        ],
      },
    },
  };

  const t = messages[locale];

  // 根据错误消息判断错误类型
  let errorType: keyof typeof t = 'unknown';
  if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
    errorType = 'unauthorized';
  } else if (errorMessage.includes('429') || errorMessage.includes('rate limit')) {
    errorType = 'rateLimit';
  } else if (errorMessage.includes('timeout') || errorMessage.includes('504')) {
    errorType = 'timeout';
  } else if (errorMessage.includes('500') || errorMessage.includes('503')) {
    errorType = 'serverError';
  } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
    errorType = 'networkError';
  }

  const errorConfig = t[errorType];

  return createErrorInfo('error', errorConfig.title, {
    details: errorMessage,
    suggestions: errorConfig.suggestions,
    recoverable: true,
    code: `API_${errorType.toUpperCase()}`,
  });
}

/**
 * 创建警告信息
 */
export function createWarning(message: string, suggestions?: string[]): ErrorInfo {
  return createErrorInfo('warning', message, {
    suggestions,
    recoverable: true,
  });
}

/**
 * 创建致命错误
 */
export function createFatalError(message: string, details?: string): ErrorInfo {
  return createErrorInfo('fatal', message, {
    details,
    recoverable: false,
  });
}
