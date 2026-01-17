import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from '@/lib/store';

describe('History (Undo/Redo)', () => {
  beforeEach(() => {
    // Reset store before each test by directly setting state
    useAppStore.setState({
      code: 'initial code',
      history: { past: [], future: [] },
      canUndo: false,
      canRedo: false,
    });
  });

  describe('setCode', () => {
    it('should record history when code changes', () => {
      const store = useAppStore.getState();
      
      store.setCode('initial code', { skipHistory: true });
      store.setCode('code 1');
      store.setCode('code 2');
      
      expect(store.history.past).toHaveLength(2);
      expect(store.history.past[0]).toBe('initial code');
      expect(store.history.past[1]).toBe('code 1');
      expect(store.code).toBe('code 2');
      expect(store.canUndo).toBe(true);
      expect(store.canRedo).toBe(false);
    });

    it('should not record history when code is unchanged', () => {
      const store = useAppStore.getState();
      
      store.setCode('same code', { skipHistory: true });
      store.setCode('same code');
      
      expect(store.history.past).toHaveLength(0);
    });

    it('should skip history when skipHistory option is true', () => {
      const store = useAppStore.getState();
      
      store.setCode('code 1', { skipHistory: true });
      store.setCode('code 2', { skipHistory: true });
      
      expect(store.history.past).toHaveLength(0);
    });

    it('should clear future when new code is set', () => {
      const store = useAppStore.getState();
      
      store.setCode('code 1', { skipHistory: true });
      store.setCode('code 2');
      store.undo();
      expect(store.history.future).toHaveLength(1);
      
      store.setCode('code 3');
      expect(store.history.future).toHaveLength(0);
    });

    it('should limit history length to MAX_HISTORY_LENGTH', () => {
      const store = useAppStore.getState();
      const MAX_HISTORY_LENGTH = 50;
      
      store.setCode('initial', { skipHistory: true });
      
      // Add more than MAX_HISTORY_LENGTH items
      for (let i = 0; i < MAX_HISTORY_LENGTH + 10; i++) {
        store.setCode(`code ${i}`);
      }
      
      expect(store.history.past.length).toBeLessThanOrEqual(MAX_HISTORY_LENGTH);
    });
  });

  describe('undo', () => {
    it('should undo to previous code', () => {
      const store = useAppStore.getState();
      
      store.setCode('code 1', { skipHistory: true });
      store.setCode('code 2');
      store.setCode('code 3');
      
      store.undo();
      expect(store.code).toBe('code 2');
      expect(store.history.past).toHaveLength(1);
      expect(store.history.future).toHaveLength(1);
      expect(store.history.future[0]).toBe('code 3');
    });

    it('should do nothing when there is no history', () => {
      const store = useAppStore.getState();
      
      store.setCode('code 1', { skipHistory: true });
      store.undo();
      
      expect(store.code).toBe('code 1');
      expect(store.history.past).toHaveLength(0);
    });

    it('should update canUndo and canRedo flags', () => {
      const store = useAppStore.getState();
      
      store.setCode('code 1', { skipHistory: true });
      store.setCode('code 2');
      expect(store.canUndo).toBe(true);
      expect(store.canRedo).toBe(false);
      
      store.undo();
      expect(store.canUndo).toBe(false);
      expect(store.canRedo).toBe(true);
    });

    it('should support multiple undo operations', () => {
      const store = useAppStore.getState();
      
      store.setCode('code 1', { skipHistory: true });
      store.setCode('code 2');
      store.setCode('code 3');
      store.setCode('code 4');
      
      store.undo();
      expect(store.code).toBe('code 3');
      
      store.undo();
      expect(store.code).toBe('code 2');
      
      store.undo();
      expect(store.code).toBe('code 1');
      
      expect(store.canUndo).toBe(false);
      expect(store.canRedo).toBe(true);
    });
  });

  describe('redo', () => {
    it('should redo to next code', () => {
      const store = useAppStore.getState();
      
      store.setCode('code 1', { skipHistory: true });
      store.setCode('code 2');
      store.setCode('code 3');
      store.undo();
      
      store.redo();
      expect(store.code).toBe('code 3');
      expect(store.history.past).toHaveLength(2);
      expect(store.history.future).toHaveLength(0);
    });

    it('should do nothing when there is no future', () => {
      const store = useAppStore.getState();
      
      store.setCode('code 1', { skipHistory: true });
      store.setCode('code 2');
      store.redo();
      
      expect(store.code).toBe('code 2');
      expect(store.history.future).toHaveLength(0);
    });

    it('should update canUndo and canRedo flags', () => {
      const store = useAppStore.getState();
      
      store.setCode('code 1', { skipHistory: true });
      store.setCode('code 2');
      store.undo();
      
      expect(store.canUndo).toBe(false);
      expect(store.canRedo).toBe(true);
      
      store.redo();
      expect(store.canUndo).toBe(true);
      expect(store.canRedo).toBe(false);
    });

    it('should support multiple redo operations', () => {
      const store = useAppStore.getState();
      
      store.setCode('code 1', { skipHistory: true });
      store.setCode('code 2');
      store.setCode('code 3');
      store.setCode('code 4');
      
      store.undo();
      store.undo();
      store.undo();
      
      store.redo();
      expect(store.code).toBe('code 2');
      
      store.redo();
      expect(store.code).toBe('code 3');
      
      store.redo();
      expect(store.code).toBe('code 4');
      
      expect(store.canUndo).toBe(true);
      expect(store.canRedo).toBe(false);
    });
  });

  describe('undo/redo workflow', () => {
    it('should support complete undo/redo workflow', () => {
      const store = useAppStore.getState();
      
      // Initial state
      store.setCode('v1', { skipHistory: true });
      expect(store.code).toBe('v1');
      
      // Make changes
      store.setCode('v2');
      store.setCode('v3');
      store.setCode('v4');
      expect(store.code).toBe('v4');
      
      // Undo twice
      store.undo();
      expect(store.code).toBe('v3');
      store.undo();
      expect(store.code).toBe('v2');
      
      // Redo once
      store.redo();
      expect(store.code).toBe('v3');
      
      // Make new change (should clear future)
      store.setCode('v5');
      expect(store.code).toBe('v5');
      expect(store.history.future).toHaveLength(0);
      expect(store.canRedo).toBe(false);
      
      // Undo to v3
      store.undo();
      expect(store.code).toBe('v3');
      expect(store.canRedo).toBe(true);
    });
  });
});
