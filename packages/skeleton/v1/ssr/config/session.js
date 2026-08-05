export default {
    driver: process.env.SESSION_DRIVER || "cookie",
    lifetime: 120,
    expire_on_close: false,
    encrypt: true,
    path: "/",
    domain: null,
    secure: process.env.APP_ENV === "production",
    http_only: true,
    same_site: "lax",
};
