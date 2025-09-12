import { performance } from 'perf_hooks';
import useMusicItemStore from '../../stores/useMusicItemStore.js';

/**
 * Performance Benchmark Suite for Music Store
 * Measures key performance metrics to verify improvements
 */

// Mock music list for testing
const mockMusicList = Array.from({ length: 100 }, (_, i) => ({
  id: `track-${i + 1}`,
  title: `Test Track ${i + 1}`,
  artist: `Test Artist ${i + 1}`,
  duration: 180 + (i * 10),
  metadata: {
    genre: 'Test',
    year: 2023,
    album: `Test Album ${Math.floor(i / 10) + 1}`
  },
  files: {
    mp3: `https://example.com/track-${i + 1}.mp3`,
    wav: `https://example.com/track-${i + 1}.wav`
  }
}));

// Mock useMusicListStore
const mockMusicListStore = {
  getState: () => ({ musicList: mockMusicList })
};

// Replace the import with our mock
global.useMusicListStore = mockMusicListStore;

class PerformanceBenchmark {
  constructor() {
    this.results = {};
    this.store = null;
  }

  async setup() {
    // Get fresh store instance
    this.store = useMusicItemStore.getState();
    
    // Ensure clean state
    if (this.store.cleanup) {
      this.store.cleanup();
    }
  }

  async teardown() {
    if (this.store && this.store.cleanup) {
      this.store.cleanup();
    }
  }

  measureTime(fn) {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    return {
      result,
      duration: end - start
    };
  }

  async measureAsyncTime(fn) {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    return {
      result,
      duration: end - start
    };
  }

  // Benchmark 1: State Update Performance
  async benchmarkStateUpdates() {
    console.log('🔄 Benchmarking state updates...');
    
    const iterations = 1000;
    const measurements = [];

    for (let i = 0; i < iterations; i++) {
      const { duration } = this.measureTime(() => {
        this.store.updateCurrentTime(Math.random() * 100);
      });
      measurements.push(duration);
    }

    const avgDuration = measurements.reduce((a, b) => a + b, 0) / measurements.length;
    const maxDuration = Math.max(...measurements);
    const minDuration = Math.min(...measurements);

    this.results.stateUpdates = {
      iterations,
      avgDuration: avgDuration.toFixed(3),
      maxDuration: maxDuration.toFixed(3),
      minDuration: minDuration.toFixed(3),
      totalDuration: measurements.reduce((a, b) => a + b, 0).toFixed(3)
    };

    console.log(`   ✅ Average: ${avgDuration.toFixed(3)}ms per update`);
    console.log(`   📊 Range: ${minDuration.toFixed(3)}ms - ${maxDuration.toFixed(3)}ms`);
  }

  // Benchmark 2: Volume Control Performance
  async benchmarkVolumeControl() {
    console.log('🔊 Benchmarking volume control...');
    
    const iterations = 500;
    const measurements = [];

    for (let i = 0; i < iterations; i++) {
      const { duration } = this.measureTime(() => {
        this.store.setVolume(Math.random());
      });
      measurements.push(duration);
    }

    const avgDuration = measurements.reduce((a, b) => a + b, 0) / measurements.length;
    
    this.results.volumeControl = {
      iterations,
      avgDuration: avgDuration.toFixed(3),
      totalDuration: measurements.reduce((a, b) => a + b, 0).toFixed(3)
    };

    console.log(`   ✅ Average: ${avgDuration.toFixed(3)}ms per volume change`);
  }

  // Benchmark 3: Seek Operation Performance
  async benchmarkSeekOperations() {
    console.log('⏭️ Benchmarking seek operations...');
    
    const iterations = 200;
    const measurements = [];

    for (let i = 0; i < iterations; i++) {
      const { duration } = this.measureTime(() => {
        this.store.seek(Math.random() * 100);
      });
      measurements.push(duration);
    }

    const avgDuration = measurements.reduce((a, b) => a + b, 0) / measurements.length;
    
    this.results.seekOperations = {
      iterations,
      avgDuration: avgDuration.toFixed(3),
      totalDuration: measurements.reduce((a, b) => a + b, 0).toFixed(3)
    };

    console.log(`   ✅ Average: ${avgDuration.toFixed(3)}ms per seek`);
  }

  // Benchmark 4: Promise Management Performance
  async benchmarkPromiseManagement() {
    console.log('🔄 Benchmarking promise management...');
    
    const iterations = 100;
    const measurements = [];

    for (let i = 0; i < iterations; i++) {
      const { duration } = await this.measureAsyncTime(async () => {
        // Simulate rapid promise creation and cancellation
        const promises = [];
        for (let j = 0; j < 10; j++) {
          promises.push(new Promise(resolve => setTimeout(resolve, 1)));
        }
        
        // Cancel all operations (simulates rapid track switching)
        if (this.store.cancelAllOperations) {
          this.store.cancelAllOperations();
        }
        
        await Promise.allSettled(promises);
      });
      measurements.push(duration);
    }

    const avgDuration = measurements.reduce((a, b) => a + b, 0) / measurements.length;
    
    this.results.promiseManagement = {
      iterations,
      avgDuration: avgDuration.toFixed(3),
      totalDuration: measurements.reduce((a, b) => a + b, 0).toFixed(3)
    };

    console.log(`   ✅ Average: ${avgDuration.toFixed(3)}ms per promise batch`);
  }

