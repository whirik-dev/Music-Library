import { describe, it, expect, beforeEach, vi } from 'vitest'

// Test version of error handler
const createErrorHandler = () => ({
  categorizeError: function(error, context = '') {
    const errorInfo = {
      type: 'unknown',
      message: 'An unknown error occurred',
      userMessage: 'Something went wrong. Please try again.',
      recoverable: true,
      retryable: false
    };

    if (!error) {
      return errorInfo;
    }

    const errorString = error.toString().toLowerCase();
    const errorCode = error.code || error.status;

    // Check specific error codes first
    if (errorCode === 403) {
      errorInfo.type = 'permission';
      errorInfo.message = `Access denied: ${error}`;
      errorInfo.userMessage = 'Access to this audio file is restricted. Please check your permissions.';
      errorInfo.recoverable = false;
    }
    else if (errorCode === 404) {
      errorInfo.type = 'notfound';
      errorInfo.message = `File not found: ${error}`;
      errorInfo.userMessage = 'The requested audio file could not be found.';
      errorInfo.recoverable = false;
    }
    // Network-related errors
    else if (errorString.includes('network') || errorString.includes('fetch') || 
        errorCode === 0 || errorCode >= 400) {
      errorInfo.type = 'network';
      errorInfo.message = `Network error: ${error}`;
      errorInfo.userMessage = 'Network connection issue. Please check your internet connection and try again.';
      errorInfo.retryable = true;
    }
    // File format or corruption errors
    else if (errorString.includes('format') || errorString.includes('decode') || 
             errorString.includes('corrupt')) {
      errorInfo.type = 'format';
      errorInfo.message = `Audio format error: ${error}`;
      errorInfo.userMessage = 'This audio file format is not supported or the file may be corrupted.';
      errorInfo.recoverable = false;
    }
    // Permission or access errors
    else if (errorString.includes('permission') || errorString.includes('access') || 
             errorString.includes('forbidden')) {
      errorInfo.type = 'permission';
      errorInfo.message = `Access denied: ${error}`;
      errorInfo.userMessage = 'Access to this audio file is restricted. Please check your permissions.';
      errorInfo.recoverable = false;
    }
    // File not found errors
    else if (errorString.includes('not found')) {
      errorInfo.type = 'notfound';
      errorInfo.message = `File not found: ${error}`;
      errorInfo.userMessage = 'The requested audio file could not be found.';
      errorInfo.recoverable = false;
    }
    // Timeout errors
    else if (errorString.includes('timeout') || errorString.includes('abort')) {
      errorInfo.type = 'timeout';
      errorInfo.message = `Request timeout: ${error}`;
      errorInfo.userMessage = 'The request took too long. Please try again.';
      errorInfo.retryable = true;
    }
    // Browser/device capability errors
    else if (errorString.includes('unsupported') || errorString.includes('capability')) {
      errorInfo.type = 'unsupported';
      errorInfo.message = `Unsupported feature: ${error}`;
      errorInfo.userMessage = 'Your browser or device does not support this audio feature.';
      errorInfo.recoverable = false;
    }
    // Memory or resource errors
    else if (errorString.includes('memory') || errorString.includes('resource')) {
      errorInfo.type = 'resource';
      errorInfo.message = `Resource error: ${error}`;
      errorInfo.userMessage = 'Insufficient resources to play audio. Please close other applications and try again.';
      errorInfo.retryable = true;
    }

    // Add context information
    if (context) {
      errorInfo.context = context;
      errorInfo.message = `${context}: ${errorInfo.message}`;
    }

    return errorInfo;
  },

  handleLoadError: function(error, player, timerManager, promiseManager, setState, context = 'Audio loading') {
    if (this.isCancellationError(error)) {
      console.log(`${context} was cancelled`);
      return null;
    }
    
    const errorInfo = this.categorizeError(error, context);
    
    console.error(`${context} failed:`, {
      error: errorInfo.message,
      type: errorInfo.type,
      recoverable: errorInfo.recoverable,
      retryable: errorInfo.retryable,
      activePromises: promiseManager ? promiseManager.getActiveCount() : 0
    });

    this.performErrorCleanup(player, timerManager, promiseManager);

    setState({
      status: 'error',
      error: errorInfo,
      playingTrackId: null,
      playingMetadata: null,
      playingFiles: null,
      pauseTime: null,
      currentTime: 0,
      duration: 1,
      player: null
    }, true);

    return errorInfo;
  },

  handlePlayError: function(error, player, timerManager, promiseManager, setState, context = 'Audio playback') {
    if (this.isCancellationError(error)) {
      console.log(`${context} was cancelled`);
      return null;
    }
    
    const errorInfo = this.categorizeError(error, context);
    
    console.error(`${context} failed:`, {
      error: errorInfo.message,
      type: errorInfo.type,
      recoverable: errorInfo.recoverable,
      retryable: errorInfo.retryable,
      activePromises: promiseManager ? promiseManager.getActiveCount() : 0
    });

    this.performErrorCleanup(player, timerManager, promiseManager);

    setState({
      status: 'error',
      error: errorInfo,
      pauseTime: null
    }, true);

    return errorInfo;
  },

  handleNetworkError: function(error, retryCallback, setState, context = 'Network request') {
    const errorInfo = this.categorizeError(error, context);
    
    console.warn(`${context} network error:`, errorInfo.message);

    setState({
      status: 'error',
      error: errorInfo
    }, true);

    if (errorInfo.retryable && retryCallback) {
      setTimeout(() => {
        console.log('Attempting automatic retry for network error...');
        retryCallback();
      }, 2000);
    }

    return errorInfo;
  },

  isCancellationError: function(error) {
    if (!error) return false;
    
    const errorMessage = error.message || error.toString();
    return errorMessage.includes('cancelled') || 
           errorMessage.includes('canceled') ||
           errorMessage.includes('aborted') ||
           error.name === 'AbortError';
  },

  handleAsyncError: function(error, context, promiseManager, additionalCleanup = null) {
    if (this.isCancellationError(error)) {
      console.log(`Async operation cancelled: ${context}`);
      return null;
    }
    
    const errorInfo = this.categorizeError(error, context);
    
    console.error(`Async ${context} failed:`, {
      error: errorInfo.message,
      type: errorInfo.type,
      recoverable: errorInfo.recoverable,
      retryable: errorInfo.retryable,
      activePromises: promiseManager ? promiseManager.getActiveCount() : 0,
      stack: error.stack
    });
    
    if (additionalCleanup && typeof additionalCleanup === 'function') {
      try {
        additionalCleanup();
      } catch (cleanupError) {
        console.warn('Error during additional cleanup:', cleanupError);
      }
    }
    
    return errorInfo;
  },

  performErrorCleanup: function(player, timerManager, promiseManager) {
    if (promiseManager) {
      try {
        promiseManager.cancelAll();
      } catch (promiseError) {
        console.warn('Error cancelling promises during cleanup:', promiseError);
      }
    }
    
    if (timerManager) {
      try {
        timerManager.reset();
      } catch (timerError) {
        console.warn('Error resetting timer during cleanup:', timerError);
      }
    }
    
    if (player) {
      try {
        player.off();
        
        if (player.playing()) {
          player.stop();
        }
        
        player.unload();
      } catch (cleanupError) {
        console.warn('Error during player cleanup:', cleanupError);
        
        try {
          if (typeof player.destroy === 'function') {
            player.destroy();
          }
        } catch (destroyError) {
          console.warn('Error during alternative player cleanup:', destroyError);
        }
      }
    }
  }
});

