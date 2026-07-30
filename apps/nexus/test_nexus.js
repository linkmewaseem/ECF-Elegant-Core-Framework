import http from "node:http";

// Start app server
await import("./app.js");

const postData = "name=Gaming%20Monitor%204K&category=Electronics&price=599.99&stock=12&sku=SKU-DISP-4K";

const req = http.request("http://localhost:3002/products", {
    method: "POST",
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": Buffer.byteLength(postData),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
    }
}, (res) => {
    let body = "";
    res.on("data", chunk => body += chunk);
    res.on("end", () => {
        console.log("HTTP STATUS:", res.statusCode);
        console.log("LOCATION HEADER:", res.headers.location);
        console.log("RESPONSE BODY:", body);
        process.exit(0);
    });
});

req.on("error", (e) => {
    console.error("HTTP ERROR:", e);
    process.exit(1);
});

req.write(postData);
req.end();
