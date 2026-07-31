/**
 * Interface IExplainEngine
 * Multi-format query execution plan analyzer interface.
 */
export default class IExplainEngine {
    explain() { throw new Error("Method explain() must be implemented."); }
    explainAnalyze() { throw new Error("Method explainAnalyze() must be implemented."); }
    explainJson() { throw new Error("Method explainJson() must be implemented."); }
    explainWithSuggestions() { throw new Error("Method explainWithSuggestions() must be implemented."); }
}
