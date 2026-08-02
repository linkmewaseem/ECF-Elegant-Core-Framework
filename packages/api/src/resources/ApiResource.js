import IApiResource from "../contracts/IApiResource.js";

export class ApiResource extends IApiResource {
  constructor(resource) {
    super();
    this.resource = resource;

    if (resource && typeof resource === "object") {
      Object.assign(this, resource);
    }
  }

  static make(resource) {
    return new this(resource);
  }

  static collection(resources) {
    return new ResourceCollection(resources, this);
  }

  when(condition, value, defaultValue = undefined) {
    const isTrue = typeof condition === "function" ? condition() : Boolean(condition);
    if (isTrue) {
      return typeof value === "function" ? value() : value;
    }
    return defaultValue;
  }

  merge(data) {
    return data;
  }

  mergeWhen(condition, data) {
    const isTrue = typeof condition === "function" ? condition() : Boolean(condition);
    if (isTrue) {
      return typeof data === "function" ? data() : data;
    }
    return undefined;
  }

  whenLoaded(relationship, value = null, defaultValue = undefined) {
    if (this.resource && (this.resource[relationship] !== undefined || this.resource[`$${relationship}`] !== undefined)) {
      const relData = this.resource[relationship] || this.resource[`$${relationship}`];
      if (typeof value === "function") return value(relData);
      return value !== null ? value : relData;
    }
    return defaultValue;
  }

  whenCounted(relationship, value = null, defaultValue = undefined) {
    const countKey = `${relationship}_count`;
    if (this.resource && this.resource[countKey] !== undefined) {
      const count = this.resource[countKey];
      if (typeof value === "function") return value(count);
      return value !== null ? value : count;
    }
    return defaultValue;
  }

  filterSparseFields(data, fieldsQuery = "") {
    if (!fieldsQuery || typeof fieldsQuery !== "string") return data;
    const allowed = fieldsQuery.split(",").map((s) => s.trim());
    const filtered = {};
    for (const key of allowed) {
      if (data[key] !== undefined) {
        filtered[key] = data[key];
      }
    }
    return filtered;
  }

  toArray() {
    if (!this.resource) return {};
    const { ...data } = this.resource;
    return data;
  }

  resolve(options = {}) {
    if (!this.resource) return null;
    let data = this.toArray();

    // Clean undefined / merged objects
    for (const [k, v] of Object.entries(data)) {
      if (v === undefined) {
        delete data[k];
      } else if (typeof v === "object" && v !== null && v.__merge) {
        delete data[k];
        Object.assign(data, v.__merge);
      }
    }

    if (options.fields) {
      data = this.filterSparseFields(data, options.fields);
    }

    return data;
  }

  toJSON() {
    return this.resolve();
  }
}

export class ResourceCollection {
  constructor(collection, resourceClass = ApiResource) {
    this.collection = Array.isArray(collection) ? collection : [];
    this.resourceClass = resourceClass;
    this.paginationMeta = null;
  }

  setPagination(meta) {
    this.paginationMeta = meta;
    return this;
  }

  resolve(options = {}) {
    const items = this.collection.map((item) => {
      const res = item instanceof ApiResource ? item : new this.resourceClass(item);
      return res.resolve(options);
    });

    if (this.paginationMeta) {
      return {
        data: items,
        links: this.paginationMeta.links || {
          first: "/api?page=1",
          last: `/api?page=${this.paginationMeta.lastPage || 1}`,
          prev: this.paginationMeta.currentPage > 1 ? `/api?page=${this.paginationMeta.currentPage - 1}` : null,
          next: this.paginationMeta.currentPage < this.paginationMeta.lastPage ? `/api?page=${this.paginationMeta.currentPage + 1}` : null,
        },
        meta: {
          currentPage: this.paginationMeta.currentPage || 1,
          perPage: this.paginationMeta.perPage || items.length,
          total: this.paginationMeta.total || items.length,
          nextCursor: this.paginationMeta.nextCursor || null,
          prevCursor: this.paginationMeta.prevCursor || null,
        },
      };
    }

    return { data: items };
  }

  toJSON() {
    return this.resolve();
  }
}

export default ApiResource;
