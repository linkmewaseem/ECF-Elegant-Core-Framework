import fs from 'node:fs';
import path from 'node:path';

/**
 * Scaffolds third-party / community ECF packages following 10/10 standard architecture.
 * Structure: Contracts ➔ Manager ➔ Drivers ➔ Facade ➔ Service Provider ➔ Testing Fake ➔ DevTools Collector ➔ README ➔ ARCHITECTURE.md.
 */
export class PackageScaffolder {
  async scaffold(packageName, baseDir = './packages') {
    const pascalName = packageName.charAt(0).toUpperCase() + packageName.slice(1);
    const targetDir = path.resolve(baseDir, packageName);

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const pkgJson = {
      name: `@ecfjs/${packageName}`,
      version: '1.0.0-rc.1',
      type: 'module',
      main: './src/index.js',
      types: './src/index.d.ts',
      scripts: { test: 'node --test tests/**/*.test.js' },
      dependencies: { '@ecfjs/contracts': 'workspace:*', '@ecfjs/core': 'workspace:*', '@ecfjs/support': 'workspace:*' },
    };

    fs.writeFileSync(path.join(targetDir, 'package.json'), JSON.stringify(pkgJson, null, 2), 'utf-8');

    const readme = `# @ecfjs/${packageName}\n\nThird-party package for ECF ecosystem.\n`;
    fs.writeFileSync(path.join(targetDir, 'README.md'), readme, 'utf-8');

    const adr = `# Architecture Decision Record (ADR) — @ecfjs/${packageName}\n\n## Status\nApproved\n`;
    fs.writeFileSync(path.join(targetDir, 'ARCHITECTURE.md'), adr, 'utf-8');

    const dirs = ['src/contracts', 'src/drivers', 'src/facades', 'src/testing', 'src/collectors', 'tests/unit'];
    for (const d of dirs) {
      fs.mkdirSync(path.join(targetDir, d), { recursive: true });
    }

    const indexJs = `export class ${pascalName}Manager {}\nexport default ${pascalName}Manager;\n`;
    fs.writeFileSync(path.join(targetDir, 'src/index.js'), indexJs, 'utf-8');

    return { success: true, packageName, path: targetDir };
  }
}

export default PackageScaffolder;
