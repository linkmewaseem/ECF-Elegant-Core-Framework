import http from "node:http";

// Start app server
await import("./app.js");

const req = http.request("http://localhost:3002/api/v1/migrations/status", {
    method: "GET",
    headers: {
        "Accept": "application/json"
    }
}, (res) => {
    let body = "";
    res.on("data", chunk => body += chunk);
    res.on("end", () => {
        console.log("MIGRATION STATUS HTTP STATUS:", res.statusCode);
        console.log("MIGRATION STATUS RESPONSE:", JSON.parse(body));
        process.exit(0);
    });
});

req.on("error", (e) => {
    console.error("HTTP ERROR:", e);
    process.exit(1);
});

req.end();
