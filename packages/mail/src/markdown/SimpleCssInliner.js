import ICssInliner from "../contracts/ICssInliner.js";

export class SimpleCssInliner extends ICssInliner {
  inline(html, css = "") {
    if (!css || typeof css !== "string") return html;

    // Parse simple selector rules like p { color: red; } and inject style="..." into matching tags
    let result = html;
    const ruleRegex = /([a-z0-9_.-]+)\s*\{\s*([^}]+)\}/gi;
    let match;

    while ((match = ruleRegex.exec(css)) !== null) {
      const tag = match[1].toLowerCase().trim();
      const styleContent = match[2].trim();

      if (tag === "p" || tag === "h1" || tag === "h2" || tag === "a" || tag === "td") {
        const tagRegex = new RegExp(`<(${tag})([^>]*)>`, "gi");
        result = result.replace(tagRegex, (full, tagName, attrs) => {
          if (attrs.includes("style=")) {
            return full.replace(/style="([^"]*)"/i, `style="$1; ${styleContent}"`);
          }
          return `<${tagName}${attrs} style="${styleContent}">`;
        });
      }
    }
    return result;
  }
}

export default SimpleCssInliner;
