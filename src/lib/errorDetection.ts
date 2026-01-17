/**
 * 错误检测工具函数
 * 用于统一的错误识别和处理
 */

import type { TranslationKeys } from './i18n';

/**
 * 检测消息是否为错误消息
 * @param content 消息内容
 * @param t 翻译对象
 * @returns 是否为错误消息
 */
export function isErrorMessage(content: string, t: TranslationKeys): boolean {
  if (!content) return false;
  
  const lowerContent = content.toLowerCase();
  
  // 检查是否包含错误关键词
  const errorKeywords = [
    t.chat.errorOccurred.toLowerCase(),
    'error',
    'failed',
    'failure',
    '错误',
    '失败',
    'exception',
  ];
  
  return errorKeywords.some(keyword => lowerContent.includes(keyword));
}

/**
 * 格式化错误消息
 * @param error 错误对象或字符串
 * @param t 翻译对象
 * @returns 格式化后的错误消息
 */
export function formatErrorMessage(error: unknown, t: TranslationKeys): string {
  if (error instanceof Error) {
    return `${t.chat.errorOccurred}: ${error.message}`;
  }
  
  if (typeof error === 'string') {
    return `${t.chat.errorOccurred}: ${error}`;
  }
  
  return `${t.chat.errorOccurred}: ${t.chat.unknownError || 'Unknown error'}`;
}

/**
 * 生成唯一 ID
 * 使用时间戳 + 随机数 + 计数器的组合，确保唯一性
 */
export function generateUniqueId(prefix: string = 'id', counter: number = 0): string {
  const timestamp = Date.now();
  const random1 = Math.random().toString(36).substring(2, 15);
  const random2 = Math.random().toString(36).substring(2, 9);
  const performanceNow = typeof performance !== 'undefined' ? performance.now().toString(36) : '';
  
  return `${prefix}-${timestamp}-${random1}-${counter}-${random2}-${performanceNow}`;
}
