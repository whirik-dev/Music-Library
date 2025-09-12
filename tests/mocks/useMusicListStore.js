// Mock implementation of useMusicListStore for testing
export default {
  getState: () => ({
    musicList: [
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
      },
      {
        id: 'test-track-3',
        title: 'Test Track 3',
        artist: 'Test Artist 3',
        duration: 200,
        files: {
          mp3: 'https://example.com/track3.mp3'
        }
      }
    ]
  }),
  subscribe: vi.fn(),
  destroy: vi.fn()
}