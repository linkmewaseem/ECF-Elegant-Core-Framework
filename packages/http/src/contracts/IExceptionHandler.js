/**
 * Interface contract for central HTTP exception reporting and rendering.
 *
 * @interface IExceptionHandler
 */
export class IExceptionHandler {
  /**
   * Report or log an exception.
   * @param {Error} error
   */
  report(error) {
    throw new Error('Method report() must be implemented.');
  }

  /**
   * Render an exception into an HTTP response.
   * @param {import('./IRequest.js').IRequest} request
   * @param {Error} error
   * @returns {import('./IResponse.js').IResponse|Promise<import('./IResponse.js').IResponse>}
   */
  render(request, error) {
    throw new Error('Method render() must be implemented.');
  }
}
