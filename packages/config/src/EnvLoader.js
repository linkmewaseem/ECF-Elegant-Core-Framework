import fs from "node:fs";
import path from "node:path";

export class EnvLoader {
  static load(filePath) {
    if (!filePath || !fs.existsSync(filePath)) {
      return {};
    }

    const content = fs.readFileSync(filePath, "utf8");
    const lines = content.split(/\r?\n/);
    const env = {};

    for (let line of lines) {
      line = line.trim();
      if (!line || line.startsWith("#")) continue;

      if (line.startsWith("export ")) {
        line = line.slice(7).trim();
      }

      const equalsIdx = line.indexOf("=");
      if (equalsIdx === -1) continue;

      const key = line.slice(0, equalsIdx).trim();
      let val = line.slice(equalsIdx + 1).trim();

      // Unquote strings
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      } else {
        // Strip comments
        const commentIdx = val.indexOf("#");
        if (commentIdx !== -1) {
          val = val.slice(0, commentIdx).trim();
        }
      }

      env[key] = this.coerce(val);
    }

    return env;
  }

  static coerce(val) {
    if (val === "true") return true;
    if (val === "false") return false;
    if (val === "null") return null;
    if (val === "undefined") return undefined;
    if (!isNaN(Number(val)) && val !== "") return Number(val);

    if (val.startsWith("[") && val.endsWith("]")) {
      try { return JSON.parse(val); } catch (e) {}
    }
    if (val.startsWith("{") && val.endsWith("}")) {
      try { return JSON.parse(val); } catch (e) {}
    }

    return val;
  }
}

export default EnvLoader;
