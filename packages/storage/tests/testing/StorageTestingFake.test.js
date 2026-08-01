import test from "node:test";
import assert from "node:assert/strict";
import StorageTestingFake from "../../src/testing/StorageTestingFake.js";

test("StorageTestingFake - assertions for exists, missing, count, checksum, visibility", async () => {
  const fake = new StorageTestingFake("avatars");

  await fake.put("user1.png", "image-content-1", { visibility: "public" });
  await fake.put("user2.png", "image-content-2");

  await fake.assertExists("user1.png");
  await fake.assertMissing("missing.png");
  await fake.assertCount(2);

  await fake.assertVisibility("user1.png", "public");

  const checksum = await fake.checksum("user1.png");
  await fake.assertChecksum("user1.png", checksum);
});
