import { Route } from "@ecfjs/http";

export default function registerHealthRoutes() {
    Route.get("/health", (req, res) => {
        return res.json({
            status: "healthy",
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
        });
    });
}
