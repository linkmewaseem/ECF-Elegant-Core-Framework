export class SearchStarted {
  constructor(index, query) {
    this.index = index;
    this.query = query;
    this.timestamp = Date.now();
  }
}

export class SearchCompleted {
  constructor(index, query, hitsCount, durationMs) {
    this.index = index;
    this.query = query;
    this.hitsCount = hitsCount;
    this.durationMs = durationMs;
    this.timestamp = Date.now();
  }
}

export class SearchFailed {
  constructor(index, query, error) {
    this.index = index;
    this.query = query;
    this.error = error;
    this.timestamp = Date.now();
  }
}

export class IndexCreated {
  constructor(index) {
    this.index = index;
  }
}

export class IndexDeleted {
  constructor(index) {
    this.index = index;
  }
}

export class DocumentIndexed {
  constructor(index, count) {
    this.index = index;
    this.count = count;
  }
}

export class DocumentRemoved {
  constructor(index, count) {
    this.index = index;
    this.count = count;
  }
}

export class BulkStarted {
  constructor(index, totalItems) {
    this.index = index;
    this.totalItems = totalItems;
  }
}

export class BulkFinished {
  constructor(index, totalItems, durationMs) {
    this.index = index;
    this.totalItems = totalItems;
    this.durationMs = durationMs;
  }
}
