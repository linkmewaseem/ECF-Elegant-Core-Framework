export function createServer() {
  return {
    async handle(req) {
      return {
        status: 200,
        data: [
          { id: 1, name: 'Enterprise Keyboard', price: 120 },
          { id: 2, name: '4K Monitor', price: 450 },
        ],
      };
    },
  };
}
