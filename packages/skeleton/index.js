/**
 * @ecfjs/skeleton — Blueprint Registry
 *
 * This package exports blueprint metadata used by @ecfjs/cli and dev tools
 * to scaffold new ECF applications.
 */

export const blueprints = {
    ssr: {
        path: "v1/ssr",
        description: "Server-rendered app — HTML views, session auth",
    },
    api: {
        path: "v1/api",
        description: "JSON-only API — JWT auth, no views",
    },
};

export const defaultBlueprint = "ssr";

export default {
    blueprints,
    defaultBlueprint,
};
