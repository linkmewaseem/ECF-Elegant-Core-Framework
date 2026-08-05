export default {
    // API blueprint defaults to JWT — no cookies/sessions involved.
    defaults: {
        guard: "api",
    },
    guards: {
        api: { driver: "jwt" },
    },
    jwt: {
        secret: process.env.JWT_SECRET || "",
        ttl: 60, // minutes
    },
};
