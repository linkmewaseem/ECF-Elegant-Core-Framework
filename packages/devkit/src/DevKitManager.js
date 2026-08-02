import { IDevKitManager } from '@ecf/contracts';
import { ModelGenerator } from './generators/ModelGenerator.js';
import { ControllerGenerator } from './generators/ControllerGenerator.js';
import { ResourceGenerator } from './generators/ResourceGenerator.js';
import { MiddlewareGenerator } from './generators/MiddlewareGenerator.js';
import { MigrationGenerator } from './generators/MigrationGenerator.js';
import { EventGenerator } from './generators/EventGenerator.js';
import { ListenerGenerator } from './generators/ListenerGenerator.js';
import { JobGenerator } from './generators/JobGenerator.js';
import { MailGenerator } from './generators/MailGenerator.js';
import { NotificationGenerator } from './generators/NotificationGenerator.js';
import { SeederGenerator } from './generators/SeederGenerator.js';
import { TestGenerator } from './generators/TestGenerator.js';
import { ChannelGenerator } from './generators/ChannelGenerator.js';
import { PolicyGenerator } from './generators/PolicyGenerator.js';
import { CommandGenerator } from './generators/CommandGenerator.js';

import { BlueprintCompiler } from './blueprint/BlueprintCompiler.js';
import { ProjectScaffolder } from './scaffolders/ProjectScaffolder.js';
import { PackageScaffolder } from './scaffolders/PackageScaffolder.js';
import { PackageValidator } from './validators/PackageValidator.js';
import { PackageInstaller } from './installers/PackageInstaller.js';
import { ArchitectureValidator } from './inspection/ArchitectureValidator.js';
import { ProjectInspector } from './inspection/ProjectInspector.js';
import { UndoManager } from './inspection/UndoManager.js';
import { StubPublisher } from './inspection/StubPublisher.js';
import { DoctorEngine } from './diagnostics/DoctorEngine.js';
import { UpgradeAssistant } from './diagnostics/UpgradeAssistant.js';

/**
 * DevKitManager — Central Manager for ECF DevKit Platform.
 */
export class DevKitManager extends IDevKitManager {
  #generators = new Map();

  constructor(options = {}) {
    super();
    this.options = options;
    this.#registerDefaultGenerators();

    this.projectScaffolder = new ProjectScaffolder(options);
    this.packageScaffolder = new PackageScaffolder();
    this.packageValidator = new PackageValidator();
    this.packageInstaller = new PackageInstaller();
    this.architectureValidator = new ArchitectureValidator();
    this.projectInspector = new ProjectInspector();
    this.stubPublisher = new StubPublisher();
    this.doctorEngine = new DoctorEngine();
    this.upgradeAssistant = new UpgradeAssistant();
  }

  #registerDefaultGenerators() {
    this.#generators.set('model', new ModelGenerator(this.options));
    this.#generators.set('controller', new ControllerGenerator(this.options));
    this.#generators.set('resource', new ResourceGenerator(this.options));
    this.#generators.set('middleware', new MiddlewareGenerator(this.options));
    this.#generators.set('migration', new MigrationGenerator(this.options));
    this.#generators.set('event', new EventGenerator(this.options));
    this.#generators.set('listener', new ListenerGenerator(this.options));
    this.#generators.set('job', new JobGenerator(this.options));
    this.#generators.set('mail', new MailGenerator(this.options));
    this.#generators.set('notification', new NotificationGenerator(this.options));
    this.#generators.set('seeder', new SeederGenerator(this.options));
    this.#generators.set('test', new TestGenerator(this.options));
    this.#generators.set('channel', new ChannelGenerator(this.options));
    this.#generators.set('policy', new PolicyGenerator(this.options));
    this.#generators.set('command', new CommandGenerator(this.options));
  }

  getGenerator(name) {
    const generator = this.#generators.get(name.toLowerCase());
    if (!generator) {
      throw new Error(`Generator "${name}" is not registered in DevKit.`);
    }
    return generator;
  }

  async make(generatorName, targetName, options = {}) {
    const gen = this.getGenerator(generatorName);
    return gen.generate(targetName, { ...this.options, ...options });
  }

  async blueprint(blueprintData, options = {}) {
    const compiler = new BlueprintCompiler({ ...this.options, ...options });
    return compiler.compile(blueprintData);
  }

  async scaffoldProject(appName, preset = 'api') {
    return this.projectScaffolder.scaffold(appName, preset);
  }

  async scaffoldPackage(packageName, baseDir = './packages') {
    return this.packageScaffolder.scaffold(packageName, baseDir);
  }

  validatePackage(packagePath) {
    return this.packageValidator.validate(packagePath);
  }

  async installPackage(packageName, options = {}) {
    return this.packageInstaller.install(packageName, options);
  }

  validateArchitecture(projectPath = '.') {
    return this.architectureValidator.validate(projectPath);
  }

  inspectProject(projectPath = '.') {
    return this.projectInspector.inspect(projectPath);
  }

  publishStubs(targetDir = './stubs') {
    return this.stubPublisher.publish(targetDir);
  }

  undo() {
    return UndoManager.undo();
  }

  doctor() {
    return this.doctorEngine.diagnose();
  }

  upgrade(options = {}) {
    return this.upgradeAssistant.checkUpgrade(options);
  }
}

export default DevKitManager;
