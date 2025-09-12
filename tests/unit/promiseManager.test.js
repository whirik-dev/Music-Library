import { describe, it, expect, beforeEach, vi } from 'vitest'

// Test version of promise manager
const createPromiseManager = () => ({
  activePromises: new Map(),
  promiseCounter: 0,
  
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
    
    const promiseMetadata = {
      id: promiseId,
      promise,
      cancel: () => {
        if (!isCancelled && !isResolved) {
          isCancelled = true;
          isResolved = true;
          
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
    
    promise.cancel = promiseMetadata.cancel;
    promise.isCancelled = promiseMetadata.isCancelled;
    promise.isResolved = promiseMetadata.isResolved;
    promise.id = promiseId;
    
    return promise;
  },
  
  register: function(promise, resourceCleanup = null) {
    this.cancelAll();
    
    if (!promise) return null;
    
    if (promise.cancel && promise.isCancelled) {
      return promise;
    }
    
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
    
    cancellablePromise.cancel = promiseMetadata.cancel;
    cancellablePromise.isCancelled = promiseMetadata.isCancelled;
    cancellablePromise.id = promiseId;
    
    return cancellablePromise;
  },

  cancelPromise: function(promiseId) {
    const promiseMetadata = this.activePromises.get(promiseId);
    if (promiseMetadata) {
      promiseMetadata.cancel();
    }
  },

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

  isCancelled: function(promise) {
    if (!promise) return false;
    
    if (promise.isCancelled && typeof promise.isCancelled === 'function') {
      return promise.isCancelled();
    }
    
    return promise && promise.cancelled === true;
  },

  getActiveCount: function() {
    return this.activePromises.size;
  },

  clear: function() {
    this.activePromises.clear();
    this.promiseCounter = 0;
  },

  createTimeoutPromise: function(ms, timeoutMessage = 'Operation timed out') {
    return this.createCancellablePromise((resolve, reject, cancellationToken) => {
      const timeoutId = setTimeout(() => {
        if (!cancellationToken.isCancelled()) {
          reject(new Error(timeoutMessage));
        }
      }, ms);
      
      return () => {
        clearTimeout(timeoutId);
      };
    });
  },

  withTimeout: function(promise, timeoutMs, timeoutMessage = 'Operation timed out') {
    const timeoutPromise = this.createTimeoutPromise(timeoutMs, timeoutMessage);
    
    return this.createCancellablePromise((resolve, reject, cancellationToken) => {
      Promise.race([promise, timeoutPromise])
        .then(resolve)
        .catch(reject);
        
      return () => {
        if (promise.cancel) promise.cancel();
        if (timeoutPromise.cancel) timeoutPromise.cancel();
      };
    });
  }
});

describe('PromiseManager', () => {
  let promiseManager;

  beforeEach(() => {
    promiseManager = createPromiseManager();
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Clean up any remaining promises to prevent unhandled rejections
    if (promiseManager) {
      promiseManager.cancelAll();
      promiseManager.clear();
    }
  });

  describe('createCancellablePromise', () => {
    it('should create a cancellable promise', async () => {
      const promise = promiseManager.createCancellablePromise((resolve) => {
        setTimeout(() => resolve('success'), 10);
      });

      expect(promise.cancel).toBeDefined();
      expect(promise.isCancelled).toBeDefined();
      expect(promiseManager.getActiveCount()).toBe(1);

      const result = await promise;
      expect(result).toBe('success');
      expect(promiseManager.getActiveCount()).toBe(0);
    });

    it('should cancel a promise before resolution', async () => {
      const cleanupFn = vi.fn();
      const promise = promiseManager.createCancellablePromise((resolve) => {
        setTimeout(() => resolve('success'), 100);
      }, cleanupFn);

      expect(promise.isCancelled()).toBe(false);
      
      promise.cancel();
      
      expect(promise.isCancelled()).toBe(true);
      expect(cleanupFn).toHaveBeenCalled();
      expect(promiseManager.getActiveCount()).toBe(0);
    });

    it('should handle cancellation token', async () => {
      let tokenRef = null;
      const promise = promiseManager.createCancellablePromise((resolve, reject, token) => {
        tokenRef = token;
        setTimeout(() => {
          try {
            token.throwIfCancelled();
            resolve('success');
          } catch (error) {
            reject(error);
          }
        }, 10);
      });

      // Cancel immediately
      promise.cancel();

      // Verify token shows cancelled
      expect(tokenRef.isCancelled()).toBe(true);
      
      // The promise should be cancelled, not rejected
      expect(promise.isCancelled()).toBe(true);
    });

    it('should handle executor errors', () => {
      const promise = promiseManager.createCancellablePromise(() => {
        throw new Error('Executor error');
      });

      return expect(promise).rejects.toThrow('Executor error');
    });
  });

  describe('register', () => {
    it('should register an existing promise', async () => {
      const originalPromise = Promise.resolve('success');
      const cancellablePromise = promiseManager.register(originalPromise);

      expect(cancellablePromise.cancel).toBeDefined();
      expect(promiseManager.getActiveCount()).toBe(1);

      const result = await cancellablePromise;
      expect(result).toBe('success');
    });

    it('should cancel all existing promises when registering new one', () => {
      const promise1 = promiseManager.register(Promise.resolve('1'));
      const promise2 = promiseManager.register(Promise.resolve('2'));

      expect(promise1.isCancelled()).toBe(true);
      expect(promiseManager.getActiveCount()).toBe(1);
    });

    it('should return null for null promise', () => {
      const result = promiseManager.register(null);
      expect(result).toBeNull();
    });
  });

  describe('cancelAll', () => {
    it('should cancel all active promises', () => {
      const promise1 = promiseManager.createCancellablePromise(() => {});
      const promise2 = promiseManager.createCancellablePromise(() => {});

      expect(promiseManager.getActiveCount()).toBe(2);

      promiseManager.cancelAll();

      expect(promise1.isCancelled()).toBe(true);
      expect(promise2.isCancelled()).toBe(true);
      expect(promiseManager.getActiveCount()).toBe(0);
    });
  });

  describe('cancelPromise', () => {
    it('should cancel specific promise by ID', () => {
      const promise1 = promiseManager.createCancellablePromise(() => {});
      const promise2 = promiseManager.createCancellablePromise(() => {});

      promiseManager.cancelPromise(promise1.id);

      expect(promise1.isCancelled()).toBe(true);
      expect(promise2.isCancelled()).toBe(false);
      expect(promiseManager.getActiveCount()).toBe(1);
    });
  });

  describe('createTimeoutPromise', () => {
    it('should create a promise that times out', async () => {
      const promise = promiseManager.createTimeoutPromise(10, 'Test timeout');

      await expect(promise).rejects.toThrow('Test timeout');
    });

    it('should be cancellable before timeout', () => {
      const promise = promiseManager.createTimeoutPromise(100);
      
      promise.cancel();
      
      expect(promise.isCancelled()).toBe(true);
    });
  });

  describe('withTimeout', () => {
    it('should resolve with original promise if it completes first', async () => {
      const originalPromise = Promise.resolve('success');
      const timeoutPromise = promiseManager.withTimeout(originalPromise, 100);

      const result = await timeoutPromise;
      expect(result).toBe('success');
    });

    it('should timeout if original promise takes too long', async () => {
      const originalPromise = new Promise(resolve => setTimeout(() => resolve('success'), 100));
      const timeoutPromise = promiseManager.withTimeout(originalPromise, 10, 'Timeout error');

      await expect(timeoutPromise).rejects.toThrow('Timeout error');
    });
  });

  describe('isCancelled', () => {
    it('should return false for null promise', () => {
      expect(promiseManager.isCancelled(null)).toBe(false);
    });

    it('should return true for cancelled promise', () => {
      const promise = promiseManager.createCancellablePromise(() => {});
      promise.cancel();
      
      expect(promiseManager.isCancelled(promise)).toBe(true);
    });

    it('should handle legacy cancelled property', () => {
      const legacyPromise = { cancelled: true };
      
      expect(promiseManager.isCancelled(legacyPromise)).toBe(true);
    });
  });

  describe('clear', () => {
    it('should clear all promises and reset counter', () => {
      promiseManager.createCancellablePromise(() => {});
      promiseManager.createCancellablePromise(() => {});

      expect(promiseManager.getActiveCount()).toBe(2);
      expect(promiseManager.promiseCounter).toBe(2);

      promiseManager.clear();

      expect(promiseManager.getActiveCount()).toBe(0);
      expect(promiseManager.promiseCounter).toBe(0);
    });
  });
});