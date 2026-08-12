import { Command } from '../kernel/Command.js';
import { CodeGenerator } from '../generators/CodeGenerator.js';

function createMakeCommandHandler(targetType, signature, description, extraOptionMapper = () => ({})) {
  return class extends Command {
    constructor() {
      super();
      this.signature = signature;
      this.description = description;
    }

    async handle(input, output) {
      const name = input.argument('name');
      if (!name) {
        output.error(`Name argument is required. Usage: ecf ${signature.split(' ')[0]} <name>`);
        return;
      }

      const force = input.option('force');
      const extraVars = extraOptionMapper(input);

      try {
        const res = CodeGenerator.generate(targetType, { name, ...extraVars }, { force });
        output.success(`Generated ${targetType}   → ${res.targetPath}`);
      } catch (err) {
        output.error(err.message);
      }
    }
  };
}

export const EcfMakeControllerCommand = createMakeCommandHandler(
  'controller',
  'make:controller {name} {--resource} {--force}',
  'Scaffold a new HTTP controller class',
  (input) => ({ isResource: input.option('resource') })
);

export const EcfMakeModelCommand = createMakeCommandHandler(
  'model',
  'make:model {name} {--force}',
  'Scaffold a new ORM database model class'
);

export const EcfMakeMiddlewareCommand = createMakeCommandHandler(
  'middleware',
  'make:middleware {name} {--force}',
  'Scaffold a new HTTP pipeline middleware class'
);

export const EcfMakeRequestCommand = createMakeCommandHandler(
  'request',
  'make:request {name} {--force}',
  'Scaffold a new form request validation class'
);

export const EcfMakePolicyCommand = createMakeCommandHandler(
  'policy',
  'make:policy {name} {--force}',
  'Scaffold a new resource authorization policy class'
);

export const EcfMakeCommandCommand = createMakeCommandHandler(
  'command',
  'make:command {name} {--force}',
  'Scaffold a new custom CLI command class'
);

export const EcfMakeMigrationCommand = createMakeCommandHandler(
  'migration',
  'make:migration {name} {--force}',
  'Scaffold a new database table migration script'
);

export const EcfMakeSeederCommand = createMakeCommandHandler(
  'seeder',
  'make:seeder {name} {--force}',
  'Scaffold a new database seeder class'
);

export const EcfMakeJobCommand = createMakeCommandHandler(
  'job',
  'make:job {name} {--force}',
  'Scaffold a new background queue job class'
);

export const EcfMakeMailCommand = createMakeCommandHandler(
  'mail',
  'make:mail {name} {--force}',
  'Scaffold a new email notification class'
);

export const EcfMakeNotificationCommand = createMakeCommandHandler(
  'notification',
  'make:notification {name} {--force}',
  'Scaffold a new multi-channel notification class'
);

export const EcfMakeChannelCommand = createMakeCommandHandler(
  'channel',
  'make:channel {name} {--force}',
  'Scaffold a new broadcast channel authorization class'
);

export const EcfMakeResourceCommand = createMakeCommandHandler(
  'resource',
  'make:resource {name} {--force}',
  'Scaffold a new API JSON resource transformer class'
);

export const EcfMakeTestCommand = createMakeCommandHandler(
  'test',
  'make:test {name} {--force}',
  'Scaffold a new unit or integration test file'
);
