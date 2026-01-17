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
      useAppStore.getState().setCode('initial code', { skipHistory: true });
      useAppStore.getState().setCode('code 1');
      useAppStore.getState().setCode('code 2');

      const state = useAppStore.getState();
      expect(state.history.past).toHaveLength(2);
      expect(state.history.past[0]).toBe('initial code');
      expect(state.history.past[1]).toBe('code 1');
      expect(state.code).toBe('code 2');
      expect(state.canUndo).toBe(true);
      expect(state.canRedo).toBe(false);
    });

    it('should not record history when code is unchanged', () => {
      useAppStore.getState().setCode('same code', { skipHistory: true });
      useAppStore.getState().setCode('same code');

      expect(useAppStore.getState().history.past).toHaveLength(0);
    });

    it('should skip history when skipHistory option is true', () => {
      useAppStore.getState().setCode('code 1', { skipHistory: true });
      useAppStore.getState().setCode('code 2', { skipHistory: true });

      expect(useAppStore.getState().history.past).toHaveLength(0);
    });

    it('should clear future when new code is set', () => {
      useAppStore.getState().setCode('code 1', { skipHistory: true });
      useAppStore.getState().setCode('code 2');
      useAppStore.getState().undo();
      expect(useAppStore.getState().history.future).toHaveLength(1);

      useAppStore.getState().setCode('code 3');
      expect(useAppStore.getState().history.future).toHaveLength(0);
    });

    it('should limit history length to MAX_HISTORY_LENGTH', () => {
      const MAX_HISTORY_LENGTH = 50;

      useAppStore.getState().setCode('initial', { skipHistory: true });

      // Add more than MAX_HISTORY_LENGTH items
      for (let i = 0; i < MAX_HISTORY_LENGTH + 10; i++) {
        useAppStore.getState().setCode(`code ${i}`);
      }

      expect(useAppStore.getState().history.past.length).toBeLessThanOrEqual(MAX_HISTORY_LENGTH);
    });
  });

  describe('undo', () => {
    it('should undo to previous code', () => {
      useAppStore.getState().setCode('code 1', { skipHistory: true });
      useAppStore.getState().setCode('code 2');
      useAppStore.getState().setCode('code 3');

      useAppStore.getState().undo();
      const state = useAppStore.getState();
      expect(state.code).toBe('code 2');
      expect(state.history.past).toHaveLength(1);
      expect(state.history.future).toHaveLength(1);
      expect(state.history.future[0]).toBe('code 3');
    });

    it('should do nothing when there is no history', () => {
      useAppStore.getState().setCode('code 1', { skipHistory: true });
      useAppStore.getState().undo();

      const state = useAppStore.getState();
      expect(state.code).toBe('code 1');
      expect(state.history.past).toHaveLength(0);
    });

    it('should update canUndo and canRedo flags', () => {
      useAppStore.getState().setCode('code 1', { skipHistory: true });
      useAppStore.getState().setCode('code 2');
      expect(useAppStore.getState().canUndo).toBe(true);
      expect(useAppStore.getState().canRedo).toBe(false);

      useAppStore.getState().undo();
      expect(useAppStore.getState().canUndo).toBe(false);
      expect(useAppStore.getState().canRedo).toBe(true);
    });

    it('should support multiple undo operations', () => {
      useAppStore.getState().setCode('code 1', { skipHistory: true });
      useAppStore.getState().setCode('code 2');
      useAppStore.getState().setCode('code 3');
      useAppStore.getState().setCode('code 4');

      useAppStore.getState().undo();
      expect(useAppStore.getState().code).toBe('code 3');

      useAppStore.getState().undo();
      expect(useAppStore.getState().code).toBe('code 2');

      useAppStore.getState().undo();
      expect(useAppStore.getState().code).toBe('code 1');

      expect(useAppStore.getState().canUndo).toBe(false);
      expect(useAppStore.getState().canRedo).toBe(true);
    });
  });

  describe('redo', () => {
    it('should redo to next code', () => {
      useAppStore.getState().setCode('code 1', { skipHistory: true });
      useAppStore.getState().setCode('code 2');
      useAppStore.getState().setCode('code 3');
      useAppStore.getState().undo();

      useAppStore.getState().redo();
      const state = useAppStore.getState();
      expect(state.code).toBe('code 3');
      expect(state.history.past).toHaveLength(2);
      expect(state.history.future).toHaveLength(0);
    });

    it('should do nothing when there is no future', () => {
      useAppStore.getState().setCode('code 1', { skipHistory: true });
      useAppStore.getState().setCode('code 2');
      useAppStore.getState().redo();

      const state = useAppStore.getState();
      expect(state.code).toBe('code 2');
      expect(state.history.future).toHaveLength(0);
    });

    it('should update canUndo and canRedo flags', () => {
      useAppStore.getState().setCode('code 1', { skipHistory: true });
      useAppStore.getState().setCode('code 2');
      useAppStore.getState().undo();

      expect(useAppStore.getState().canUndo).toBe(false);
      expect(useAppStore.getState().canRedo).toBe(true);

      useAppStore.getState().redo();
      expect(useAppStore.getState().canUndo).toBe(true);
      expect(useAppStore.getState().canRedo).toBe(false);
    });

    it('should support multiple redo operations', () => {
      useAppStore.getState().setCode('code 1', { skipHistory: true });
      useAppStore.getState().setCode('code 2');
      useAppStore.getState().setCode('code 3');
      useAppStore.getState().setCode('code 4');

      useAppStore.getState().undo();
      useAppStore.getState().undo();
      useAppStore.getState().undo();

      useAppStore.getState().redo();
      expect(useAppStore.getState().code).toBe('code 2');

      useAppStore.getState().redo();
      expect(useAppStore.getState().code).toBe('code 3');

      useAppStore.getState().redo();
      expect(useAppStore.getState().code).toBe('code 4');

      expect(useAppStore.getState().canUndo).toBe(true);
      expect(useAppStore.getState().canRedo).toBe(false);
    });
  });

  describe('undo/redo workflow', () => {
    it('should support complete undo/redo workflow', () => {
      // Initial state
      useAppStore.getState().setCode('v1', { skipHistory: true });
      expect(useAppStore.getState().code).toBe('v1');

      // Make changes
      useAppStore.getState().setCode('v2');
      useAppStore.getState().setCode('v3');
      useAppStore.getState().setCode('v4');
      expect(useAppStore.getState().code).toBe('v4');

      // Undo twice
      useAppStore.getState().undo();
      expect(useAppStore.getState().code).toBe('v3');
      useAppStore.getState().undo();
      expect(useAppStore.getState().code).toBe('v2');

      // Redo once
      useAppStore.getState().redo();
      expect(useAppStore.getState().code).toBe('v3');

      // Make new change (should clear future)
      useAppStore.getState().setCode('v5');
      expect(useAppStore.getState().code).toBe('v5');
      expect(useAppStore.getState().history.future).toHaveLength(0);
      expect(useAppStore.getState().canRedo).toBe(false);

      // Undo to v3
      useAppStore.getState().undo();
      expect(useAppStore.getState().code).toBe('v3');
      expect(useAppStore.getState().canRedo).toBe(true);
    });
  });
});
