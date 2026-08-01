/**
 * MediaPipeline — Middleware-based processing pipeline.
 *
 * Architecture:
 *   MediaFile → Stage(Load) → Stage(Validate) → Stage(Decode)
 *            → Stage(Transform) → Stage(Optimize) → Stage(Encode)
 *            → Stage(Store)
 *
 * Each stage (middleware) receives a context and calls next() to pass
 * control to the next stage — identical to Express/Koa middleware.
 *
 * Developer API:
 *   pipeline.use(new StripMetadataStage())
 *          .use(new ResizeStage(800, 600))
 *          .use(new WatermarkStage(...))
 *          .run(ctx)
 */
export class MediaPipeline {
  #middlewares = [];

  /**
   * Register a middleware stage.
   * @param {{ process(ctx, next): Promise<void> }} middleware
   */
  use(middleware) {
    this.#middlewares.push(middleware);
    return this;
  }

  /**
   * Execute the full pipeline against a context object.
   * @param {object} ctx - Shared mutable context passed through all stages.
   * @returns {Promise<object>} The final context after all stages run.
   */
  async run(ctx) {
    ctx.trace = ctx.trace ?? [];

    const execute = async (index) => {
      if (index >= this.#middlewares.length) return;

      const middleware = this.#middlewares[index];
      const stageName = middleware.constructor?.name ?? `Stage[${index}]`;
      const start = Date.now();

      await middleware.process(ctx, () => execute(index + 1));

      ctx.trace.push({ stage: stageName, durationMs: Date.now() - start });
    };

    await execute(0);
    return ctx;
  }

  count() { return this.#middlewares.length; }
}

// ─── Built-in Pipeline Stage Base ────────────────────────────────────────────

export class PipelineStage {
  async process(ctx, next) { await next(); }
}

export default MediaPipeline;
