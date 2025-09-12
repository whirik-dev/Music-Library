# Design Document

## Overview

This design document outlines the refactoring approach for the music player store to address memory leaks, improve error handling, enhance state consistency, optimize performance, and maintain clean code structure while preserving full API compatibility. The refactoring will transform the existing global variable-based approach into a more robust, encapsulated solution.

## Architecture

### Current Architecture Issues
- Global variables (`animationFrameId`, `lastUpdateTime`, `updateInterval`, `skipNextUpdate`) create potential conflicts
- Promise cancellation logic is mixed with business logic
- Error handling lacks proper cleanup and user feedback
- State updates are inconsistent and prone to race conditions

### New Architecture Approach
- **Encapsulated State Management**: Move all global variables into store instance
- **Centralized Resource Management**: Single point for cleanup and resource disposal
- **Separated Concerns**: Distinct modules for timer management, error handling, and audio control
- **Consistent State Transitions**: Atomic state updates with proper validation

## Components and Interfaces

### 1. Timer Management Module
```javascript
// Internal timer management - encapsulated within store
const createTimerManager = () => ({
  animationFrameId: null,
  lastUpdateTime: 0,
  updateInterval: 100, // Named constant instead of magic number
  skipNextUpdate: false,
  
  start: (updateCallback) => { /* implementation */ },
  stop: () => { /* implementation */ },
  reset: () => { /* implementation */ }
});
```

### 2. Promise Management Module
```javascript
// Centralized promise cancellation
const createPromiseManager = () => ({
  currentPromise: null,
  
  register: (promise) => { /* implementation */ },
  cancel: () => { /* implementation */ },
  clear: () => { /* implementation */ }
});
```

### 3. Error Handler Module
```javascript
// Comprehensive error handling with cleanup
const createErrorHandler = () => ({
  handleLoadError: (error, cleanup) => { /* implementation */ },
  handlePlayError: (error, cleanup) => { /* implementation */ },
  handleNetworkError: (error, retry) => { /* implementation */ }
});
```

### 4. Audio Resource Manager
```javascript
// Centralized audio resource management
const createAudioManager = () => ({
  currentPlayer: null,
  
  createPlayer: (config) => { /* implementation */ },
  disposePlayer: (player) => { /* implementation */ },
  switchPlayer: (newPlayer) => { /* implementation */ }
});
```

### 5. State Validator
```javascript
// Ensure state consistency
const createStateValidator = () => ({
  validateTransition: (fromState, toState) => { /* implementation */ },
  sanitizeState: (state) => { /* implementation */ }
});
```

## Data Models

### Store State Structure (Unchanged for API Compatibility)
```javascript
{
  status: null | 'loading' | 'playing' | 'paused',
  playingTrackId: null | string,
  playingMetadata: null | object,
  playingFiles: null | object, // Fixed typo from 'playingfiles'
  pauseTime: null | number,
  currentTime: number,
  duration: number,
  player: null | Howl,
  volume: number
}
```

### Internal Management State (New - Encapsulated)
```javascript
{
  timer: TimerManager,
  promises: PromiseManager,
  errorHandler: ErrorHandler,
  audioManager: AudioManager,
  validator: StateValidator,
  
  // Constants
  VOLUME_DIVISOR: 4, // Named constant for volume calculation
  UPDATE_INTERVAL: 100,
  MIN_TIME_DIFF: 0.05
}
```

## Error Handling

### 1. Load Error Handling
- **Before**: Simple reject with basic error message
- **After**: Comprehensive error categorization with specific user messages
- **Cleanup**: Automatic resource disposal and state reset
- **User Feedback**: Clear error messages indicating the specific problem

### 2. Network Error Handling
- **Retry Logic**: Exponential backoff for transient network issues
- **Timeout Management**: Proper timeout handling with user notification
- **Offline Detection**: Graceful handling of offline scenarios

