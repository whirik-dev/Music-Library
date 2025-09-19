import { create } from 'zustand';
import { Howl } from 'howler';

import useMusicListStore from "@/stores/useMusicListStore";

// ============================================================================
// CONSTANTS AND CONFIGURATION
// ============================================================================

/**
 * Application constants for audio playback configuration
 * Centralized configuration to avoid magic numbers throughout the codebase
 */
const CONSTANTS = {
    // Timer and animation settings
    UPDATE_INTERVAL: 100,        // Animation frame update interval (~10fps)
    MIN_TIME_DIFF: 0.05,        // Minimum time difference for progress updates
    
    // Audio settings
    VOLUME_DIVISOR: 4,          // Volume adjustment factor for UI consistency
    DEFAULT_DURATION: 1,        // Default duration for unloaded tracks
    DEFAULT_VOLUME: 0.8,    // Default volume (0.2) matching setVolume logic
    
    // Retry and timeout settings
    MAX_RETRY_ATTEMPTS: 3,      // Maximum automatic retry attempts
    BASE_RETRY_DELAY: 1000,     // Base delay for exponential backoff (1 second)
    MAX_LOAD_TIME: 30000,       // Maximum expected load time (30 seconds)
    BATCH_UPDATE_DELAY: 16,     // State update batching delay (~60fps)
    SEEK_DEBOUNCE_TIME: 100,    // Debounce time for seek operations
    INTERACTION_TIMEOUT: 1000   // Time window for recent interaction detection
};

// ============================================================================
// CORE MANAGEMENT MODULES
// ============================================================================

/**
 * Timer Management Module
 * Handles animation frame lifecycle and progress updates with optimized performance
 * Prevents memory leaks through proper cleanup and state tracking
 */
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
            // Only proceed if timer is still supposed to be running
            if (!this.isRunning) {
                return;
            }
            
            // Optimize update frequency based on time difference
            const timeDiff = currentTime - this.lastUpdateTime;
            if (timeDiff >= CONSTANTS.UPDATE_INTERVAL) {
                if (!this.skipNextUpdate) {
                    // Only call update if enough time has passed since last seek
                    const now = performance.now();
                    if (!this.lastSeekTime || (now - this.lastSeekTime) > CONSTANTS.SEEK_DEBOUNCE_TIME) {
                        updateCallback();
                    }
                } else {
                    this.skipNextUpdate = false;
                }
                this.lastUpdateTime = currentTime;
            }
            
            // Continue animation loop only if still running
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

/**
 * Promise Management Module
 * Provides cancellable promise functionality with comprehensive resource tracking
 * Handles promise lifecycle, cancellation, and cleanup to prevent memory leaks
 */
const createPromiseManager = () => ({
    activePromises: new Map(),
    promiseCounter: 0,
    
    // Create a cancellable promise wrapper with proper resource tracking
    createCancellablePromise: function(executor, resourceCleanup = null) {
        const promiseId = ++this.promiseCounter;
        let isCancelled = false;
        let isResolved = false;
        let cleanup = resourceCleanup;
        
        const cancellationToken = {
            isCancelled: () => isCancelled,
            throwIfCancelled: () => {
                if (isCancelled) {
                    throw new Error('Operation was cancelled');
                }
            }
        };
        
        const promise = new Promise((resolve, reject) => {
            const wrappedResolve = (value) => {
                if (!isCancelled && !isResolved) {
                    isResolved = true;
                    this.activePromises.delete(promiseId);
                    resolve(value);
                }
            };
            
            const wrappedReject = (error) => {
                if (!isCancelled && !isResolved) {
                    isResolved = true;
                    this.activePromises.delete(promiseId);
                    reject(error);
                }
            };
            
            try {
                executor(wrappedResolve, wrappedReject, cancellationToken);
            } catch (error) {
                wrappedReject(error);
            }
        });
        
        // Store promise metadata for tracking and cleanup
        const promiseMetadata = {
            id: promiseId,
            promise,
            cancel: () => {
                if (!isCancelled && !isResolved) {
                    isCancelled = true;
                    isResolved = true;
                    
                    // Perform resource cleanup if provided
                    if (cleanup && typeof cleanup === 'function') {
                        try {
                            cleanup();
                        } catch (cleanupError) {
                            console.warn('Error during promise cleanup:', cleanupError);
                        }
                    }
                    
                    this.activePromises.delete(promiseId);
                }
            },
            isCancelled: () => isCancelled,
            isResolved: () => isResolved
        };
        
        this.activePromises.set(promiseId, promiseMetadata);
        
        // Return enhanced promise with cancellation methods
        promise.cancel = promiseMetadata.cancel;
        promise.isCancelled = promiseMetadata.isCancelled;
        promise.isResolved = promiseMetadata.isResolved;
        promise.id = promiseId;
        
        return promise;
    },
    
    // Register an existing promise for tracking (legacy support)
    register: function(promise, resourceCleanup = null) {
        // Cancel any existing promises first
        this.cancelAll();
        
        if (!promise) return null;
        
        // If it's already a cancellable promise, just track it
        if (promise.cancel && promise.isCancelled) {
            return promise;
        }
        
        // Wrap existing promise to make it cancellable
        const promiseId = ++this.promiseCounter;
        let isCancelled = false;
        
        const cancellablePromise = promise.then(
            (value) => {
                if (isCancelled) {
                    throw new Error('Operation was cancelled');
                }
                this.activePromises.delete(promiseId);
                return value;
            },
            (error) => {
                if (isCancelled) {
                    throw new Error('Operation was cancelled');
                }
                this.activePromises.delete(promiseId);
                throw error;
            }
        );
        
        const promiseMetadata = {
            id: promiseId,
            promise: cancellablePromise,
            cancel: () => {
                if (!isCancelled) {
                    isCancelled = true;
                    
                    if (resourceCleanup && typeof resourceCleanup === 'function') {
                        try {
                            resourceCleanup();
                        } catch (cleanupError) {
                            console.warn('Error during promise cleanup:', cleanupError);
                        }
                    }
                    
                    this.activePromises.delete(promiseId);
                }
            },
            isCancelled: () => isCancelled
        };
        
        this.activePromises.set(promiseId, promiseMetadata);
        
        // Add cancellation methods to the promise
        cancellablePromise.cancel = promiseMetadata.cancel;
        cancellablePromise.isCancelled = promiseMetadata.isCancelled;
        cancellablePromise.id = promiseId;
        
        return cancellablePromise;
    },

    // Cancel a specific promise by ID
    cancelPromise: function(promiseId) {
        const promiseMetadata = this.activePromises.get(promiseId);
        if (promiseMetadata) {
            promiseMetadata.cancel();
        }
    },

    // Cancel all active promises with proper cleanup
    cancelAll: function() {
        const promises = Array.from(this.activePromises.values());
        promises.forEach(promiseMetadata => {
            try {
                promiseMetadata.cancel();
            } catch (error) {
                console.warn('Error cancelling promise:', error);
            }
        });
        this.activePromises.clear();
    },

    // Check if a specific promise is cancelled
    isCancelled: function(promise) {
        if (!promise) return false;
        
        // Check if it's our enhanced promise
        if (promise.isCancelled && typeof promise.isCancelled === 'function') {
            return promise.isCancelled();
        }
        
        // Legacy support for old cancellation method
        return promise && promise.cancelled === true;
    },

    // Get count of active promises for monitoring
    getActiveCount: function() {
        return this.activePromises.size;
    },

    // Clear all promise references (for cleanup)
    clear: function() {
        this.activePromises.clear();
        this.promiseCounter = 0;
    },

    // Create a timeout promise that can be cancelled
    createTimeoutPromise: function(ms, timeoutMessage = 'Operation timed out') {
        return this.createCancellablePromise((resolve, reject, cancellationToken) => {
            const timeoutId = setTimeout(() => {
                if (!cancellationToken.isCancelled()) {
                    reject(new Error(timeoutMessage));
                }
            }, ms);
            
            // Return cleanup function to clear timeout
            return () => {
                clearTimeout(timeoutId);
            };
        }, () => {
            // Cleanup function will be called automatically
        });
    },

    // Create a race between a promise and a timeout
    withTimeout: function(promise, timeoutMs, timeoutMessage = 'Operation timed out') {
        const timeoutPromise = this.createTimeoutPromise(timeoutMs, timeoutMessage);
        
        return this.createCancellablePromise((resolve, reject, cancellationToken) => {
            Promise.race([promise, timeoutPromise])
                .then(resolve)
                .catch(reject);
                
            // Cleanup function to cancel both promises
            return () => {
                if (promise.cancel) promise.cancel();
                if (timeoutPromise.cancel) timeoutPromise.cancel();
            };
        });
    }
});

