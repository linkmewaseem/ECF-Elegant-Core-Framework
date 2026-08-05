import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { Str, Arr, Collection, LazyCollection, Fluent } from "../src/index.js";

describe("@ecfjs/support — Utility Package Tests", () => {

  test("Str helper utilities (camel, snake, kebab, studly, slug)", () => {
    assert.equal(Str.camel("hello_world"), "helloWorld");
    assert.equal(Str.studly("hello_world"), "HelloWorld");
    assert.equal(Str.snake("helloWorld"), "hello_world");
    assert.equal(Str.kebab("helloWorld"), "hello-world");
    assert.equal(Str.slug("Hello World ECF!"), "hello-world-ecf");
    assert.equal(typeof Str.uuid(), "string");
  });

  test("Arr helper utilities (get, set, has, forget, pluck)", () => {
    const data = { user: { name: "Ali", age: 30 } };
    assert.equal(Arr.get(data, "user.name"), "Ali");
    assert.equal(Arr.has(data, "user.age"), true);
    
    Arr.set(data, "user.email", "ali@ecf.dev");
    assert.equal(data.user.email, "ali@ecf.dev");

    const users = [{ name: "Ali" }, { name: "Sara" }];
    assert.deepEqual(Arr.pluck(users, "name"), ["Ali", "Sara"]);
  });

  test("Collection fluent API", () => {
    const col = Collection.make([1, 2, 3, 4, 5]);
    const evens = col.filter((x) => x % 2 === 0).all();
    assert.deepEqual(evens, [2, 4]);

    const users = Collection.make([
      { id: 1, name: "Ali", role: "admin" },
      { id: 2, name: "Sara", role: "user" },
    ]);
    assert.equal(users.where("role", "admin").first().name, "Ali");
  });

  test("LazyCollection generator iteration", () => {
    const lazy = LazyCollection.make([1, 2, 3, 4, 5])
      .map((x) => x * 2)
      .take(2);
    
    assert.deepEqual(lazy.toArray(), [2, 4]);
  });

  test("Fluent proxy attributes", () => {
    const fluent = new Fluent({ name: "ECF", version: "1.0" });
    assert.equal(fluent.name, "ECF");
    assert.equal(fluent.get("version"), "1.0");
  });

});
