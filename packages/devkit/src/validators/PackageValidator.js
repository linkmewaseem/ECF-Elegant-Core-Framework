import fs from 'node:fs';
import path from 'node:path';

/**
 * Validates 10/10 ECF Package Architecture Standard compliance.
 * Checks for README, ARCHITECTURE.md, package.json, src/index.js, tests, etc.
 */
export class PackageValidator {
  validate(packagePath) {
    const absPath = path.resolve(packagePath);
    const checks = {
      packageJson: fs.existsSync(path.join(absPath, 'package.json')),
      readme: fs.existsSync(path.join(absPath, 'README.md')),
      architecture: fs.existsSync(path.join(absPath, 'ARCHITECTURE.md')),
      srcIndex: fs.existsSync(path.join(absPath, 'src', 'index.js')),
      tests: fs.existsSync(path.join(absPath, 'tests')),
    };

    const passed = Object.values(checks).every(Boolean);
    const score = Math.round((Object.values(checks).filter(Boolean).length / Object.keys(checks).length) * 100);

    return {
      passed,
      score,
      checks,
      packagePath: absPath,
    };
  }
}

export default PackageValidator;
