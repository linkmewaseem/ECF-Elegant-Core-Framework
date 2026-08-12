import { Route } from "@ecfjs/http";
import HomeController from "../app/Http/Controllers/HomeController.js";
import AuthController from "../app/Http/Controllers/AuthController.js";
import PasswordResetController from "../app/Http/Controllers/PasswordResetController.js";
import DashboardController from "../app/Http/Controllers/DashboardController.js";

export default function registerWebRoutes() {
    Route.get("/", [HomeController, "index"]).name("home");
    Route.get("/about", [HomeController, "about"]).name("about");

    // Authentication Routes
    Route.get("/register", [AuthController, "showRegister"]).name("register");
    Route.post("/register", [AuthController, "register"]);

    Route.get("/login", [AuthController, "showLogin"]).name("login");
    Route.post("/login", [AuthController, "login"]);

    Route.get("/verify-email", [AuthController, "verifyEmail"]).name("verify.email");
    Route.get("/logout", [AuthController, "logout"]).name("logout");
    Route.post("/logout", [AuthController, "logout"]);

    // Password Reset & Change Routes
    Route.get("/forgot-password", [PasswordResetController, "showForgotPassword"]).name("password.forgot");
    Route.post("/forgot-password", [PasswordResetController, "sendResetLink"]);

    Route.get("/reset-password", [PasswordResetController, "showResetPassword"]).name("password.reset");
    Route.post("/reset-password", [PasswordResetController, "resetPassword"]);

    Route.get("/change-password", [PasswordResetController, "showChangePassword"]).name("password.change");
    Route.post("/change-password", [PasswordResetController, "changePassword"]);

    // Protected Dashboard Route
    Route.get("/dashboard", [DashboardController, "index"]).name("dashboard");

    // Fallback 404 Route
    Route.fallback([HomeController, "notFound"]);
}
