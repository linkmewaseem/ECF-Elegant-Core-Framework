export default {
    name: "my-api",
    version: "1.0.0",
    blueprint: "v1/api",
    packages: [
        "@ecf/core",
        "@ecf/http",
        "@ecf/database",
        "@ecf/auth",
        "@ecf/validation",
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
