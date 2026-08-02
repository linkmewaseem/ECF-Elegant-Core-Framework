export class SwaggerUiMiddleware {
  constructor(openApiGenerator, routes = []) {
    this.generator = openApiGenerator;
    this.routes = routes;
  }

  getHtmlSpec(specJson) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>ECF API Platform — Swagger UI</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
  <style>
    body { margin:0; background:#0f172a; color:#f8fafc; font-family: sans-serif; }
    .topbar { display:none; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script>
    window.onload = () => {
      window.ui = SwaggerUIBundle({
        spec: ${JSON.stringify(specJson)},
        dom_id: '#swagger-ui',
        deepLinking: true,
      });
    };
  </script>
</body>
</html>`;
  }

  async handle(req, res, next) {
    const url = req.url || req.path || "";

    if (url === "/openapi.json" || url === "/swagger.json") {
      const spec = this.generator.generate(this.routes);
      if (res && typeof res.setHeader === "function") {
        res.setHeader("Content-Type", "application/json");
        return res.end(JSON.stringify(spec, null, 2));
      }
      return spec;
    }

    if (url === "/docs/api" || url === "/docs/api/") {
      const spec = this.generator.generate(this.routes);
      const html = this.getHtmlSpec(spec);
      if (res && typeof res.setHeader === "function") {
        res.setHeader("Content-Type", "text/html");
        return res.end(html);
      }
      return html;
    }

    return await next();
  }
}

export default SwaggerUiMiddleware;
