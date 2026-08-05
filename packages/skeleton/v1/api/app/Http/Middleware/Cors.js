export class Cors {
    handle(req, res, next) {
        res.header("Access-Control-Allow-Origin", process.env.CORS_ORIGIN || "*");
        res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
        res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
        if (req.method === "OPTIONS") {
            return res.status(204).end();
        }
        return next();
    }
}

export default Cors;
