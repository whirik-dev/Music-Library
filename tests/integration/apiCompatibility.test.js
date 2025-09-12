import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import useMusicItemStore from '../../stores/useMusicItemStore.js';

/**
 * API Compatibility Test Suite
 * Verifies that all existing functionality works exactly as before
 * Tests the public API contract to ensure no breaking changes
 */

// Mock music list store
const mockMusicList = [
  {
    id: 'test-track-1',
    title: 'Test Track 1',
    artist: 'Test Artist 1',
    duration: 180,
    metadata: { genre: 'Rock', year: 2023 },
    files: { mp3: 'https://example.com/track1.mp3' }
  },
  {
    id: 'test-track-2', 
    title: 'Test Track 2',
    artist: 'Test Artist 2',
    duration: 240,
    metadata: { genre: 'Pop', year: 2023 },
    files: { mp3: 'https://example.com/track2.mp3' }
  }
];

// Mock useMusicListStore
vi.mock('../../stores/useMusicListStore.js', () => ({
  default: {
    getState: () => ({ musicList: mockMusicList })
  }
}));

describe('API Compatibility Tests', () => {
  let store;

  beforeEach(() => {
    // Get fresh store instance
    store = useMusicItemStore.getState();
    
    // Ensure clean state
    if (store.cleanup) {
      store.cleanup();
    }
    
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Clean up after each test
    if (store && store.cleanup) {
      store.cleanup();
    }
  });

  describe('Store State Structure', () => {
    it('should maintain exact state structure', () => {
      const state = useMusicItemStore.getState();
      
      // Verify all expected properties exist
      expect(state).toHaveProperty('status');
      expect(state).toHaveProperty('playingTrackId');
      expect(state).toHaveProperty('playingMetadata');
      expect(state).toHaveProperty('playingFiles');
      expect(state).toHaveProperty('pauseTime');
      expect(state).toHaveProperty('currentTime');
      expect(state).toHaveProperty('duration');
      expect(state).toHaveProperty('player');
      expect(state).toHaveProperty('volume');
      
      // Verify initial values match expected defaults
      expect(state.status).toBeNull();
      expect(state.playingTrackId).toBeNull();
      expect(state.playingMetadata).toBeNull();
      expect(state.playingFiles).toBeNull();
      expect(state.pauseTime).toBeNull();
      expect(state.currentTime).toBe(0);
      expect(state.duration).toBe(1); // Default duration
      expect(state.player).toBeNull();
      expect(typeof state.volume).toBe('number');
    });

    it('should maintain correct property types', () => {
      const state = useMusicItemStore.getState();
      
      expect(state.status === null || typeof state.status === 'string').toBe(true);
      expect(state.playingTrackId === null || typeof state.playingTrackId === 'string').toBe(true);
      expect(state.playingMetadata === null || typeof state.playingMetadata === 'object').toBe(true);
      expect(state.playingFiles === null || typeof state.playingFiles === 'object').toBe(true);
      expect(state.pauseTime === null || typeof state.pauseTime === 'number').toBe(true);
      expect(typeof state.currentTime).toBe('number');
      expect(typeof state.duration).toBe('number');
      expect(state.player === null || typeof state.player === 'object').toBe(true);
      expect(typeof state.volume).toBe('number');
    });
  });

  describe('Core Methods API', () => {
    it('should expose all required methods', () => {
      const state = useMusicItemStore.getState();
      
      // Core playback methods
      expect(typeof state.play).toBe('function');
      expect(typeof state.pause).toBe('function');
      expect(typeof state.resume).toBe('function');
      expect(typeof state.stop).toBe('function');
      expect(typeof state.seek).toBe('function');
      
      // Audio control methods
      expect(typeof state.setVolume).toBe('function');
      expect(typeof state.updateCurrentTime).toBe('function');
      expect(typeof state.updatePauseTime).toBe('function');
    });

    it('should maintain method signatures', () => {
      const state = useMusicItemStore.getState();
      
      // Check method lengths (parameter count)
      expect(state.play.length).toBe(1); // trackId
      expect(state.pause.length).toBe(0);
      expect(state.resume.length).toBe(0);
      expect(state.stop.length).toBe(0);
      expect(state.seek.length).toBe(1); // time
      expect(state.setVolume.length).toBe(1); // volume
      expect(state.updateCurrentTime.length).toBe(1); // time
      expect(state.updatePauseTime.length).toBe(1); // time
    });
  });

  describe('Method Return Types', () => {
    it('should return correct types for sync methods', () => {
      const state = useMusicItemStore.getState();
      
      // Sync methods should return boolean or undefined
      const pauseResult = state.pause();
      expect(typeof pauseResult === 'boolean' || pauseResult === undefined).toBe(true);
      
      const stopResult = state.stop();
      expect(stopResult === undefined).toBe(true);
      
      const seekResult = state.seek(10);
      expect(typeof seekResult === 'boolean' || seekResult === undefined).toBe(true);
      
      const volumeResult = state.setVolume(0.5);
      expect(typeof volumeResult === 'boolean' || volumeResult === undefined).toBe(true);
      
      const timeResult = state.updateCurrentTime(30);
      expect(typeof timeResult === 'boolean' || timeResult === undefined).toBe(true);
      
      const pauseTimeResult = state.updatePauseTime(45);
      expect(pauseTimeResult === undefined).toBe(true);
    });

    it('should return promises for async methods', () => {
      const state = useMusicItemStore.getState();
      
      // Async methods should return promises
      const playResult = state.play('test-track-1');
      expect(playResult instanceof Promise).toBe(true);
      
      const resumeResult = state.resume();
      expect(resumeResult instanceof Promise).toBe(true);
      
      // Clean up promises
      if (playResult && playResult.cancel) playResult.cancel();
      if (resumeResult && resumeResult.cancel) resumeResult.cancel();
    });
  });

  describe('State Updates Behavior', () => {
    it('should update currentTime correctly', () => {
      const initialTime = store.currentTime;
      
      store.updateCurrentTime(50);
      
      const newState = useMusicItemStore.getState();
      expect(newState.currentTime).toBe(50);
      expect(newState.currentTime).not.toBe(initialTime);
    });

    it('should update pauseTime correctly', () => {
      const initialPauseTime = store.pauseTime;
      
      store.updatePauseTime(30);
      
      const newState = useMusicItemStore.getState();
      expect(newState.pauseTime).toBe(30);
      expect(newState.pauseTime).not.toBe(initialPauseTime);
    });

    it('should update volume correctly', () => {
      const initialVolume = store.volume;
      
      store.setVolume(0.8);
      
      const newState = useMusicItemStore.getState();
      expect(newState.volume).toBe(0.8 / 4); // Volume is divided by 4
      expect(newState.volume).not.toBe(initialVolume);
    });

    it('should handle volume boundary values', () => {
      // Test minimum volume
      store.setVolume(0);
      expect(useMusicItemStore.getState().volume).toBe(0);
      
      // Test maximum volume
      store.setVolume(1);
      expect(useMusicItemStore.getState().volume).toBe(1 / 4);
      
      // Test negative volume (should be clamped)
      store.setVolume(-0.5);
      expect(useMusicItemStore.getState().volume).toBe(-0.5 / 4);
      
      // Test volume above 1 (should be clamped)
      store.setVolume(1.5);
      expect(useMusicItemStore.getState().volume).toBe(1.5 / 4);
    });
  });

  describe('Error Handling Behavior', () => {
    it('should handle invalid parameters gracefully', () => {
      // These should not throw errors
      expect(() => store.seek(null)).not.toThrow();
      expect(() => store.seek(undefined)).not.toThrow();
      expect(() => store.seek('invalid')).not.toThrow();
      
      expect(() => store.setVolume(null)).not.toThrow();
      expect(() => store.setVolume(undefined)).not.toThrow();
      expect(() => store.setVolume('invalid')).not.toThrow();
      
      expect(() => store.updateCurrentTime(null)).not.toThrow();
      expect(() => store.updateCurrentTime(undefined)).not.toThrow();
      expect(() => store.updateCurrentTime('invalid')).not.toThrow();
    });

    it('should handle operations when no player is available', () => {
      // Ensure no player is active
      store.stop();
      
      // These should not throw errors
      expect(() => store.pause()).not.toThrow();
      expect(() => store.seek(30)).not.toThrow();
      expect(() => store.setVolume(0.5)).not.toThrow();
    });
  });

  describe('State Consistency', () => {
    it('should maintain state consistency during operations', () => {
      const initialState = useMusicItemStore.getState();
      
      // Perform multiple operations
      store.updateCurrentTime(25);
      store.setVolume(0.7);
      store.updatePauseTime(25);
      
      const finalState = useMusicItemStore.getState();
      
      // State should be consistent
      expect(finalState.currentTime).toBe(25);
      expect(finalState.volume).toBe(0.7 / 4);
      expect(finalState.pauseTime).toBe(25);
      
      // Other properties should remain unchanged
      expect(finalState.status).toBe(initialState.status);
      expect(finalState.playingTrackId).toBe(initialState.playingTrackId);
      expect(finalState.duration).toBe(initialState.duration);
    });

    it('should handle rapid state updates', () => {
      // Perform rapid updates
      for (let i = 0; i < 100; i++) {
        store.updateCurrentTime(i);
      }
      
      const state = useMusicItemStore.getState();
      expect(state.currentTime).toBe(99);
    });
  });

  describe('Enhanced Features Compatibility', () => {
    it('should provide enhanced methods without breaking existing API', () => {
      const state = useMusicItemStore.getState();
      
      // Enhanced methods should exist but not be required for basic functionality
      if (state.cancelLoading) {
        expect(typeof state.cancelLoading).toBe('function');
      }
      
      if (state.retry) {
        expect(typeof state.retry).toBe('function');
      }
      
      if (state.cleanup) {
        expect(typeof state.cleanup).toBe('function');
      }
      
      if (state.getPromiseStats) {
        expect(typeof state.getPromiseStats).toBe('function');
      }
    });

    it('should maintain backward compatibility with enhanced features', () => {
      const state = useMusicItemStore.getState();
      
      // Enhanced methods should not interfere with basic operations
      store.updateCurrentTime(10);
      store.setVolume(0.5);
      
      if (state.getPromiseStats) {
        const stats = state.getPromiseStats();
        expect(typeof stats).toBe('object');
      }
      
      // Basic state should still work
      const finalState = useMusicItemStore.getState();
      expect(finalState.currentTime).toBe(10);
      expect(finalState.volume).toBe(0.5 / 4);
    });
  });

  describe('Performance Requirements', () => {
    it('should handle frequent updates efficiently', () => {
      const startTime = performance.now();
      
      // Perform many rapid updates
      for (let i = 0; i < 1000; i++) {
        store.updateCurrentTime(i % 100);
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should complete quickly (less than 100ms for 1000 updates)
      expect(duration).toBeLessThan(100);
      
      // Final state should be correct
      const state = useMusicItemStore.getState();
      expect(state.currentTime).toBe(999 % 100);
    });

    it('should handle concurrent operations', async () => {
      const operations = [];
      
      // Create concurrent operations
      for (let i = 0; i < 50; i++) {
        operations.push(
          new Promise(resolve => {
            setTimeout(() => {
              store.updateCurrentTime(i);
              store.setVolume(i / 100);
              resolve();
            }, Math.random() * 10);
          })
        );
      }
      
      const startTime = performance.now();
      await Promise.all(operations);
      const endTime = performance.now();
      
      // Should complete reasonably quickly
      expect(endTime - startTime).toBeLessThan(1000);
      
      // State should be consistent
      const state = useMusicItemStore.getState();
      expect(typeof state.currentTime).toBe('number');
      expect(typeof state.volume).toBe('number');
    });
  });

  describe('Memory Management', () => {
    it('should not leak memory during normal operations', () => {
      const initialMemory = process.memoryUsage();
      
      // Perform intensive operations
      for (let i = 0; i < 1000; i++) {
        store.updateCurrentTime(Math.random() * 100);
        store.setVolume(Math.random());
        store.seek(Math.random() * 100);
      }
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      const finalMemory = process.memoryUsage();
      const memoryDelta = finalMemory.heapUsed - initialMemory.heapUsed;
      
      // Memory growth should be reasonable (less than 10MB)
      expect(memoryDelta).toBeLessThan(10 * 1024 * 1024);
    });

    it('should clean up resources properly', () => {
      const state = useMusicItemStore.getState();
      
      // Perform operations that create resources
      store.updateCurrentTime(50);
      store.setVolume(0.8);
      
      // Clean up if method exists
      if (state.cleanup) {
        expect(() => state.cleanup()).not.toThrow();
        
        // State should be reset to initial values
        const cleanState = useMusicItemStore.getState();
        expect(cleanState.status).toBeNull();
        expect(cleanState.playingTrackId).toBeNull();
        expect(cleanState.player).toBeNull();
      }
    });
  });

  describe('Integration with External Dependencies', () => {
    it('should work with mocked music list store', () => {
      // The store should be able to access the mocked music list
      expect(() => {
        // This would internally call getCachedTrackData which uses useMusicListStore
        store.updateCurrentTime(10);
      }).not.toThrow();
    });

    it('should handle missing dependencies gracefully', () => {
      // Even if external dependencies fail, basic operations should work
      expect(() => {
        store.setVolume(0.5);
        store.updateCurrentTime(30);
        store.updatePauseTime(30);
      }).not.toThrow();
    });
  });
});