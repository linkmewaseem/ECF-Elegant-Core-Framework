/**
 * Interface for Test Runner.
 * @interface ITestRunner
 */
export class ITestRunner {
  test(name, fn) {
    throw new Error('Method test() must be implemented.');
  }

  profile(name) {
    throw new Error('Method profile() must be implemented.');
  }
}

/**
 * Interface for Test HTTP Client.
 * @interface ITestHttpClient
 */
export class ITestHttpClient {
  get(url, headers) { throw new Error('Method get() must be implemented.'); }
  post(url, data, headers) { throw new Error('Method post() must be implemented.'); }
  put(url, data, headers) { throw new Error('Method put() must be implemented.'); }
  delete(url, data, headers) { throw new Error('Method delete() must be implemented.'); }
  actingAs(user) { throw new Error('Method actingAs() must be implemented.'); }
}

/**
 * Interface for Test Database Sandbox & Assertions.
 * @interface ITestDatabase
 */
export class ITestDatabase {
  useTransaction() { throw new Error('Method useTransaction() must be implemented.'); }
  refresh() { throw new Error('Method refresh() must be implemented.'); }
  assertDatabaseHas(table, data) { throw new Error('Method assertDatabaseHas() must be implemented.'); }
  assertDatabaseMissing(table, data) { throw new Error('Method assertDatabaseMissing() must be implemented.'); }
}

export default ITestRunner;
