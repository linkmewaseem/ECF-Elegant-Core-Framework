import PipelineError from "./errors/PipelineError.js";

export default class Pipeline {
    constructor() {
        this.passables = [];
        this.hasSendBeenCalled = false;
        this.pipes = [];
    }

    /**
     * Set the object / parameters being sent through the pipeline.
     * @param {...any} passables 
     * @returns {this}
     */
    send(...passables) {
        if (passables.length === 0 || passables.some(p => p === null || p === undefined)) {
            throw new PipelineError("Pipeline requires valid passable object(s).");
        }

        this.passables = passables;
        this.hasSendBeenCalled = true;
        return this;
    }

    /**
     * Set the array of pipes / middleware.
     * @param {Array<Function|Object>} pipes 
     * @returns {this}
     */
    through(pipes) {
        this.validatePipes(pipes);
        this.pipes = [...pipes];
        return this;
    }

    /**
     * Run the pipeline with a final destination callback.
     * @param {Function} destination 
     * @returns {any}
     */
    then(destination) {
        this.validateDestination(destination);
        this.assertReady();
        return this.execute(destination);
    }

    // ---- Execution Engine ----

    execute(destination) {
        const chain = this.buildChain(destination);
        return chain();
    }

    buildChain(destination) {
        return this.pipes.reduceRight((next, pipe) => {
            return () => this.invoke(pipe, next);
        }, () => destination(...this.passables));
    }

    invoke(pipe, next) {
        if (pipe && typeof pipe.handle === "function") {
            return pipe.handle(...this.passables, next);
        }
        if (typeof pipe === "function") {
            return pipe(...this.passables, next);
        }
        throw new PipelineError("Invalid pipe object. Must be a function or implement handle().");
    }

    // ---- Validation ----

    validatePipes(pipes) {
        if (!Array.isArray(pipes)) {
            throw new PipelineError("Pipeline requires an array of middleware / pipes.");
        }

        for (let i = 0; i < pipes.length; i++) {
            const p = pipes[i];
            const isFunction = typeof p === "function";
            const isPipeInstance = p && typeof p.handle === "function";

            if (!isFunction && !isPipeInstance) {
                throw new PipelineError(`Middleware / pipe at index ${i} must be a function or implement handle().`);
            }
        }
    }

    validateDestination(destination) {
        if (typeof destination !== "function") {
            throw new PipelineError("Pipeline requires a valid destination function.");
        }
    }

    assertReady() {
        if (!this.hasSendBeenCalled) {
            throw new PipelineError("Pipeline requires send() to be called with request and response before then().");
        }
    }
}