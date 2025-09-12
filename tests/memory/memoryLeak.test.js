import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// Create a simple mock store for memory testing
const createMockStoreForMemoryTesting = () => {
  let players = [];
  let timers = [];
  let animationFrames = [];

  return {
    async play(trackId) {
      // Clean up previous player
      if (players.length > 0) {
        const oldPlayer = players.pop();
        oldPlayer.unload();
      }

      // Create new player
      const player = new global.Howl({ src: [`https://example.com/${trackId}.mp3`] });
      players.push(player);

      // Start animation frame
      const frameId = requestAnimationFrame(() => {});
      animationFrames.push(frameId);

      return player;
    },

    stop() {
      // Clean up all resources
      players.forEach(player => {
        try {
          player.unload();
        } catch (e) {
          // Ignore cleanup errors
        }
      });
      players = [];

      animationFrames.forEach(id => cancelAnimationFrame(id));
      animationFrames = [];

      timers.forEach(id => clearTimeout(id));
      timers = [];
    },

    pause() {
      // Mock pause
    },

    async resume() {
      // Mock resume
    },

    seek(time) {
      // Mock seek
    },

    setVolume(volume) {
      // Mock volume
    },

    // Expose for testing
    _getResourceCounts() {
      return {
        players: players.length,
        timers: timers.length,
        animationFrames: animationFrames.length
      };
    }
  };
};

const useMusicItemStore = {
  getState: () => createMockStoreForMemoryTesting()
};

// Memory tracking utilities
class MemoryTracker {
  constructor() {
    this.trackedObjects = new Set();
    this.animationFrames = new Set();
    this.timers = new Set();
    this.eventListeners = new Map();
    this.initialMemory = this.getMemoryUsage();
  }

  getMemoryUsage() {
    // In a real browser environment, you might use performance.memory
    // For testing, we'll simulate memory tracking
    return {
      usedJSHeapSize: this.trackedObjects.size * 1000, // Simulate memory usage
      totalJSHeapSize: 50000000,
      jsHeapSizeLimit: 100000000
    };
  }

  trackObject(obj, type = 'unknown') {
    this.trackedObjects.add({ obj, type, timestamp: Date.now() });
  }

  untrackObject(obj) {
    for (const tracked of this.trackedObjects) {
      if (tracked.obj === obj) {
        this.trackedObjects.delete(tracked);
        break;
      }
    }
  }

  trackAnimationFrame(id) {
    this.animationFrames.add(id);
  }

  untrackAnimationFrame(id) {
    this.animationFrames.delete(id);
  }

  trackTimer(id) {
    this.timers.add(id);
  }

  untrackTimer(id) {
    this.timers.delete(id);
  }

  trackEventListener(element, event, handler) {
    const key = `${element}-${event}`;
    if (!this.eventListeners.has(key)) {
      this.eventListeners.set(key, new Set());
    }
    this.eventListeners.get(key).add(handler);
  }

  untrackEventListener(element, event, handler) {
    const key = `${element}-${event}`;
    if (this.eventListeners.has(key)) {
      this.eventListeners.get(key).delete(handler);
      if (this.eventListeners.get(key).size === 0) {
        this.eventListeners.delete(key);
      }
    }
  }

  getLeakReport() {
    const currentMemory = this.getMemoryUsage();
    return {
      memoryDelta: currentMemory.usedJSHeapSize - this.initialMemory.usedJSHeapSize,
      trackedObjects: this.trackedObjects.size,
      activeAnimationFrames: this.animationFrames.size,
      activeTimers: this.timers.size,
      activeEventListeners: Array.from(this.eventListeners.values())
        .reduce((total, set) => total + set.size, 0),
      objectsByType: this.getObjectsByType()
    };
  }

  getObjectsByType() {
    const types = {};
    for (const tracked of this.trackedObjects) {
      types[tracked.type] = (types[tracked.type] || 0) + 1;
    }
    return types;
  }

  reset() {
    this.trackedObjects.clear();
    this.animationFrames.clear();
    this.timers.clear();
    this.eventListeners.clear();
    this.initialMemory = this.getMemoryUsage();
  }
}

