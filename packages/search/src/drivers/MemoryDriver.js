import ISearchDriver from "../contracts/ISearchDriver.js";
import HighlightStage from "../pipeline/stages/HighlightStage.js";

export class MemoryDriver extends ISearchDriver {
  constructor() {
    super();
    this.indices = new Map();
  }

  capabilities() {
    return ["search", "index", "remove", "flush", "facet", "highlight", "aggregate", "filter", "sort"];
  }

  getOrCreateIndex(indexName) {
    if (!this.indices.has(indexName)) {
      this.indices.set(indexName, new Map());
    }
    return this.indices.get(indexName);
  }

  async index(indexName, documents) {
    const indexStore = this.getOrCreateIndex(indexName);
    for (const doc of documents) {
      const id = doc.id !== undefined ? String(doc.id) : doc.id || String(Math.random());
      indexStore.set(id, { ...doc, id });
    }
    return { success: true, count: documents.length };
  }

  async remove(indexName, documentIds) {
    const indexStore = this.getOrCreateIndex(indexName);
    let count = 0;
    for (const id of documentIds) {
      if (indexStore.delete(String(id))) count++;
    }
    return { success: true, removedCount: count };
  }

  async flush(indexName) {
    const indexStore = this.getOrCreateIndex(indexName);
    indexStore.clear();
    return { success: true, indexName };
  }

  async search(indexName, params = {}) {
    const targetIndexes = indexName.split(",").map((s) => s.trim());
    let allDocs = [];

    for (const idx of targetIndexes) {
      const store = this.indices.get(idx);
      if (store) {
        allDocs.push(...Array.from(store.values()));
      }
    }

    const { term, filters, facets, limit = 20, offset = 0, sort, highlightFields } = params;

    let filtered = allDocs.filter((doc) => {
      if (filters && filters.length > 0) {
        for (const f of filters) {
          const docVal = doc[f.field];
          if (f.op === "=" && docVal !== f.value) return false;
          if (f.op === "in" && !f.value.includes(docVal)) return false;
          if (f.op === ">" && !(docVal > f.value)) return false;
          if (f.op === "<" && !(docVal < f.value)) return false;
          if (f.op === ">=" && !(docVal >= f.value)) return false;
          if (f.op === "<=" && !(docVal <= f.value)) return false;
        }
      }
      return true;
    });

    if (term) {
      const lower = term.toLowerCase();
      filtered = filtered.filter((doc) => {
        const text = JSON.stringify(doc).toLowerCase();
        return text.includes(lower);
      });
    }

    if (sort) {
      filtered.sort((a, b) => {
        const valA = a[sort.field];
        const valB = b[sort.field];
        if (valA === valB) return 0;
        const comp = valA > valB ? 1 : -1;
        return sort.direction === "desc" ? -comp : comp;
      });
    }

    const facetResults = {};
    if (facets && facets.length > 0) {
      for (const facetField of facets) {
        const counts = {};
        for (const doc of filtered) {
          const fVal = doc[facetField];
          if (fVal !== undefined) {
            counts[fVal] = (counts[fVal] || 0) + 1;
          }
        }
        facetResults[facetField] = counts;
      }
    }

    const total = filtered.length;
    let paginated = filtered.slice(offset, offset + limit);

    if (highlightFields && highlightFields.length > 0 && term) {
      paginated = HighlightStage.apply(paginated, term, highlightFields);
    }

    return {
      hits: paginated,
      total,
      facets: facetResults,
      offset,
      limit,
      driver: "memory",
    };
  }
}

export default MemoryDriver;
