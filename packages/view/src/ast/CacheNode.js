import ViewError from "../errors/ViewError.js";

export default class CacheNode {
    constructor(keyExpr, ttlExpr = null, body = []) {
        if (typeof keyExpr !== "string" || !keyExpr.trim()) {
            throw new ViewError("CacheNode requires a non-empty cache key expression.");
        }
        this.type = "Cache";
        this.keyExpr = keyExpr.trim();
        this.ttlExpr = ttlExpr ? ttlExpr.trim() : null;
        this.body = Array.isArray(body) ? body : [];
    }
}
