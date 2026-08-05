import { Application, Facade, CoreServiceProvider, LoggerServiceProvider, HttpServiceProvider, Route, Middleware, Log, ValidationException } from "@ecfjs/http";
import { ViewServiceProvider } from "@ecfjs/view";
import { Rule } from "@ecfjs/validation";

const app = new Application();

app.register(CoreServiceProvider);
app.register(HttpServiceProvider);
app.register(LoggerServiceProvider);
app.register(ViewServiceProvider);
app.boot();

Facade.setApplication(app);

// ---- Exception Handling Setup ----
class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = "ValidationError";
    }
}

const exceptionManager = app.make("exception.manager");

exceptionManager.render(ValidationError, (err, req, res) => {
    return res.status(422).json({ error: err.message, type: "ValidationError" });
});

exceptionManager.render(ValidationException, (err, req, res) => {
    return res.status(422).json({ error: err.message, errors: err.errors, type: "ValidationException" });
});

exceptionManager.report(Error, (err) => {
    Log.error(`[ExceptionReporter] ${err.name}: ${err.message}`);
});

// ---- Global Middleware ----
const requestLogger = (req, res, next) => {
    Log.info(`[Global Logger] ${req.method} ${req.path}`);
    return next();
};
app.use(requestLogger);

class CustomHeaderMiddleware extends Middleware {
    handle(req, res, next) {
        res.header("X-Powered-By", "ECF Enterprise Framework v1.0");
        return next();
    }
}
app.use(new CustomHeaderMiddleware());

// ---- In-Memory Data Store ----
const users = [
    { id: 1, name: "John", email: "john@gmail.com", role: "Admin", disabled: false },
    { id: 2, name: "Jane", email: "jane@gmail.com", role: "User", disabled: true },
    { id: 3, name: "Bob", email: "bob@gmail.com", role: "User", disabled: false },
    { id: 4, name: "Alice", email: "alice@gmail.com", role: "Manager", disabled: true },
    { id: 5, name: "Mike", email: "mike@gmail.com", role: "User", disabled: false },
];

// ---- Route Definitions using New Enterprise Features ----

// 1. Home Page
Route.get("/", (req, res) => {
    return res.view("home", {
        title: "ECF Framework",
        name: "ECF Enterprise Web Framework",
        date: new Date().toDateString(),
        users
    });
}).name("home");

// 2. About Page
Route.get("/about", (req, res) => {
    return res.view("about", {
        title: "About ECF",
    });
}).name("about");

// 3. User Listing with Input Helpers
Route.get("/users", async (req, res) => {
    const roleFilter = req.query("role", null);
    const filteredUsers = roleFilter
        ? users.filter(u => u.role.toLowerCase() === String(roleFilter).toLowerCase())
        : users;

    if (req.expectsJson()) {
        return res.json({ users: filteredUsers });
    }

    return res.view("user", {
        title: "Users List",
        users: filteredUsers
    });
}).name("users.index");

// 4. Create User Form Page
Route.get("/users/new", (req, res) => {
    return res.view("users.new", {
        title: "New User",
    });
}).name("users.create");

// 5. User Detail Page with Parameter Regex Constraint (.where) & Input Helper
Route.get("/users/{id}", async (req, res) => {
    const id = req.integer("id");
    const user = users.find(u => u.id === id);

    if (!user) {
        return res.status(404).view("users.not-found", {
            title: "User Not Found",
            searchParam: id,
            suggestions: []
        });
    }

    if (req.expectsJson()) {
        return res.json({ user });
    }

    return res.view("users.show", { user });
}).name("users.show").where("id", /^\d+$/);

// 6. User Creation Handler (POST) using fluent Rule builder & conditional validation
Route.post("/user", async (req, res) => {
    // Perform validation using @ecfjs/validation engine with fluent Rule builder & Phase 2/3 rules
    const validated = await req.validate({
        name: [Rule.required(), Rule.alphaDash(), Rule.min(2)],
        email: [Rule.required(), Rule.email()],
        role: "nullable|in:Admin,User,Manager",
        admin_code: "required_if:role,Admin|alphanum",
        website: "sometimes|nullable|url",
        disabled: "nullable|boolean"
    });

    const existingUser = users.find(u => u.email === validated.email);
    if (existingUser) {
        throw new ValidationError("User with this email already exists.");
    }

    const newUser = {
        id: users.length + 1,
        name: validated.name,
        email: validated.email,
        role: validated.role || "User",
        disabled: Boolean(validated.disabled)
    };
    users.push(newUser);

    if (req.expectsJson()) {
        return res.status(201).json({ message: "User created successfully", user: newUser });
    }

    return res.redirect(Route.url("users.index"));
}).name("users.store");

// 7. Route Groups: API v1 Group (/api/v1/...)
Route.group({ prefix: "/api/v1" }, (router) => {
    router.get("/status", (req, res) => {
        return res.json({
            status: "online",
            framework: "ECF Enterprise",
            ip: req.ip,
            secure: req.secure,
            ajax: req.ajax()
        });
    });

    router.get("/users", (req, res) => res.json({ users }));

    // Advanced Registration Endpoint showcasing Extended Rules, Same confirmation, & RequiredIf
    router.post("/register", async (req, res) => {
        const data = await req.validate({
            username: [Rule.required(), Rule.alphaDash(), Rule.between(3, 20)],
            email: [Rule.required(), Rule.email()],
            password: [Rule.required(), Rule.min(8)],
            password_confirmation: [Rule.required(), Rule.same("password")],
            dob: [Rule.sometimes(), Rule.date()],
            ip: [Rule.sometimes(), Rule.ip("v4")],
            account_type: [Rule.required(), Rule.in(["personal", "business"])],
            tax_id: [Rule.requiredIf("account_type", "business"), Rule.alphaNum()]
        });

        return res.status(201).json({
            message: "Account registered successfully",
            validated: data
        });
    });
});

// 8. Exception Demonstration Routes
Route.get("/error", (req, res) => {
    throw new ValidationError("Demonstrating custom ValidationError handler!");
});

Route.get("/crash", (req, res) => {
    throw new Error("Demonstrating unexpected 500 error reporting!");
});

// 9. Fallback Route (404 Not Found)
Route.fallback((req, res) => {
    if (req.expectsJson()) {
        return res.status(404).json({ error: "Route not found", path: req.path });
    }
    return res.status(404).view("errors.404", {
        title: "404 Not Found",
        message: `No route matching ${req.method} ${req.path}`
    });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    Log.info(`Halo Application running at http://localhost:${PORT}`);
});