import AppServiceProvider from "../app/Providers/AppServiceProvider.js";

/**
 * App-specific providers. Framework providers (Http, Database, View, Auth,
 * Logger, Core) are already registered in bootstrap/app.js — add your own
 * bindings here (mailer, third-party SDK clients, custom facades, etc).
 */
export default [
    AppServiceProvider,
];
