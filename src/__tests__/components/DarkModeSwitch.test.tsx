import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DarkModeSwitch } from '@/components/DarkModeSwitch';
import { useAppStore } from '@/lib/store';

describe('DarkModeSwitch', () => {
  beforeEach(() => {
    // 重置 store
    useAppStore.setState({
      darkMode: 'system',
    });

    // 清除 document.documentElement 的 class
    document.documentElement.className = '';
  });

  it('应该渲染三个按钮', () => {
    render(<DarkModeSwitch />);

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(3);
  });

  it('应该高亮当前选中的模式', () => {
    useAppStore.setState({ darkMode: 'light' });
    render(<DarkModeSwitch />);

    const lightButton = screen.getByTitle('浅色模式');
    expect(lightButton).toHaveClass('bg-blue-100');
  });

  it('点击浅色模式按钮应该切换到浅色模式', () => {
    render(<DarkModeSwitch />);

    const lightButton = screen.getByTitle('浅色模式');
    fireEvent.click(lightButton);

    expect(useAppStore.getState().darkMode).toBe('light');
  });

  it('点击深色模式按钮应该切换到深色模式', () => {
    render(<DarkModeSwitch />);

    const darkButton = screen.getByTitle('深色模式');
    fireEvent.click(darkButton);

    expect(useAppStore.getState().darkMode).toBe('dark');
  });

  it('点击系统模式按钮应该切换到系统模式', () => {
    useAppStore.setState({ darkMode: 'light' });
    render(<DarkModeSwitch />);

    const systemButton = screen.getByTitle('跟随系统');
    fireEvent.click(systemButton);

    expect(useAppStore.getState().darkMode).toBe('system');
  });

  it('深色模式应该添加 dark class 到 html 元素', () => {
    useAppStore.setState({ darkMode: 'dark' });
    render(<DarkModeSwitch />);

    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('浅色模式应该移除 dark class', () => {
    document.documentElement.classList.add('dark');
    useAppStore.setState({ darkMode: 'light' });
    render(<DarkModeSwitch />);

    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('系统模式应该根据系统偏好设置 dark class', () => {
    // Mock matchMedia
    const mockMatchMedia = vi.fn((query) => ({
      matches: query === '(prefers-color-scheme: dark)',
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: mockMatchMedia,
    });

    useAppStore.setState({ darkMode: 'system' });
    render(<DarkModeSwitch />);

    // 系统偏好为深色，应该添加 dark class
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('应该有正确的 aria-label', () => {
    render(<DarkModeSwitch />);

    expect(screen.getByLabelText('浅色模式')).toBeInTheDocument();
    expect(screen.getByLabelText('跟随系统')).toBeInTheDocument();
    expect(screen.getByLabelText('深色模式')).toBeInTheDocument();
  });
});
