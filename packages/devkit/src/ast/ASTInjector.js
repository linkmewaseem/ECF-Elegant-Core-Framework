import { IASTInjector } from '@ecf/contracts';

/**
 * AST Code Injector Engine.
 * Safely manipulates JavaScript/JSON/Env structures without breaking code formatting.
 */
export class ASTInjector extends IASTInjector {
  /**
   * Inject Service Provider into config/app.js content.
   * @param {string} content
   * @param {string} providerClass
   * @returns {string}
   */
  injectProvider(content, providerClass) {
    if (content.includes(providerClass)) return content;

    const importStatement = `import { ${providerClass} } from './providers/${providerClass}.js';\n`;
    let updated = importStatement + content;

    if (updated.includes('providers: [')) {
      updated = updated.replace('providers: [', `providers: [\n    ${providerClass},`);
    }

    return updated;
  }

  /**
   * Inject Route definition into routes/web.js or routes/api.js content.
   * @param {string} content
   * @param {string} routeDefinition
   * @returns {string}
   */
  injectRoute(content, routeDefinition) {
    if (content.includes(routeDefinition)) return content;
    return content.trim() + `\n\n${routeDefinition}\n`;
  }

  /**
   * Inject Environment variable key=value into .env content.
   * @param {string} content
   * @param {string} key
   * @param {string} value
   * @returns {string}
   */
  injectEnv(content, key, value) {
    if (content.includes(`${key}=`)) return content;
    return content.trim() + `\n${key}=${value}\n`;
  }

  /**
   * Inject npm script or dependency into package.json object.
   * @param {Object} packageJson
   * @param {string} packageName
   * @param {string} version
   * @returns {Object}
   */
  injectDependency(packageJson, packageName, version = 'workspace:*') {
    const pkg = { ...packageJson };
    if (!pkg.dependencies) pkg.dependencies = {};
    pkg.dependencies[packageName] = version;
    return pkg;
  }
}

export default ASTInjector;
