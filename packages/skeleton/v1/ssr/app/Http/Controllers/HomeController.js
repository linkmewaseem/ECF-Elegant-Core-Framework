import Controller from "./Controller.js";
import User from "../../Models/User.js";

export class HomeController extends Controller {
    async index(req, res) {
        let user = null;
        if (req.cookies?.ecf_user_id) {
            try {
                const u = await User.find(req.cookies.ecf_user_id);
                if (u) user = { name: u.name, email: u.email };
            } catch {}
        }

        return res.view("home", {
            title: "Welcome",
            appName: process.env.APP_NAME || "ECF Application",
            description: "An elegant, full-stack framework with built-in authentication, database ORM, and modern Tailwind CSS UI.",
            user,
        });
    }

    async about(req, res) {
        return res.view("about", {
            title: "About",
            appName: process.env.APP_NAME || "ECF Application",
        });
    }

    async notFound(req, res) {
        res.status(404);
        return res.view("errors.404", {
            title: "404 - Page Not Found",
            appName: process.env.APP_NAME || "ECF Application",
        });
    }
}

export default HomeController;
