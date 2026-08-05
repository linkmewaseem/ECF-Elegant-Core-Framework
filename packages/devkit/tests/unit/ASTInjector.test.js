import { describe, it } from 'node:test';
import assert from 'node:assert';
import { ASTInjector } from '../../src/index.js';

describe('ASTInjector Unit Tests', () => {
  it('should inject Service Providers into config content', () => {
    const injector = new ASTInjector();
    const configContent = `export default { providers: [ CoreServiceProvider ] };`;
    const updated = injector.injectProvider(configContent, 'AuthServiceProvider');

    assert.ok(updated.includes('import { AuthServiceProvider }'));
    assert.ok(updated.includes('AuthServiceProvider,'));
  });

  it('should inject route definitions and environment variables', () => {
    const injector = new ASTInjector();
    const routeContent = `import { Router } from '@ecfjs/http';`;
    const updatedRoutes = injector.injectRoute(routeContent, `Router.get('/test', () => 'OK');`);

    assert.ok(updatedRoutes.includes("Router.get('/test', () => 'OK');"));

    const envContent = `APP_NAME=ECF\n`;
    const updatedEnv = injector.injectEnv(envContent, 'LOG_CHANNEL', 'stack');
    assert.ok(updatedEnv.includes('LOG_CHANNEL=stack'));
  });
});
