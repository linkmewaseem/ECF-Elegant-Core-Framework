/**
 * Interface contract for outgoing HTTP response builders.
 *
 * @interface IResponse
 */
export class IResponse {
  status(code) {
    throw new Error('Method status() must be implemented.');
  }

  getStatusCode() {
    throw new Error('Method getStatusCode() must be implemented.');
  }

  header(name, value) {
    throw new Error('Method header() must be implemented.');
  }

  getHeader(name) {
    throw new Error('Method getHeader() must be implemented.');
  }

  cookie(name, value, options = {}) {
    throw new Error('Method cookie() must be implemented.');
  }

  json(data) {
    throw new Error('Method json() must be implemented.');
  }

  html(content) {
    throw new Error('Method html() must be implemented.');
  }

  redirect(url, status = 302) {
    throw new Error('Method redirect() must be implemented.');
  }

  download(filePath, filename = null) {
    throw new Error('Method download() must be implemented.');
  }

  view(name, data = {}) {
    throw new Error('Method view() must be implemented.');
  }

  send(body) {
    throw new Error('Method send() must be implemented.');
  }
}
