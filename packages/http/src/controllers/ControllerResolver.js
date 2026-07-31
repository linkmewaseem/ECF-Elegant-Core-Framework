import { ModelBinder } from '../routing/ModelBinder.js';

/**
 * Enterprise Controller Parameter Resolver.
 * Uses IoC Container, ModelBinder, and reflection/typehints to resolve controller action arguments.
 */
export class ControllerResolver {
  /**
   * @param {import('@ecf/core').Container} [container]
   * @param {ModelBinder} [modelBinder]
   */
  constructor(container = null, modelBinder = null) {
    this.container = container;
    this.modelBinder = modelBinder || new ModelBinder(container);
  }

  /**
   * Resolve controller instance from class or container.
   * @param {Function|class|object} TargetController
   * @returns {object}
   */
  resolveController(TargetController) {
    if (typeof TargetController === 'object') {
      return TargetController;
    }

    if (this.container && typeof this.container.make === 'function') {
      return this.container.make(TargetController);
    }

    return new TargetController();
  }

  /**
   * Resolve arguments for action invocation based on Request, Params, and Container Services.
   * @param {object} controllerInstance
   * @param {string} actionName
   * @param {import('../contracts/IRequest.js').IRequest} request
   * @param {import('../contracts/IResponse.js').IResponse} response
   * @param {object} routeParams
   * @returns {Promise<any[]>}
   */
  async resolveActionArguments(controllerInstance, actionName, request, response, routeParams = {}) {
    const actionMethod = controllerInstance[actionName];
    if (typeof actionMethod !== 'function') {
      throw new Error(`Action [${actionName}] not found on controller ${controllerInstance.constructor.name}`);
    }

    const boundParams = await this.modelBinder.resolveParams(routeParams);
    const args = [];

    // Auto-inject Request & Response
    args.push(request);
    args.push(response);

    // Append bound route parameters
    for (const val of Object.values(boundParams)) {
      args.push(val);
    }

    return args;
  }
}
