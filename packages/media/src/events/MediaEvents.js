export class MediaLoadedEvent {
  constructor(payload) { this.payload = payload; this.name = "MediaLoaded"; }
}
export class MediaValidatedEvent {
  constructor(payload) { this.payload = payload; this.name = "MediaValidated"; }
}
export class MediaTransformingEvent {
  constructor(payload) { this.payload = payload; this.name = "MediaTransforming"; }
}
export class MediaOptimizedEvent {
  constructor(payload) { this.payload = payload; this.name = "MediaOptimized"; }
}
export class MediaEncodedEvent {
  constructor(payload) { this.payload = payload; this.name = "MediaEncoded"; }
}
export class MediaStoredEvent {
  constructor(payload) { this.payload = payload; this.name = "MediaStored"; }
}
export class MediaProcessedEvent {
  constructor(result) { this.result = result; this.name = "MediaProcessed"; }
}
export class MediaFailedEvent {
  constructor(error, mediaFile) { this.error = error; this.mediaFile = mediaFile; this.name = "MediaFailed"; }
}
export class MediaDeletedEvent {
  constructor(path, disk) { this.path = path; this.disk = disk; this.name = "MediaDeleted"; }
}
