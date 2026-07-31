import { IResource } from '../contracts/IResource.js';

/**
 * API JsonResource transformer transforming models or data objects to JSON payloads.
 */
export class JsonResource extends IResource {
  constructor(resource) {
    super();
    this.resource = resource;
    this.additionalMeta = {};
  }

  static make(resource) {
    return new this(resource);
  }

  static collection(resources) {
    const list = Array.isArray(resources) ? resources : [resources];
    return list.map(item => new this(item).toArray());
  }

  additional(meta) {
    this.additionalMeta = { ...this.additionalMeta, ...meta };
    return this;
  }

  toArray(request = null) {
    if (this.resource === null || this.resource === undefined) {
      return null;
    }
    if (typeof this.resource.toJSON === 'function') {
      return this.resource.toJSON();
    }
    return { ...this.resource };
  }

  toResponse(request = null) {
    return {
      data: this.toArray(request),
      ...this.additionalMeta
    };
  }
}
