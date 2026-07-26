export default class ViewCache {
    constructor() {
        this.store = new Map();       // Map<id, CompiledTemplate>
        this.dependents = new Map();  // Map<dependencyName, Set<id>>
    }

    has(id) {
        return this.store.has(id);
    }

    get(id) {
        return this.store.get(id);
    }

    set(id, compiledTemplate) {
        this.store.set(id, compiledTemplate);
        this.trackDependencies(id, compiledTemplate.dependencies ?? []);
        return this;
    }

    trackDependencies(id, dependencies) {
        for (const dependency of dependencies) {
            if (!this.dependents.has(dependency)) {
                this.dependents.set(dependency, new Set());
            }
            this.dependents.get(dependency).add(id);
        }
    }

    invalidate(id) {
        this.store.delete(id);
        return this;
    }

    invalidateByDependency(dependencyName) {
        const dependentIds = this.dependents.get(dependencyName);
        if (dependentIds) {
            for (const id of dependentIds) {
                this.store.delete(id);
            }
            this.dependents.delete(dependencyName);
        }
        return this;
    }

    clear() {
        this.store.clear();
        this.dependents.clear();
        return this;
    }
}
