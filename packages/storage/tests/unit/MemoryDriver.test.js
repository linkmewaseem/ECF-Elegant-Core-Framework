import test from "node:test";
import assert from "node:assert/strict";
import MemoryDriver from "../../src/drivers/MemoryDriver.js";

test("MemoryDriver - in-memory storage operations and directory listing", async () => {
  const driver = new MemoryDriver();

  await driver.put("avatars/user1.png", "image1");
  await driver.put("avatars/user2.png", "image2");
  await driver.put("reports/monthly.pdf", "report");

  assert.equal(await driver.exists("avatars/user1.png"), true);
  assert.equal(await driver.get("avatars/user1.png"), "image1");

  const avatarFiles = await driver.files("avatars");
  assert.equal(avatarFiles.length, 2);

  const allFiles = await driver.allFiles();
  assert.equal(allFiles.length, 3);

  await driver.delete("avatars/user1.png");
  assert.equal(await driver.exists("avatars/user1.png"), false);
});
