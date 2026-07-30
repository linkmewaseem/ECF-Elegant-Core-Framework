export class Container {
    bind(name: string, factory: Function): void;
    singleton(name: string, factory: Function): void;
    has(name: string): boolean;
    make(name: string): any;
    alias(name: string, aliasClass: any): void;
}

export class Application extends Container {
    constructor();
    register(providerClass: any): this;
    boot(): this;
    use(middleware: any): this;
    listen(port: number | string, callback?: Function): any;
}

export class ServiceProvider {
    app: Application;
    register(app?: Application): void;
    boot(app?: Application): void;
}

export class Facade {
    static app: Application | null;
    static setApplication(app: Application): void;
    static accessor(): string;
    static getRoot(): any;
    static create(FacadeClass: any): any;
}

export class ECFError extends Error {
    cause?: any;
    context?: any;
    constructor(message?: string, cause?: any, context?: any);
}

export class ContainerError extends ECFError {}
export class ConfigError extends ECFError {}
export class LoggerError extends ECFError {}
export class EventError extends ECFError {}
export class EnvError extends ECFError {}
export class ExceptionManagerError extends ECFError {}
export class ViewContractError extends ECFError {}

export class ViewContract {
    render(view: string, data?: any): string;
}

export class ConfigManager {
    get(key: string, defaultValue?: any): any;
    set(key: string, value: any): this;
    has(key: string): boolean;
}

export class ConfigServiceProvider extends ServiceProvider {}
export const Config: ConfigManager;

export class LoggerManager {
    info(message: string, context?: any): void;
    warning(message: string, context?: any): void;
    error(message: string, context?: any): void;
    critical(message: string, context?: any): void;
    debug(message: string, context?: any): void;
}

export class LoggerServiceProvider extends ServiceProvider {}
export const Log: LoggerManager;

export class Transport {}
export class ConsoleTransport extends Transport {}

export class EventManager {
    listen(event: string, listener: Function): void;
    dispatch(event: string, payload?: any): any[];
    has(event: string): boolean;
    forget(event: string): void;
    clear(): void;
}

export class EventServiceProvider extends ServiceProvider {}
export const Event: EventManager;

export class EnvManager {
    get(key: string, defaultValue?: any): any;
    set(key: string, value: any): this;
    has(key: string): boolean;
    all(): Record<string, any>;
    clear(): void;
}

export class DotEnvLoader {
    static load(filePath: string): Record<string, any>;
}

export class EnvironmentServiceProvider extends ServiceProvider {}
export const Env: EnvManager;

export class ExceptionManager {
    render(errorClass: any, handler: Function): this;
    report(errorClass: any, handler: Function): this;
}

export class CoreServiceProvider extends ServiceProvider {}
export class DatabaseServiceProvider extends ServiceProvider {}
export const DB: any;
