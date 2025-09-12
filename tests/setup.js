import '@testing-library/jest-dom'

// Mock Howler.js for testing
global.Howl = class MockHowl {
  constructor(config) {
    this.config = config
    this.isPlaying = false
    this.currentTime = 0
    this.duration = 100
    this.volume = 1
    this.listeners = {}
  }

  play() {
    this.isPlaying = true
    setTimeout(() => {
      if (this.listeners.play) {
        this.listeners.play.forEach(fn => fn())
      }
    }, 0)
    return this
  }

  pause() {
    this.isPlaying = false
    if (this.listeners.pause) {
      this.listeners.pause.forEach(fn => fn())
    }
    return this
  }

  stop() {
    this.isPlaying = false
    this.currentTime = 0
    if (this.listeners.stop) {
      this.listeners.stop.forEach(fn => fn())
    }
    return this
  }

  seek(time) {
    if (time !== undefined) {
      this.currentTime = time
      return this
    }
    return this.currentTime
  }

  volume(vol) {
    if (vol !== undefined) {
      this.volume = vol
      return this
    }
    return this.volume
  }

  playing() {
    return this.isPlaying
  }

  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = []
    }
    this.listeners[event].push(callback)
    return this
  }

  off(event, callback) {
    if (this.listeners[event]) {
      if (callback) {
        this.listeners[event] = this.listeners[event].filter(fn => fn !== callback)
      } else {
        this.listeners[event] = []
      }
    }
    return this
  }

  unload() {
    this.listeners = {}
    return this
  }

  load() {
    setTimeout(() => {
      if (this.listeners.load) {
        this.listeners.load.forEach(fn => fn())
      }
    }, 0)
    return this
  }

  // Simulate loading error
  triggerLoadError(error) {
    setTimeout(() => {
      if (this.listeners.loaderror) {
        this.listeners.loaderror.forEach(fn => fn(null, error))
      }
    }, 0)
  }

  // Simulate playback end
  triggerEnd() {
    setTimeout(() => {
      if (this.listeners.end) {
        this.listeners.end.forEach(fn => fn())
      }
    }, 0)
  }
}

// Mock performance.now for consistent timing in tests
global.performance = {
  now: () => Date.now()
}

// Mock requestAnimationFrame and cancelAnimationFrame
let animationFrameId = 0
global.requestAnimationFrame = (callback) => {
  animationFrameId++
  setTimeout(() => callback(performance.now()), 16) // ~60fps
  return animationFrameId
}

global.cancelAnimationFrame = (id) => {
  // Mock implementation
}

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  warn: vi.fn(),
  error: vi.fn(),
  log: vi.fn()
}