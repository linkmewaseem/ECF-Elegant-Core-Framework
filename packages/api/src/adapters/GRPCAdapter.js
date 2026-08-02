export class GRPCAdapter {
  constructor(options = {}) {
    this.options = options;
  }

  async handleCall(service, method, request) {
    return { response: {}, status: 0, adapter: "grpc" };
  }
}

export default GRPCAdapter;
