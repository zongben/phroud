import "reflect-metadata";
import { Container } from "inversify";
import cors from "cors";
import bodyParser from "body-parser";
import { ILogger } from "../../logger";
import { AppOptions } from "../_internal";
import { IEnv } from "./interfaces";
import { IReqHandler, MediatorPipe } from "../../mediator";
import { ExceptionHandler, ExpressMiddleware, NotFoundHandler, TimerHanlder } from "./types";
import { Module } from "../../di";
export declare class App {
    private _app;
    private _server?;
    private _connections;
    private _exceptionHandler?;
    private _notFoundHandler?;
    private _authGuard?;
    logger: ILogger;
    env: IEnv;
    serviceContainer: Container;
    options: AppOptions;
    private constructor();
    static createBuilder(fn?: (options: AppOptions) => void): App;
    setDotEnv(path: string): this;
    setLogger(logger: ILogger): this;
    setMediator(handlers: Array<new (...args: any[]) => IReqHandler<any, any>>, pipeline?: {
        pre?: MediatorPipe[];
        post?: MediatorPipe[];
    }): this;
    loadModules(...modules: Module[]): this;
    mapController(controllers: Array<new (...args: any[]) => any>): this;
    setExceptionHandler(handler: ExceptionHandler): this;
    setNotFoundHandler(handler: NotFoundHandler): this;
    useTimerMiddleware(handler: TimerHanlder): this;
    private _useExceptionMiddleware;
    private _useNotFoundMiddleware;
    useMiddleware(middleware: ExpressMiddleware): this;
    setAuthGuard(guard: ExpressMiddleware): this;
    useJsonParser(options?: bodyParser.OptionsJson): this;
    useUrlEncodedParser(options?: bodyParser.OptionsUrlencoded): this;
    useCors(options: cors.CorsOptions): this;
    addHeaders(headers: Record<string, string>): this;
    run(port?: number): void;
    private _bindLogger;
    private _gracefulShutdown;
}
//# sourceMappingURL=app.d.ts.map