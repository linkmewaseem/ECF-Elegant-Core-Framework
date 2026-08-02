# API Platform Documentation (`@ecf/api`, `@ecf/search`)

The API Platform provides automated OpenAPI v3 spec generation, API resources, rate limiting, and full-text/vector search.

---

## 🌐 API Resources (`@ecf/api`)

```js
import { ApiResource } from "@ecf/api";

export class UserResource extends ApiResource {
  toArray() {
    return { id: this.resource.id, name: this.resource.name };
  }
}
```

---

## 📄 License
MIT Licensed.
