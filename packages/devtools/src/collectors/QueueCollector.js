export class QueueCollector {
  collectJobDispatched(requestRecord, jobName, queue = 'default', payload = {}) {
    if (requestRecord) requestRecord.addJob('dispatched', { jobName, queue, payload, at: Date.now() - requestRecord.startedAt });
  }

  collectJobProcessed(requestRecord, jobName, durationMs, queue = 'default') {
    if (requestRecord) requestRecord.addJob('processed', { jobName, queue, durationMs, at: Date.now() - requestRecord.startedAt });
  }

  collectJobFailed(requestRecord, jobName, error, queue = 'default') {
    if (requestRecord) requestRecord.addJob('failed', { jobName, queue, error: error?.message, at: Date.now() - requestRecord.startedAt });
  }
}

export default QueueCollector;
