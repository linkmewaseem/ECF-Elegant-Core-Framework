import IHydrator from "../contracts/IHydrator.js";

export default class Hydrator extends IHydrator {
    static #prototypeCache = new WeakMap();

    hydrate(rows, modelClass, connection = null) {
        if (!Array.isArray(rows) || rows.length === 0) return [];
        return rows.map(row => {
            const instance = new modelClass({}, true);
            if (connection) instance.setConnection(connection);
            instance.exists = true;

            const attributeManager = instance.attributeManager;
            for (const [key, value] of Object.entries(row)) {
                attributeManager.setAttribute(key, value);
            }
            attributeManager.syncOriginal();
            return instance;
        });
    }

    hydrateRaw(rows, modelClass, connection = null) {
        if (!Array.isArray(rows) || rows.length === 0) return [];

        let protoDescriptor = Hydrator.#prototypeCache.get(modelClass);
        if (!protoDescriptor) {
            const dummy = new modelClass({}, true);
            protoDescriptor = Object.getPrototypeOf(dummy);
            Hydrator.#prototypeCache.set(modelClass, protoDescriptor);
        }

        const count = rows.length;
        const models = new Array(count);

        for (let i = 0; i < count; i++) {
            const row = rows[i];
            const model = Object.create(protoDescriptor);
            model.exists = true;
            model.attributes = row;
            model.original = { ...row };
            if (connection) model.connection = connection;
            models[i] = model;
        }

        return models;
    }
}
