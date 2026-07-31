/**
 * Interface contract for form validation rules and engines.
 *
 * @interface IValidator
 */
export class IValidator {
  validate() {
    throw new Error('Method validate() must be implemented.');
  }

  fails() {
    throw new Error('Method fails() must be implemented.');
  }

  passes() {
    throw new Error('Method passes() must be implemented.');
  }

  errors() {
    throw new Error('Method errors() must be implemented.');
  }

  validated() {
    throw new Error('Method validated() must be implemented.');
  }
}
