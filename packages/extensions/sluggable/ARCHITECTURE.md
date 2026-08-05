# Sluggable Extension Architecture

`@ecfjs/sluggable` is an ORM extension. Its public entry point is `index.js`; `SluggablePlugin.js` contains the plugin implementation. It depends on the host ECF database integration and does not create an application runtime by itself.
