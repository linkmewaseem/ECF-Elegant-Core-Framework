/**
 * Interface contract for action, resource, and invokable controllers.
 *
 * @interface IController
 */
export class IController {
  /**
   * Get registered middleware for this controller.
   * @returns {Array<string|Function|object>}
   */
  getMiddleware() {
    return [];
  }
}
