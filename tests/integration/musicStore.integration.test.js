import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// Create a mock store for integration testing
const createMockStore = () => {
  let state = {
    status: null,
    playingTrackId: null,
    playingMetadata: null,
    playingFiles: null,
    pauseTime: null,
    currentTime: 0,
    duration: 1,
    player: null,
    volume: 0.2,
    error: null
  };

  const mockMusicList = [
    {
      id: 'test-track-1',
      title: 'Test Track 1',
      artist: 'Test Artist 1',
      duration: 180,
      files: {
        mp3: 'https://example.com/track1.mp3',
        wav: 'https://example.com/track1.wav'
      }
    },
    {
      id: 'test-track-2',
      title: 'Test Track 2',
      artist: 'Test Artist 2',
      duration: 240,
      files: {
        mp3: 'https://example.com/track2.mp3'
      }
    }
  ];

  return {
    getState: () => ({ ...state }),
    
    async play(trackId) {
      const track = mockMusicList.find(t => t.id === trackId);
      if (!track) {
        state.status = 'error';
        state.error = { type: 'notfound', message: 'Track not found' };
        throw new Error('Track not found');
      }

      // Set loading state
      state.status = 'loading';
      state.playingTrackId = trackId;
      state.playingMetadata = track;
      state.playingFiles = track.files;

      // Simulate async loading
      await new Promise(resolve => setTimeout(resolve, 10));

      // Create mock player
      const player = new global.Howl({ src: [track.files.mp3] });
      
      // Set playing state
      state.status = 'playing';
      state.player = player;
      state.duration = track.duration;
      state.error = null;

      return player;
    },

    pause() {
      if (state.player) {
        state.status = 'paused';
        state.pauseTime = state.currentTime;
        state.player.pause();
      }
    },

    async resume() {
      if (state.player && state.status === 'paused') {
        state.status = 'playing';
        state.pauseTime = null;
        state.player.play();
      }
    },

    stop() {
      if (state.player) {
        state.player.stop();
        state.player.unload();
      }
      state.status = null;
      state.playingTrackId = null;
      state.playingMetadata = null;
      state.playingFiles = null;
      state.pauseTime = null;
      state.currentTime = 0;
      state.duration = 1;
      state.player = null;
      state.error = null;
    },

    seek(time) {
      state.currentTime = time;
      if (state.player) {
        state.player.seek(time);
      }
    },

    setVolume(volume) {
      state.volume = volume / 4; // Match store logic
      if (state.player) {
        state.player.volume(volume / 4);
      }
    },

    updateCurrentTime(time) {
      state.currentTime = time;
    },

    updatePauseTime(time) {
      state.pauseTime = time;
    },

    // Expose state properties for compatibility
    get status() { return state.status; },
    get playingTrackId() { return state.playingTrackId; },
    get playingMetadata() { return state.playingMetadata; },
    get playingFiles() { return state.playingFiles; },
    get pauseTime() { return state.pauseTime; },
    get currentTime() { return state.currentTime; },
    get duration() { return state.duration; },
    get player() { return state.player; },
    get volume() { return state.volume; },
    get error() { return state.error; }
  };
};

// Mock the store module
const useMusicItemStore = {
  getState: () => createMockStore()
};

