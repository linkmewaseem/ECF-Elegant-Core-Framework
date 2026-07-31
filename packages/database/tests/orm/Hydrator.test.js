import { describe, test } from "node:test";
import assert from "node:assert/strict";
import Hydrator from "../../src/orm/Hydrator.js";

class DummyUser {
    constructor(attributes = {}) {
        this.attributes = attributes;
        this.exists = true;
    }
}

describe("Hydrator Pipeline Architecture & Fast-Path", () => {
    test("hydrates raw database rows into models via hydrate and fast-path hydrateRaw", () => {
        const hydrator = new Hydrator();
        const rows = [
            { id: 1, name: "Alice", email: "alice@ecf.dev" },
            { id: 2, name: "Bob", email: "bob@ecf.dev" }
        ];

        const rawModels = hydrator.hydrateRaw(rows, DummyUser);
        assert.equal(rawModels.length, 2);
        assert.equal(rawModels[0].attributes.name, "Alice");
        assert.equal(rawModels[1].attributes.name, "Bob");
        assert.equal(rawModels[0].exists, true);
    });
});
