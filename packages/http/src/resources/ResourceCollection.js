import { IResource } from '../contracts/IResource.js';

/**
 * Collection transformer wrapping multiple API resources with pagination metadata.
 */
export class ResourceCollection extends IResource {
  constructor(collection, resourceClass = null) {
    super();
    this.collection = Array.isArray(collection) ? collection : (collection?.data || []);
    this.resourceClass = resourceClass;
    this.paginationMeta = collection?.meta || null;
  }

  toArray(request = null) {
    if (this.resourceClass) {
      return this.collection.map(item => new this.resourceClass(item).toArray(request));
    }
    return this.collection.map(item => (typeof item.toArray === 'function' ? item.toArray(request) : item));
  }

  toResponse(request = null) {
    const payload = {
      data: this.toArray(request)
    };

    if (this.paginationMeta) {
      payload.meta = this.paginationMeta;
    }

    return payload;
  }
}
