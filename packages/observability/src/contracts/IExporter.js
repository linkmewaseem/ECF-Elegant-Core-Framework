export class IExporter {
  /** Called when a span finishes. */
  exportSpan(span) { throw new Error("Contract method."); }
  /** Called when a metric is recorded. */
  exportMetric(metric) { throw new Error("Contract method."); }
  /** Called when a timeline entry is recorded. */
  exportTimelineEntry(entry) { throw new Error("Contract method."); }
  /** Flush any buffered data. */
  flush() { throw new Error("Contract method."); }
  /** Human-readable exporter name. */
  name() { throw new Error("Contract method."); }
}
export default IExporter;
