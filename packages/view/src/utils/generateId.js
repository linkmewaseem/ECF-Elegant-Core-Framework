import crypto from "node:crypto";

export default function generateId(filePath) {
    return crypto.createHash("sha1").update(filePath).digest("hex").slice(0, 12);
}
