import ModelCollection from "../ModelCollection.js";

export default class RelationMatcher {
    static match(relationName, relation, parentModels, relatedModels, identityMap = null) {
        if (!Array.isArray(parentModels) || parentModels.length === 0) {
            return;
        }

        // Deduplicate related models through IdentityMap
        const processedRelated = relatedModels.map(m => {
            if (identityMap && typeof identityMap.register === "function") {
                const modelClass = Object.getPrototypeOf(m)?.constructor || m.constructor;
                const pk = modelClass?.primaryKey || "id";
                const id = m.getAttribute(pk);
                if (id !== null && id !== undefined && identityMap.has(modelClass, id)) {
                    return identityMap.get(modelClass, id);
                }
                return identityMap.register(m);
            }
            return m;
        });

        const type = relation.meta.type;

        if (type === "hasOne") {
            const foreignKey = relation.meta.foreignKey;
            const localKey = relation.meta.localKey;

            const map = new Map();
            for (const r of processedRelated) {
                const fkVal = r.getAttribute(foreignKey);
                if (fkVal !== null && fkVal !== undefined) {
                    const keyStr = String(fkVal);
                    if (!map.has(keyStr)) map.set(keyStr, r);
                }
            }

            for (const parent of parentModels) {
                const pkVal = parent.getAttribute(localKey);
                const matched = pkVal !== null && pkVal !== undefined ? (map.get(String(pkVal)) || null) : null;
                parent.getAttributeManager().setRelation(relationName, matched);
            }
        } else if (type === "hasMany") {
            const foreignKey = relation.meta.foreignKey;
            const localKey = relation.meta.localKey;

            const map = new Map();
            for (const r of processedRelated) {
                const fkVal = r.getAttribute(foreignKey);
                if (fkVal !== null && fkVal !== undefined) {
                    const keyStr = String(fkVal);
                    if (!map.has(keyStr)) map.set(keyStr, []);
                    map.get(keyStr).push(r);
                }
            }

            for (const parent of parentModels) {
                const pkVal = parent.getAttribute(localKey);
                const matched = pkVal !== null && pkVal !== undefined ? (map.get(String(pkVal)) || []) : [];
                parent.getAttributeManager().setRelation(relationName, new ModelCollection(matched));
            }
        } else if (type === "belongsTo") {
            const foreignKey = relation.meta.foreignKey;
            const ownerKey = relation.meta.localKey;

            const map = new Map();
            for (const r of processedRelated) {
                const pkVal = r.getAttribute(ownerKey);
                if (pkVal !== null && pkVal !== undefined) {
                    map.set(String(pkVal), r);
                }
            }

            for (const parent of parentModels) {
                const fkVal = parent.getAttribute(foreignKey);
                const matched = fkVal !== null && fkVal !== undefined ? (map.get(String(fkVal)) || null) : null;
                parent.getAttributeManager().setRelation(relationName, matched);
            }
        } else if (type === "belongsToMany") {
            const parentKey = relation.meta.localKey;

            const map = new Map();
            for (const r of processedRelated) {
                const fkVal = r.getAttribute("__pivot_parent_id");
                if (fkVal !== null && fkVal !== undefined) {
                    const keyStr = String(fkVal);
                    if (!map.has(keyStr)) map.set(keyStr, []);
                    map.get(keyStr).push(r);
                }
            }

            for (const parent of parentModels) {
                const pkVal = parent.getAttribute(parentKey);
                const matched = pkVal !== null && pkVal !== undefined ? (map.get(String(pkVal)) || []) : [];
                parent.getAttributeManager().setRelation(relationName, new ModelCollection(matched));
            }
        }
    }
}
