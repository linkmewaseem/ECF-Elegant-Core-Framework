export class SearchPipeline {
  constructor() {
    this.stages = [];
  }

  use(stage) {
    this.stages.push(stage);
    return this;
  }

  async process(params, finalHandler) {
    let index = -1;

    const dispatch = async (i, currentParams) => {
      if (i <= index) throw new Error("next() called multiple times in SearchPipeline");
      index = i;

      if (i === this.stages.length) {
        return await finalHandler(currentParams);
      }

      const stage = this.stages[i];
      if (typeof stage === "function") {
        return await stage(currentParams, (nextParams) => dispatch(i + 1, nextParams || currentParams));
      } else if (typeof stage.handle === "function") {
        return await stage.handle(currentParams, (nextParams) => dispatch(i + 1, nextParams || currentParams));
      }
      return await dispatch(i + 1, currentParams);
    };

    return await dispatch(0, params);
  }
}

export default SearchPipeline;
