import IExplainEngine from "../contracts/IExplainEngine.js";

export default class ExplainEngine extends IExplainEngine {
    #queryBuilder;

    constructor(queryBuilder) {
        super();
        this.#queryBuilder = queryBuilder;
    }

    async explain() {
        const { sql, bindings } = this.#queryBuilder.grammar.compileExplain(this.#queryBuilder.ast, "plain");
        return this.#queryBuilder.connection.query(sql, bindings);
    }

    async explainAnalyze() {
        const { sql, bindings } = this.#queryBuilder.grammar.compileExplain(this.#queryBuilder.ast, "analyze");
        return this.#queryBuilder.connection.query(sql, bindings);
    }

    async explainJson() {
        const { sql, bindings } = this.#queryBuilder.grammar.compileExplain(this.#queryBuilder.ast, "json");
        return this.#queryBuilder.connection.query(sql, bindings);
    }

    async explainWithSuggestions() {
        const plan = await this.explain();
        const suggestions = [];
        const ast = this.#queryBuilder.ast;

        if (ast.wheres && ast.wheres.length > 0) {
            const whereCols = ast.wheres
                .filter(w => w.type === "basic" || w.type === "in")
                .map(w => w.column);

            if (whereCols.length > 0) {
                suggestions.push({
                    type: "INDEX_RECOMMENDATION",
                    message: `Consider adding index on table [${ast.table}] column(s): ${whereCols.join(", ")}`,
                    columns: whereCols,
                    table: ast.table
                });
            }
        }

        if (ast.orders && ast.orders.length > 0) {
            const orderCols = ast.orders.map(o => o.column);
            suggestions.push({
                type: "ORDER_INDEX_RECOMMENDATION",
                message: `Sort operations detected on [${orderCols.join(", ")}]. Consider composite index for sorting.`,
                columns: orderCols,
                table: ast.table
            });
        }

        return {
            plan,
            suggestions
        };
    }
}