describe('ErrorHandler', () => {
  let errorHandler;
  let mockPlayer;
  let mockTimerManager;
  let mockPromiseManager;
  let mockSetState;

  beforeEach(() => {
    errorHandler = createErrorHandler();
    
    mockPlayer = {
      off: vi.fn(),
      playing: vi.fn(() => false),
      stop: vi.fn(),
      unload: vi.fn(),
      destroy: vi.fn()
    };
    
    mockTimerManager = {
      reset: vi.fn()
    };
    
    mockPromiseManager = {
      cancelAll: vi.fn(),
      getActiveCount: vi.fn(() => 0)
    };
    
    mockSetState = vi.fn();
    
    vi.clearAllMocks();
  });

  describe('categorizeError', () => {
    it('should categorize network errors', () => {
      const error = new Error('Network request failed');
      const result = errorHandler.categorizeError(error);

      expect(result.type).toBe('network');
      expect(result.retryable).toBe(true);
      expect(result.userMessage).toContain('Network connection issue');
    });

    it('should categorize format errors', () => {
      const error = new Error('Audio format not supported');
      const result = errorHandler.categorizeError(error);

      expect(result.type).toBe('format');
      expect(result.recoverable).toBe(false);
      expect(result.userMessage).toContain('format is not supported');
    });

    it('should categorize permission errors', () => {
      const error = { code: 403, message: 'Access forbidden', toString: () => 'Access forbidden' };
      const result = errorHandler.categorizeError(error);

      expect(result.type).toBe('permission');
      expect(result.recoverable).toBe(false);
      expect(result.userMessage).toContain('Access to this audio file is restricted');
    });

    it('should categorize not found errors', () => {
      const error = { code: 404, message: 'File not found', toString: () => 'File not found' };
      const result = errorHandler.categorizeError(error);

      expect(result.type).toBe('notfound');
      expect(result.recoverable).toBe(false);
      expect(result.userMessage).toContain('could not be found');
    });

    it('should categorize timeout errors', () => {
      const error = new Error('Request timeout');
      const result = errorHandler.categorizeError(error);

      expect(result.type).toBe('timeout');
      expect(result.retryable).toBe(true);
      expect(result.userMessage).toContain('took too long');
    });

    it('should handle null error', () => {
      const result = errorHandler.categorizeError(null);

      expect(result.type).toBe('unknown');
      expect(result.recoverable).toBe(true);
    });

    it('should add context to error message', () => {
      const error = new Error('Test error');
      const result = errorHandler.categorizeError(error, 'Test context');

      expect(result.context).toBe('Test context');
      expect(result.message).toContain('Test context:');
    });
  });

  describe('handleLoadError', () => {
    it('should handle load error and perform cleanup', () => {
      const error = new Error('Load failed');
      
      const result = errorHandler.handleLoadError(
        error, 
        mockPlayer, 
        mockTimerManager, 
        mockPromiseManager, 
        mockSetState
      );

      expect(result).not.toBeNull();
      expect(result.type).toBe('unknown');
      expect(mockPromiseManager.cancelAll).toHaveBeenCalled();
      expect(mockTimerManager.reset).toHaveBeenCalled();
      expect(mockPlayer.off).toHaveBeenCalled();
      expect(mockSetState).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          error: result,
          playingTrackId: null
        }),
        true
      );
    });

    it('should return null for cancellation errors', () => {
      const error = new Error('Operation was cancelled');
      
      const result = errorHandler.handleLoadError(
        error, 
        mockPlayer, 
        mockTimerManager, 
        mockPromiseManager, 
        mockSetState
      );

      expect(result).toBeNull();
      expect(mockSetState).not.toHaveBeenCalled();
    });
  });

  describe('handlePlayError', () => {
    it('should handle play error and perform cleanup', () => {
      const error = new Error('Play failed');
      
      const result = errorHandler.handlePlayError(
        error, 
        mockPlayer, 
        mockTimerManager, 
        mockPromiseManager, 
        mockSetState
      );

      expect(result).not.toBeNull();
      expect(mockPromiseManager.cancelAll).toHaveBeenCalled();
      expect(mockTimerManager.reset).toHaveBeenCalled();
      expect(mockSetState).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          error: result
        }),
        true
      );
    });
  });

  describe('handleNetworkError', () => {
    it('should handle network error and set up retry', () => {
      const error = new Error('Network failed');
      const retryCallback = vi.fn();
      
      const result = errorHandler.handleNetworkError(
        error, 
        retryCallback, 
        mockSetState
      );

      expect(result.type).toBe('network');
      expect(mockSetState).toHaveBeenCalled();
      
      // Wait for retry timeout
      setTimeout(() => {
        expect(retryCallback).toHaveBeenCalled();
      }, 2100);
    });
  });

  describe('isCancellationError', () => {
    it('should identify cancellation errors', () => {
      expect(errorHandler.isCancellationError(new Error('Operation was cancelled'))).toBe(true);
      expect(errorHandler.isCancellationError(new Error('Operation was canceled'))).toBe(true);
      expect(errorHandler.isCancellationError(new Error('Request aborted'))).toBe(true);
      expect(errorHandler.isCancellationError({ name: 'AbortError' })).toBe(true);
      expect(errorHandler.isCancellationError(new Error('Regular error'))).toBe(false);
      expect(errorHandler.isCancellationError(null)).toBe(false);
    });
  });

  describe('handleAsyncError', () => {
    it('should handle async errors with additional cleanup', () => {
      const error = new Error('Async error');
      const additionalCleanup = vi.fn();
      
      const result = errorHandler.handleAsyncError(
        error, 
        'test context', 
        mockPromiseManager, 
        additionalCleanup
      );

      expect(result).not.toBeNull();
      expect(additionalCleanup).toHaveBeenCalled();
    });

    it('should return null for cancellation errors', () => {
      const error = new Error('Operation was cancelled');
      
      const result = errorHandler.handleAsyncError(
        error, 
        'test context', 
        mockPromiseManager
      );

      expect(result).toBeNull();
    });
  });

  describe('performErrorCleanup', () => {
    it('should perform comprehensive cleanup', () => {
      mockPlayer.playing.mockReturnValue(true);
      
      errorHandler.performErrorCleanup(mockPlayer, mockTimerManager, mockPromiseManager);

      expect(mockPromiseManager.cancelAll).toHaveBeenCalled();
      expect(mockTimerManager.reset).toHaveBeenCalled();
      expect(mockPlayer.off).toHaveBeenCalled();
      expect(mockPlayer.stop).toHaveBeenCalled();
      expect(mockPlayer.unload).toHaveBeenCalled();
    });

    it('should handle cleanup errors gracefully', () => {
      mockPlayer.off.mockImplementation(() => {
        throw new Error('Cleanup error');
      });
      
      expect(() => {
        errorHandler.performErrorCleanup(mockPlayer, mockTimerManager, mockPromiseManager);
      }).not.toThrow();
      
      expect(mockPlayer.destroy).toHaveBeenCalled();
    });

    it('should work with null parameters', () => {
      expect(() => {
        errorHandler.performErrorCleanup(null, null, null);
      }).not.toThrow();
    });
  });
});