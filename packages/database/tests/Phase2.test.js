import { describe, it } from "node:test";
import assert from "node:assert";
import {
    Model,
    ModelCollection,
    IntegerCast,
    BooleanCast,
    JsonCast,
    DateCast,
    FloatCast,
    Cast
} from "../src/index.js";

// Custom Cast example
class Money {
    constructor(amount) {
        this.amount = Number(amount);
    }
}

class MoneyCast extends Cast {
    get(value) {
        return value !== null && value !== undefined ? new Money(value) : null;
    }
    set(value) {
        if (value instanceof Money) {
            return value.amount;
        }
        return value !== null && value !== undefined ? Number(value) : null;
    }
}

// User test model
class User extends Model {
    static fillable = ["name", "email", "age", "profile", "active", "createdAt", "price"];
    static casts = {
        age: IntegerCast,
        profile: "json",
        active: BooleanCast,
        createdAt: DateCast,
        price: MoneyCast
    };
    static hidden = ["password", "rememberToken"];
    static appends = ["fullName"];

    getFullNameAttribute() {
        return `${this.getAttribute("name")} Khan`;
    }
}

class RestrictedUser extends Model {
    static fillable = ["name", "email"];
    static guarded = ["password", "isAdmin"];
}

describe("ECF Phase 2 - Cast Manager", () => {
    it("should cast attributes using built-in string shorthand and classes", () => {
        const user = new User({
            name: "Ali",
            age: "28",
            profile: '{"role":"admin","theme":"dark"}',
            active: "1",
            createdAt: "2026-07-29T20:00:00.000Z"
        });

        assert.strictEqual(user.age, 28);
        assert.deepStrictEqual(user.profile, { role: "admin", theme: "dark" });
        assert.strictEqual(user.active, true);
        assert.ok(user.createdAt instanceof Date);
        assert.strictEqual(user.createdAt.toISOString(), "2026-07-29T20:00:00.000Z");
    });

    it("should support custom Cast classes like MoneyCast", () => {
        const user = new User();
        user.price = new Money(150);

        // Getter returns Money instance
        assert.ok(user.price instanceof Money);
        assert.strictEqual(user.price.amount, 150);

        // Underlying stored raw attribute is raw value
        assert.strictEqual(user.getAttributeManager().getRawAttributes().price, 150);
    });
});

describe("ECF Phase 2 - Serialization", () => {
    it("should respect hidden attributes and appends in toJSON()", () => {
        const user = new User({
            name: "Ali",
            email: "ali@example.com"
        });
        user.forceFill({ password: "secret_password", rememberToken: "token_123" });

        const json = user.toJSON();

        assert.strictEqual(json.name, "Ali");
        assert.strictEqual(json.email, "ali@example.com");
        assert.strictEqual(json.fullName, "Ali Khan"); // Appended getter
        assert.strictEqual(json.password, undefined); // Hidden
        assert.strictEqual(json.rememberToken, undefined); // Hidden
    });

    it("should respect visible property when defined", () => {
        class VisibleUser extends Model {
            static visible = ["id", "name"];
        }

        const user = new VisibleUser();
        user.forceFill({ id: 10, name: "Waseem", email: "waseem@example.com", secret: "shh" });

        const json = user.toJSON();
        assert.deepStrictEqual(json, { id: 10, name: "Waseem" });
    });
});

describe("ECF Phase 2 - Mass Assignment Protection", () => {
    it("should allow fillable fields and ignore non-fillable fields", () => {
        const user = new RestrictedUser({
            name: "Zaid",
            email: "zaid@example.com",
            isAdmin: true,
            password: "hacked"
        });

        assert.strictEqual(user.name, "Zaid");
        assert.strictEqual(user.email, "zaid@example.com");
        assert.strictEqual(user.isAdmin, null);
        assert.strictEqual(user.password, null);
    });

    it("should allow forceFill to bypass fillable and guarded checks", () => {
        const user = new RestrictedUser({ name: "Zaid" });
        user.forceFill({ isAdmin: true, password: "safe" });

        assert.strictEqual(user.isAdmin, true);
        assert.strictEqual(user.password, "safe");
    });
});

