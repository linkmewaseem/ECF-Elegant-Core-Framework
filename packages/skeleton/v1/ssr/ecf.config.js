export default {
    name: "my-app",
    version: "1.0.0",
    blueprint: "v1/ssr",
    packages: [
        "@ecf/core",
        "@ecf/http",
        "@ecf/view",
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
        views: "resources/views",
    },
};