/**
 * Error Handler Module
 * Categorizes and handles different types of errors with appropriate user feedback
 * Provides comprehensive error recovery and cleanup functionality
 */
const createErrorHandler = () => ({
    // Error categorization for different failure types
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

        // Network-related errors
        if (errorString.includes('network') || errorString.includes('fetch') || 
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
                 errorString.includes('forbidden') || errorCode === 403) {
            errorInfo.type = 'permission';
            errorInfo.message = `Access denied: ${error}`;
            errorInfo.userMessage = 'Access to this audio file is restricted. Please check your permissions.';
            errorInfo.recoverable = false;
        }
        // File not found errors
        else if (errorString.includes('not found') || errorCode === 404) {
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

    // Enhanced load error handler with comprehensive cleanup and user feedback
    handleLoadError: function(error, player, timerManager, promiseManager, setState, context = 'Audio loading') {
        // Check if this is a cancellation error and handle gracefully
        if (this.isCancellationError(error)) {
            console.log(`${context} was cancelled`);
            return null; // Don't treat cancellation as an error
        }
        
        const errorInfo = this.categorizeError(error, context);
        
        console.error(`${context} failed:`, {
            error: errorInfo.message,
            type: errorInfo.type,
            recoverable: errorInfo.recoverable,
            retryable: errorInfo.retryable,
            activePromises: promiseManager ? promiseManager.getActiveCount() : 0
        });

        // Perform comprehensive cleanup with enhanced promise handling
        this.performErrorCleanup(player, timerManager, promiseManager);

        // Set error state with user feedback (immediate update for errors)
        setState({
            status: 'error',
            error: errorInfo,
            playingTrackId: null,
            playingMetadata: null,
            playingFiles: null,
            pauseTime: null,
            currentTime: 0,
            duration: CONSTANTS.DEFAULT_DURATION,
            player: null
        }, true);

        return errorInfo;
    },

    // Enhanced play error handler with better async error categorization
    handlePlayError: function(error, player, timerManager, promiseManager, setState, context = 'Audio playback') {
        // Check if this is a cancellation error and handle gracefully
        if (this.isCancellationError(error)) {
            console.log(`${context} was cancelled`);
            return null; // Don't treat cancellation as an error
        }
        
        const errorInfo = this.categorizeError(error, context);
        
        console.error(`${context} failed:`, {
            error: errorInfo.message,
            type: errorInfo.type,
            recoverable: errorInfo.recoverable,
            retryable: errorInfo.retryable,
            activePromises: promiseManager ? promiseManager.getActiveCount() : 0
        });

        // Perform comprehensive cleanup with enhanced promise handling
        this.performErrorCleanup(player, timerManager, promiseManager);

        // Set error state (immediate update for errors)
        setState({
            status: 'error',
            error: errorInfo,
            pauseTime: null
        }, true);

        return errorInfo;
    },

    // Network-specific error handler with retry logic
    handleNetworkError: function(error, retryCallback, setState, context = 'Network request') {
        const errorInfo = this.categorizeError(error, context);
        
        console.warn(`${context} network error:`, errorInfo.message);

        // Set temporary error state for network issues (immediate update for errors)
        setState({
            status: 'error',
            error: errorInfo
        }, true);

        // Implement automatic retry for network errors if retryable
        if (errorInfo.retryable && retryCallback) {
            setTimeout(() => {
                console.log('Attempting automatic retry for network error...');
                retryCallback();
            }, 2000); // 2 second delay before retry
        }

        return errorInfo;
    },

    // Check if an error is due to operation cancellation
    isCancellationError: function(error) {
        if (!error) return false;
        
        const errorMessage = error.message || error.toString();
        return errorMessage.includes('cancelled') || 
               errorMessage.includes('canceled') ||
               errorMessage.includes('aborted') ||
               error.name === 'AbortError';
    },

    // Enhanced async error handler for promise-based operations
    handleAsyncError: function(error, context, promiseManager, additionalCleanup = null) {
        // Don't handle cancellation as errors
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
        
        // Perform additional cleanup if provided
        if (additionalCleanup && typeof additionalCleanup === 'function') {
            try {
                additionalCleanup();
            } catch (cleanupError) {
                console.warn('Error during additional cleanup:', cleanupError);
            }
        }
        
        return errorInfo;
    },

    // Comprehensive error cleanup with enhanced promise management
    performErrorCleanup: function(player, timerManager, promiseManager) {
        // Cancel any pending promises first with proper cleanup
        if (promiseManager) {
            try {
                promiseManager.cancelAll();
            } catch (promiseError) {
                console.warn('Error cancelling promises during cleanup:', promiseError);
            }
        }
        
        // Stop timer management
        if (timerManager) {
            try {
                timerManager.reset();
            } catch (timerError) {
                console.warn('Error resetting timer during cleanup:', timerError);
            }
        }
        
        // Clean up audio player with enhanced error handling
        if (player) {
            try {
                // Remove all event listeners to prevent memory leaks
                player.off();
                
                // Stop playback if active
                if (player.playing()) {
                    player.stop();
                }
                
                // Unload the audio resource
                player.unload();
            } catch (cleanupError) {
                console.warn('Error during player cleanup:', cleanupError);
                
                // Try alternative cleanup methods if standard cleanup fails
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

/**
 * Resource Management Module
 * Centralized resource cleanup and disposal to prevent memory leaks
 * Handles audio player lifecycle and comprehensive error cleanup
 */
const createResourceManager = () => ({
    // Centralized cleanup function that handles all resource disposal
    cleanup: function(player, timerManager, promiseManager) {
        // Cancel any pending promises first
        if (promiseManager) {
            promiseManager.cancelAll();
        }
        
        // Stop and dispose audio player
        if (player) {
            try {
                if (player.playing()) {
                    player.stop();
                }
                player.unload();
            } catch (error) {
                console.warn('Error during player cleanup:', error);
            }
        }
        
        // Stop timer management
        if (timerManager) {
            timerManager.reset();
        }
    },

    // Comprehensive cleanup for all error scenarios
    cleanupOnError: function(player, timerManager, promiseManager, error) {
        console.error('Cleaning up resources due to error:', error);
        
        // Perform full cleanup
        this.cleanup(player, timerManager, promiseManager);
        
        // Additional error-specific cleanup
        if (player) {
            // Remove all event listeners to prevent memory leaks
            try {
                player.off();
            } catch (e) {
                console.warn('Error removing player event listeners:', e);
            }
        }
    },

    // Safe player disposal with error handling
    disposePlayer: function(player) {
        if (player) {
            try {
                // Remove all event listeners first
                player.off();
                
                // Stop playback if active
                if (player.playing()) {
                    player.stop();
                }
                
                // Unload the audio resource
                player.unload();
            } catch (error) {
                console.warn('Error during player disposal:', error);
            }
        }
    },

    // Complete store cleanup for component unmount
    cleanupStore: function(player, timerManager, promiseManager) {
        // Cancel all pending operations
        if (promiseManager) {
            promiseManager.cancelAll();
        }
        
        // Stop all timers and animation frames
        if (timerManager) {
            timerManager.reset();
        }
        
        // Dispose of audio resources
        this.disposePlayer(player);
        
        // Clear any remaining references
        return {
            status: null,
            playingTrackId: null,
            playingMetadata: null,
            playingFiles: null,
            pauseTime: null,
            currentTime: 0,
            duration: CONSTANTS.DEFAULT_DURATION,
            player: null,
            volume: CONSTANTS.DEFAULT_VOLUME
        };
    }
});

// ============================================================================
// PERFORMANCE OPTIMIZATION MODULES
// ============================================================================

/**
 * Performance Cache Module
 * Caches track data lookups to avoid repeated find() operations
 * Automatically invalidates cache when music list changes
 */
const createPerformanceCache = () => ({
    trackDataCache: new Map(),
    lastMusicListVersion: null,
    
    // Cache track data to avoid repeated find() operations
    getCachedTrackData: function(trackId, musicList) {
        // Check if music list has changed (simple version check)
        const currentVersion = musicList.length + musicList.map(m => m.id).join('');
        if (this.lastMusicListVersion !== currentVersion) {
            this.trackDataCache.clear();
            this.lastMusicListVersion = currentVersion;
        }
        
        // Return cached result if available
        if (this.trackDataCache.has(trackId)) {
            return this.trackDataCache.get(trackId);
        }
        
        // Find and cache the result
        const trackData = musicList.find((m) => m.id === trackId);
        if (trackData) {
            this.trackDataCache.set(trackId, trackData);
        }
        
        return trackData;
    },
    
    // Clear cache when needed
    clearCache: function() {
        this.trackDataCache.clear();
        this.lastMusicListVersion = null;
    }
});

/**
 * State Update Batching Module
 * Batches state updates to reduce re-renders and improve performance
 * Provides immediate updates for critical state changes
 */
const createStateBatcher = () => ({
    pendingUpdates: {},
    batchTimeout: null,
    
    // Batch state updates to reduce re-renders
    batchUpdate: function(updates, setState, immediate = false) {
        if (immediate) {
            setState(updates);
            return;
        }
        
        // Merge with pending updates
        Object.assign(this.pendingUpdates, updates);
        
        // Clear existing timeout
        if (this.batchTimeout) {
            clearTimeout(this.batchTimeout);
        }
        
        // Set new timeout to apply batched updates
        this.batchTimeout = setTimeout(() => {
            if (Object.keys(this.pendingUpdates).length > 0) {
                setState(this.pendingUpdates);
                this.pendingUpdates = {};
            }
            this.batchTimeout = null;
        }, CONSTANTS.BATCH_UPDATE_DELAY); // ~60fps batching
    },
    
    // Force immediate flush of pending updates
    flushUpdates: function(setState) {
        if (this.batchTimeout) {
            clearTimeout(this.batchTimeout);
            this.batchTimeout = null;
        }
        
        if (Object.keys(this.pendingUpdates).length > 0) {
            setState(this.pendingUpdates);
            this.pendingUpdates = {};
        }
    },
    
    // Clear all pending updates
    clearPending: function() {
        if (this.batchTimeout) {
            clearTimeout(this.batchTimeout);
            this.batchTimeout = null;
        }
        this.pendingUpdates = {};
    }
});

/**
 * State Management Module
 * Factory functions for creating consistent state objects
 * Ensures proper state structure and default values
 */
const createStateManager = () => ({
    createInitialState: () => ({
        status: null,
        playingTrackId: null,
        playingMetadata: null,
        playingFiles: null,
        pauseTime: null,
        currentTime: 0,
        duration: CONSTANTS.DEFAULT_DURATION,
        player: null,
        volume: CONSTANTS.DEFAULT_VOLUME,
        error: null,
        retryCount: 0,
        isLoadingCancellable: false,
        lastInteractionTime: null
    }),

    createLoadingState: (trackId, metadata, files) => ({
        status: 'loading',
        playingTrackId: trackId,
        playingMetadata: metadata,
        playingFiles: files,
        currentTime: 0,
        duration: 0,
        pauseTime: null,
        player: null,
        error: null,
        isLoadingCancellable: true,
        lastInteractionTime: Date.now()
    }),

    createPlayingState: (player, duration) => ({
        duration: duration,
        player: player,
        status: 'playing',
        error: null,
        retryCount: 0,
        isLoadingCancellable: false,
        lastInteractionTime: Date.now()
    }),

    createPausedState: (currentTime) => ({
        status: 'paused',
        pauseTime: currentTime,
        error: null
    }),

    createStoppedState: () => ({
        status: null,
        playingTrackId: null,
        playingMetadata: null,
        playingFiles: null,
        pauseTime: null,
        duration: CONSTANTS.DEFAULT_DURATION,
        currentTime: 0,
        player: null,
        error: null,
        retryCount: 0
    }),

    createErrorState: (errorInfo, preserveTrackInfo = false) => {
        const baseErrorState = {
            status: 'error',
            error: errorInfo,
            player: null,
            pauseTime: null
        };

        // Preserve track information for recoverable errors
        if (preserveTrackInfo) {
            return baseErrorState;
        }

        // Clear all track information for non-recoverable errors
        return {
            ...baseErrorState,
            playingTrackId: null,
            playingMetadata: null,
            playingFiles: null,
            currentTime: 0,
            duration: CONSTANTS.DEFAULT_DURATION
        };
    }
});

// ============================================================================
// MAIN STORE IMPLEMENTATION
// ============================================================================

const useMusicItemStore = create((set, get) => {
    // ========================================================================
    // INTERNAL MANAGEMENT INSTANCES
    // ========================================================================
    
    const timerManager = createTimerManager();
    const promiseManager = createPromiseManager();
    const resourceManager = createResourceManager();
    const stateManager = createStateManager();
    const errorHandler = createErrorHandler();
    const performanceCache = createPerformanceCache();
    const stateBatcher = createStateBatcher();

    // ========================================================================
    // INTERNAL HELPER FUNCTIONS
    // ========================================================================
    
    /**
     * Starts the progress update timer with optimized callback
     * Only updates when significant time difference is detected
     */
    const startTimer = () => {
        const updateCallback = () => {
            const player = get().player;
            if (player && player.playing()) {
                const time = player.seek();
                const prevTime = get().currentTime;
                
                // Only update if time difference is significant
                if (Math.abs(time - prevTime) >= CONSTANTS.MIN_TIME_DIFF) {
                    stateBatcher.batchUpdate({ currentTime: time }, set);
                }
            }
        };

        timerManager.start(updateCallback);
    };

    /**
     * Stops the progress update timer
     */
    const stopTimer = () => {
        timerManager.stop();
    };

    /**
     * Gets cached track data with performance optimization
     * Avoids repeated find() operations on the music list
     */
    const getCachedTrackData = (trackId) => {
        const musicList = useMusicListStore.getState().musicList;
        return performanceCache.getCachedTrackData(trackId, musicList);
    };

    /**
     * Validates and clamps time values within valid range
     */
    const validateTime = (time, duration) => {
        return Math.max(0, Math.min(time, duration || CONSTANTS.DEFAULT_DURATION));
    };

    /**
     * Validates and clamps volume values within valid range
     */
    const validateVolume = (volume) => {
        const clampedVol = Math.max(0, Math.min(volume, 1));
        return clampedVol / CONSTANTS.VOLUME_DIVISOR;
    };

    /**
     * Creates adaptive audio URL based on network conditions
     * Foundation for future adaptive quality implementation
     */
    const createAudioUrl = (trackId, baseUrl) => {
        // Currently returns base URL, can be enhanced for adaptive quality
        return baseUrl || `https://${process.env.NEXT_PUBLIC_ASSET_SERVER}/${trackId}?r=preview`;
    };

    /**
     * Handles track not found error with proper error state
     */
    const handleTrackNotFound = (trackId) => {
        const errorInfo = errorHandler.categorizeError(
            new Error(`Track with ID ${trackId} not found`),
            'Track lookup'
        );
        errorInfo.userMessage = 'The requested track could not be found.';
        errorInfo.recoverable = false;
        
        stateBatcher.batchUpdate(stateManager.createErrorState(errorInfo), set, true);
    };

    /**
     * Creates and configures a new Howl audio player instance
     */
    const createAudioPlayer = (url, trackId) => {
        return new Howl({
            src: [url],
            format: ['mp3'],
            html5: true,
            xhrWithCredentials: false,
            volume: get().volume
        });
    };

    /**
     * Sets up event handlers for audio player
     */
    const setupPlayerEvents = (howl, cancellationToken, resolve, reject) => {
        // Load error handler
        howl.onloaderror = (_, error) => {
            if (cancellationToken.isCancelled()) return;
            
            const errorInfo = errorHandler.handleLoadError(
                error, 
                howl, 
                timerManager, 
                promiseManager, 
                (updates, immediate) => stateBatcher.batchUpdate(updates, set, immediate),
                'Audio file loading'
            );
            
            if (errorInfo) {
                reject(new Error(errorInfo.message));
            }
        };

        // Track end handler
        howl.onend = () => {
            if (cancellationToken.isCancelled()) return;
            
            stopTimer();
            stateBatcher.flushUpdates(set);
            stateBatcher.batchUpdate(stateManager.createStoppedState(), set, true);
        };

        // Play event handler
        howl.once('play', () => {
            if (cancellationToken.isCancelled()) {
                resourceManager.disposePlayer(howl);
                return;
            }

            stateBatcher.batchUpdate(
                stateManager.createPlayingState(howl, howl.duration()), 
                set, 
                true
            );
            startTimer();
            resolve();
        });

        // Error event handler
        howl.once('playerror', (_, error) => {
            if (cancellationToken.isCancelled()) return;
            
            const errorInfo = errorHandler.handlePlayError(
                error,
                howl,
                timerManager,
                promiseManager,
                (updates, immediate) => stateBatcher.batchUpdate(updates, set, immediate),
                'Audio playback runtime'
            );
            
            if (errorInfo) {
                reject(new Error(errorInfo.message));
            }
        });
    };

    /**
     * Creates a cancellable playback promise with proper resource management
     */
    const createPlaybackPromise = (audioUrl, trackId) => {
        return promiseManager.createCancellablePromise((resolve, reject, cancellationToken) => {
            let howl = null;
            
            try {
                // Create audio player instance
                howl = createAudioPlayer(audioUrl, trackId);
                
                // Set up event handlers
                setupPlayerEvents(howl, cancellationToken, resolve, reject);
                
                // Start playback
                howl.play();
                
            } catch (error) {
                // Handle immediate play errors
                const errorInfo = errorHandler.handlePlayError(
                    error,
                    howl,
                    timerManager,
                    promiseManager,
                    (updates, immediate) => stateBatcher.batchUpdate(updates, set, immediate),
                    'Audio playback initialization'
                );
                
                if (errorInfo) {
                    reject(new Error(errorInfo.message));
                }
            }
            
            // Return cleanup function for proper resource disposal
            return () => {
                if (howl) {
                    try {
                        howl.off();
                        if (howl.playing()) {
                            howl.stop();
                        }
                        howl.unload();
                    } catch (cleanupError) {
                        console.warn('Error during howl cleanup:', cleanupError);
                    }
                }
            };
        });
    };

    /**
     * Executes playback promise with comprehensive error handling and retry logic
     */
    const executePlayback = async (playPromise, trackId) => {
        try {
            await playPromise;
        } catch (error) {
            // Handle playback errors with enhanced error categorization
            const errorInfo = errorHandler.handleAsyncError(
                error, 
                'Play operation', 
                promiseManager,
                () => {
                    const currentPlayer = get().player;
                    if (currentPlayer) {
                        resourceManager.disposePlayer(currentPlayer);
                    }
                }
            );
            
            // Process error if not a cancellation
            if (errorInfo) {
                await handlePlaybackError(errorInfo, trackId);
            }
        } finally {
            // Clean up promise reference
            if (playPromise && playPromise.id) {
                promiseManager.cancelPromise(playPromise.id);
            }
        }
    };

    /**
     * Handles playback errors with retry logic for network issues
     */
    const handlePlaybackError = async (errorInfo, trackId) => {
        console.error('Play operation failed:', {
            error: errorInfo.message,
            type: errorInfo.type,
            retryable: errorInfo.retryable,
            trackId: trackId
        });
        
        // Check for automatic retry conditions
        const shouldAutoRetry = errorInfo.type === 'network' && 
                               errorInfo.retryable && 
                               get().retryCount < CONSTANTS.MAX_RETRY_ATTEMPTS;
        
        if (shouldAutoRetry) {
            console.log('Network error detected, attempting automatic retry...');
            
            // Set error state but preserve track info for retry
            stateBatcher.batchUpdate({
                ...stateManager.createErrorState(errorInfo, true),
                retryCount: get().retryCount + 1
            }, set, true);
            
            // Attempt automatic retry
            try {
                const success = await get().autoRetry(trackId, get().retryCount);
                if (!success) {
                    console.log('Auto-retry failed for track:', trackId);
                }
            } catch (retryError) {
                console.error('Auto-retry promise failed:', retryError);
            }
        } else {
            // Handle non-retryable errors
            const currentPlayer = get().player;
            resourceManager.cleanupOnError(currentPlayer, timerManager, promiseManager, errorInfo);
            
            stateBatcher.batchUpdate(
                stateManager.createErrorState(errorInfo, errorInfo.recoverable), 
                set, 
                true
            );
        }
    };

    return {
        // ====================================================================
        // INITIAL STATE
        // ====================================================================
        
        ...stateManager.createInitialState(),

        // ====================================================================
        // CORE PLAYBACK METHODS
        // ====================================================================
        
        /**
         * Plays a track by ID with comprehensive error handling and resource management
         * Handles loading, caching, and state transitions
         */
        play: async (trackId) => {
            // Early return if same track is already playing
            if (get().playingTrackId === trackId && get().status !== null) {
                return;
            }

            // Cancel any existing operations
            promiseManager.cancelAll();

            // Validate and prepare track data
            const trackData = getCachedTrackData(trackId);
            if (!trackData) {
                return handleTrackNotFound(trackId);
            }

            // Prepare playback resources
            const { metadata, files } = trackData;
            const audioUrl = createAudioUrl(trackId);

            // Clean up previous resources
            const prevPlayer = get().player;
            resourceManager.cleanup(prevPlayer, timerManager, promiseManager);

            // Set loading state
            stateBatcher.batchUpdate(
                stateManager.createLoadingState(trackId, metadata, files), 
                set, 
                true
            );

            // Create and execute playback promise
            const playPromise = createPlaybackPromise(audioUrl, trackId);

            // Execute playback with error handling
            await executePlayback(playPromise, trackId);
        },

        /**
         * Seeks to a specific time position in the current track
         * Provides immediate visual feedback and validates time bounds
         */
        seek: (time) => {
            const { player, status } = get();
            
            if (!player) {
                console.warn('Cannot seek: no player available');
                return false;
            }
            
            // Validate seek time
            const duration = player.duration();
            const clampedTime = Math.max(0, Math.min(time, duration));
            
            try {
                // Provide immediate visual feedback before actual seek
                stateBatcher.batchUpdate({
                    currentTime: clampedTime,
                    lastInteractionTime: Date.now()
                }, set, true);
                
                // Perform the actual seek operation
                player.seek(clampedTime);
                timerManager.skipNext();
                
                // Update state based on current status
                const newState = {
                    pauseTime: status === 'paused' ? clampedTime : null,
                    currentTime: clampedTime,
                    error: null
                };
                
                // If we were paused, maintain paused state; if playing, ensure playing state
                if (status === 'paused') {
                    newState.status = 'paused';
                } else if (status === 'playing') {
                    newState.status = 'playing';
                }
                
                stateBatcher.batchUpdate(newState, set, true);
                return true;
                
            } catch (error) {
                console.error('Seek operation failed:', error);
                const errorInfo = errorHandler.categorizeError(error, 'Seek operation');
                errorInfo.userMessage = 'Failed to seek to the requested position.';
                
                stateBatcher.batchUpdate({
                    error: errorInfo
                }, set, true);
                return false;
            }
        },

        /**
         * Pauses the currently playing track
         * Stops the progress timer and saves current position
         */
        pause: () => {
            const { player, status } = get();
            
            if (!player) {
                console.warn('Cannot pause: no player available');
                return false;
            }
            
            if (status !== 'playing') {
                console.warn('Cannot pause: not currently playing');
                return false;
            }
            
            try {
                // Provide immediate visual feedback
                const currentTime = player.seek();
                stateBatcher.batchUpdate({
                    status: 'paused',
                    pauseTime: currentTime,
                    lastInteractionTime: Date.now()
                }, set, true);
                
                // Perform the actual pause operation
                player.pause();
                stopTimer();
                stateBatcher.flushUpdates(set); // Flush pending updates before pause
                
                // Confirm the paused state
                stateBatcher.batchUpdate({
                    ...stateManager.createPausedState(currentTime),
                    error: null
                }, set, true);
                
                return true;
                
            } catch (error) {
                console.error('Pause operation failed:', error);
                const errorInfo = errorHandler.categorizeError(error, 'Pause operation');
                errorInfo.userMessage = 'Failed to pause playback.';
                
                stateBatcher.batchUpdate({
                    error: errorInfo
                }, set, true);
                return false;
            }
        },

        /**
         * Resumes playback from the paused position
         * Returns a promise that resolves when playback starts
         */
        resume: () => {
            // Provide immediate feedback that resume is starting
            const { player, pauseTime, status } = get();
            
            if (!player || pauseTime == null) {
                const errorInfo = errorHandler.categorizeError(
                    new Error('No player or pause time available'),
                    'Resume validation'
                );
                errorInfo.userMessage = 'Cannot resume playback. Please start playing a track first.';
                
                stateBatcher.batchUpdate(stateManager.createErrorState(errorInfo, true), set, true);
                return Promise.reject(new Error(errorInfo.message));
            }
            
            if (status !== 'paused') {
                console.warn('Cannot resume: not currently paused');
                return Promise.resolve();
            }
            
            // Provide immediate visual feedback
            stateBatcher.batchUpdate({
                status: 'playing',
                lastInteractionTime: Date.now()
            }, set, true);
            
            // Create a cancellable resume promise with proper error handling
            const resumePromise = promiseManager.createCancellablePromise((resolve, reject, cancellationToken) => {
                try {
                    // Check for cancellation before proceeding
                    cancellationToken.throwIfCancelled();
                    
                    player.seek(pauseTime);
                    player.play();
                    timerManager.skipNext();
                    startTimer();

                    const handlePlay = () => {
                        // Check for cancellation before handling play event
                        if (cancellationToken.isCancelled()) return;
                        
                        // Use immediate update for critical state change
                        stateBatcher.batchUpdate({
                            status: 'playing',
                            pauseTime: null,
                            error: null,
                            lastInteractionTime: Date.now()
                        }, set, true);
                        resolve();
                    };

                    const handleError = (_, error) => {
                        // Check for cancellation before handling error
                        if (cancellationToken.isCancelled()) return;
                        
                        // Enhanced error handling for resume failure
                        const errorInfo = errorHandler.handlePlayError(
                            error,
                            player,
                            timerManager,
                            promiseManager,
                            (updates, immediate) => stateBatcher.batchUpdate(updates, set, immediate),
                            'Audio resume'
                        );
                        
                        if (errorInfo) {
                            reject(new Error(errorInfo.message));
                        }
                    };

                    player.once('play', handlePlay);
                    player.once('playerror', handleError);
                    
                    // Return cleanup function to remove event listeners
                    return () => {
                        if (player) {
                            try {
                                player.off('play', handlePlay);
                                player.off('playerror', handleError);
                            } catch (cleanupError) {
                                console.warn('Error removing resume event listeners:', cleanupError);
                            }
                        }
                    };
                    
                } catch (error) {
                    // Enhanced error handling for immediate resume error
                    const errorInfo = errorHandler.handlePlayError(
                        error,
                        player,
                        timerManager,
                        promiseManager,
                        (updates, immediate) => stateBatcher.batchUpdate(updates, set, immediate),
                        'Audio resume initialization'
                    );
                    
                    if (errorInfo) {
                        reject(new Error(errorInfo.message));
                    }
                }
            });
            
            return resumePromise;
        },

        /**
         * Stops playback and resets to initial state
         * Performs comprehensive resource cleanup
         */
        stop: () => {
            const { player } = get();
            resourceManager.cleanup(player, timerManager, promiseManager);
            stateBatcher.flushUpdates(set); // Flush pending updates before stop
            stateBatcher.batchUpdate(stateManager.createStoppedState(), set, true);
        },

        // ====================================================================
        // AUDIO CONTROL METHODS
        // ====================================================================
        
        /**
         * Sets the volume level with validation and immediate feedback
         * Applies volume to both store state and active player
         */
        setVolume: (vol) => {
            const clampedVol = Math.max(0, Math.min(vol, 1));
            const adjustedVolume = clampedVol / CONSTANTS.VOLUME_DIVISOR;
            
            try {
                // Provide immediate visual feedback for volume slider
                stateBatcher.batchUpdate({ 
                    volume: adjustedVolume,
                    error: null,
                    lastInteractionTime: Date.now()
                }, set, true);
                
                // Apply volume to player if available
                const player = get().player;
                if (player) {
                    player.volume(adjustedVolume);
                }
                
                return true;
                
            } catch (error) {
                console.error('Volume change failed:', error);
                const errorInfo = errorHandler.categorizeError(error, 'Volume control');
                errorInfo.userMessage = 'Failed to change volume.';
                
                stateBatcher.batchUpdate({
                    error: errorInfo
                }, set, true);
                return false;
            }
        },

        /**
         * Updates the current playback time with validation
         * Used for progress bar interactions and external time updates
         */
        updateCurrentTime: (time) => {
            const player = get().player;
            
            if (!player) {
                console.warn('Cannot update time: no player available');
                return false;
            }
            
            try {
                // Validate time value
                const duration = player.duration();
                const clampedTime = Math.max(0, Math.min(time, duration));
                
                // Provide immediate visual feedback for progress bar
                stateBatcher.batchUpdate({ 
                    currentTime: clampedTime,
                    error: null,
                    lastInteractionTime: Date.now()
                }, set, true);
                
                // Update player position
                player.seek(clampedTime);
                timerManager.skipNext();
                
                return true;
                
            } catch (error) {
                console.error('Time update failed:', error);
                const errorInfo = errorHandler.categorizeError(error, 'Time update');
                errorInfo.userMessage = 'Failed to update playback position.';
                
                stateBatcher.batchUpdate({
                    error: errorInfo
                }, set, true);
                return false;
            }
        },

        /**
         * Updates the pause time for resume functionality
         */
        updatePauseTime: (time) => {
            stateBatcher.batchUpdate({ pauseTime: time }, set);
        },

        // ====================================================================
        // USER INTERACTION METHODS
        // ====================================================================
        
        /**
         * Cancels the current loading operation
         * Provides immediate user feedback and comprehensive cleanup
         */
        cancelLoading: () => {
            const { status } = get();
            
            if (status !== 'loading') {
                console.warn('Cannot cancel: no loading operation in progress');
                return false;
            }

            console.log('User requested loading cancellation');
            
            // Cancel all active promises (this will cancel the loading operation)
            promiseManager.cancelAll();
            
            // Stop any timers
            timerManager.stop();
            
            // Clean up any existing player
            const currentPlayer = get().player;
            if (currentPlayer) {
                resourceManager.disposePlayer(currentPlayer);
            }
            
            // Set cancelled state with immediate feedback
            stateBatcher.batchUpdate({
                status: null,
                playingTrackId: null,
                playingMetadata: null,
                playingFiles: null,
                currentTime: 0,
                duration: CONSTANTS.DEFAULT_DURATION,
                player: null,
                error: null,
                retryCount: 0
            }, set, true);
            
            return true;
        },

        // ====================================================================
        // ERROR RECOVERY METHODS
        // ====================================================================
        
        /**
         * Manually retries the last failed operation
         * Implements exponential backoff and retry limits
         */
        retry: async () => {
            const { error, playingTrackId, retryCount } = get();
            
            if (!error || !error.retryable) {
                console.warn('Cannot retry: error is not retryable or no error present');
                return;
            }

            if (retryCount >= CONSTANTS.MAX_RETRY_ATTEMPTS) {
                console.warn('Maximum retry attempts reached');
                const errorInfo = errorHandler.categorizeError(
                    new Error('Maximum retry attempts exceeded'),
                    'Retry limit'
                );
                errorInfo.userMessage = 'Maximum retry attempts reached. Please try again later.';
                errorInfo.recoverable = false;
                
                stateBatcher.batchUpdate(stateManager.createErrorState(errorInfo), set, true);
                return;
            }

            if (!playingTrackId) {
                console.warn('Cannot retry: no track ID available');
                return;
            }

            console.log(`Retrying playback (attempt ${retryCount + 1}/3)...`);
            
            // Provide immediate feedback that retry is starting
            stateBatcher.batchUpdate({ 
                status: 'loading',
                error: null
            }, set, true);
            
            // Increment retry count
            stateBatcher.batchUpdate({ retryCount: retryCount + 1 }, set);
            
            // Create a cancellable retry promise with exponential backoff
            const retryPromise = promiseManager.createCancellablePromise(async (resolve, reject, cancellationToken) => {
                try {
                    // Wait before retry with exponential backoff
                    const delay = Math.pow(2, retryCount) * CONSTANTS.BASE_RETRY_DELAY;
                    
                    // Create a cancellable delay
                    await new Promise((delayResolve, delayReject) => {
                        const timeoutId = setTimeout(() => {
                            if (cancellationToken.isCancelled()) {
                                delayReject(new Error('Retry cancelled during delay'));
                            } else {
                                delayResolve();
                            }
                        }, delay);
                        
                        // Store timeout ID for cleanup
                        return () => {
                            clearTimeout(timeoutId);
                        };
                    });
                    
                    // Check for cancellation before attempting retry
                    cancellationToken.throwIfCancelled();
                    
                    // Attempt to play again
                    await get().play(playingTrackId);
                    resolve();
                    
                } catch (retryError) {
                    // Use enhanced async error handling for retry errors
                    const errorInfo = errorHandler.handleAsyncError(
                        retryError, 
                        'Retry operation', 
                        promiseManager
                    );
                    
                    if (errorInfo) {
                        console.error('Retry failed:', errorInfo.message);
                        reject(retryError);
                    } else {
                        // Cancellation error, resolve silently
                        resolve();
                    }
                }
            });
            
            try {
                await retryPromise;
            } catch (retryError) {
                // The error has already been handled by the async error handler
                console.log('Retry operation completed with error');
            }
        },

        /**
         * Automatically retries failed operations with exponential backoff
         * Used internally for network error recovery
         */
        autoRetry: async (trackId, currentRetryCount = 0) => {
            const maxRetries = CONSTANTS.MAX_RETRY_ATTEMPTS;
            const baseDelay = CONSTANTS.BASE_RETRY_DELAY;
            
            if (currentRetryCount >= maxRetries) {
                console.warn('Auto-retry: Maximum attempts reached');
                const errorInfo = errorHandler.categorizeError(
                    new Error('Auto-retry maximum attempts exceeded'),
                    'Auto-retry limit'
                );
                errorInfo.userMessage = 'Failed to load audio after multiple attempts. Please try again later.';
                errorInfo.recoverable = false;
                
                stateBatcher.batchUpdate(stateManager.createErrorState(errorInfo), set, true);
                return false;
            }

            console.log(`Auto-retry attempt ${currentRetryCount + 1}/${maxRetries} for track ${trackId}`);
            
            // Calculate exponential backoff delay
            const delay = baseDelay * Math.pow(2, currentRetryCount);
            
            // Create a cancellable auto-retry promise
            const autoRetryPromise = promiseManager.createCancellablePromise(async (resolve, reject, cancellationToken) => {
                try {
                    // Wait with exponential backoff
                    await new Promise((delayResolve, delayReject) => {
                        const timeoutId = setTimeout(() => {
                            if (cancellationToken.isCancelled()) {
                                delayReject(new Error('Auto-retry cancelled during delay'));
                            } else {
                                delayResolve();
                            }
                        }, delay);
                        
                        return () => {
                            clearTimeout(timeoutId);
                        };
                    });
                    
                    // Check for cancellation before attempting retry
                    cancellationToken.throwIfCancelled();
                    
                    // Update retry count in state
                    stateBatcher.batchUpdate({ 
                        retryCount: currentRetryCount + 1,
                        status: 'loading'
                    }, set, true);
                    
                    // Attempt to play again
                    await get().play(trackId);
                    resolve(true);
                    
                } catch (retryError) {
                    // Check if this is a retryable error
                    const errorInfo = errorHandler.categorizeError(retryError, 'Auto-retry');
                    
                    if (errorInfo.retryable && !errorHandler.isCancellationError(retryError)) {
                        // Recursively try again with incremented count
                        const success = await get().autoRetry(trackId, currentRetryCount + 1);
                        resolve(success);
                    } else {
                        // Non-retryable error or cancellation
                        if (!errorHandler.isCancellationError(retryError)) {
                            console.error('Auto-retry failed with non-retryable error:', errorInfo.message);
                            stateBatcher.batchUpdate(stateManager.createErrorState(errorInfo), set, true);
                        }
                        resolve(false);
                    }
                }
            });
            
            try {
                return await autoRetryPromise;
            } catch (error) {
                // Handle any unexpected errors
                const errorInfo = errorHandler.handleAsyncError(error, 'Auto-retry operation', promiseManager);
                if (errorInfo) {
                    console.error('Auto-retry operation failed:', errorInfo.message);
                }
                return false;
            }
        },

        /**
         * Clears the current error state and resets retry count
         */
        clearError: () => {
            stateBatcher.batchUpdate({ 
                error: null, 
                retryCount: 0,
                status: get().status === 'error' ? null : get().status
            }, set, true);
        },

        // ====================================================================
        // STATE QUERY METHODS
        // ====================================================================
        
        /**
         * Gets user-friendly error message for display
         */
        getErrorMessage: () => {
            const { error } = get();
            return error ? error.userMessage : null;
        },

        /**
         * Checks if the current error is recoverable
         */
        isErrorRecoverable: () => {
            const { error } = get();
            return error ? error.recoverable : false;
        },

        /**
         * Checks if the current error is retryable
         */
        isErrorRetryable: () => {
            const { error } = get();
            return error ? error.retryable : false;
        },

        /**
         * Checks if the current loading operation can be cancelled
         */
        canCancelLoading: () => {
            const { status, isLoadingCancellable } = get();
            return status === 'loading' && isLoadingCancellable;
        },

        // ====================================================================
        // PROGRESS AND FEEDBACK METHODS
        // ====================================================================
        
        /**
         * Gets comprehensive loading progress information
         */
        getLoadingInfo: () => {
            const { status, retryCount, lastInteractionTime } = get();
            
            if (status !== 'loading') {
                return null;
            }
            
            const now = Date.now();
            const elapsedTime = lastInteractionTime ? now - lastInteractionTime : 0;
            
            return {
                isLoading: true,
                retryCount,
                elapsedTime,
                canCancel: get().canCancelLoading()
            };
        },

        /**
         * Enhanced stop method with immediate user feedback
         */
        stopWithFeedback: () => {
            const { player, status } = get();
            
            // Provide immediate visual feedback
            stateBatcher.batchUpdate({
                status: null
            }, set, true);
            
            try {
                resourceManager.cleanup(player, timerManager, promiseManager);
                stateBatcher.flushUpdates(set); // Flush pending updates before stop
                stateBatcher.batchUpdate({
                    ...stateManager.createStoppedState(),
                    lastInteractionTime: Date.now()
                }, set, true);
                
                return true;
                
            } catch (error) {
                console.error('Stop operation failed:', error);
                const errorInfo = errorHandler.categorizeError(error, 'Stop operation');
                errorInfo.userMessage = 'Failed to stop playback.';
                
                stateBatcher.batchUpdate({
                    error: errorInfo
                }, set, true);
                return false;
            }
        },

        /**
         * Gets user interaction responsiveness metrics
         */
        getInteractionMetrics: () => {
            const { lastInteractionTime } = get();
            
            if (!lastInteractionTime) {
                return null;
            }
            
            const now = Date.now();
            const timeSinceLastInteraction = now - lastInteractionTime;
            
            return {
                lastInteractionTime,
                timeSinceLastInteraction,
                isRecentInteraction: timeSinceLastInteraction < CONSTANTS.INTERACTION_TIMEOUT
            };
        },

        /**
         * Gets detailed loading progress with percentage and time estimates
         */
        getLoadingProgress: () => {
            const { status, retryCount, lastInteractionTime, error } = get();
            
            if (status !== 'loading') {
                return null;
            }
            
            const now = Date.now();
            const elapsedTime = lastInteractionTime ? now - lastInteractionTime : 0;
            const maxLoadTime = CONSTANTS.MAX_LOAD_TIME;
            const progressPercentage = Math.min((elapsedTime / maxLoadTime) * 100, 95); // Cap at 95% until actually loaded
            
            return {
                isLoading: true,
                progressPercentage,
                elapsedTime,
                retryCount,
                canCancel: get().canCancelLoading(),
                hasError: !!error,
                errorMessage: error ? error.userMessage : null,
                isRetrying: retryCount > 0,
                estimatedTimeRemaining: Math.max(0, maxLoadTime - elapsedTime)
            };
        },

        /**
         * Updates loading feedback with custom message and progress
         */
        updateLoadingFeedback: (message, progress = null) => {
            const { status } = get();
            
            if (status !== 'loading') {
                return false;
            }
            
            const updateData = {
                lastInteractionTime: Date.now()
            };
            
            if (message) {
                updateData.loadingMessage = message;
            }
            
            if (progress !== null) {
                updateData.loadingProgress = Math.max(0, Math.min(100, progress));
            }
            
            stateBatcher.batchUpdate(updateData, set, true);
            return true;
        },

        // ====================================================================
        // NETWORK AND ADAPTIVE QUALITY METHODS
        // ====================================================================
        
        /**
         * Gets basic network condition information for adaptive quality
         * Foundation for future adaptive streaming implementation
         */
        getNetworkCondition: () => {
            // Basic network condition detection using navigator.connection if available
            if (typeof navigator !== 'undefined' && navigator.connection) {
                const connection = navigator.connection;
                return {
                    effectiveType: connection.effectiveType || 'unknown',
                    downlink: connection.downlink || null,
                    rtt: connection.rtt || null,
                    saveData: connection.saveData || false
                };
            }
            
            // Fallback: estimate based on retry patterns and loading times
            const { retryCount, lastInteractionTime } = get();
            const now = Date.now();
            const timeSinceInteraction = lastInteractionTime ? now - lastInteractionTime : 0;
            
            // Simple heuristic: if we've had to retry multiple times, assume poor connection
            let estimatedQuality = 'good';
            if (retryCount > 1) {
                estimatedQuality = 'poor';
            } else if (retryCount > 0 || timeSinceInteraction > 10000) {
                estimatedQuality = 'fair';
            }
            
            return {
                effectiveType: estimatedQuality,
                downlink: null,
                rtt: null,
                saveData: false,
                estimated: true
            };
        },

        // Adaptive quality selection based on network conditions (foundation for requirement 8.3)
        getAdaptiveAudioUrl: (trackId, baseUrl) => {
            const networkCondition = get().getNetworkCondition();
            
            // For now, this is a foundation - in a full implementation, this would
            // select different quality levels based on network conditions
            let qualityParam = '';
            
            if (networkCondition.saveData || networkCondition.effectiveType === 'slow-2g' || networkCondition.effectiveType === '2g') {
                qualityParam = '&quality=low';
            } else if (networkCondition.effectiveType === '3g' || networkCondition.effectiveType === 'poor') {
                qualityParam = '&quality=medium';
            } else {
                qualityParam = '&quality=high';
            }
            
            return `${baseUrl}${qualityParam}`;
        },

        // ====================================================================
        // CLEANUP AND DEBUGGING METHODS
        // ====================================================================
        
        /**
         * Comprehensive cleanup method for component unmount
         * Cancels all operations and releases all resources
         */
        cleanup: () => {
            const { player } = get();
            
            console.log('Starting store cleanup...', {
                activePromises: promiseManager.getActiveCount(),
                timerRunning: timerManager.isRunning,
                playerExists: !!player
            });
            
            // Cancel all active promises first to prevent any ongoing operations
            promiseManager.cancelAll();
            
            // Clear performance cache
            performanceCache.clearCache();
            
            // Clear any pending batched updates
            stateBatcher.clearPending();
            
            // Perform comprehensive resource cleanup
            const cleanState = resourceManager.cleanupStore(player, timerManager, promiseManager);
            stateBatcher.batchUpdate(cleanState, set, true);
            
            console.log('Store cleanup completed');
        },

        /**
         * Gets promise management statistics for debugging and monitoring
         */
        getPromiseStats: () => {
            return {
                activePromises: promiseManager.getActiveCount(),
                timerRunning: timerManager.isRunning
            };
        },

        /**
         * Cancels all active operations for emergency cleanup or testing
         */
        cancelAllOperations: () => {
            console.log('Cancelling all active operations...', {
                activePromises: promiseManager.getActiveCount()
            });
            
            promiseManager.cancelAll();
            timerManager.stop();
            stateBatcher.clearPending();
            
            // Set a clean state
            stateBatcher.batchUpdate({
                status: null,
                error: null,
                retryCount: 0
            }, set, true);
        }
    };
});

// ============================================================================
// EXPORT
// ============================================================================

/**
 * Music Item Store - Comprehensive audio playback management
 * 
 * Features:
 * - Robust error handling with categorization and recovery
 * - Memory leak prevention through proper resource management
 * - Performance optimization with caching and batched updates
 * - User experience enhancements with immediate feedback
 * - Comprehensive promise management with cancellation support
 * - Automatic retry logic with exponential backoff
 * - Network condition monitoring for adaptive quality
 * 
 * API Compatibility: Maintains full backward compatibility with existing code
 */
export default useMusicItemStore;
