/**
 * Interface contract for API JsonResource transformers.
 *
 * @interface IResource
 */
export class IResource {
  toArray(request) {
    throw new Error('Method toArray() must be implemented.');
  }

  toResponse(request) {
    throw new Error('Method toResponse() must be implemented.');
  }
}
