export class NormalizeStage {
  async handle(params, next) {
    if (params.term && typeof params.term === "string") {
      params.term = params.term.trim().toLowerCase();
    }
    return await next(params);
  }
}

export default NormalizeStage;
