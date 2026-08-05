import { ServiceProvider, ECFError } from "@ecfjs/core";

export class ViewError extends ECFError {}

export class ViewFinder {
    constructor(paths?: string[]);
    addPath(path: string): void;
    find(viewName: string): string;
}

export class ViewCompiler {
    compile(templateSource: string): any;
}

export class ViewEngine {
    render(viewName: string, data?: Record<string, any>): string;
    renderString(source: string, data?: Record<string, any>): string;
    directive(name: string, handler: Function): void;
}

export class ViewManager {
    render(viewName: string, data?: Record<string, any>): string;
    share(key: string | Record<string, any>, value?: any): void;
    composer(views: string | string[], callback: Function): void;
    directive(name: string, handler: Function): void;
}

export class ViewServiceProvider extends ServiceProvider {}
export const View: ViewEngine;
