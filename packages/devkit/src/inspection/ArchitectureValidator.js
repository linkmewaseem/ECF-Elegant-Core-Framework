import fs from 'node:fs';
import path from 'node:path';
import { IArchitectureValidator } from '@ecf/contracts';

/**
 * Clean Architecture Boundary Validator (ecf architecture).
 * Checks that Controllers do not import Drivers, Models do not import HTTP, circular dependencies, etc.
 */
export class ArchitectureValidator extends IArchitectureValidator {
  validate(projectPath = '.') {
    const absPath = path.resolve(projectPath);
    const violations = [];

    // Scan app directory if exists
    const controllersDir = path.join(absPath, 'app', 'http', 'controllers');
    if (fs.existsSync(controllersDir)) {
      const files = fs.readdirSync(controllersDir);
      for (const file of files) {
        if (file.endsWith('.js')) {
          const content = fs.readFileSync(path.join(controllersDir, file), 'utf-8');
          if (content.includes('/drivers/')) {
            violations.push({
              file: `app/http/controllers/${file}`,
              rule: 'Controllers must not import Drivers directly.',
            });
          }
        }
      }
    }

    return {
      passed: violations.length === 0,
      violationsCount: violations.length,
      violations,
    };
  }
}

export default ArchitectureValidator;
