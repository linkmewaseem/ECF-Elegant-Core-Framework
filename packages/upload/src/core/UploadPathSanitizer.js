import path from "node:path";
import { FileValidationException } from "../exceptions/UploadException.js";

const DANGEROUS_EXTENSIONS = new Set([
  "php", "phtml", "php3", "php4", "php5", "phps",
  "exe", "bat", "cmd", "sh", "pl", "cgi", "vbs", "jar", "js", "htaccess"
]);

export class UploadPathSanitizer {
  static sanitize(originalName) {
    if (typeof originalName !== "string" || originalName.trim() === "") {
      return `upload_${Date.now()}.bin`;
    }

    const basename = path.basename(originalName);
    const ext = path.extname(basename).toLowerCase().replace(".", "");

    if (DANGEROUS_EXTENSIONS.has(ext)) {
      // Neutralize dangerous executable extension into .bin for safe storage/quarantine
      const safeBase = basename.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 100);
      return `${safeBase}.bin`;
    }

    const nameWithoutExt = basename.slice(0, basename.length - (ext ? ext.length + 1 : 0));
    const safeBase = nameWithoutExt.replace(/[^a-zA-Z0-9_-]/g, "_").replace(/_+/g, "_").slice(0, 100);

    const safeName = ext ? `${safeBase || "file"}.${ext}` : (safeBase || "file");
    return safeName;
  }
}

export default UploadPathSanitizer;
