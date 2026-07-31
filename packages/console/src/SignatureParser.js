export class SignatureParser {
  static parse(signatureString) {
    if (!signatureString || typeof signatureString !== "string") {
      throw new Error("Invalid command signature string.");
    }

    const clean = signatureString.replace(/\s+/g, " ").trim();
    const parts = clean.split(" ");
    const name = parts[0];

    const args = [];
    const options = [];

    const matches = clean.match(/\{([^}]+)\}/g) || [];

    for (const match of matches) {
      const inner = match.slice(1, -1).trim();

      if (inner.startsWith("--")) {
        // Option
        const [optDef, ...descriptionParts] = inner.split(":");
        const description = descriptionParts.join(":").trim();
        const optClean = optDef.slice(2).trim();

        if (optClean.includes("=")) {
          const [optName, defaultValue] = optClean.split("=");
          options.push({
            name: optName.trim(),
            shortcut: null,
            hasValue: true,
            default: defaultValue.trim(),
            description,
          });
        } else {
          options.push({
            name: optClean,
            shortcut: null,
            hasValue: false,
            default: false,
            description,
          });
        }
      } else {
        // Argument
        const [argDef, ...descriptionParts] = inner.split(":");
        const description = descriptionParts.join(":").trim();
        let argClean = argDef.trim();
        let isRequired = true;
        let defaultValue = null;

        if (argClean.endsWith("?")) {
          isRequired = false;
          argClean = argClean.slice(0, -1).trim();
        } else if (argClean.includes("=")) {
          isRequired = false;
          const [aName, aVal] = argClean.split("=");
          argClean = aName.trim();
          defaultValue = aVal.trim();
        }

        args.push({
          name: argClean,
          required: isRequired,
          default: defaultValue,
          description,
        });
      }
    }

    return {
      name,
      arguments: args,
      options,
    };
  }
}

export default SignatureParser;
