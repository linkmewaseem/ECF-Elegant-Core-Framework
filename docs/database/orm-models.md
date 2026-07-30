# ORM Models & Relationships

## Introduction

The ECF ORM (Object-Relational Mapping) provides an Active Record pattern implementation mapping database tables to JavaScript classes. It simplifies record querying, persistence, and relational data loading.

## Why use it?

Interacting with relational database rows as raw plain objects requires manually building joins and foreign key lookups. ORM Models encapsulate table logic, attribute casting, and relationships into clean class methods.

## Syntax

```js
import { Model } from "@ecf/database";

// Define a Model subclass
class User extends Model {
    static table = "users";

    posts() {
        return this.hasMany(Post, "user_id");
    }
}
```

## Example

```js
import { Model } from "@ecf/database";

// 1. Model Definitions with Relationships
class User extends Model {
    static table = "users";

    posts() {
        return this.hasMany(Post, "user_id");
    }
}

class Post extends Model {
    static table = "posts";

    user() {
        return this.belongsTo(User, "user_id");
    }
}

// 2. Querying & Creating Records
const user = await User.find(1);
console.log(user.name);

const newPost = await Post.create({
    title: "Introducing ECF ORM",
    user_id: user.id
});

// 3. Resolving Relationships
const userPosts = await user.posts().get();
console.log(userPosts);
```

## How it Works

1. **Active Record Mapping**: Model instances map properties to database column fields. Modifying properties (`user.name = "New Name"`) and calling `await user.save()` triggers an automatic SQL `UPDATE` statement.
2. **Relationship Matcher (`RelationMatcher`)**: Relationship functions (`hasMany`, `belongsTo`, `hasOne`, `belongsToMany`) return relation query instances. Calling `.get()` on a relation executes pre-configured foreign key filters automatically.

## Relationship Types

### `hasOne(RelatedModel, foreignKey, localKey)`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `RelatedModel` | `typeof Model` | Target related Model class. |
| `foreignKey` | `string` | Foreign key column on the target table. |
| `localKey` | `string` | Primary key column on current table. Defaults to `"id"`. |

### `hasMany(RelatedModel, foreignKey, localKey)`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `RelatedModel` | `typeof Model` | Target related Model class. |
| `foreignKey` | `string` | Foreign key column on the target table. |
| `localKey` | `string` | Primary key column on current table. Defaults to `"id"`. |

### `belongsTo(RelatedModel, foreignKey, ownerKey)`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `RelatedModel` | `typeof Model` | Target related Model class. |
| `foreignKey` | `string` | Foreign key column on current table. |
| `ownerKey` | `string` | Primary key column on target table. Defaults to `"id"`. |

### `belongsToMany(RelatedModel, pivotTable, foreignPivotKey, relatedPivotKey)`

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `RelatedModel` | `typeof Model` | Target related Model class. |
| `pivotTable` | `string` | Join pivot table name. |
| `foreignPivotKey` | `string` | Column in pivot table referencing current model. |
| `relatedPivotKey` | `string` | Column in pivot table referencing target model. |

## Return Value

- `Model.find(id)` returns a Promise resolving to a `Model` instance or `null`.
- `Model.create(data)` returns a Promise resolving to the newly created `Model` instance.
- `model.save()` returns a Promise resolving to `boolean`.
- Relationship methods return relation builder objects supporting `.get()` and `.first()`.

## Notes

> [!NOTE]
> If `static table` is omitted, the model automatically infers the pluralized table name from the class name.

## Best Practices

- Define clear relationships (`hasMany`, `belongsTo`) inside model methods.
- Keep business logic specific to entity records within Model class methods.

## Common Mistakes

- **Forgetting `await` on `save()` or relationship `.get()`**: Relationship methods return queries, requiring `await` to execute database fetches.

## Tips

- You can chain query builder methods directly on models: `await User.where("status", "active").orderBy("created_at", "DESC").get()`.

## Related Features

- [Query Builder](file:///f:/ecf/docs/database/query-builder.md)
- [Schema & Migrations](file:///f:/ecf/docs/database/schema-migrations.md)

---

## Summary

ECF ORM Models enable intuitive object persistence and relationship querying using standard Active Record patterns.

## Next Topic

[Schema & Migrations](file:///f:/ecf/docs/database/schema-migrations.md)

## Related Topics

- [Query Builder](file:///f:/ecf/docs/database/query-builder.md)
- [Schema & Migrations](file:///f:/ecf/docs/database/schema-migrations.md)
