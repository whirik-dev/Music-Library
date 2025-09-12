# Music Player Store Testing Suite

This directory contains comprehensive tests for the music player store refactoring project, covering unit tests, integration tests, and memory leak detection.

## Test Structure

### Unit Tests (`tests/unit/`)

#### Timer Manager Tests (`timerManager.test.js`)
- Tests the animation frame management system
- Validates proper timer lifecycle (start, stop, reset)
- Verifies update interval and debouncing logic
- Ensures no multiple timer conflicts

#### Promise Manager Tests (`promiseManager.test.js`)
- Tests cancellable promise creation and management
- Validates promise registration and cancellation
- Tests timeout functionality and race conditions
- Verifies proper cleanup of promise resources

#### Error Handler Tests (`errorHandler.test.js`)
- Tests error categorization (network, format, permission, etc.)
- Validates error handling with proper cleanup
- Tests cancellation error detection
- Verifies comprehensive resource cleanup on errors

### Integration Tests (`tests/integration/`)

#### Music Store Integration Tests (`musicStore.integration.test.js`)
- Tests complete audio playback flow (play → pause → resume → stop)
- Validates track switching and state consistency
- Tests error handling in realistic scenarios
- Verifies resource management during operations
- Tests performance under various conditions
- Validates edge cases and boundary conditions

### Memory Leak Detection Tests (`tests/memory/`)

#### Memory Leak Tests (`memoryLeak.test.js`)
- Tests for animation frame leaks during playback
- Validates audio player resource disposal
- Tests timer and promise cleanup
- Monitors memory usage over extended operations
- Simulates component lifecycle scenarios
- Tests error scenario resource management

## Test Configuration

### Setup (`tests/setup.js`)
- Configures testing environment with jsdom
- Provides Howler.js mocks for audio testing
- Sets up performance and animation frame mocks
- Configures console mocking to reduce test noise

### Vitest Configuration (`vitest.config.js`)
- Configures test environment and setup files
- Sets up path aliases for imports
- Configures coverage reporting
- Excludes unnecessary files from coverage

## Running Tests

```bash
# Run all tests
npm run test

# Run tests once
npm run test:run

# Run with UI
npm run test:ui

# Run with coverage
npm run test:coverage

# Run specific test files
npm run test:run tests/unit/
npm run test:run tests/integration/
npm run test:run tests/memory/
```

## Test Coverage Areas

### Memory Management
- ✅ Animation frame cleanup
- ✅ Audio player resource disposal
- ✅ Timer management
- ✅ Promise cancellation and cleanup
- ✅ Event listener cleanup

### Error Handling
- ✅ Network error categorization
- ✅ File format error handling
- ✅ Permission and access errors
- ✅ Timeout error management
- ✅ Cancellation error detection
- ✅ Resource cleanup on errors

### State Management
- ✅ Consistent state transitions
- ✅ Atomic state updates
- ✅ Error state handling
- ✅ Loading state management
- ✅ Playback state consistency

### Performance
- ✅ Efficient timer updates
- ✅ Debounced operations
- ✅ Resource optimization
- ✅ Memory usage stability
- ✅ Concurrent operation handling

### API Compatibility
- ✅ Method signature preservation
- ✅ State property consistency
- ✅ Backward compatibility
- ✅ Error handling compatibility

## Key Testing Principles

1. **Isolation**: Each test is independent and doesn't affect others
2. **Mocking**: External dependencies are properly mocked
3. **Cleanup**: Resources are cleaned up after each test
4. **Realistic Scenarios**: Tests simulate real-world usage patterns
5. **Edge Cases**: Boundary conditions and error scenarios are tested
6. **Performance**: Memory usage and performance are monitored

## Test Requirements Coverage

The tests validate all requirements from the specification:

- **Requirement 1.4**: Memory leak prevention through comprehensive resource tracking
- **Requirement 8.3**: Error scenario testing with proper cleanup validation
- **Requirement 8.4**: Resource management testing under various conditions

## Continuous Integration

These tests are designed to run in CI environments and provide:
- Fast execution times
- Reliable results
- Clear error reporting
- Coverage metrics
- Memory leak detection

## Troubleshooting

### Common Issues

1. **Timing Issues**: Some tests use setTimeout for async operations. Adjust timeouts if tests are flaky.
2. **Memory Tracking**: Memory leak tests simulate memory usage. Real browser memory APIs may differ.
3. **Mock Limitations**: Howler.js mocks provide basic functionality. Complex audio features may need additional mocking.

### Debug Tips

1. Use `npm run test:ui` for interactive debugging
2. Add `console.log` statements in tests for debugging (they're mocked by default)
3. Use `vi.unmock()` to disable specific mocks if needed
4. Check test timeouts if tests hang unexpectedly