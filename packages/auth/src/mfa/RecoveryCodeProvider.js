import crypto from "node:crypto";
import IMultiFactorProvider from "../contracts/IMultiFactorProvider.js";

export class RecoveryCodeProvider extends IMultiFactorProvider {
  name() {
    return "recovery_codes";
  }

  generateSecret(user, count = 8) {
    const plainCodes = [];
    const hashedCodes = [];

    for (let i = 0; i < count; i++) {
      const code = `${crypto.randomBytes(4).toString("hex")}-${crypto.randomBytes(4).toString("hex")}`;
      plainCodes.push(code);
      hashedCodes.push(this.hashCode(code));
    }

    return {
      plainCodes,
      hashedCodes
    };
  }

  verifyCode(hashedCodes = [], plainCode = "") {
    if (!plainCode || !Array.isArray(hashedCodes)) {
      return { valid: false, remainingCodes: hashedCodes };
    }

    const inputHash = this.hashCode(plainCode);
    const inputBuf = Buffer.from(inputHash, "hex");

    let matchIndex = -1;
    for (let i = 0; i < hashedCodes.length; i++) {
      const expectedBuf = Buffer.from(hashedCodes[i], "hex");
      if (expectedBuf.length === inputBuf.length && crypto.timingSafeEqual(expectedBuf, inputBuf)) {
        matchIndex = i;
        break;
      }
    }

    if (matchIndex !== -1) {
      const remainingCodes = hashedCodes.filter((_, idx) => idx !== matchIndex);
      return {
        valid: true,
        remainingCodes
      };
    }

    return { valid: false, remainingCodes: hashedCodes };
  }

  hashCode(code) {
    return crypto.createHash("sha256").update(code.trim()).digest("hex");
  }
}

export default RecoveryCodeProvider;
