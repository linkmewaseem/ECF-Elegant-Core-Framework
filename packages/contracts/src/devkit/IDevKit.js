/**
 * Interface for DevKit Manager.
 * @interface IDevKitManager
 */
export class IDevKitManager {
  make(generatorName, options) { throw new Error('Method make() must be implemented.'); }
  blueprint(yamlFile) { throw new Error('Method blueprint() must be implemented.'); }
  install(packageName) { throw new Error('Method install() must be implemented.'); }
  doctor() { throw new Error('Method doctor() must be implemented.'); }
}

/**
 * Interface for Code Generator.
 * @interface ICodeGenerator
 */
export class ICodeGenerator {
  generate(options) { throw new Error('Method generate() must be implemented.'); }
}

/**
 * Interface for AST Injector.
 * @interface IASTInjector
 */
export class IASTInjector {
  injectProvider(content, providerClass) { throw new Error('Method injectProvider() must be implemented.'); }
  injectRoute(content, routeDefinition) { throw new Error('Method injectRoute() must be implemented.'); }
}

/**
 * Interface for Architecture Validator.
 * @interface IArchitectureValidator
 */
export class IArchitectureValidator {
  validate(projectPath) { throw new Error('Method validate() must be implemented.'); }
}

export default IDevKitManager;
