import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from '@/lib/store';

describe('Loading State Management', () => {
  beforeEach(() => {
    // Reset store before each test
    const store = useAppStore.getState();
    store.setLoadingState('rendering', false);
    store.setLoadingState('exporting', false);
    store.setLoadingState('validating', false);
    store.setLoadingState('themeChanging', false);
  });

  it('should initialize with all loading states as false', () => {
    const { loadingState } = useAppStore.getState();
    expect(loadingState.rendering).toBe(false);
    expect(loadingState.exporting).toBe(false);
    expect(loadingState.validating).toBe(false);
    expect(loadingState.themeChanging).toBe(false);
  });

  it('should update rendering state', () => {
    const { setLoadingState } = useAppStore.getState();
    
    setLoadingState('rendering', true);
    expect(useAppStore.getState().loadingState.rendering).toBe(true);
    
    setLoadingState('rendering', false);
    expect(useAppStore.getState().loadingState.rendering).toBe(false);
  });

  it('should update exporting state', () => {
    const { setLoadingState } = useAppStore.getState();
    
    setLoadingState('exporting', true);
    expect(useAppStore.getState().loadingState.exporting).toBe(true);
    
    setLoadingState('exporting', false);
    expect(useAppStore.getState().loadingState.exporting).toBe(false);
  });

  it('should update validating state', () => {
    const { setLoadingState } = useAppStore.getState();
    
    setLoadingState('validating', true);
    expect(useAppStore.getState().loadingState.validating).toBe(true);
    
    setLoadingState('validating', false);
    expect(useAppStore.getState().loadingState.validating).toBe(false);
  });

  it('should update themeChanging state', () => {
    const { setLoadingState } = useAppStore.getState();
    
    setLoadingState('themeChanging', true);
    expect(useAppStore.getState().loadingState.themeChanging).toBe(true);
    
    setLoadingState('themeChanging', false);
    expect(useAppStore.getState().loadingState.themeChanging).toBe(false);
  });

  it('should update multiple loading states independently', () => {
    const { setLoadingState } = useAppStore.getState();
    
    setLoadingState('rendering', true);
    setLoadingState('validating', true);
    
    const { loadingState } = useAppStore.getState();
    expect(loadingState.rendering).toBe(true);
    expect(loadingState.validating).toBe(true);
    expect(loadingState.exporting).toBe(false);
    expect(loadingState.themeChanging).toBe(false);
  });

  it('should not affect other states when updating one state', () => {
    const { setLoadingState } = useAppStore.getState();
    
    setLoadingState('rendering', true);
    setLoadingState('exporting', true);
    
    setLoadingState('rendering', false);
    
    const { loadingState } = useAppStore.getState();
    expect(loadingState.rendering).toBe(false);
    expect(loadingState.exporting).toBe(true);
  });
});
