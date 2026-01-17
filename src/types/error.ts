/**
 * 错误级别
 */
export type ErrorLevel = 'warning' | 'error' | 'fatal';

/**
 * 错误信息接口
 */
export interface ErrorInfo {
  /** 错误级别 */
  level: ErrorLevel;
  /** 错误消息 */
  message: string;
  /** 错误详情（可选） */
  details?: string;
  /** 修复建议（可选） */
  suggestions?: string[];
  /** 是否可恢复 */
  recoverable: boolean;
  /** 错误代码（可选） */
  code?: string;
  /** 时间戳 */
  timestamp?: number;
}

/**
 * 创建错误信息
 */
export function createErrorInfo(
  level: ErrorLevel,
  message: string,
  options?: {
    details?: string;
    suggestions?: string[];
    recoverable?: boolean;
    code?: string;
  }
): ErrorInfo {
  return {
    level,
    message,
    details: options?.details,
    suggestions: options?.suggestions,
    recoverable: options?.recoverable ?? true,
    code: options?.code,
    timestamp: Date.now(),
  };
}
