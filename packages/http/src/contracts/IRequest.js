/**
 * Interface contract for incoming HTTP requests.
 *
 * @interface IRequest
 */
export class IRequest {
  method() {
    throw new Error('Method method() must be implemented.');
  }

  path() {
    throw new Error('Method path() must be implemented.');
  }

  url() {
    throw new Error('Method url() must be implemented.');
  }

  ip() {
    throw new Error('Method ip() must be implemented.');
  }

  query(key = null, defaultValue = null) {
    throw new Error('Method query() must be implemented.');
  }

  input(key = null, defaultValue = null) {
    throw new Error('Method input() must be implemented.');
  }

  all() {
    throw new Error('Method all() must be implemented.');
  }

  header(name = null, defaultValue = null) {
    throw new Error('Method header() must be implemented.');
  }

  cookie(name = null, defaultValue = null) {
    throw new Error('Method cookie() must be implemented.');
  }

  file(name = null) {
    throw new Error('Method file() must be implemented.');
  }

  user() {
    throw new Error('Method user() must be implemented.');
  }

  setUser(user) {
    throw new Error('Method setUser() must be implemented.');
  }

  wantsJson() {
    throw new Error('Method wantsJson() must be implemented.');
  }
}
