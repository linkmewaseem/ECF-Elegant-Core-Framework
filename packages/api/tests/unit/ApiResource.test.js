import test from "node:test";
import assert from "node:assert/strict";
import { ApiResource } from "../../src/index.js";

test("ApiResource: transforms objects with conditional when, whenLoaded, and whenCounted", () => {
  class UserResource extends ApiResource {
    toArray() {
      return {
        id: this.id,
        name: this.name,
        email: this.when(this.role === "admin", this.email),
        posts: this.whenLoaded("posts"),
        postsCount: this.whenCounted("posts"),
      };
    }
  }

  const user1 = { id: 1, name: "Alice", email: "alice@ecf.dev", role: "user" };
  const res1 = new UserResource(user1).resolve();
  assert.equal(res1.id, 1);
  assert.equal(res1.email, undefined);

  const user2 = { id: 2, name: "Bob", email: "bob@ecf.dev", role: "admin", posts: [{ id: 99 }], posts_count: 5 };
  const res2 = new UserResource(user2).resolve();
  assert.equal(res2.email, "bob@ecf.dev");
  assert.equal(res2.posts.length, 1);
  assert.equal(res2.postsCount, 5);
});

test("ApiResource: supports Sparse Fieldsets", () => {
  class ProductResource extends ApiResource {
    toArray() {
      return { id: this.id, title: this.title, price: this.price, secretKey: "abc" };
    }
  }

  const res = new ProductResource({ id: 10, title: "Phone", price: 999, secretKey: "abc" }).resolve({
    fields: "id,title,price",
  });

  assert.equal(res.id, 10);
  assert.equal(res.title, "Phone");
  assert.equal(res.secretKey, undefined);
});
