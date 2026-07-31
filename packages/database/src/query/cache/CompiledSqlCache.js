import { isExpression } from "../Expression.js";

export default class CompiledSqlCache {
    #cache = new Map();
    #hits = 0;
    #misses = 0;

    get hits() { return this.#hits; }
    get misses() { return this.#misses; }
    get hitRate() {
        const total = this.#hits + this.#misses;
        return total === 0 ? 1 : this.#hits / total;
    }

    /**
     * Compute a structural fingerprint of an AST excluding literal binding values.
     * @param {Object} ast 
     * @param {string} grammarName 
     * @returns {string}
     */
    fingerprint(ast, grammarName) {
        const columns = ast.columns ? ast.columns.map(c => isExpression(c) ? c.getValue() : String(c)) : [];
        const wheres = ast.wheres ? ast.wheres.map(w => ({
            type: w.type,
            col: isExpression(w.column) ? w.column.getValue() : String(w.column),
            op: w.operator,
            bool: w.boolean,
            not: w.not
        })) : [];

        const structure = {
            g: grammarName,
            t: ast.table,
            c: columns,
            w: wheres,
            o: ast.orders ? ast.orders.map(o => ({ col: o.column, dir: o.direction })) : [],
            gBy: ast.groups || [],
            j: ast.joins ? ast.joins.map(j => ({ type: j.type, tbl: j.table, f: j.first, op: j.operator, s: j.second })) : [],
            l: ast.limit !== null && ast.limit !== undefined ? "L" : null,
            off: ast.offset !== null && ast.offset !== undefined ? "O" : null,
            agg: ast.aggregate ? { type: ast.aggregate.type, col: ast.aggregate.column } : null
        };
        return JSON.stringify(structure);
    }

    /**
     * Get or compile AST query into { sql, bindings }.
     * @param {Object} ast 
     * @param {Object} grammar 
     * @returns {{ sql: string, bindings: Array }}
     */
    getOrCompile(ast, grammar) {
        const grammarName = grammar.constructor.name;
        const key = this.fingerprint(ast, grammarName);

        if (this.#cache.has(key)) {
            this.#hits++;
            const template = this.#cache.get(key);
            const bindings = this.extractBindings(ast);
            if (typeof grammar.parameterizeSql === "function") {
                return grammar.parameterizeSql(template.rawSql, bindings);
            }
            return { sql: template.sql, bindings };
        }

        this.#misses++;
        const compiled = grammar.compileSelect(ast);
        this.#cache.set(key, {
            sql: compiled.sql,
            rawSql: compiled.sql,
            bindingsCount: compiled.bindings.length
        });
        return compiled;
    }

    extractBindings(ast) {
        const bindings = [];
        if (ast.wheres) {
            for (const w of ast.wheres) {
                if (w.type === "basic" && w.value !== undefined && w.value !== null) {
                    bindings.push(w.value);
                } else if (w.type === "in" && Array.isArray(w.value)) {
                    bindings.push(...w.value);
                } else if (w.type === "between" && Array.isArray(w.value)) {
                    bindings.push(w.value[0], w.value[1]);
                } else if (w.type === "raw" && Array.isArray(w.value)) {
                    bindings.push(...w.value);
                }
            }
        }
        return bindings;
    }

    clear() {
        this.#cache.clear();
        this.#hits = 0;
        this.#misses = 0;
    }
}
