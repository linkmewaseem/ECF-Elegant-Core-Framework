export class BroadcastPipeline {
  constructor() {
    this.middlewares = [];
  }

  use(middleware) {
    this.middlewares.push(middleware);
    return this;
  }

  async send(message, finalHandler) {
    let index = -1;

    const dispatch = async (i, msg) => {
      if (i <= index) throw new Error("next() called multiple times");
      index = i;

      if (i === this.middlewares.length) {
        return await finalHandler(msg);
      }

      const mw = this.middlewares[i];
      if (typeof mw === "function") {
        return await mw(msg, (nextMsg) => dispatch(i + 1, nextMsg || msg));
      } else if (typeof mw.handle === "function") {
        return await mw.handle(msg, (nextMsg) => dispatch(i + 1, nextMsg || msg));
      }
      return await dispatch(i + 1, msg);
    };

    return await dispatch(0, message);
  }
}

export default BroadcastPipeline;
