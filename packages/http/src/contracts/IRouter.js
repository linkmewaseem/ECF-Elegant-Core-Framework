/**
 * Interface contract for routing engines.
 *
 * @interface IRouter
 */
export class IRouter {
  get(uri, action) {
    throw new Error('Method get() must be implemented.');
  }

  post(uri, action) {
    throw new Error('Method post() must be implemented.');
  }

  put(uri, action) {
    throw new Error('Method put() must be implemented.');
  }

  patch(uri, action) {
    throw new Error('Method patch() must be implemented.');
  }

  delete(uri, action) {
    throw new Error('Method delete() must be implemented.');
  }

  options(uri, action) {
    throw new Error('Method options() must be implemented.');
  }

  any(uri, action) {
    throw new Error('Method any() must be implemented.');
  }

  match(methods, uri, action) {
    throw new Error('Method match() must be implemented.');
  }

  group(attributes, callback) {
    throw new Error('Method group() must be implemented.');
  }

  resource(name, controller) {
    throw new Error('Method resource() must be implemented.');
  }

  dispatch(request) {
    throw new Error('Method dispatch() must be implemented.');
  }
}
