import Expression, { isExpression } from "./Expression.js";
import IGrammarCompiler from "../contracts/IGrammarCompiler.js";

export default class Grammar extends IGrammarCompiler {
    /**
     * Wrap identifier in driver-specific quotes (`"col"` or `` `col` ``).
     * @param {string|Expression} value 
     * @returns {string}
     */
    wrap(value) {
        if (isExpression(value)) {
            return value.getValue();
        }
        if (typeof value !== "string") return "";
        if (value === "*") return "*";

        // Support "column AS alias"
        const asMatch = value.match(/^(.+?)\s+(?:AS|as)\s+(.+)$/i);
        if (asMatch) {
            return `${this.wrap(asMatch[1])} AS ${this.wrapValue(asMatch[2])}`;
        }

        // Support table.column alias (users.name)
        if (value.includes(".")) {
            return value.split(".").map(part => this.wrapValue(part)).join(".");
        }

        return this.wrapValue(value);
    }

    wrapValue(value) {
        if (value === "*") return "*";
        return `"${value.replace(/"/g, '""')}"`;
    }

    /**
     * Compile SELECT query AST into { sql, bindings }.
     * @param {Object} ast 
     * @returns {{ sql: string, bindings: Array }}
     */
    compileSelect(ast) {
        const bindings = [];

        let columnsSql;
        if (ast.aggregate) {
            columnsSql = this.compileAggregate(ast.aggregate);
        } else if (!ast.columns || ast.columns.length === 0) {
            columnsSql = "*";
        } else {
            columnsSql = ast.columns.map(col => this.wrap(col)).join(", ");
        }

        let sql = `SELECT ${columnsSql} FROM ${this.wrap(ast.table)}`;

        if (ast.joins && ast.joins.length > 0) {
            sql += " " + this.compileJoins(ast.joins);
        }

        const whereRes = this.compileWheres(ast.wheres);
        if (whereRes.sql) {
            sql += ` WHERE ${whereRes.sql}`;
            bindings.push(...whereRes.bindings);
        }

        if (ast.groups && ast.groups.length > 0) {
            sql += ` GROUP BY ` + ast.groups.map(g => this.wrap(g)).join(", ");
        }

        if (ast.orders && ast.orders.length > 0) {
            sql += ` ORDER BY ` + ast.orders.map(o => `${this.wrap(o.column)} ${o.direction}`).join(", ");
        }

        if (ast.limit !== null && ast.limit !== undefined) {
            sql += ` LIMIT ${Number(ast.limit)}`;
        }

        if (ast.offset !== null && ast.offset !== undefined) {
            sql += ` OFFSET ${Number(ast.offset)}`;
        }

        return { sql, bindings };
    }

    /**
     * Compile INSERT query into { sql, bindings }.
     */
    compileInsert(ast, values) {
        const records = Array.isArray(values) ? values : [values];
        if (records.length === 0) return { sql: "", bindings: [] };

        const columns = Object.keys(records[0]);
        const columnsSql = columns.map(c => this.wrap(c)).join(", ");

        const bindings = [];
        const placeholders = [];

        for (const row of records) {
            const rowPlaceholders = [];
            for (const col of columns) {
                const val = row[col];
                if (isExpression(val)) {
                    rowPlaceholders.push(val.getValue());
                } else {
                    rowPlaceholders.push("?");
                    bindings.push(val);
                }
            }
            placeholders.push(`(${rowPlaceholders.join(", ")})`);
        }

        const sql = `INSERT INTO ${this.wrap(ast.table)} (${columnsSql}) VALUES ${placeholders.join(", ")}`;
        return { sql, bindings };
    }

    /**
     * Alias for compileInsert with multiple records.
     */
    compileBulkInsert(ast, records) {
        return this.compileInsert(ast, records);
    }

    /**
     * Compile UPDATE query into { sql, bindings }.
     */
    compileUpdate(ast, values = {}) {
        const setParts = [];
        const bindings = [];

        for (const [col, val] of Object.entries(values)) {
            if (isExpression(val)) {
                setParts.push(`${this.wrap(col)} = ${val.getValue()}`);
            } else {
                setParts.push(`${this.wrap(col)} = ?`);
                bindings.push(val);
            }
        }

        let sql = `UPDATE ${this.wrap(ast.table)} SET ${setParts.join(", ")}`;

        const whereRes = this.compileWheres(ast.wheres);
        if (whereRes.sql) {
            sql += ` WHERE ${whereRes.sql}`;
            bindings.push(...whereRes.bindings);
        }

        return { sql, bindings };
    }

