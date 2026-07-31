/**
 * Interface IGrammarCompiler
 * Contract for database-agnostic AST compiler pipeline.
 */
export default class IGrammarCompiler {
    wrap(value) { throw new Error("Method wrap() must be implemented."); }
    wrapValue(value) { throw new Error("Method wrapValue() must be implemented."); }
    compileSelect(ast) { throw new Error("Method compileSelect() must be implemented."); }
    compileInsert(ast, values) { throw new Error("Method compileInsert() must be implemented."); }
    compileUpdate(ast, values) { throw new Error("Method compileUpdate() must be implemented."); }
    compileDelete(ast) { throw new Error("Method compileDelete() must be implemented."); }
    compileTruncate(ast) { throw new Error("Method compileTruncate() must be implemented."); }
    compileExplain(ast, mode = "plain") { throw new Error("Method compileExplain() must be implemented."); }
    compileBulkInsert(ast, records) { throw new Error("Method compileBulkInsert() must be implemented."); }
    compileUpsert(ast, records, uniqueKeys, updateColumns) { throw new Error("Method compileUpsert() must be implemented."); }
}
