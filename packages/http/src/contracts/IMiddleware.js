/**
 * Interface contract for middleware pipeline steps.
 *
 * @interface IMiddleware
 */
export class IMiddleware {
  /**
   * Handle an incoming request.
   * @param {import('./IRequest.js').IRequest} request
   * @param {Function} next
   * @param {...any} params
   * @returns {Promise<any>|any}
   */
  handle(request, next, ...params) {
    throw new Error('Method handle() must be implemented.');
  }

  /**
   * Optional lifecycle hook executed after response is sent.
   * @param {import('./IRequest.js').IRequest} request
   * @param {import('./IResponse.js').IResponse} response
   */
  terminate(request, response) {
    // Optional default implementation
  }
}