    /**
     * Compile DELETE query into { sql, bindings }.
     */
    compileDelete(ast) {
        let sql = `DELETE FROM ${this.wrap(ast.table)}`;
        const bindings = [];

        const whereRes = this.compileWheres(ast.wheres);
        if (whereRes.sql) {
            sql += ` WHERE ${whereRes.sql}`;
            bindings.push(...whereRes.bindings);
        }

        return { sql, bindings };
    }

    /**
     * Compile TRUNCATE query into { sql, bindings }.
     */
    compileTruncate(ast) {
        return { sql: `TRUNCATE TABLE ${this.wrap(ast.table)}`, bindings: [] };
    }

    /**
     * Compile EXPLAIN query for standard SQL AST.
     */
    compileExplain(ast, mode = "plain") {
        const selectRes = this.compileSelect(ast);
        let prefix = "EXPLAIN ";
        if (mode === "analyze") prefix = "EXPLAIN ANALYZE ";
        if (mode === "json") prefix = "EXPLAIN FORMAT=JSON ";
        return {
            sql: `${prefix}${selectRes.sql}`,
            bindings: selectRes.bindings
        };
    }

    /**
     * Compile UPSERT query.
     */
    compileUpsert(ast, records, uniqueKeys = ["id"], updateColumns = null) {
        const insertRes = this.compileInsert(ast, records);
        if (!insertRes.sql) return insertRes;

        const recordList = Array.isArray(records) ? records : [records];
        const columns = Object.keys(recordList[0]);
        const updates = updateColumns || columns.filter(c => !uniqueKeys.includes(c));

        const keysConflict = uniqueKeys.map(k => this.wrap(k)).join(", ");
        const updateSet = updates.map(u => `${this.wrap(u)} = EXCLUDED.${this.wrap(u)}`).join(", ");

        const sql = `${insertRes.sql} ON CONFLICT(${keysConflict}) DO UPDATE SET ${updateSet}`;
        return { sql, bindings: insertRes.bindings };
    }

    compileWheres(wheres = []) {
        if (!wheres || wheres.length === 0) {
            return { sql: "", bindings: [] };
        }

        const sqlParts = [];
        const bindings = [];

        for (let i = 0; i < wheres.length; i++) {
            const w = wheres[i];
            const prefix = i === 0 ? "" : `${w.boolean} `;

            if (w.type === "raw") {
                if (isExpression(w.column)) {
                    sqlParts.push(`${prefix}${w.column.getValue()}`);
                } else {
                    sqlParts.push(`${prefix}${w.column}`);
                    if (Array.isArray(w.value)) bindings.push(...w.value);
                }
            } else if (w.type === "basic") {
                if (isExpression(w.value)) {
                    sqlParts.push(`${prefix}${this.wrap(w.column)} ${w.operator} ${w.value.getValue()}`);
                } else {
                    sqlParts.push(`${prefix}${this.wrap(w.column)} ${w.operator} ?`);
                    bindings.push(w.value);
                }
            } else if (w.type === "in") {
                const arr = Array.isArray(w.value) ? w.value : [w.value];
                const notStr = w.not ? "NOT " : "";
                const placeholders = arr.map(v => (isExpression(v) ? v.getValue() : "?")).join(", ");
                sqlParts.push(`${prefix}${this.wrap(w.column)} ${notStr}IN (${placeholders})`);
                for (const v of arr) {
                    if (!isExpression(v)) bindings.push(v);
                }
            } else if (w.type === "null") {
                const notStr = w.not ? "NOT " : "";
                sqlParts.push(`${prefix}${this.wrap(w.column)} IS ${notStr}NULL`);
            } else if (w.type === "between") {
                const notStr = w.not ? "NOT " : "";
                sqlParts.push(`${prefix}${this.wrap(w.column)} ${notStr}BETWEEN ? AND ?`);
                bindings.push(w.value[0], w.value[1]);
            }
        }

        return { sql: sqlParts.join(" "), bindings };
    }

    compileJoins(joins = []) {
        return joins.map(j => {
            return `${j.type} JOIN ${this.wrap(j.table)} ON ${this.wrap(j.first)} ${j.operator} ${this.wrap(j.second)}`;
        }).join(" ");
    }

    compileAggregate(aggregate) {
        const col = aggregate.column === "*" ? "*" : this.wrap(aggregate.column);
        return `${aggregate.type.toUpperCase()}(${col})`;
    }
}
