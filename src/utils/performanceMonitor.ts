interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: any;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private enabled: boolean = true;

  /**
   * Start measuring performance
   */
  startMeasure(name: string, metadata?: any): void {
    if (!this.enabled) return;

    this.metrics.set(name, {
      name,
      startTime: Date.now(),
      metadata,
    });
  }

  /**
   * End measuring performance
   */
  endMeasure(name: string): number | null {
    if (!this.enabled) return null;

    const metric = this.metrics.get(name);
    if (!metric) {
      console.warn(`Performance metric "${name}" not found`);
      return null;
    }

    metric.endTime = Date.now();
    metric.duration = metric.endTime - metric.startTime;

    // Log if duration exceeds threshold
    if (metric.duration > 2000) {
      console.warn(`Slow operation detected: ${name} took ${metric.duration}ms`, metric.metadata);
    }

    return metric.duration;
  }

  /**
   * Measure async function
   */
  async measureAsync<T>(name: string, fn: () => Promise<T>, metadata?: any): Promise<T> {
    this.startMeasure(name, metadata);
    try {
      const result = await fn();
      return result;
    } finally {
      this.endMeasure(name);
    }
  }

  /**
   * Measure sync function
   */
  measureSync<T>(name: string, fn: () => T, metadata?: any): T {
    this.startMeasure(name, metadata);
    try {
      return fn();
    } finally {
      this.endMeasure(name);
    }
  }

  /**
   * Get all metrics
   */
  getAllMetrics(): PerformanceMetric[] {
    return Array.from(this.metrics.values());
  }

  /**
   * Get metric by name
   */
  getMetric(name: string): PerformanceMetric | undefined {
    return this.metrics.get(name);
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.metrics.clear();
  }

  /**
   * Enable/disable monitoring
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Generate performance report
   */
  generateReport(): string {
    const metrics = this.getAllMetrics().filter((m) => m.duration !== undefined);

    if (metrics.length === 0) {
      return 'No performance metrics collected';
    }

    const totalDuration = metrics.reduce((sum, m) => sum + (m.duration || 0), 0);
    const avgDuration = totalDuration / metrics.length;
    const slowest = metrics.reduce((max, m) => (m.duration! > (max.duration || 0) ? m : max));

    return `
Performance Report
==================
Total Metrics: ${metrics.length}
Total Duration: ${totalDuration}ms
Average Duration: ${avgDuration.toFixed(2)}ms
Slowest Operation: ${slowest.name} (${slowest.duration}ms)

Metrics:
${metrics.map((m) => `- ${m.name}: ${m.duration}ms`).join('\n')}
    `.trim();
  }

  /**
   * Monitor memory usage (if available)
   */
  getMemoryUsage(): any {
    if (typeof performance !== 'undefined' && (performance as any).memory) {
      const memory = (performance as any).memory;
      return {
        usedJSHeapSize: (memory.usedJSHeapSize / 1048576).toFixed(2) + ' MB',
        totalJSHeapSize: (memory.totalJSHeapSize / 1048576).toFixed(2) + ' MB',
        jsHeapSizeLimit: (memory.jsHeapSizeLimit / 1048576).toFixed(2) + ' MB',
      };
    }
    return null;
  }

  /**
   * Monitor network latency
   */
  async measureNetworkLatency(url: string): Promise<number> {
    const startTime = Date.now();
    try {
      await fetch(url, { method: 'HEAD', mode: 'no-cors' });
      return Date.now() - startTime;
    } catch (error) {
      console.error('Network latency measurement failed:', error);
      return -1;
    }
  }
}

export const performanceMonitor = new PerformanceMonitor();
export default performanceMonitor;
