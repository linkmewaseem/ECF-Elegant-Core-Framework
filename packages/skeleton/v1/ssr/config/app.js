export default {
    name: process.env.APP_NAME || "ECF Application",
    env: process.env.APP_ENV || "development",
    debug: process.env.APP_DEBUG !== "false",
    url: process.env.APP_URL || "http://localhost:3000",
    timezone: "UTC",
    locale: "en",
    fallback_locale: "en",
    key: process.env.APP_KEY || "",
};
