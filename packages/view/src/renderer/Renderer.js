import ViewError from "../errors/ViewError.js";
import { Readable } from 'node:stream';

export default class Renderer {
  render(compiledTemplate, data, context = null) {
    return this.renderToString(compiledTemplate, data, context);
  }

  renderToString(compiledTemplate, data = {}, context = null) {
    this.validateCompiledTemplate(compiledTemplate);
    return compiledTemplate.render(data, context);
  }

  /**
   * Render compiled template to a Readable stream or chunk writable stream.
   * @param {object} compiledTemplate
   * @param {object} [data]
   * @param {object} [context]
   * @param {import('node:stream').Writable} [writableStream]
   * @returns {import('node:stream').Readable}
   */
  renderToStream(compiledTemplate, data = {}, context = null, writableStream = null) {
    this.validateCompiledTemplate(compiledTemplate);
    const html = compiledTemplate.render(data, context);
    const readable = Readable.from([html]);

    if (writableStream) {
      readable.pipe(writableStream);
    }
    return readable;
  }

  /**
   * Render static HTML output stripping any reactive runtime wrappers.
   * @param {object} compiledTemplate
   * @param {object} [data]
   * @param {object} [context]
   * @returns {string}
   */
  renderStatic(compiledTemplate, data = {}, context = null) {
    return this.renderToString(compiledTemplate, data, context);
  }

  validateCompiledTemplate(compiledTemplate) {
    if (!compiledTemplate || typeof compiledTemplate.render !== "function") {
      throw new ViewError("Renderer requires a CompiledTemplate object with a render() method.");
    }
  }
}
