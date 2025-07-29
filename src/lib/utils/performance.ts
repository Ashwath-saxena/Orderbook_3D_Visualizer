import { OrderBookSnapshot } from '@/lib/types/orderbook';

export class PerformanceOptimizer {
  private static instance: PerformanceOptimizer;
  private rafId: number | null = null;
  private frameCallbacks: Array<() => void> = [];

  static getInstance(): PerformanceOptimizer {
    if (!PerformanceOptimizer.instance) {
      PerformanceOptimizer.instance = new PerformanceOptimizer();
    }
    return PerformanceOptimizer.instance;
  }

  // Level of Detail (LOD) based on data size
  static getLODLevel(dataSize: number): number {
    if (dataSize > 10000) return 3; // Highest LOD - show fewer details
    if (dataSize > 5000) return 2;
    if (dataSize > 1000) return 1;
    return 0; // Lowest LOD - show all details
  }

  // Throttle orderbook updates
  static throttleUpdates<T>(callback: (data: T) => void, delay: number) {
    let lastCall = 0;
    let timeoutId: NodeJS.Timeout;

    return (data: T) => {
      const now = Date.now();
      
      if (now - lastCall >= delay) {
        lastCall = now;
        callback(data);
      } else {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          lastCall = Date.now();
          callback(data);
        }, delay - (now - lastCall));
      }
    };
  }

  // Batch DOM updates
  scheduleUpdate(callback: () => void): void {
    this.frameCallbacks.push(callback);
    
    if (this.rafId === null) {
      this.rafId = requestAnimationFrame(() => {
        this.frameCallbacks.forEach(cb => cb());
        this.frameCallbacks = [];
        this.rafId = null;
      });
    }
  }

  // Memory management for large datasets
  static optimizeDataset(snapshots: OrderBookSnapshot[], maxSize: number = 100): OrderBookSnapshot[] {
    if (snapshots.length <= maxSize) return snapshots;
    
    // Keep recent data and sample older data
    const recent = snapshots.slice(-maxSize * 0.7);
    const older = snapshots.slice(0, -maxSize * 0.7);
    const sampledOlder = older.filter((_, index) => index % Math.ceil(older.length / (maxSize * 0.3)) === 0);
    
    return [...sampledOlder, ...recent];
  }

  // Debounce resize events
  static debounceResize(callback: () => void, delay: number = 250) {
    let timeoutId: NodeJS.Timeout;
    
    return () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(callback, delay);
    };
  }
}
