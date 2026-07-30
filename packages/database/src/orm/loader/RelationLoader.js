import IdentityMap from "./IdentityMap.js";
import RelationPlan from "./RelationPlan.js";
import SqlBatchStrategy from "./SqlBatchStrategy.js";
import RelationMatcher from "./RelationMatcher.js";
import MetricsCollector from "./MetricsCollector.js";
import ModelCollection from "../ModelCollection.js";

export default class RelationLoader {
    static async load(models, relations, strategy = null) {
        if (!models) return models;

        const isCollection = Array.isArray(models) || models instanceof ModelCollection || (models && typeof models[Symbol.iterator] === "function" && typeof models.getAttribute !== "function");
        const modelList = isCollection ? [...models] : [models];
        if (modelList.length === 0) return models;

        const batchStrategy = strategy || new SqlBatchStrategy();
        const identityMap = new IdentityMap();
        const metrics = new MetricsCollector();

        metrics.start();

        // Register initial parent models into query-scoped IdentityMap
        for (const m of modelList) {
            identityMap.register(m);
        }

        const planRoot = RelationPlan.compile(relations);

        await RelationLoader.loadNodeChildren(modelList, planRoot, batchStrategy, identityMap, metrics);

        metrics.finish();

        return models;
    }

    static async loadNodeChildren(parentModels, parentNode, strategy, identityMap, metrics) {
        if (!parentModels || parentModels.length === 0) return;

        for (const childNode of parentNode.children.values()) {
            const relationName = childNode.name;
            const sample = parentModels[0];

            if (!sample || typeof sample[relationName] !== "function") continue;

            const relation = sample[relationName]();
            metrics.recordQuery();

            const relatedModels = await strategy.batchQuery(relation, parentModels, childNode.constraint);
            metrics.recordHydration(relatedModels.length);

            RelationMatcher.match(relationName, relation, parentModels, relatedModels, identityMap);

            if (childNode.children.size > 0 && relatedModels.length > 0) {
                await RelationLoader.loadNodeChildren(relatedModels, childNode, strategy, identityMap, metrics);
            }
        }
    }
}
