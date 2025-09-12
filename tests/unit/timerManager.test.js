import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// We need to extract the timer manager creation function for testing
// Since it's internal to the store, we'll create a test version
const createTimerManager = () => ({
  animationFrameId: null,
  lastUpdateTime: 0,
  skipNextUpdate: false,
  isRunning: false,
  lastSeekTime: null,
  
  start: function(updateCallback) {
    if (this.isRunning) {
      return; // Prevent multiple timers
    }
    
    const update = (currentTime) => {
      if (!this.isRunning) {
        return;
      }
      
      const timeDiff = currentTime - this.lastUpdateTime;
      if (timeDiff >= 100) { // UPDATE_INTERVAL
        if (!this.skipNextUpdate) {
          const now = performance.now();
          if (!this.lastSeekTime || (now - this.lastSeekTime) > 100) { // SEEK_DEBOUNCE_TIME
            updateCallback();
          }
        } else {
          this.skipNextUpdate = false;
        }
        this.lastUpdateTime = currentTime;
      }
      
      if (this.isRunning) {
        this.animationFrameId = requestAnimationFrame(update);
      }
    };

    this.stop();
    this.isRunning = true;
    this.lastUpdateTime = performance.now();
    this.animationFrameId = requestAnimationFrame(update);
  },

  stop: function() {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.lastUpdateTime = 0;
  },

  reset: function() {
    this.stop();
    this.skipNextUpdate = false;
    this.lastUpdateTime = 0;
    this.lastSeekTime = null;
  },

  skipNext: function() {
    this.skipNextUpdate = true;
    this.lastSeekTime = performance.now();
  }
});

describe('TimerManager', () => {
  let timerManager;
  let updateCallback;

  beforeEach(() => {
    timerManager = createTimerManager();
    updateCallback = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(() => {
    timerManager.stop();
  });

  describe('start', () => {
    it('should start the timer and call update callback', async () => {
      timerManager.start(updateCallback);
      
      expect(timerManager.isRunning).toBe(true);
      expect(timerManager.animationFrameId).not.toBeNull();
      
      // Wait for animation frame and update interval
      await new Promise(resolve => setTimeout(resolve, 150));
      
      expect(updateCallback).toHaveBeenCalled();
    });

    it('should not start multiple timers', () => {
      timerManager.start(updateCallback);
      const firstFrameId = timerManager.animationFrameId;
      
      timerManager.start(updateCallback);
      
      expect(timerManager.animationFrameId).toBe(firstFrameId);
    });

    it('should respect update interval', async () => {
      timerManager.start(updateCallback);
      
      // Wait less than update interval
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Should not have called callback yet due to interval
      expect(updateCallback).not.toHaveBeenCalled();
    });
  });

  describe('stop', () => {
    it('should stop the timer', () => {
      timerManager.start(updateCallback);
      expect(timerManager.isRunning).toBe(true);
      
      timerManager.stop();
      
      expect(timerManager.isRunning).toBe(false);
      expect(timerManager.animationFrameId).toBeNull();
      expect(timerManager.lastUpdateTime).toBe(0);
    });
  });

  describe('reset', () => {
    it('should reset all timer state', () => {
      timerManager.start(updateCallback);
      timerManager.skipNext();
      
      timerManager.reset();
      
      expect(timerManager.isRunning).toBe(false);
      expect(timerManager.animationFrameId).toBeNull();
      expect(timerManager.skipNextUpdate).toBe(false);
      expect(timerManager.lastUpdateTime).toBe(0);
      expect(timerManager.lastSeekTime).toBeNull();
    });
  });

  describe('skipNext', () => {
    it('should skip the next update', async () => {
      timerManager.start(updateCallback);
      timerManager.skipNext();
      
      expect(timerManager.skipNextUpdate).toBe(true);
      expect(timerManager.lastSeekTime).not.toBeNull();
      
      // Wait for animation frame
      await new Promise(resolve => setTimeout(resolve, 120));
      
      // First update should be skipped
      expect(updateCallback).not.toHaveBeenCalled();
      
      // Wait for second update
      await new Promise(resolve => setTimeout(resolve, 120));
      
      // Second update should proceed
      expect(updateCallback).toHaveBeenCalled();
    });
  });

  describe('seek debouncing', () => {
    it('should debounce updates after seek', async () => {
      timerManager.start(updateCallback);
      timerManager.skipNext();
      
      // Wait less than debounce time
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Should not call update due to debouncing
      expect(updateCallback).not.toHaveBeenCalled();
      
      // Wait for debounce time to pass and update interval
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Now should call update
      expect(updateCallback).toHaveBeenCalled();
    });
  });
});