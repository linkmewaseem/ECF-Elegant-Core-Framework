import { Application, Facade, CoreServiceProvider, LoggerServiceProvider, HttpServiceProvider, Route, Middleware, Log, ValidationException } from "@ecfjs/http";
import { ViewServiceProvider } from "@ecfjs/view";
import { Rule } from "@ecfjs/validation";
import { DatabaseServiceProvider, DB, Schema } from "@ecfjs/database";
import { initializeDatabase } from "./database/init.js";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = new Application();

// Register all ECF Framework Service Providers
app.register(CoreServiceProvider);
app.register(HttpServiceProvider);
app.register(LoggerServiceProvider);
app.register(ViewServiceProvider);
app.register(DatabaseServiceProvider);

app.boot();
Facade.setApplication(app);

// Initialize SQLite database schema and seeds
await initializeDatabase();

// ---- Exception Handling Setup ----
const exceptionManager = app.make("exception.manager");

exceptionManager.render(ValidationException, (err, req, res) => {
    if (req.expectsJson()) {
        return res.status(422).json({
            status: "error",
            message: err.message,
            errors: err.errors
        });
    }
    return res.status(422).send(`
        <div style="font-family: sans-serif; padding: 2rem; max-width: 600px; margin: 2rem auto; background: #fff0f0; border: 1px solid #ffcdd2; border-radius: 8px; color: #b71c1c;">
            <h2>Validation Error (422)</h2>
            <p>${err.message}</p>
            <pre>${JSON.stringify(err.errors, null, 2)}</pre>
            <br>
            <a href="javascript:history.back()">&larr; Back to Form</a>
        </div>
    `);
});

// ---- Global Middleware ----
app.use((req, res, next) => {
    Log.info(`[Nexus App] ${req.method} ${req.path}`);
    return next();
});

// ---- Application Routes ----

// 1. Dashboard View (GET /)
Route.get("/", async (req, res) => {
    const products = await DB.table("products").orderBy("id", "DESC").get();
    const totalProducts = await DB.table("products").count();

    const lowStockItems = await DB.table("products").where("stock", "<=", 10).get();
    const lowStockCount = lowStockItems.length;

    let totalStockValue = 0;
    for (const p of products) {
        totalStockValue += (p.price * p.stock);
    }

    return res.view("dashboard", {
        title: "Executive Dashboard",
        products: products.slice(0, 5),
        totalProducts,
        lowStockCount,
        totalStockValue: totalStockValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    });
}).name("dashboard");

// 2. Inventory Catalog (GET /products)
Route.get("/products", async (req, res) => {
    const categoryFilter = req.query("category", null);

    let query = DB.table("products");
    if (categoryFilter) {
        query = query.where("category", categoryFilter);
    }

    const products = await query.orderBy("name", "ASC").get();

    if (req.expectsJson()) {
        return res.json({ count: products.length, products });
    }

    return res.view("products.index", {
        title: "Inventory Catalog",
        products
    });
}).name("products.index");

// 3. New Product Form (GET /products/new)
Route.get("/products/new", (req, res) => {
    return res.view("products.create", {
        title: "Add New Product"
    });
}).name("products.create");

// 4. Product Store Handler (POST /products)
Route.post("/products", async (req, res) => {
    // Validate request data using @ecfjs/validation engine with fluent Rule builder
    const validated = await req.validate({
        name: [Rule.required(), Rule.string(), Rule.min(3)],
        category: [Rule.required(), Rule.in(["Electronics", "Peripherals", "Hardware", "Accessories"])],
        price: [Rule.required(), Rule.number(), Rule.min(0.01)],
        stock: [Rule.required(), Rule.integer(), Rule.min(0)],
        sku: [Rule.required(), Rule.alphaDash()]
    });

    const newProductId = await DB.table("products").insertGetId({
        name: validated.name,
        category: validated.category,
        price: Number(validated.price),
        stock: Number(validated.stock),
        sku: String(validated.sku).toUpperCase(),
        created_at: new Date().toISOString().split("T")[0]
    });

    Log.info(`[Nexus] Created new product #${newProductId} (${validated.name})`);

    if (req.expectsJson()) {
        return res.status(201).json({
            message: "Product created successfully",
            id: newProductId
        });
    }

    return res.redirect(Route.url("products.index"));
}).name("products.store");

