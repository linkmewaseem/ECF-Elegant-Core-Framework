# Database Subsystem Documentation (`@ecfjs/database`)

The Database Subsystem provides Eloquent-style ORM active record models, schema migrations, seeders, and query builders.

---

## 🗄️ Eloquent Models (`@ecfjs/database`)

```js
import { Model } from "@ecfjs/database";

export class User extends Model {
  static table = "users";
}

const users = await User.query().where("status", "active").get();
```

---

## ⚙️ Schema Migrations (`@ecfjs/database`)

```js
import { Schema } from "@ecfjs/database";

export class CreateUsersTable {
  async up() {
    await Schema.create("users", (table) => {
      table.id();
      table.string("name");
      table.timestamps();
    });
  }
}
```

---

## 📄 License
MIT Licensed.
