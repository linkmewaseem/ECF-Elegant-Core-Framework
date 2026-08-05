# HTTP Subsystem Documentation (`@ecfjs/http`, `@ecfjs/validation`, `@ecfjs/view`)

The HTTP Subsystem provides fast request routing, middleware pipelines, pipeline validation, and view rendering.

---

## 🚦 HTTP Routing (`@ecfjs/http`)

```js
import { Router } from "@ecfjs/http";

Router.get("/users", "UserController@index");
Router.post("/users", "UserController@store");
```

---

## 🔍 Validation Pipeline (`@ecfjs/validation`)

```js
import { Validator } from "@ecfjs/validation";

const result = Validator.make(req.body, {
  email: "required|email",
  password: "required|min:8",
});
```

---

## 📄 License
MIT Licensed.
