import assert from 'node:assert';

/**
 * Interface Contract Assertion Helper.
 */
export class ContractAssert {
  /**
   * Assert that a target instance or class implements all required methods of an interface contract.
   * @param {Object|Function} target - Driver or class instance
   * @param {Function} InterfaceClass - Contract class definition
   */
  static assertImplemented(target, InterfaceClass) {
    assert.ok(target, `Contract assertion target must be defined.`);
    assert.ok(InterfaceClass, `Interface class contract must be defined.`);

    const instance = typeof target === 'function' ? new target() : target;
    const proto = InterfaceClass.prototype;

    const requiredMethods = Object.getOwnPropertyNames(proto).filter(
      (m) => m !== 'constructor' && typeof proto[m] === 'function'
    );

    for (const method of requiredMethods) {
      assert.strictEqual(
        typeof instance[method],
        'function',
        `Contract Violation: [${instance.constructor.name || 'Target'}] does not implement method "${method}()" required by contract [${InterfaceClass.name}].`
      );
    }

    return true;
  }
}

export const Contract = ContractAssert;
export default ContractAssert;