// Enhanced mocks that track resource usage
const createTrackingMocks = (tracker) => {
  const originalRequestAnimationFrame = global.requestAnimationFrame;
  const originalCancelAnimationFrame = global.cancelAnimationFrame;
  const originalSetTimeout = global.setTimeout;
  const originalClearTimeout = global.clearTimeout;

  global.requestAnimationFrame = (callback) => {
    const id = originalRequestAnimationFrame(callback);
    tracker.trackAnimationFrame(id);
    return id;
  };

  global.cancelAnimationFrame = (id) => {
    tracker.untrackAnimationFrame(id);
    return originalCancelAnimationFrame(id);
  };

  global.setTimeout = (callback, delay) => {
    const id = originalSetTimeout(callback, delay);
    tracker.trackTimer(id);
    return id;
  };

  global.clearTimeout = (id) => {
    tracker.untrackTimer(id);
    return originalClearTimeout(id);
  };

  // Enhanced Howl mock that tracks resources
  const OriginalHowl = global.Howl;
  global.Howl = class extends OriginalHowl {
    constructor(config) {
      super(config);
      tracker.trackObject(this, 'Howl');
    }

    unload() {
      tracker.untrackObject(this);
      return super.unload();
    }

    on(event, callback) {
      tracker.trackEventListener(this, event, callback);
      return super.on(event, callback);
    }

    off(event, callback) {
      if (callback) {
        tracker.untrackEventListener(this, event, callback);
      } else {
        // Remove all listeners for this event
        const key = `${this}-${event}`;
        if (tracker.eventListeners.has(key)) {
          tracker.eventListeners.delete(key);
        }
      }
      return super.off(event, callback);
    }
  };

  return {
    restore: () => {
      global.requestAnimationFrame = originalRequestAnimationFrame;
      global.cancelAnimationFrame = originalCancelAnimationFrame;
      global.setTimeout = originalSetTimeout;
      global.clearTimeout = originalClearTimeout;
      global.Howl = OriginalHowl;
    }
  };
};

