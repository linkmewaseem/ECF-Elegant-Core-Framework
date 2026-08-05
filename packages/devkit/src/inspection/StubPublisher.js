import fs from 'node:fs';
import path from 'node:path';

/**
 * Stub Publisher (ecf stub:publish).
 * Publishes customizable code generation templates into project's stubs/ directory.
 */
export class StubPublisher {
  publish(targetDir = './stubs') {
    const absPath = path.resolve(targetDir);
    if (!fs.existsSync(absPath)) {
      fs.mkdirSync(absPath, { recursive: true });
    }

    const stubs = {
      'model.stub': `import { Model } from '@ecfjs/database';\n\nexport class {{pascal}} extends Model {}\nexport default {{pascal}};\n`,
      'controller.stub': `export class {{pascal}}Controller {}\nexport default {{pascal}}Controller;\n`,
      'job.stub': `import { Job } from '@ecfjs/queue';\n\nexport class {{pascal}}Job extends Job {}\nexport default {{pascal}}Job;\n`,
      'resource.stub': `import { ApiResource } from '@ecfjs/api';\n\nexport class {{pascal}}Resource extends ApiResource {}\nexport default {{pascal}}Resource;\n`,
    };

    const published = [];
    for (const [name, content] of Object.entries(stubs)) {
      const filePath = path.join(absPath, name);
      fs.writeFileSync(filePath, content, 'utf-8');
      published.push(filePath);
    }

    return { success: true, publishedCount: published.length, targetDir: absPath };
  }
}

export default StubPublisher;
