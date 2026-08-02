# HTTP Subsystem Documentation (`@ecf/http`, `@ecf/validation`, `@ecf/view`)

The HTTP Subsystem provides fast request routing, middleware pipelines, pipeline validation, and view rendering.

---

## 🚦 HTTP Routing (`@ecf/http`)

```js
import { Router } from "@ecf/http";

Router.get("/users", "UserController@index");
Router.post("/users", "UserController@store");
```

---

## 🔍 Validation Pipeline (`@ecf/validation`)

```js
import { Validator } from "@ecf/validation";

const result = Validator.make(req.body, {
  email: "required|email",
  password: "required|min:8",
});
```

---

## 📄 License
MIT Licensed.
