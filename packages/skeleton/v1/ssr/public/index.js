import { createApp } from "../bootstrap/app.js";

const app = createApp();
const config = app.make("config");

const host = config.get("http.host", "127.0.0.1");
const port = config.get("http.port", 3000);

// Only start listening when this file is run directly (e.g. `node public/index.js`
// or via a process manager). If createApp() is imported elsewhere — tests, CLI
// commands, queue workers — no server is started.
const entryFile = process.argv[1] ? process.argv[1].replace(/\\/g, "/") : "";

if (entryFile && (entryFile.endsWith("index.js") || entryFile.endsWith("public/index.js"))) {
    app.listen(port, host, () => {
        console.log(`🚀 ECF SSR app running on http://${host}:${port}`);
    });
}

export { app };
export default app;
