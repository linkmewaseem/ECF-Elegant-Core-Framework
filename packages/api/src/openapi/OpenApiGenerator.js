export class OpenApiGenerator {
  constructor(title = "ECF API Platform", version = "1.0.0", description = "Enterprise ECF OpenAPI Specifications") {
    this.title = title;
    this.version = version;
    this.description = description;
  }

  generate(routes = []) {
    const paths = {};

    for (const route of routes) {
      const pathKey = route.path || "/";
      const method = (route.method || "get").toLowerCase();

      if (!paths[pathKey]) paths[pathKey] = {};

      paths[pathKey][method] = {
        summary: route.summary || `${method.toUpperCase()} ${pathKey}`,
        description: route.description || "",
        operationId: route.operationId || `${method}_${pathKey.replace(/[^a-zA-Z0-9]/g, "_")}`,
        parameters: route.parameters || [],
        responses: {
          "200": {
            description: "Successful response",
            content: {
              "application/json": {
                schema: route.responseSchema || { type: "object" },
              },
            },
          },
          "400": { description: "Validation Error / Bad Request" },
          "401": { description: "Unauthorized" },
          "429": { description: "Rate limit exceeded" },
        },
      };
    }

    return {
      openapi: "3.0.3",
      info: {
        title: this.title,
        version: this.version,
        description: this.description,
      },
      paths,
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
          apiKeyAuth: {
            type: "apiKey",
            in: "header",
            name: "X-API-Key",
          },
        },
      },
    };
  }
}

export default OpenApiGenerator;
