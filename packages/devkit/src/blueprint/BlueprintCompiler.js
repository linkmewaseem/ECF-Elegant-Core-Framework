import { ModelGenerator } from '../generators/ModelGenerator.js';
import { ControllerGenerator } from '../generators/ControllerGenerator.js';
import { MigrationGenerator } from '../generators/MigrationGenerator.js';
import { ResourceGenerator } from '../generators/ResourceGenerator.js';
import { PolicyGenerator } from '../generators/PolicyGenerator.js';
import { TestGenerator } from '../generators/TestGenerator.js';

/**
 * YAML / JSON Blueprint Scaffolder Compiler.
 * Compiles a declarative specification into an entire feature stack in one command.
 */
export class BlueprintCompiler {
  constructor(options = {}) {
    this.options = options;
    this.modelGen = new ModelGenerator(options);
    this.controllerGen = new ControllerGenerator(options);
    this.migrationGen = new MigrationGenerator(options);
    this.resourceGen = new ResourceGenerator(options);
    this.policyGen = new PolicyGenerator(options);
    this.testGen = new TestGenerator(options);
  }

  /**
   * Compile model definitions from blueprint object.
   * @param {Object} blueprintData
   * @returns {Promise<Array>}
   */
  async compile(blueprintData) {
    const results = [];
    const models = blueprintData.models || {};

    for (const [modelName, config] of Object.entries(models)) {
      results.push(await this.modelGen.generate(modelName, this.options));
      results.push(await this.migrationGen.generate(modelName, this.options));
      results.push(await this.controllerGen.generate(modelName, this.options));
      results.push(await this.resourceGen.generate(modelName, this.options));
      results.push(await this.policyGen.generate(modelName, this.options));
      results.push(await this.testGen.generate(modelName, this.options));
    }

    return results;
  }
}

export default BlueprintCompiler;
