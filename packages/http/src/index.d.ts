import type { ServiceProvider, ECFError } from "@ecfjs/core";
export { Application, Container, ServiceProvider, Facade, LoggerServiceProvider, CoreServiceProvider, ConfigManager, ConfigError, ContainerError, ECFError, ExceptionManager, Log } from "@ecfjs/core";

export class Request {
    constructor(incomingMessage: any, bodyParserManager: any);
    raw: any;
    method: string;
    url: string;
    path: string;
    query(key?: string, defaultValue?: any): any;
    input(key?: string, defaultValue?: any): Promise<any>;
    all(): Promise<Record<string, any>>;
    filled(key: string): Promise<boolean>;
    boolean(key: string, defaultValue?: boolean): Promise<boolean>;
    integer(key: string, defaultValue?: number): number;
    header(name: string): string | undefined;
    expectsJson(): boolean;
    validate(rules: Record<string, any>, customMessages?: Record<string, string>, customAttributes?: Record<string, string>): Promise<Record<string, any>>;
}

export class Response {
    constructor(serverResponse?: any);
    status(code: number): this;
    header(name: string, value: string): this;
    json(data: any): this;
    send(body?: any): this;
    view(viewName: string, data?: any): this;
    redirect(url: string, status?: number): this;
}

export class Route {
    static get(path: string, ...handlers: any[]): Route;
    static post(path: string, ...handlers: any[]): Route;
    static put(path: string, ...handlers: any[]): Route;
    static patch(path: string, ...handlers: any[]): Route;
    static delete(path: string, ...handlers: any[]): Route;
    static any(path: string, ...handlers: any[]): Route;
    static match(methods: string[], path: string, ...handlers: any[]): Route;
    static group(attributes: any, callback: Function): void;
    static fallback(...handlers: any[]): Route;
    static url(name: string, params?: Record<string, any>): string;

    name(name: string): this;
    where(param: string, regex: RegExp | string): this;
}

export class Router {}
export class Pipeline {}
export class Middleware {
    handle(req: Request, res: Response, next: Function): any;
}
export class HttpKernel {
    handle(req: any, res: any): Promise<any>;
}
export class HttpServer {
    listen(port: number | string, callback?: Function): this;
}
export class HttpServiceProvider extends ServiceProvider {}
export class HttpExceptionHandler {}
export class MiddlewareRegistry {}
export class BodyParserManager {}
export class BodyParser {}
export class JsonBodyParser extends BodyParser {}
export class FormBodyParser extends BodyParser {}
export class TextBodyParser extends BodyParser {}
export class RawBodyParser extends BodyParser {}

export class ExceptionHandler {}
export class ExceptionRenderer {}
export class ExceptionReporter {}

export class HttpException extends ECFError {
    statusCode: number;
    constructor(statusCode?: number, message?: string, headers?: any, cause?: any, context?: any);
}
export class BadRequestException extends HttpException {}
export class UnauthorizedException extends HttpException {}
export class ForbiddenException extends HttpException {}
export class NotFoundException extends HttpException {}
export class MethodNotAllowedException extends HttpException {}
export class CsrfException extends HttpException {}
export class ValidationException extends HttpException {
    errors: Record<string, any>;
    static withErrors(errors: any, message?: string): ValidationException;
}
export class RateLimitException extends HttpException {}
export class InternalServerException extends HttpException {}
export class ServiceUnavailableException extends HttpException {}

export class RequestError extends ECFError {}
export class ResponseError extends ECFError {}
export class RouterError extends ECFError {}
export class RouteError extends ECFError {}
export class PipelineError extends ECFError {}
export class HttpKernelError extends ECFError {}
export class HttpServerError extends ECFError {}
export class MiddlewareRegistryError extends ECFError {}
export class HttpExceptionHandlerError extends ECFError {}
export class RouteNotFoundError extends ECFError {}
export class BodyParserError extends ECFError {}
export class InvalidJsonError extends ECFError {}
export class PayloadTooLargeError extends ECFError {}