// 5. Product Details View (GET /products/{id})
Route.get("/products/{id}", async (req, res) => {
    const id = req.integer("id");
    const product = await DB.table("products").where("id", id).first();

    if (!product) {
        return res.status(404).send(`
            <div style="font-family: sans-serif; text-align: center; padding: 4rem;">
                <h1>404 Product Not Found</h1>
                <p>No product exists with ID #${id}</p>
                <br>
                <a href="/products">&larr; Back to Catalog</a>
            </div>
        `);
    }

    product.totalValuation = (product.price * product.stock).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    if (req.expectsJson()) {
        return res.json({ product });
    }

    return res.view("products.show", {
        title: product.name,
        product
    });
}).name("products.show").where("id", /^\d+$/);

// 6. Delete Product Handler (POST /products/{id}/delete)
Route.post("/products/{id}/delete", async (req, res) => {
    const id = req.integer("id");
    const affected = await DB.table("products").where("id", id).delete();

    Log.info(`[Nexus] Deleted product #${id} (affected: ${affected})`);

    if (req.expectsJson()) {
        return res.json({ message: "Product deleted", affected });
    }

    return res.redirect(Route.url("products.index"));
}).name("products.delete").where("id", /^\d+$/);

// 7. API v1 Analytics & Specs Endpoint (GET /api/v1/analytics & /api/v1/schema/inspect)
Route.group({ prefix: "/api/v1" }, (router) => {
    router.get("/analytics", async (req, res) => {
        const totalItems = await DB.table("products").count();
        const maxPrice = await DB.table("products").max("price");
        const minPrice = await DB.table("products").min("price");
        const avgPrice = await DB.table("products").avg("price");

        return res.json({
            framework: "ECF Enterprise Web Framework v1.0",
            packages: ["@ecfjs/core", "@ecfjs/http", "@ecfjs/view", "@ecfjs/validation", "@ecfjs/database"],
            metrics: {
                totalItems,
                maxPrice,
                minPrice,
                avgPrice: Number(avgPrice?.toFixed(2) || 0)
            }
        });
    });

    router.get("/schema/inspect", async (req, res) => {
        const hasProducts = await Schema.hasTable("products");
        const hasOrders = await Schema.hasTable("orders");
        const hasSkuColumn = await Schema.hasColumn("products", "sku");
        const hasProductIdColumn = await Schema.hasColumn("orders", "product_id");

        return res.json({
            tables: {
                products: { exists: hasProducts, hasSkuColumn },
                orders: { exists: hasOrders, hasProductIdColumn }
            },
            driver: DB.connection().driver.constructor.name,
            grammar: DB.connection().schemaGrammar.constructor.name
        });
    });

    router.get("/migrations/status", async (req, res) => {
        const migrationsPath = path.join(__dirname, "database", "migrations");
        const status = await DB.migrator().status(migrationsPath);
        return res.json({ migrations: status });
    });
});

// Fallback Route
Route.fallback((req, res) => {
    if (req.expectsJson()) {
        return res.status(404).json({ error: "Endpoint not found", path: req.path });
    }
    return res.status(404).send(`
        <div style="font-family: sans-serif; text-align: center; padding: 4rem; color: #333;">
            <h1>404 Page Not Found</h1>
            <p>The path <code>${req.path}</code> was not found.</p>
            <br>
            <a href="/">&larr; Return Home</a>
        </div>
    `);
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
    Log.info(`Nexus Enterprise Application running at http://localhost:${PORT}`);
});
