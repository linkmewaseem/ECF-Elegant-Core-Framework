export default {
    // SSR apps default to session/cookie auth. Switch to "api" guard for
    // token-based auth on any JSON endpoints defined in routes/api.js.
    defaults: {
        guard: "session",
    },
    guards: {
        session: { driver: "session" },
        api: { driver: "jwt" },
    },
};
