import { ILogProcessor } from '@ecf/contracts';

/**
 * Git Commit Hash Processor.
 */
export class GitCommitProcessor extends ILogProcessor {
  constructor({ commitSha = process.env.GIT_COMMIT_SHA || process.env.COMMIT_SHA } = {}) {
    super();
    this.commitSha = commitSha || null;
  }

  process(record) {
    if (this.commitSha) {
      if (!record.context) record.context = {};
      record.context.gitCommit = this.commitSha;
    }
    return record;
  }
}

export default GitCommitProcessor;
