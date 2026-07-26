export default class Pipeline {
    constructor() {
        this.stages = [];
    }

    use(name, stage, method) {
        this.stages.push({ name, stage, method });
        return this;
    }

    run(input) {
        return this.stages.reduce((value, { stage, method }) => stage[method](value), input);
    }

    // Runs the pipeline but also keeps each stage's output — needed by
    // inspect()/ecf-inspect so tokens aren't lost once the AST stages run.
    runWithTrace(input) {
        const trace = [];
        let value = input;

        for (const { name, stage, method } of this.stages) {
            value = stage[method](value);
            trace.push({ name, output: value });
        }

        return { result: value, trace };
    }
}
