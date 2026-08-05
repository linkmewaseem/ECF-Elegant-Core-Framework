import Controller from "./Controller.js";
import User from "../../Models/User.js";
import StoreUserRequest from "../Requests/StoreUserRequest.js";

export class UserController extends Controller {
    async index(req, res) {
        const users = await User.all();
        return res.json({ data: users });
    }

    async store(req, res) {
        const body = await req.body();
        const request = new StoreUserRequest(body);
        if (request.fails()) {
            return res.status(422).json({ errors: request.errors() });
        }
        const user = await User.create(request.validated());
        return res.status(201).json({ data: user });
    }

    async show(req, res) {
        const user = await User.find(req.params.id);
        if (!user) return res.status(404).json({ error: "User not found" });
        return res.json({ data: user });
    }

    async update(req, res) {
        const body = await req.body();
        const user = await User.find(req.params.id);
        if (!user) return res.status(404).json({ error: "User not found" });
        await user.update(body);
        return res.json({ data: user });
    }

    async destroy(req, res) {
        const user = await User.find(req.params.id);
        if (!user) return res.status(404).json({ error: "User not found" });
        await user.delete();
        return res.status(204).end();
    }
}

export default UserController;