### 3. Resource Cleanup
- **Automatic Cleanup**: All resources cleaned up on error
- **State Consistency**: Guaranteed consistent state after errors
- **Memory Safety**: No leaked audio instances or timers

## Testing Strategy

### 1. Unit Tests
- **Timer Management**: Test animation frame lifecycle
- **Promise Cancellation**: Verify proper cancellation behavior
- **Error Scenarios**: Test all error paths with proper cleanup
- **State Transitions**: Validate all state changes

### 2. Integration Tests
- **Audio Playback Flow**: End-to-end playback scenarios
- **Resource Management**: Memory leak detection tests
- **Error Recovery**: Test recovery from various error states
- **Performance**: Measure performance improvements

### 3. Memory Leak Tests
- **Multiple Instances**: Test concurrent player instances
- **Rapid Switching**: Test rapid track switching scenarios
- **Component Lifecycle**: Test mount/unmount scenarios
- **Long Running**: Test extended playback sessions

## Implementation Strategy

### Phase 1: Internal Refactoring
1. **Encapsulate Global Variables**: Move globals into store instance
2. **Create Management Modules**: Implement timer, promise, and error managers
3. **Fix State Inconsistencies**: Correct typos and consolidate volume handling
4. **Add Resource Cleanup**: Implement comprehensive cleanup logic

### Phase 2: Performance Optimization
1. **Optimize Music List Queries**: Cache and reuse find() results
2. **Improve Animation Frame Management**: Optimize update frequency
3. **Implement Debouncing**: Add debouncing for rapid state changes
4. **Add Performance Monitoring**: Track key performance metrics

### Phase 3: Enhanced Error Handling
1. **Implement Retry Logic**: Add automatic retry with backoff
2. **Add User Feedback**: Provide clear error messages
3. **Improve Network Handling**: Better network error management
4. **Add Cancellation Support**: Allow users to cancel loading

### Phase 4: Code Quality Improvements
1. **Extract Constants**: Replace magic numbers with named constants
2. **Simplify Logic**: Refactor complex functions for readability
3. **Add Documentation**: Document complex logic and APIs
4. **Standardize Patterns**: Ensure consistent coding patterns

## API Compatibility Matrix

| Method | Current Signature | New Signature | Compatible |
|--------|------------------|---------------|------------|
| `play(trackId)` | `async (trackId) => void` | `async (trackId) => void` | ✅ |
| `seek(time)` | `(time) => void` | `(time) => void` | ✅ |
| `pause()` | `() => void` | `() => void` | ✅ |
| `resume()` | `() => Promise` | `() => Promise` | ✅ |
| `stop()` | `() => void` | `() => void` | ✅ |
| `setVolume(vol)` | `(vol) => void` | `(vol) => void` | ✅ |
| `updateCurrentTime(time)` | `(time) => void` | `(time) => void` | ✅ |
| `updatePauseTime(time)` | `(time) => void` | `(time) => void` | ✅ |

All existing methods maintain their exact signatures and behavior while gaining improved internal implementation.

## Performance Improvements

### 1. Reduced Function Calls
- **Before**: `musicList.find()` called twice for same trackId
- **After**: Single find() call with result caching

### 2. Optimized State Updates
- **Before**: Multiple separate state updates
- **After**: Atomic state updates with batching

### 3. Efficient Timer Management
- **Before**: Global animation frame with potential conflicts
- **After**: Instance-specific timer with proper lifecycle

### 4. Memory Optimization
- **Before**: Potential memory leaks from uncleaned resources
- **After**: Guaranteed cleanup with automatic resource management

## Migration Path

### Backward Compatibility
- All existing code using the store will continue to work unchanged
- No breaking changes to public API
- Internal improvements are transparent to consumers

### Testing During Migration
- Comprehensive test suite to verify no regressions
- Performance benchmarks to measure improvements
- Memory leak detection to verify fixes

### Rollback Strategy
- Maintain original implementation as backup
- Feature flags for gradual rollout
- Monitoring to detect any issues during deployment