describe("ECF Phase 2 - ModelCollection", () => {
    it("should return ModelCollection and support first, last, find, and where", () => {
        const u1 = new User({ name: "Ali", age: 20 });
        u1.forceFill({ id: 1 });

        const u2 = new User({ name: "Usman", age: 30 });
        u2.forceFill({ id: 2 });

        const u3 = new User({ name: "Sara", age: 25 });
        u3.forceFill({ id: 3 });

        const collection = new ModelCollection([u1, u2, u3]);

        assert.strictEqual(collection.length, 3);
        assert.strictEqual(collection.first().name, "Ali");
        assert.strictEqual(collection.last().name, "Sara");

        // find by ID
        assert.strictEqual(collection.find(2).name, "Usman");

        // where filtering
        const filtered = collection.where("age", ">", 22);
        assert.ok(filtered instanceof ModelCollection);
        assert.strictEqual(filtered.length, 2);
        assert.strictEqual(filtered.pluck("name").join(", "), "Usman, Sara");
    });

    it("should support pluck, groupBy, keyBy, chunk, sum, avg, unique, and sortBy", () => {
        const users = new ModelCollection([
            new User({ name: "Ali", age: 20, active: true }),
            new User({ name: "Usman", age: 30, active: false }),
            new User({ name: "Ali", age: 40, active: true })
        ]);
        users[0].forceFill({ id: 1 });
        users[1].forceFill({ id: 2 });
        users[2].forceFill({ id: 3 });

        // pluck
        assert.deepStrictEqual(users.pluck("age"), [20, 30, 40]);

        // sum & avg
        assert.strictEqual(users.sum("age"), 90);
        assert.strictEqual(users.avg("age"), 30);

        // keyBy
        const keyed = users.keyBy("id");
        assert.strictEqual(keyed[2].name, "Usman");

        // groupBy
        const grouped = users.groupBy("active");
        assert.strictEqual(grouped[true].length, 2);
        assert.strictEqual(grouped[false].length, 1);

        // unique
        const uniqueNames = users.unique("name");
        assert.strictEqual(uniqueNames.length, 2);

        // chunk
        const chunks = users.chunk(2);
        assert.strictEqual(chunks.length, 2);
        assert.strictEqual(chunks[0].length, 2);
        assert.strictEqual(chunks[1].length, 1);

        // sortBy
        const sorted = users.sortBy("age", "desc");
        assert.strictEqual(sorted.first().age, 40);
    });

    it("should support partition, tap, pipe, when, and unless expressive helpers", () => {
        const users = new ModelCollection([
            new User({ name: "Ali", active: true }),
            new User({ name: "Usman", active: false })
        ]);

        // partition
        const [activeUsers, inactiveUsers] = users.partition(u => u.active);
        assert.strictEqual(activeUsers.length, 1);
        assert.strictEqual(inactiveUsers.length, 1);

        // tap
        let tapped = false;
        users.tap(c => {
            tapped = c.length === 2;
        });
        assert.ok(tapped);

        // pipe
        const totalCount = users.pipe(c => c.length);
        assert.strictEqual(totalCount, 2);

        // when & unless
        const conditionalRes = users.when(true, c => c.pluck("name"));
        assert.deepStrictEqual(conditionalRes, ["Ali", "Usman"]);

        const unlessRes = users.unless(false, c => c.length);
        assert.strictEqual(unlessRes, 2);
    });

    it("should support serialization toJSON() on ModelCollection", () => {
        const users = new ModelCollection([
            new User({ name: "Ali", email: "ali@test.com" })
        ]);

        const json = users.toJSON();
        assert.ok(Array.isArray(json));
        assert.strictEqual(json[0].name, "Ali");
        assert.strictEqual(json[0].fullName, "Ali Khan");
    });
});
