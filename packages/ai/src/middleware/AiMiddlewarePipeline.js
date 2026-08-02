/**
 * AI Middleware Execution Pipeline (Prompt -> Moderation -> Cache -> Logger -> Driver -> Parser).
 */
export class AiMiddlewarePipeline {
  #middlewares = [];

  use(fn) {
    this.#middlewares.push(fn);
    return this;
  }

  async run(context, next) {
    let index = -1;
    const dispatch = async (i) => {
      if (i <= index) throw new Error('next() called multiple times');
      index = i;
      const fn = this.#middlewares[i] || next;
      if (!fn) return;
      return fn(context, () => dispatch(i + 1));
    };
    return dispatch(0);
  }
}

export default AiMiddlewarePipeline;
