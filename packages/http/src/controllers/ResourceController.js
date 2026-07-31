import { Controller } from './Controller.js';

/**
 * Resource Controller enforcing CRUD signatures.
 */
export class ResourceController extends Controller {
  async index(request, response) {
    throw new Error('ResourceController.index() not implemented.');
  }

  async create(request, response) {
    throw new Error('ResourceController.create() not implemented.');
  }

  async store(request, response) {
    throw new Error('ResourceController.store() not implemented.');
  }

  async show(request, response) {
    throw new Error('ResourceController.show() not implemented.');
  }

  async edit(request, response) {
    throw new Error('ResourceController.edit() not implemented.');
  }

  async update(request, response) {
    throw new Error('ResourceController.update() not implemented.');
  }

  async destroy(request, response) {
    throw new Error('ResourceController.destroy() not implemented.');
  }
}