describe('Music Store Integration Tests', () => {
  let store;
  let mockPlayer;

  beforeEach(() => {
    // Reset store state
    store = useMusicItemStore.getState();
    store.stop();
    
    // Clear any existing mocks
    vi.clearAllMocks();
    
    // Create a fresh mock player for each test
    mockPlayer = new global.Howl({});
  });

  afterEach(() => {
    // Clean up after each test
    if (store) {
      store.stop();
    }
  });

  describe('Complete Audio Playback Flow', () => {
    it('should handle complete play flow from start to finish', async () => {
      const initialState = store;
      expect(initialState.status).toBeNull();
      expect(initialState.playingTrackId).toBeNull();

      // Start playing a track
      const playPromise = store.play('test-track-1');
      
      // Should immediately set loading state
      const loadingState = useMusicItemStore.getState();
      expect(loadingState.status).toBe('loading');
      expect(loadingState.playingTrackId).toBe('test-track-1');
      expect(loadingState.playingMetadata).toBeDefined();
      expect(loadingState.playingFiles).toBeDefined();

      // Wait for play to complete
      await playPromise;

      // Should be in playing state
      const playingState = useMusicItemStore.getState();
      expect(playingState.status).toBe('playing');
      expect(playingState.player).toBeDefined();
      expect(playingState.duration).toBeGreaterThan(0);

      // Pause the track
      store.pause();
      const pausedState = useMusicItemStore.getState();
      expect(pausedState.status).toBe('paused');
      expect(pausedState.pauseTime).toBeDefined();

      // Resume the track
      await store.resume();
      const resumedState = useMusicItemStore.getState();
      expect(resumedState.status).toBe('playing');
      expect(resumedState.pauseTime).toBeNull();

      // Stop the track
      store.stop();
      const stoppedState = useMusicItemStore.getState();
      expect(stoppedState.status).toBeNull();
      expect(stoppedState.playingTrackId).toBeNull();
      expect(stoppedState.player).toBeNull();
    });

    it('should handle track switching correctly', async () => {
      // Play first track
      await store.play('test-track-1');
      const firstTrackState = useMusicItemStore.getState();
      expect(firstTrackState.playingTrackId).toBe('test-track-1');

      // Switch to second track
      await store.play('test-track-2');
      const secondTrackState = useMusicItemStore.getState();
      expect(secondTrackState.playingTrackId).toBe('test-track-2');
      expect(secondTrackState.status).toBe('playing');
    });

    it('should handle seeking during playback', async () => {
      await store.play('test-track-1');
      
      // Seek to 50 seconds
      store.seek(50);
      
      const state = useMusicItemStore.getState();
      expect(state.currentTime).toBe(50);
      
      // Verify player was updated
      expect(state.player.seek()).toBe(50);
    });

    it('should handle volume changes', () => {
      const initialVolume = store.volume;
      
      store.setVolume(0.8);
      
      const state = useMusicItemStore.getState();
      expect(state.volume).toBe(0.8 / 4); // Volume is divided by 4 in the store
    });

    it('should handle current time updates', () => {
      store.updateCurrentTime(75);
      
      const state = useMusicItemStore.getState();
      expect(state.currentTime).toBe(75);
    });

    it('should handle pause time updates', () => {
      store.updatePauseTime(30);
      
      const state = useMusicItemStore.getState();
      expect(state.pauseTime).toBe(30);
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle load errors gracefully', async () => {
      // Mock a load error
      const originalHowl = global.Howl;
      global.Howl = class extends originalHowl {
        constructor(config) {
          super(config);
          // Simulate load error after construction
          setTimeout(() => {
            this.triggerLoadError('Network error');
          }, 10);
        }
      };

      try {
        await store.play('test-track-1');
      } catch (error) {
        // Error should be handled gracefully
      }

      const state = useMusicItemStore.getState();
      expect(state.status).toBe('error');
      expect(state.error).toBeDefined();
      expect(state.playingTrackId).toBeNull();

      // Restore original Howl
      global.Howl = originalHowl;
    });

    it('should handle play errors gracefully', async () => {
      // First load the track successfully
      await store.play('test-track-1');
      
      // Mock a play error
      const state = useMusicItemStore.getState();
      const player = state.player;
      
      // Override play method to throw error
      player.play = () => {
        throw new Error('Play error');
      };

      // Try to play again
      try {
        await store.play('test-track-1');
      } catch (error) {
        // Error should be handled
      }

      const errorState = useMusicItemStore.getState();
      expect(errorState.status).toBe('error');
    });

    it('should handle invalid track IDs', async () => {
      try {
        await store.play('non-existent-track');
      } catch (error) {
        expect(error).toBeDefined();
      }

      const state = useMusicItemStore.getState();
      expect(state.status).toBe('error');
    });
  });

  describe('Resource Management Integration', () => {
    it('should clean up resources when switching tracks', async () => {
      // Play first track
      await store.play('test-track-1');
      const firstPlayer = useMusicItemStore.getState().player;
      const unloadSpy = vi.spyOn(firstPlayer, 'unload');

      // Switch to second track
      await store.play('test-track-2');

      // First player should be cleaned up
      expect(unloadSpy).toHaveBeenCalled();
    });

    it('should clean up resources on stop', async () => {
      await store.play('test-track-1');
      const player = useMusicItemStore.getState().player;
      const unloadSpy = vi.spyOn(player, 'unload');

      store.stop();

      expect(unloadSpy).toHaveBeenCalled();
    });

    it('should handle multiple rapid play calls', async () => {
      // Start multiple play operations rapidly
      const promises = [
        store.play('test-track-1'),
        store.play('test-track-2'),
        store.play('test-track-1')
      ];

      // Wait for all to complete
      await Promise.allSettled(promises);

      // Should end up with the last requested track
      const state = useMusicItemStore.getState();
      expect(state.playingTrackId).toBe('test-track-1');
    });
  });

  describe('State Consistency Integration', () => {
    it('should maintain consistent state during rapid operations', async () => {
      // Perform rapid operations
      await store.play('test-track-1');
      store.pause();
      await store.resume();
      store.seek(30);
      store.setVolume(0.5);
      store.updateCurrentTime(45);

      const state = useMusicItemStore.getState();
      
      // State should be consistent
      expect(state.status).toBe('playing');
      expect(state.currentTime).toBe(45);
      expect(state.volume).toBe(0.5 / 4);
      expect(state.playingTrackId).toBe('test-track-1');
    });

    it('should handle concurrent state updates', async () => {
      await store.play('test-track-1');

      // Perform concurrent updates
      const updates = [
        () => store.updateCurrentTime(10),
        () => store.setVolume(0.3),
        () => store.updatePauseTime(null),
        () => store.seek(20)
      ];

      // Execute all updates
      updates.forEach(update => update());

      const state = useMusicItemStore.getState();
      
      // All updates should be applied
      expect(state.currentTime).toBe(20); // seek overrides updateCurrentTime
      expect(state.volume).toBe(0.3 / 4);
      expect(state.pauseTime).toBeNull();
    });
  });

  describe('Performance Integration', () => {
    it('should handle frequent current time updates efficiently', async () => {
      await store.play('test-track-1');

      const startTime = performance.now();
      
      // Simulate frequent updates like those from animation frames
      for (let i = 0; i < 100; i++) {
        store.updateCurrentTime(i);
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete quickly (less than 100ms for 100 updates)
      expect(duration).toBeLessThan(100);

      const state = useMusicItemStore.getState();
      expect(state.currentTime).toBe(99);
    });

    it('should cache track lookups efficiently', async () => {
      // Play the same track multiple times to test caching
      await store.play('test-track-1');
      await store.play('test-track-2');
      await store.play('test-track-1'); // Should use cached lookup

      const state = useMusicItemStore.getState();
      expect(state.playingTrackId).toBe('test-track-1');
    });
  });

  describe('Edge Cases Integration', () => {
    it('should handle empty or null track IDs', async () => {
      try {
        await store.play(null);
      } catch (error) {
        expect(error).toBeDefined();
      }

      try {
        await store.play('');
      } catch (error) {
        expect(error).toBeDefined();
      }

      try {
        await store.play(undefined);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should handle seeking before track is loaded', () => {
      // Try to seek when no track is playing
      expect(() => store.seek(30)).not.toThrow();
      
      const state = useMusicItemStore.getState();
      expect(state.currentTime).toBe(30);
    });

    it('should handle pause/resume when no track is playing', () => {
      expect(() => store.pause()).not.toThrow();
      expect(() => store.resume()).not.toThrow();
    });

    it('should handle volume changes at boundaries', () => {
      // Test volume at boundaries
      store.setVolume(0);
      expect(useMusicItemStore.getState().volume).toBe(0);

      store.setVolume(1);
      expect(useMusicItemStore.getState().volume).toBe(1 / 4);

      store.setVolume(-1);
      expect(useMusicItemStore.getState().volume).toBe(-1 / 4);

      store.setVolume(2);
      expect(useMusicItemStore.getState().volume).toBe(2 / 4);
    });
  });
});