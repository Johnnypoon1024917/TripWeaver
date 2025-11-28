import { performanceMonitor } from '../performanceMonitor';
describe('PerformanceMonitor', () => {
    beforeEach(() => {
        performanceMonitor.clearMetrics();
    });
    describe('startMeasure and endMeasure', () => {
        it('should measure duration correctly', () => {
            performanceMonitor.startMeasure('test-operation');
            // Simulate some work
            const start = Date.now();
            while (Date.now() - start < 10) {
                // Busy wait for 10ms
            }
            const duration = performanceMonitor.endMeasure('test-operation');
            expect(duration).toBeGreaterThanOrEqual(10);
        });
        it('should return null for non-existent metrics', () => {
            const duration = performanceMonitor.endMeasure('non-existent');
            expect(duration).toBeNull();
        });
    });
    describe('measureAsync', () => {
        it('should measure async function duration', async () => {
            const asyncFn = async () => {
                // Simulate async work
                await new Promise(resolve => setTimeout(resolve, 10));
                return 'result';
            };
            const result = await performanceMonitor.measureAsync('async-test', asyncFn);
            expect(result).toBe('result');
            const metric = performanceMonitor.getMetric('async-test');
            expect(metric).toBeDefined();
            expect(metric.duration).toBeGreaterThanOrEqual(10);
        });
    });
    describe('measureSync', () => {
        it('should measure sync function duration', () => {
            const syncFn = () => {
                // Simulate sync work
                const start = Date.now();
                while (Date.now() - start < 5) {
                    // Busy wait for 5ms
                }
                return 'result';
            };
            const result = performanceMonitor.measureSync('sync-test', syncFn);
            expect(result).toBe('result');
            const metric = performanceMonitor.getMetric('sync-test');
            expect(metric).toBeDefined();
            expect(metric.duration).toBeGreaterThanOrEqual(5);
        });
    });
    describe('getAllMetrics and getMetric', () => {
        it('should retrieve all metrics', () => {
            performanceMonitor.startMeasure('metric-1');
            performanceMonitor.endMeasure('metric-1');
            performanceMonitor.startMeasure('metric-2');
            performanceMonitor.endMeasure('metric-2');
            const metrics = performanceMonitor.getAllMetrics();
            expect(metrics).toHaveLength(2);
            const metric1 = performanceMonitor.getMetric('metric-1');
            expect(metric1).toBeDefined();
            expect(metric1.name).toBe('metric-1');
        });
    });
    describe('clearMetrics', () => {
        it('should clear all metrics', () => {
            performanceMonitor.startMeasure('test');
            performanceMonitor.endMeasure('test');
            expect(performanceMonitor.getAllMetrics()).toHaveLength(1);
            performanceMonitor.clearMetrics();
            expect(performanceMonitor.getAllMetrics()).toHaveLength(0);
        });
    });
    describe('setEnabled', () => {
        it('should disable monitoring when set to false', () => {
            performanceMonitor.setEnabled(false);
            performanceMonitor.startMeasure('disabled-test');
            const duration = performanceMonitor.endMeasure('disabled-test');
            expect(duration).toBeNull();
        });
    });
    describe('generateReport', () => {
        it('should generate a report with metrics', () => {
            performanceMonitor.startMeasure('report-test');
            performanceMonitor.endMeasure('report-test');
            const report = performanceMonitor.generateReport();
            expect(report).toContain('Performance Report');
            expect(report).toContain('report-test');
        });
        it('should handle empty metrics', () => {
            const report = performanceMonitor.generateReport();
            expect(report).toBe('No performance metrics collected');
        });
    });
});
