import { Route } from "@ecf/http";

/**
 * Optional JSON routes for AJAX calls or webhooks from your SSR pages.
 * For a project that's mostly API, use the `api` blueprint instead
 * (`ecf new my-app --type=api`) — it's built around this as the primary layer.
 */
export default function registerApiRoutes() {
    Route.group("/api/v1", () => {
        Route.get("/status", (req, res) => res.json({ status: "ok", api: "v1" }));
    });
}
