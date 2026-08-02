export class IBroadcastMiddleware {
  async handle(message, next) {
    return await next(message);
  }
}

export default IBroadcastMiddleware;
