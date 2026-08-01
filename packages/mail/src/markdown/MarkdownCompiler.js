import SimpleCssInliner from "./SimpleCssInliner.js";

export class MarkdownCompiler {
  constructor(viewEngine = null) {
    this.viewEngine = viewEngine;
    this.inliner = new SimpleCssInliner();
  }

  async compile(markdownText, data = {}) {
    // 1. Replace components like <x-mail::button url="...">Text</x-mail::button>
    let html = markdownText
      .replace(/# (.*)/g, "<h1>$1</h1>")
      .replace(/## (.*)/g, "<h2>$2</h2>")
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')
      .replace(/\n\n/g, "</p><p>");

    html = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;"><p>${html}</p></div>`;

    const defaultCss = "h1 { color: #111827; } h2 { color: #374151; } a { color: #2563eb; text-decoration: none; } p { color: #4b5563; line-height: 1.5; }";
    return this.inliner.inline(html, defaultCss);
  }
}

export default MarkdownCompiler;
