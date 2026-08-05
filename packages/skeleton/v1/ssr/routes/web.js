import { Route } from "@ecfjs/http";
import HomeController from "../app/Http/Controllers/HomeController.js";

export default function registerWebRoutes() {
    Route.get("/", [HomeController, "index"]).name("home");
    Route.get("/about", [HomeController, "about"]).name("about");
}
