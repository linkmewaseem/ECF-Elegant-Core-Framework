export class TokenizerStage {
  async handle(params, next) {
    if (params.term && typeof params.term === "string") {
      params.tokens = params.term.split(/\s+/).filter(Boolean);
    } else {
      params.tokens = [];
    }
    return await next(params);
  }
}

export default TokenizerStage;
