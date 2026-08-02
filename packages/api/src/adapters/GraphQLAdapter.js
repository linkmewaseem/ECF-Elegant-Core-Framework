export class GraphQLAdapter {
  constructor(options = {}) {
    this.options = options;
  }

  async handleQuery(query, variables = {}) {
    return { data: {}, errors: null, adapter: "graphql" };
  }
}

export default GraphQLAdapter;
