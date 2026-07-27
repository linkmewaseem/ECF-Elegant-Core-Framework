import { Application, Facade, CoreServiceProvider, RouteNotFoundError, LoggerServiceProvider, HttpServiceProvider, Route, Middleware, Log, ExceptionManager } from "@ecf/http";
import { ViewServiceProvider } from "@ecf/view";

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

// Custom renderer: ValidationError → 422 JSON response
exceptionManager.render(ValidationError, (err, req, res) => {
    return res.status(422).json({ error: err.message, type: "ValidationError" });
});

// Custom reporter: log every error to console
exceptionManager.report(Error, (err) => {
    Log.error(`[ExceptionReporter] ${err.name}: ${err.message}`);
});

// ---- 1. Global Function Middleware ----
const requestLogger = (req, res, next) => {
    Log.info(`[Global Logger] ${req.method} ${req.path}`);
    return next();
};
app.use(requestLogger);
Log.info("Server running");

// ---- 2. Global Class-Style Middleware ----
class CustomHeaderMiddleware extends Middleware {
    handle(req, res, next) {
        res.header("X-Powered-By", "ECF Framework");
        return next();
    }
}
app.use(new CustomHeaderMiddleware());

// ---- 3. Inline Middleware Functions ----
const firstMiddleware = (req, res, next) => {
    console.log("[Route Middleware] Executing firstMiddleware for this route");
    return next();
};

const secondMiddleware = (req, res, next) => {
    console.log("[Route Middleware] Executing secondMiddleware for this route");
    return next();
};

const users = [
    { id: 1, name: "John", email: "john@gmail.com", role: "Admin", disabled: false },
    { id: 2, name: "Jane", email: "jane@gmail.com", role: "User", disabled: true },
    { id: 3, name: "Bob", email: "bob@gmail.com", role: "User", disabled: false },
    { id: 4, name: "Alice", email: "alice@gmail.com", role: "Manager", disabled: true },
    { id: 5, name: "Mike", email: "mike@gmail.com", role: "User", disabled: false },
];

Route.get("/", [firstMiddleware, secondMiddleware], (req, res) => {
    return res.view("home", {
        title: "ECF View Engine",
        name: "ECF View Engine",
        age: 20,
        date: new Date().toDateString(),
        users
    });
});

Route.get("/about", (req, res) => {
    return res.view("about", {
        title: "About",
    });
});

Route.get("/users/new", firstMiddleware, (req, res) => {
    return res.view("users.new", {
        title: "New User",
    });
});

Route.get("/users", (req, res) => {
    return res.view("user", {
        title: "Users",
        users
    });
});

// Route for finding by name (case-insensitive) - MUST come before /users/{id}
Route.get("/users/name/{name}", (req, res) => {
    const searchName = req.params.name;
    console.log("Searching for user by name:", searchName);

    const user = users.find(
        (user) => user.name.toLowerCase() === searchName.toLowerCase()
    );

    if (!user) {
        const suggestions = users.filter((user) =>
            user.name.toLowerCase().includes(searchName.toLowerCase())
        );

        return res.view("users.not-found", {
            title: "User Not Found",
            searchParam: searchName,
            suggestions
        });
    }

    return res.view("users.show", { user });
});

// Route for finding by ID - must come AFTER specific routes
Route.get("/users/{id}", (req, res) => {
    const id = parseInt(req.params.id);
    console.log("Searching for user by ID:", id);

    const user = users.find((user) => user.id === id);
    if (!user) {
        return res.view("users.not-found", {
            title: "User Not Found",
            searchParam: id,
            suggestions: []
        });
    }
    return res.view("users.show", {
        user

    });
});

Route.post("/user", async (req, res) => {
    const { name, email } = await req.body();
    if (!name || !email) {
        return res.text("Name and email are required", 422);
    }
    if (!email.includes("@")) {
        return res.text("Email is invalid", 422);
    }
    const existingUser = users.find((user) => user.email === email);
    if (existingUser) {
        return res.text("Email already exists", 422);
    }
    users.push({ id: users.length + 1, name, email, role: "User", disabled: false });
    return res.redirect("/users");
});

// ---- Exception Test Routes ----

Route.get("/error", (req, res) => {
    throw new ValidationError("Name field is required");
});

Route.get("/crash", (req, res) => {
    throw new Error("Something unexpected happened!");
});

exceptionManager.render(RouteNotFoundError, (err, req, res) => {
    return res.status(404).view("errors.404", {
        title: "404",
        message: err.message
    });
});



app.listen(3000, () => {
    console.log("ecf running at http://localhost:3000");
});