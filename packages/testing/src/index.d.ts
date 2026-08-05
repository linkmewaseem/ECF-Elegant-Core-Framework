import { ITestRunner, ITestHttpClient, ITestDatabase } from '@ecfjs/contracts';

export interface TestContext {
  t: any;
  app: any;
  http: any;
  database: any;
  fake: any;
  time: any;
  browser: any;
  benchmark: any;
  snapshot: any;
  factory: (model: any) => any;
}

export type TestFn = (ctx: TestContext) => Promise<void> | void;

export function test(title: string, fn: TestFn): any;

export namespace test {
  function profile(name: string): { test: (title: string, fn: TestFn) => any };
}

export const it: typeof test;
export function describe(title: string, fn: Function): any;
export function beforeEach(fn: Function): any;
export function afterEach(fn: Function): any;

export class TestApplication {
  env: string;
  http: any;
  database: any;
  fakes: any;
  flush(): void;
}

export default test;
