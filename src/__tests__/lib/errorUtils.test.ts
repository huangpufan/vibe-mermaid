import { describe, it, expect } from 'vitest';
import {
  createMermaidError,
  createApiError,
  createWarning,
  createFatalError,
} from '@/lib/errorUtils';

describe('errorUtils', () => {
  describe('createMermaidError', () => {
    it('应该创建 Mermaid 错误（中文）', () => {
      const error = new Error('Parse error on line 5');
      const errorInfo = createMermaidError(error, 'zh');

      expect(errorInfo.level).toBe('error');
      expect(errorInfo.message).toBe('Mermaid 语法错误');
      expect(errorInfo.details).toBe('Parse error on line 5');
      expect(errorInfo.suggestions).toHaveLength(3);
      expect(errorInfo.recoverable).toBe(true);
      expect(errorInfo.code).toBe('MERMAID_PARSE_ERROR');
    });

    it('应该创建 Mermaid 错误（英文）', () => {
      const error = new Error('Parse error');
      const errorInfo = createMermaidError(error, 'en');

      expect(errorInfo.message).toBe('Mermaid Syntax Error');
      expect(errorInfo.suggestions?.[0]).toContain('Check the Mermaid syntax');
    });

    it('应该处理非 Error 对象', () => {
      const errorInfo = createMermaidError('String error', 'zh');

      expect(errorInfo.details).toBe('String error');
    });
  });

  describe('createApiError', () => {
    it('应该识别 401 错误', () => {
      const error = new Error('401 Unauthorized');
      const errorInfo = createApiError(error, 'zh');

      expect(errorInfo.message).toBe('API 密钥无效');
      expect(errorInfo.code).toBe('API_UNAUTHORIZED');
      expect(errorInfo.suggestions).toContain('检查 API 密钥是否正确');
    });

    it('应该识别 429 错误', () => {
      const error = new Error('429 rate limit exceeded');
      const errorInfo = createApiError(error, 'zh');

      expect(errorInfo.message).toBe('请求频率超限');
      expect(errorInfo.code).toBe('API_RATELIMIT');
    });

    it('应该识别超时错误', () => {
      const error = new Error('Request timeout');
      const errorInfo = createApiError(error, 'zh');

      expect(errorInfo.message).toBe('请求超时');
      expect(errorInfo.code).toBe('API_TIMEOUT');
    });

    it('应该识别服务器错误', () => {
      const error = new Error('500 Internal Server Error');
      const errorInfo = createApiError(error, 'zh');

      expect(errorInfo.message).toBe('服务器错误');
      expect(errorInfo.code).toBe('API_SERVERERROR');
    });

    it('应该识别网络错误', () => {
      const error = new Error('network error');
      const errorInfo = createApiError(error, 'zh');

      expect(errorInfo.message).toBe('网络错误');
      expect(errorInfo.code).toBe('API_NETWORKERROR');
    });

    it('应该处理未知错误', () => {
      const error = new Error('Something went wrong');
      const errorInfo = createApiError(error, 'zh');

      expect(errorInfo.message).toBe('未知错误');
      expect(errorInfo.code).toBe('API_UNKNOWN');
    });

    it('应该支持英文错误消息', () => {
      const error = new Error('401 Unauthorized');
      const errorInfo = createApiError(error, 'en');

      expect(errorInfo.message).toBe('API Key Invalid');
      expect(errorInfo.suggestions?.[0]).toContain('Check if your API key is correct');
    });
  });

  describe('createWarning', () => {
    it('应该创建警告信息', () => {
      const warning = createWarning('这是一个警告');

      expect(warning.level).toBe('warning');
      expect(warning.message).toBe('这是一个警告');
      expect(warning.recoverable).toBe(true);
    });

    it('应该支持建议', () => {
      const warning = createWarning('警告', ['建议1', '建议2']);

      expect(warning.suggestions).toEqual(['建议1', '建议2']);
    });
  });

  describe('createFatalError', () => {
    it('应该创建致命错误', () => {
      const fatal = createFatalError('致命错误', '详细信息');

      expect(fatal.level).toBe('fatal');
      expect(fatal.message).toBe('致命错误');
      expect(fatal.details).toBe('详细信息');
      expect(fatal.recoverable).toBe(false);
    });
  });
});
