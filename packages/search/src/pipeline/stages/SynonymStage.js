export class SynonymStage {
  async handle(params, next) {
    if (params.synonymsMap && params.tokens) {
      const expanded = [];
      for (const token of params.tokens) {
        expanded.push(token);
        if (params.synonymsMap[token]) {
          const syns = Array.isArray(params.synonymsMap[token]) ? params.synonymsMap[token] : [params.synonymsMap[token]];
          expanded.push(...syns);
        }
      }
      params.expandedTokens = Array.from(new Set(expanded));
    }
    return await next(params);
  }
}

export default SynonymStage;
