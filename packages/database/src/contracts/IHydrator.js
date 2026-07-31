/**
 * Interface IHydrator
 * Pipeline contract for raw row transformation into Model instances.
 */
export default class IHydrator {
    hydrate(rows, modelClass, connection = null) { throw new Error("Method hydrate() must be implemented."); }
    hydrateRaw(rows, modelClass, connection = null) { throw new Error("Method hydrateRaw() must be implemented."); }
}