  // Benchmark 5: Memory Usage Tracking
  async benchmarkMemoryUsage() {
    console.log('💾 Benchmarking memory usage...');
    
    const initialMemory = process.memoryUsage();
    
    // Perform intensive operations
    for (let i = 0; i < 100; i++) {
      this.store.updateCurrentTime(Math.random() * 100);
      this.store.setVolume(Math.random());
      this.store.seek(Math.random() * 100);
      
      if (this.store.getPromiseStats) {
        this.store.getPromiseStats();
      }
    }

    const finalMemory = process.memoryUsage();
    
    this.results.memoryUsage = {
      initialHeapUsed: (initialMemory.heapUsed / 1024 / 1024).toFixed(2),
      finalHeapUsed: (finalMemory.heapUsed / 1024 / 1024).toFixed(2),
      heapDelta: ((finalMemory.heapUsed - initialMemory.heapUsed) / 1024 / 1024).toFixed(2),
      initialExternal: (initialMemory.external / 1024 / 1024).toFixed(2),
      finalExternal: (finalMemory.external / 1024 / 1024).toFixed(2),
      externalDelta: ((finalMemory.external - initialMemory.external) / 1024 / 1024).toFixed(2)
    };

    console.log(`   ✅ Heap usage: ${this.results.memoryUsage.initialHeapUsed}MB → ${this.results.memoryUsage.finalHeapUsed}MB (Δ${this.results.memoryUsage.heapDelta}MB)`);
  }

  // Benchmark 6: Error Handling Performance
  async benchmarkErrorHandling() {
    console.log('⚠️ Benchmarking error handling...');
    
    const iterations = 50;
    const measurements = [];

    for (let i = 0; i < iterations; i++) {
      const { duration } = this.measureTime(() => {
        try {
          // Simulate various error scenarios
          this.store.seek(-1); // Invalid seek
          this.store.setVolume(-1); // Invalid volume
          this.store.updateCurrentTime(-1); // Invalid time
        } catch (error) {
          // Expected errors
        }
      });
      measurements.push(duration);
    }

    const avgDuration = measurements.reduce((a, b) => a + b, 0) / measurements.length;
    
    this.results.errorHandling = {
      iterations,
      avgDuration: avgDuration.toFixed(3),
      totalDuration: measurements.reduce((a, b) => a + b, 0).toFixed(3)
    };

    console.log(`   ✅ Average: ${avgDuration.toFixed(3)}ms per error scenario`);
  }

  // Benchmark 7: Concurrent Operations
  async benchmarkConcurrentOperations() {
    console.log('🔀 Benchmarking concurrent operations...');
    
    const { duration } = await this.measureAsyncTime(async () => {
      const operations = [];
      
      // Create multiple concurrent operations
      for (let i = 0; i < 20; i++) {
        operations.push(
          new Promise(resolve => {
            setTimeout(() => {
              this.store.updateCurrentTime(Math.random() * 100);
              this.store.setVolume(Math.random());
              resolve();
            }, Math.random() * 10);
          })
        );
      }
      
      await Promise.all(operations);
    });

    this.results.concurrentOperations = {
      operations: 20,
      totalDuration: duration.toFixed(3),
      avgPerOperation: (duration / 20).toFixed(3)
    };

    console.log(`   ✅ 20 concurrent operations completed in ${duration.toFixed(3)}ms`);
  }

  // Run all benchmarks
  async runAllBenchmarks() {
    console.log('🚀 Starting Performance Benchmark Suite\n');
    
    await this.setup();
    
    try {
      await this.benchmarkStateUpdates();
      await this.benchmarkVolumeControl();
      await this.benchmarkSeekOperations();
      await this.benchmarkPromiseManagement();
      await this.benchmarkMemoryUsage();
      await this.benchmarkErrorHandling();
      await this.benchmarkConcurrentOperations();
      
      this.printSummary();
      
    } catch (error) {
      console.error('❌ Benchmark failed:', error);
    } finally {
      await this.teardown();
    }
  }

  printSummary() {
    console.log('\n📊 Performance Benchmark Results Summary');
    console.log('=' .repeat(50));
    
    Object.entries(this.results).forEach(([test, results]) => {
      console.log(`\n${test.toUpperCase()}:`);
      Object.entries(results).forEach(([key, value]) => {
        console.log(`  ${key}: ${value}${key.includes('Duration') ? 'ms' : ''}`);
      });
    });

    // Performance thresholds (requirements verification)
    const thresholds = {
      stateUpdates: { avgDuration: 1.0 }, // Should be under 1ms per update
      volumeControl: { avgDuration: 2.0 }, // Should be under 2ms per volume change
      seekOperations: { avgDuration: 5.0 }, // Should be under 5ms per seek
      memoryUsage: { heapDelta: 10.0 } // Should not grow more than 10MB
    };

    console.log('\n✅ Performance Requirements Verification:');
    console.log('=' .repeat(50));
    
    let allPassed = true;
    
    Object.entries(thresholds).forEach(([test, limits]) => {
      const results = this.results[test];
      if (results) {
        Object.entries(limits).forEach(([metric, threshold]) => {
          const actual = parseFloat(results[metric]);
          const passed = actual <= threshold;
          allPassed = allPassed && passed;
          
          const status = passed ? '✅' : '❌';
          console.log(`  ${status} ${test}.${metric}: ${actual} <= ${threshold}`);
        });
      }
    });

    console.log(`\n${allPassed ? '🎉' : '⚠️'} Overall Performance: ${allPassed ? 'PASSED' : 'NEEDS ATTENTION'}`);
    
    return allPassed;
  }
}

// Export for use in tests
export default PerformanceBenchmark;

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const benchmark = new PerformanceBenchmark();
  benchmark.runAllBenchmarks()
    .then((passed) => {
      process.exit(passed ? 0 : 1);
    })
    .catch((error) => {
      console.error('Benchmark failed:', error);
      process.exit(1);
    });
}