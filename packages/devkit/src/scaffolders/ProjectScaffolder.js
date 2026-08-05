import fs from 'node:fs';
import path from 'node:path';

/**
 * Scaffolds complete new ECF application projects (ecf new [app-name]).
 */
export class ProjectScaffolder {
  constructor(options = {}) {
    this.options = options;
  }

  async scaffold(appName, preset = 'api') {
    const targetDir = path.resolve(appName);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const pkgJson = {
      name: appName,
      version: '1.0.0',
      type: 'module',
      scripts: {
        dev: 'node app.js',
        test: 'ecf test',
      },
      dependencies: {
        '@ecfjs/core': 'workspace:*',
        '@ecfjs/database': 'workspace:*',
        '@ecfjs/http': 'workspace:*',
        '@ecfjs/api': 'workspace:*',
        '@ecfjs/logging': 'workspace:*',
      },
    };

    fs.writeFileSync(path.join(targetDir, 'package.json'), JSON.stringify(pkgJson, null, 2), 'utf-8');

    const appJs = `import { Application } from '@ecfjs/core';

const app = new Application();
app.listen(3000, () => {
  console.log('ECF Application running on http://localhost:3000');
});
`;
    fs.writeFileSync(path.join(targetDir, 'app.js'), appJs, 'utf-8');

    const envFile = `APP_NAME=${appName}
APP_ENV=local
APP_DEBUG=true
DB_CONNECTION=sqlite
DB_DATABASE=./database.sqlite
`;
    fs.writeFileSync(path.join(targetDir, '.env'), envFile, 'utf-8');

    // Create standard directory tree
    const dirs = ['app/models', 'app/http/controllers', 'app/http/middleware', 'config', 'database/migrations', 'routes', 'tests/unit'];
    for (const d of dirs) {
      fs.mkdirSync(path.join(targetDir, d), { recursive: true });
    }

    return { success: true, appName, path: targetDir, preset };
  }
}

export default ProjectScaffolder;
