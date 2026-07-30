import IntegerCast from "./casts/IntegerCast.js";
import FloatCast from "./casts/FloatCast.js";
import BooleanCast from "./casts/BooleanCast.js";
import JsonCast from "./casts/JsonCast.js";
import DateCast from "./casts/DateCast.js";

const BUILT_IN_CASTS = {
    integer: IntegerCast,
    int: IntegerCast,
    float: FloatCast,
    number: FloatCast,
    double: FloatCast,
    boolean: BooleanCast,
    bool: BooleanCast,
    json: JsonCast,
    array: JsonCast,
    object: JsonCast,
    date: DateCast,
    datetime: DateCast
};

export default class CastManager {
    #model;
    #castCache = new Map();

    constructor(model) {
        this.#model = model;
    }

    getCasts() {
        const modelClass = this.#model.constructor;
        return modelClass.casts || {};
    }

    hasCast(key) {
        const casts = this.getCasts();
        return key in casts;
    }

    resolveCast(castDefinition) {
        if (!castDefinition) return null;

        if (this.#castCache.has(castDefinition)) {
            return this.#castCache.get(castDefinition);
        }

        let castInstance = null;

        if (typeof castDefinition === "string") {
            const lower = castDefinition.toLowerCase();
            const CastClass = BUILT_IN_CASTS[lower];
            if (CastClass) {
                castInstance = new CastClass();
            }
        } else if (typeof castDefinition === "function") {
            // Class or constructor function
            try {
                castInstance = new castDefinition();
            } catch (e) {
                // If it's not instantiable via new, use as object if static get/set exists
                castInstance = castDefinition;
            }
        } else if (typeof castDefinition === "object" && castDefinition !== null) {
            castInstance = castDefinition;
        }

        if (castInstance) {
            this.#castCache.set(castDefinition, castInstance);
        }

        return castInstance;
    }

    castGet(key, value, attributes = {}) {
        const casts = this.getCasts();
        if (!(key in casts)) return value;

        const cast = this.resolveCast(casts[key]);
        if (cast && typeof cast.get === "function") {
            return cast.get(value, key, attributes);
        }

        return value;
    }

    castSet(key, value, attributes = {}) {
        const casts = this.getCasts();
        if (!(key in casts)) return value;

        const cast = this.resolveCast(casts[key]);
        if (cast && typeof cast.set === "function") {
            return cast.set(value, key, attributes);
        }

        return value;
    }
}
