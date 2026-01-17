import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorDisplay from '@/components/ErrorDisplay';
import { createErrorInfo } from '@/types/error';
import { useAppStore } from '@/lib/store';

// Mock store
vi.mock('@/lib/store', () => ({
  useAppStore: vi.fn(),
}));

describe('ErrorDisplay', () => {
  beforeEach(() => {
    (useAppStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      locale: 'zh',
    });
  });

  it('应该显示错误消息', () => {
    const error = createErrorInfo('error', '测试错误消息');
    render(<ErrorDisplay error={error} />);
    
    expect(screen.getByText('测试错误消息')).toBeInTheDocument();
  });

  it('应该根据错误级别显示不同的图标', () => {
    const warningError = createErrorInfo('warning', '警告消息');
    const { rerender } = render(<ErrorDisplay error={warningError} />);
    expect(screen.getByText('⚠️')).toBeInTheDocument();

    const errorError = createErrorInfo('error', '错误消息');
    rerender(<ErrorDisplay error={errorError} />);
    expect(screen.getByText('❌')).toBeInTheDocument();

    const fatalError = createErrorInfo('fatal', '致命错误');
    rerender(<ErrorDisplay error={fatalError} />);
    expect(screen.getByText('🚨')).toBeInTheDocument();
  });

  it('应该显示错误代码', () => {
    const error = createErrorInfo('error', '测试错误', {
      code: 'TEST_ERROR_001',
    });
    render(<ErrorDisplay error={error} />);
    
    expect(screen.getByText(/TEST_ERROR_001/)).toBeInTheDocument();
  });

  it('应该显示和隐藏详情', () => {
    const error = createErrorInfo('error', '测试错误', {
      details: '这是详细的错误信息',
    });
    render(<ErrorDisplay error={error} />);
    
    // 初始状态不显示详情
    expect(screen.queryByText('这是详细的错误信息')).not.toBeInTheDocument();
    
    // 点击详情按钮
    const detailsButton = screen.getByText('详情');
    fireEvent.click(detailsButton);
    
    // 应该显示详情
    expect(screen.getByText('这是详细的错误信息')).toBeInTheDocument();
    
    // 再次点击隐藏
    const hideButton = screen.getByText('隐藏详情');
    fireEvent.click(hideButton);
    
    // 详情应该被隐藏
    expect(screen.queryByText('这是详细的错误信息')).not.toBeInTheDocument();
  });

  it('应该显示修复建议', () => {
    const error = createErrorInfo('error', '测试错误', {
      suggestions: ['建议1', '建议2', '建议3'],
    });
    render(<ErrorDisplay error={error} />);
    
    expect(screen.getByText('建议1')).toBeInTheDocument();
    expect(screen.getByText('建议2')).toBeInTheDocument();
    expect(screen.getByText('建议3')).toBeInTheDocument();
  });

  it('应该在可恢复错误时显示重试按钮', () => {
    const onRetry = vi.fn();
    const error = createErrorInfo('error', '测试错误', {
      recoverable: true,
    });
    render(<ErrorDisplay error={error} onRetry={onRetry} />);
    
    const retryButton = screen.getByText('重试');
    expect(retryButton).toBeInTheDocument();
    
    fireEvent.click(retryButton);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('应该在不可恢复错误时不显示重试按钮', () => {
    const error = createErrorInfo('fatal', '致命错误', {
      recoverable: false,
    });
    render(<ErrorDisplay error={error} onRetry={() => {}} />);
    
    expect(screen.queryByText('重试')).not.toBeInTheDocument();
  });

  it('应该显示关闭按钮并调用回调', () => {
    const onDismiss = vi.fn();
    const error = createErrorInfo('error', '测试错误');
    render(<ErrorDisplay error={error} onDismiss={onDismiss} />);
    
    const dismissButton = screen.getByText('关闭');
    fireEvent.click(dismissButton);
    
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('应该支持英文语言', () => {
    (useAppStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      locale: 'en',
    });

    const error = createErrorInfo('error', 'Test error', {
      details: 'Error details',
    });
    render(<ErrorDisplay error={error} />);
    
    expect(screen.getByText('Details')).toBeInTheDocument();
  });

  it('应该有正确的 ARIA 属性', () => {
    const error = createErrorInfo('error', '测试错误');
    const { container } = render(<ErrorDisplay error={error} />);
    
    const alert = container.querySelector('[role="alert"]');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveAttribute('aria-live', 'assertive');
  });
});
