import { Route } from "@ecf/http";
import UserController from "../app/Http/Controllers/UserController.js";

export default function registerApiRoutes() {
    Route.group("/api/v1", () => {
        Route.get("/status", (req, res) => res.json({ status: "ok", api: "v1" }));

        Route.get("/users", [UserController, "index"]);
        Route.post("/users", [UserController, "store"]);
        Route.get("/users/{id}", [UserController, "show"]);
        Route.put("/users/{id}", [UserController, "update"]);
        Route.delete("/users/{id}", [UserController, "destroy"]);
    });
}
