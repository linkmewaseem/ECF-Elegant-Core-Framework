import crypto from "node:crypto";

export class Str {
  static camel(str) {
    if (!str) return "";
    return str
      .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
      .replace(/^[A-Z]/, (chr) => chr.toLowerCase());
  }

  static studly(str) {
    if (!str) return "";
    return str
      .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
      .replace(/^[a-z]/, (chr) => chr.toUpperCase());
  }

  static snake(str, delimiter = "_") {
    if (!str) return "";
    return str
      .replace(/([a-z0-9])([A-Z])/g, `$1${delimiter}$2`)
      .replace(/[^a-zA-Z0-9]+/g, delimiter)
      .toLowerCase();
  }

  static kebab(str) {
    return this.snake(str, "-");
  }

  static slug(str, separator = "-") {
    if (!str) return "";
    return str
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, separator)
      .replace(/[^\w\-]+/g, "")
      .replace(/\-\-+/g, separator);
  }

  static random(length = 16) {
    return crypto.randomBytes(Math.ceil(length / 2)).toString("hex").slice(0, length);
  }

  static uuid() {
    return crypto.randomUUID();
  }

  static limit(str, limit = 100, end = "...") {
    if (!str || str.length <= limit) return str || "";
    return str.slice(0, limit) + end;
  }

  static contains(haystack, needles) {
    if (!haystack) return false;
    const arrayNeedles = Array.isArray(needles) ? needles : [needles];
    return arrayNeedles.some((needle) => haystack.includes(needle));
  }

  static startsWith(haystack, needles) {
    if (!haystack) return false;
    const arrayNeedles = Array.isArray(needles) ? needles : [needles];
    return arrayNeedles.some((needle) => haystack.startsWith(needle));
  }

  static endsWith(haystack, needles) {
    if (!haystack) return false;
    const arrayNeedles = Array.isArray(needles) ? needles : [needles];
    return arrayNeedles.some((needle) => haystack.endsWith(needle));
  }
}

export default Str;
