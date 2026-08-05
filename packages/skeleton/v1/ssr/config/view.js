export default {
    // NOTE: ViewServiceProvider already has safe fallback defaults if this
    // file is missing entirely (basePath: process.cwd()/views, extension:
    // .ecf, cache: true). This file only exists so you can override them.
    // The keys below MUST match what ViewServiceProvider reads —
    // "view.path" (singular, a string) not "view.paths" (array).
    path: "resources/views",
    extension: ".ecf",
    cache: process.env.APP_ENV === "production",
};
