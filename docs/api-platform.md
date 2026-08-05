# API Platform Documentation (`@ecfjs/api`, `@ecfjs/search`)

The API Platform provides automated OpenAPI v3 spec generation, API resources, rate limiting, and full-text/vector search.

---

## 🌐 API Resources (`@ecfjs/api`)

```js
import { ApiResource } from "@ecfjs/api";

export class UserResource extends ApiResource {
  toArray() {
    return { id: this.resource.id, name: this.resource.name };
  }
}
```

---

## 📄 License
MIT Licensed.
