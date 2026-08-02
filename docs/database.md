# Database Subsystem Documentation (`@ecf/database`)

The Database Subsystem provides Eloquent-style ORM active record models, schema migrations, seeders, and query builders.

---

## 🗄️ Eloquent Models (`@ecf/database`)

```js
import { Model } from "@ecf/database";

export class User extends Model {
  static table = "users";
}

const users = await User.query().where("status", "active").get();
```

---

## ⚙️ Schema Migrations (`@ecf/database`)

```js
import { Schema } from "@ecf/database";

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
