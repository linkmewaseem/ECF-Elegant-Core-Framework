import crypto from "node:crypto";
import Pipeline from "./compiler/Pipeline.js";
import Lexer from "./compiler/Lexer.js";
import Parser from "./compiler/Parser.js";
import Transformer from "./compiler/Transformer.js";
import Optimizer from "./compiler/Optimizer.js";
import CodeGenerator from "./compiler/CodeGenerator.js";
import Compilation from "./Compilation.js";
import deepFreeze from "./utils/deepFreeze.js";
import { COMPILER_VERSION, ECF_VERSION } from "./version.js";
import ViewError from "./errors/ViewError.js";

export default class Compiler {
    constructor(pipeline = Compiler.defaultPipeline(), codeGenerator = new CodeGenerator()) {
        this.pipeline = pipeline;
        this.codeGenerator = codeGenerator;
    }

    static defaultPipeline() {
        return new Pipeline()
            .use("lexer", new Lexer(), "lex")
            .use("parser", new Parser(), "parse")
            .use("transformer", new Transformer(), "transform")
            .use("optimizer", new Optimizer(), "optimize");
    }

    // TemplateFile -> CompiledTemplate (the common path — used by ViewManager.render/compile)
    compile(templateFile) {
        return this.analyze(templateFile).finalize();
    }

    // TemplateFile -> Compilation (intermediate — used by ecf inspect / ViewManager.inspect)
    analyze(templateFile) {
        this.validateTemplateFile(templateFile);

        const { result: optimizedAst, trace } = this.pipeline.runWithTrace(templateFile.source);
        const tokens = trace.find((step) => step.name === "lexer")?.output;

        const ast = deepFreeze(optimizedAst);
        const render = this.codeGenerator.generate(ast);
        const hash = this.computeHash(templateFile.source);

        return new Compilation({
            name: templateFile.name,
            tokens,
            ast,
            render,
            assets: { css: [], js: [], fonts: [], images: [] },
            dependencies: ast.dependencies ?? [],
            hash
        });
    }

    computeHash(source) {
        return crypto
            .createHash("sha256")
            .update(source + COMPILER_VERSION + ECF_VERSION)
            .digest("hex")
            .slice(0, 12);
    }

    validateTemplateFile(templateFile) {
        if (!templateFile || typeof templateFile.source !== "string") {
            throw new ViewError("Compiler.compile() requires a TemplateFile object with a source string.");
        }
    }
}
