export default {
    name: "my-app",
    version: "1.0.0",
    blueprint: "v1/ssr",
    packages: [
        "@ecfjs/core",
        "@ecfjs/http",
        "@ecfjs/view",
        "@ecfjs/database",
        "@ecfjs/auth",
        "@ecfjs/validation",
    ],
    plugins: {
        autoload: true,
        directory: "plugins",
    },
    paths: {
        app: "app",
        config: "config",
        database: "database",
        routes: "routes",
        public: "public",
        views: "resources/views",
    },
};
