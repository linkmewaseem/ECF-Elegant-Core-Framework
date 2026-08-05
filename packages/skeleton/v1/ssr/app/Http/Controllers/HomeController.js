import Controller from "./Controller.js";

export class HomeController extends Controller {
    async index(req, res) {
        return res.view("home", {
            title: "Welcome",
            appName: "ECF Framework Application",
            description: "You're looking at a server-rendered ECF view.",
        });
    }

    async about(req, res) {
        return res.view("about", {
            title: "About",
        });
    }
}

export default HomeController;
