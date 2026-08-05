# Audit Extension Architecture

`@ecfjs/audit` is an ORM extension. Its public entry point is `index.js`; `AuditPlugin.js` contains the plugin implementation. It depends on the host ECF database integration and does not create an application runtime by itself.
