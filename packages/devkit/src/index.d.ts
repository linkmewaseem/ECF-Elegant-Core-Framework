import { IDevKitManager, ICodeGenerator, IASTInjector, IArchitectureValidator } from '@ecfjs/contracts';

export class DevKitManager extends IDevKitManager {
  make(generatorName: string, targetName: string, options?: any): Promise<any>;
  blueprint(blueprintData: any, options?: any): Promise<any[]>;
  scaffoldProject(appName: string, preset?: string): Promise<any>;
  scaffoldPackage(packageName: string, baseDir?: string): Promise<any>;
  validatePackage(packagePath: string): any;
  installPackage(packageName: string, options?: any): Promise<any>;
  validateArchitecture(projectPath?: string): any;
  inspectProject(projectPath?: string): any;
  publishStubs(targetDir?: string): any;
  undo(): any;
  doctor(): any;
  upgrade(options?: any): Promise<any>;
}

export const DevKit: DevKitManager;
export const DevKitFacade: DevKitManager;
export default DevKitFacade;
