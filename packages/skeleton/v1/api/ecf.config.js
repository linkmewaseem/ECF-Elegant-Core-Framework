export default {
    name: "my-api",
    version: "1.0.0",
    blueprint: "v1/api",
    packages: [
        "@ecfjs/core",
        "@ecfjs/http",
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
    },
};