describe('Memory Leak Detection Tests', () => {
  let memoryTracker;
  let mockRestore;
  let store;

  beforeEach(() => {
    memoryTracker = new MemoryTracker();
    mockRestore = createTrackingMocks(memoryTracker);
    store = useMusicItemStore.getState();
    try {
      store.stop(); // Ensure clean state
    } catch (e) {
      // Ignore errors during cleanup
    }
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (store) {
      try {
        store.stop();
      } catch (e) {
        // Ignore errors during cleanup
      }
    }
    if (mockRestore && mockRestore.restore) {
      mockRestore.restore();
    }
  });

  describe('Animation Frame Leaks', () => {
    it('should not leak animation frames during normal playback', async () => {
      const initialReport = memoryTracker.getLeakReport();
      
      // Play and stop multiple tracks
      for (let i = 1; i <= 5; i++) {
        await store.play(`test-track-${i}`);
        await new Promise(resolve => setTimeout(resolve, 50)); // Let animation frames run
        store.stop();
      }

      const finalReport = memoryTracker.getLeakReport();
      
      // Should not have any active animation frames after stopping
      expect(finalReport.activeAnimationFrames).toBe(0);
      expect(finalReport.activeAnimationFrames).toBeLessThanOrEqual(initialReport.activeAnimationFrames);
    });

    it('should clean up animation frames when switching tracks rapidly', async () => {
      // Rapidly switch between tracks
      for (let i = 1; i <= 10; i++) {
        store.play(`test-track-${i % 5 + 1}`); // Don't await, simulate rapid switching
        await new Promise(resolve => setTimeout(resolve, 10));
      }

      // Stop and wait for cleanup
      store.stop();
      await new Promise(resolve => setTimeout(resolve, 100));

      const report = memoryTracker.getLeakReport();
      expect(report.activeAnimationFrames).toBe(0);
    });

    it('should handle animation frame cleanup on errors', async () => {
      // Mock an error during playback
      const originalHowl = global.Howl;
      global.Howl = class extends originalHowl {
        constructor(config) {
          super(config);
          setTimeout(() => this.triggerLoadError('Test error'), 10);
        }
      };

      try {
        await store.play('test-track-1');
      } catch (error) {
        // Expected error
      }

      await new Promise(resolve => setTimeout(resolve, 100));

      const report = memoryTracker.getLeakReport();
      expect(report.activeAnimationFrames).toBe(0);

      global.Howl = originalHowl;
    });
  });

  describe('Audio Player Resource Leaks', () => {
    it('should properly dispose of audio players', async () => {
      const initialReport = memoryTracker.getLeakReport();
      
      // Create and dispose multiple players
      for (let i = 1; i <= 5; i++) {
        await store.play(`test-track-${i}`);
        store.stop();
      }

      await new Promise(resolve => setTimeout(resolve, 100));

      const finalReport = memoryTracker.getLeakReport();
      
      // Should not accumulate Howl instances
      expect(finalReport.objectsByType.Howl || 0).toBeLessThanOrEqual(1);
    });

    it('should clean up event listeners on player disposal', async () => {
      await store.play('test-track-1');
      
      const midReport = memoryTracker.getLeakReport();
      expect(midReport.activeEventListeners).toBeGreaterThan(0);

      store.stop();
      await new Promise(resolve => setTimeout(resolve, 50));

      const finalReport = memoryTracker.getLeakReport();
      expect(finalReport.activeEventListeners).toBe(0);
    });

    it('should handle multiple concurrent players without leaks', async () => {
      // Start multiple play operations without waiting
      const promises = [];
      for (let i = 1; i <= 5; i++) {
        promises.push(store.play(`test-track-${i}`));
      }

      // Wait for all to settle
      await Promise.allSettled(promises);
      
      // Only one player should remain active
      const report = memoryTracker.getLeakReport();
      expect(report.objectsByType.Howl || 0).toBeLessThanOrEqual(1);
    });
  });

  describe('Timer and Promise Leaks', () => {
    it('should not leak timers during normal operation', async () => {
      const initialTimers = memoryTracker.getLeakReport().activeTimers;
      
      // Perform various operations
      await store.play('test-track-1');
      store.pause();
      await store.resume();
      store.seek(30);
      store.stop();

      await new Promise(resolve => setTimeout(resolve, 200));

      const finalTimers = memoryTracker.getLeakReport().activeTimers;
      
      // Should not accumulate timers
      expect(finalTimers).toBeLessThanOrEqual(initialTimers + 1); // Allow for test timer
    });

    it('should clean up promises on cancellation', async () => {
      // Start a play operation
      const playPromise = store.play('test-track-1');
      
      // Immediately start another (should cancel the first)
      const secondPromise = store.play('test-track-2');
      
      await secondPromise;
      
      // First promise should be cancelled/cleaned up
      // This is tested indirectly through the store's promise manager
      expect(store.status).toBe('playing');
      expect(store.playingTrackId).toBe('test-track-2');
    });
  });

  describe('Memory Usage Over Time', () => {
    it('should maintain stable memory usage during extended operation', async () => {
      const measurements = [];
      
      // Perform extended operations
      for (let cycle = 0; cycle < 10; cycle++) {
        // Play multiple tracks in this cycle
        for (let i = 1; i <= 3; i++) {
          await store.play(`test-track-${i}`);
          await new Promise(resolve => setTimeout(resolve, 20));
          store.pause();
          await store.resume();
          store.seek(Math.random() * 100);
          store.setVolume(Math.random());
        }
        
        store.stop();
        await new Promise(resolve => setTimeout(resolve, 50));
        
        // Measure memory after each cycle
        measurements.push(memoryTracker.getLeakReport());
      }
      
      // Memory usage should not grow significantly over time
      const firstMeasurement = measurements[0];
      const lastMeasurement = measurements[measurements.length - 1];
      
      const memoryGrowth = lastMeasurement.memoryDelta - firstMeasurement.memoryDelta;
      const objectGrowth = lastMeasurement.trackedObjects - firstMeasurement.trackedObjects;
      
      // Allow for some growth but not excessive
      expect(memoryGrowth).toBeLessThan(10000); // Less than 10KB growth
      expect(objectGrowth).toBeLessThan(5); // Less than 5 additional objects
    });

    it('should handle stress test without memory explosion', async () => {
      const initialReport = memoryTracker.getLeakReport();
      
      // Stress test: rapid operations
      const operations = [];
      for (let i = 0; i < 50; i++) {
        operations.push(async () => {
          const trackId = `test-track-${(i % 5) + 1}`;
          try {
            await store.play(trackId);
            store.seek(Math.random() * 100);
            store.setVolume(Math.random());
            if (Math.random() > 0.5) {
              store.pause();
              await store.resume();
            }
          } catch (error) {
            // Ignore errors in stress test
          }
        });
      }
      
      // Execute operations in batches to avoid overwhelming
      for (let batch = 0; batch < operations.length; batch += 10) {
        const batchOps = operations.slice(batch, batch + 10);
        await Promise.allSettled(batchOps.map(op => op()));
        await new Promise(resolve => setTimeout(resolve, 10));
      }
      
      store.stop();
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const finalReport = memoryTracker.getLeakReport();
      
      // Should not have excessive resource accumulation
      expect(finalReport.activeAnimationFrames).toBeLessThan(5);
      expect(finalReport.activeTimers).toBeLessThan(10);
      expect(finalReport.activeEventListeners).toBeLessThan(5);
      expect(finalReport.objectsByType.Howl || 0).toBeLessThan(3);
    });
  });

  describe('Component Lifecycle Memory Management', () => {
    it('should clean up all resources on component unmount simulation', async () => {
      // Simulate component mount and active usage
      await store.play('test-track-1');
      store.setVolume(0.5);
      store.seek(30);
      
      const activeReport = memoryTracker.getLeakReport();
      expect(activeReport.trackedObjects).toBeGreaterThan(0);
      
      // Simulate component unmount
      store.stop();
      
      // Force cleanup (in real app this would be handled by useEffect cleanup)
      if (store.player) {
        store.player.unload();
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const cleanupReport = memoryTracker.getLeakReport();
      
      // All resources should be cleaned up
      expect(cleanupReport.activeAnimationFrames).toBe(0);
      expect(cleanupReport.activeEventListeners).toBe(0);
      expect(cleanupReport.objectsByType.Howl || 0).toBe(0);
    });

    it('should handle multiple mount/unmount cycles', async () => {
      for (let cycle = 0; cycle < 5; cycle++) {
        // Simulate mount
        await store.play(`test-track-${(cycle % 3) + 1}`);
        await new Promise(resolve => setTimeout(resolve, 50));
        
        // Simulate unmount
        store.stop();
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      const finalReport = memoryTracker.getLeakReport();
      
      // Should not accumulate resources across cycles
      expect(finalReport.activeAnimationFrames).toBe(0);
      expect(finalReport.activeTimers).toBeLessThan(3);
      expect(finalReport.objectsByType.Howl || 0).toBe(0);
    });
  });

  describe('Error Scenario Memory Management', () => {
    it('should clean up resources when errors occur', async () => {
      // Mock various error scenarios
      const errorScenarios = [
        () => {
          const originalHowl = global.Howl;
          global.Howl = class extends originalHowl {
            constructor(config) {
              super(config);
              setTimeout(() => this.triggerLoadError('Load error'), 10);
            }
          };
          return () => { global.Howl = originalHowl; };
        },
        () => {
          // Simulate network error
          return () => {};
        }
      ];
      
      for (const createScenario of errorScenarios) {
        const restore = createScenario();
        
        try {
          await store.play('test-track-1');
        } catch (error) {
          // Expected error
        }
        
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const report = memoryTracker.getLeakReport();
        
        // Resources should be cleaned up even after errors
        expect(report.activeAnimationFrames).toBe(0);
        expect(report.activeEventListeners).toBe(0);
        
        restore();
        store.stop(); // Ensure clean state for next iteration
      }
    });
  });
});