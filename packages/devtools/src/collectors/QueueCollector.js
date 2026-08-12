export class QueueCollector {
  collectJobDispatched(requestRecord, jobName, queue = 'default', payload = {}) {
    if (!requestRecord) return;
    const at = Date.now() - (requestRecord.startedAt ?? Date.now());
    const timelineItem = { event: `Job Dispatched: ${jobName}`, category: 'queue', at, status: 'INFO', data: { jobName, queue, payload } };
    if (typeof requestRecord.addTimelineEntry === 'function') requestRecord.addTimelineEntry(timelineItem);
    else if (Array.isArray(requestRecord.timeline)) requestRecord.timeline.push(timelineItem);

    if (typeof requestRecord.addJob === 'function') {
      requestRecord.addJob('dispatched', { jobName, queue, payload, at });
    } else if (requestRecord.panels?.queue) {
      requestRecord.panels.queue.totalJobs = (requestRecord.panels.queue.totalJobs || 0) + 1;
      requestRecord.panels.queue.dispatched = requestRecord.panels.queue.dispatched || [];
      requestRecord.panels.queue.dispatched.push({ jobName, queue, payload, at });
    }
  }

  collectJobProcessed(requestRecord, jobName, durationMs, queue = 'default') {
    if (!requestRecord) return;
    const at = Date.now() - (requestRecord.startedAt ?? Date.now());
    const timelineItem = { event: `Job Processed: ${jobName}`, category: 'queue', at, status: 'SUCCESS', data: { jobName, queue, durationMs } };
    if (typeof requestRecord.addTimelineEntry === 'function') requestRecord.addTimelineEntry(timelineItem);
    else if (Array.isArray(requestRecord.timeline)) requestRecord.timeline.push(timelineItem);

    if (typeof requestRecord.addJob === 'function') {
      requestRecord.addJob('processed', { jobName, queue, durationMs, at });
    } else if (requestRecord.panels?.queue) {
      requestRecord.panels.queue.totalJobs = (requestRecord.panels.queue.totalJobs || 0) + 1;
      requestRecord.panels.queue.processed = requestRecord.panels.queue.processed || [];
      requestRecord.panels.queue.processed.push({ jobName, queue, durationMs, at });
    }
  }

  collectJobFailed(requestRecord, jobName, error, queue = 'default') {
    if (!requestRecord) return;
    const at = Date.now() - (requestRecord.startedAt ?? Date.now());
    const timelineItem = { event: `Job Failed: ${jobName}`, category: 'queue', at, status: 'ERROR', data: { jobName, queue, error: error?.message || error } };
    if (typeof requestRecord.addTimelineEntry === 'function') requestRecord.addTimelineEntry(timelineItem);
    else if (Array.isArray(requestRecord.timeline)) requestRecord.timeline.push(timelineItem);

    if (typeof requestRecord.addJob === 'function') {
      requestRecord.addJob('failed', { jobName, queue, error: error?.message || error, at });
    } else if (requestRecord.panels?.queue) {
      requestRecord.panels.queue.totalJobs = (requestRecord.panels.queue.totalJobs || 0) + 1;
      requestRecord.panels.queue.failed = requestRecord.panels.queue.failed || [];
      requestRecord.panels.queue.failed.push({ jobName, queue, error: error?.message || error, at });
    }
  }
}

export default QueueCollector;
