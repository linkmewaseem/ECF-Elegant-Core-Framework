import Tokenizer from "./Tokenizer.js";
import Parser from "./Parser.js";
import Evaluator from "./Evaluator.js";

export default class ExpressionEngine {
    constructor() {
        this.tokenizer = new Tokenizer();
        this.parser = new Parser();
        this.evaluator = new Evaluator();
    }

    parse(source) {
        const tokens = this.tokenizer.tokenize(source);
        return this.parser.parse(tokens);
    }

    evaluate(sourceOrAst, scope = {}) {
        const ast = typeof sourceOrAst === "string" ? this.parse(sourceOrAst) : sourceOrAst;
        return this.evaluator.evaluate(ast, scope);
    }
}
