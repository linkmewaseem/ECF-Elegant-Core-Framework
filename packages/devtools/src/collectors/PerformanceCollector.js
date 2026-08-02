export class PerformanceCollector {
  captureMemory() {
    return process.memoryUsage();
  }
}

export default PerformanceCollector;
