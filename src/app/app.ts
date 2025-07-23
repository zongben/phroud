import express, { Router, NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import "reflect-metadata";
import { Container, Newable } from "inversify";
import http, { IncomingMessage } from "http";
import { WebSocket, WebSocketServer } from "ws";
import { Socket } from "net";
import cors from "cors";
import bodyParser from "body-parser";
import onFinished from "on-finished";
import {
  IPublisherSymbol,
  ISenderSymbol,
  Mediator,
  MediatorPipe,
} from "../mediator/index";
import {
  EmpackExceptionMiddlewareFunction,
  EmpackMiddlewareFunction,
  ExceptionHandler,
  NotFoundHandler,
  TimerHanlder,
  WsAuthResult,
} from "./types/index";
import {
  CONTROLLER_METADATA,
  GUARD_KEY,
  GuardDefinition,
  ROUTE_METADATA_KEY,
  RouteDefinition,
  WebSocketContext,
  WSCONTROLLER_METADATA,
} from "../controller/index";
import { Timer, timerStorage } from "../utils/index";
import { IEnvSymbol, ILoggerSymbol } from "./symbols/index";
import { Module } from "../di/index";
import { EventMap, MediatorMap } from "../mediator/types/index";
import { IWebSocket } from "../controller/interfaces/index";
import { EmpackMiddleware, IEnv } from "./interfaces/index";
import { ILogger } from "../logger/index";
import { MEDIATOR_KEY } from "../mediator/mediator";
import { match } from "path-to-regexp";

function withWsErrorHandler<T extends (...args: any[]) => Promise<any> | any>(
  handler: T,
  errorHandler: (err: unknown) => Promise<void> | void,
): (...args: Parameters<T>) => Promise<void> {
  return async (...args) => {
    try {
      await handler(...args);
    } catch (err) {
      await errorHandler(err);
    }
  };
}

async function resolveMiddleware(
  container: Container,
  middleware: Newable<EmpackMiddleware> | EmpackMiddlewareFunction,
): Promise<EmpackMiddlewareFunction> {
  if (middleware.prototype) {
    const instance = await container.getAsync(
      middleware as Newable<EmpackMiddleware>,
    );
    return instance.use.bind(instance);
  }
  return middleware as EmpackMiddlewareFunction;
}

class Env implements IEnv {
  private _env;

  constructor(path: string) {
    dotenv.config({ path });
    this._env = process.env;
  }

  get(key: string): string {
    const value = this._env[key];
    if (!value) {
      throw new Error(`Environment variable ${key} is not defined`);
    }
    return value;
  }

  getOptional(key: string): string | undefined {
    return this._env[key];
  }
}

class Logger implements ILogger {
  error(err: Error) {
    console.error(err.stack || err.message);
  }

  warn(message: string) {
    console.warn(message);
  }

  info(message: string) {
    console.info(message);
  }

  debug(message: string) {
    console.debug(message);
  }
}

export class AppOptions {
  routerPrefix: string = "/api";
  wsPrefix: string = "";
  setTimeout?: number;
}

export class WsOptions {
  authHandler?: (req: IncomingMessage) => Promise<WsAuthResult> | WsAuthResult;
  onError?: (
    err: any,
    ws: WebSocket,
    req: IncomingMessage,
  ) => void | Promise<void>;
}

export class App {
  private _app: express.Application;
  private _server: http.Server;
  private _connections: Set<Socket>;
  private _exceptionHandler?: ExceptionHandler;
  private _notFoundHandler?: NotFoundHandler;
  private _requestScopeObjects: Map<symbol, Newable>;
  private _mediatorMap: MediatorMap = new Map();
  private _eventMap: EventMap = new Map();
  private _mediatorPipeLine?: {
    pre?: Newable<MediatorPipe>[];
    post?: Newable<MediatorPipe>[];
  };
  private _isAuthGuardEnabled: boolean;
  logger: ILogger;
  env!: IEnv;
  serviceContainer: Container;
  options: AppOptions;

  private constructor(options: AppOptions) {
    this.options = options;
    this._app = express();
    this._isAuthGuardEnabled = false;
    this._connections = new Set<Socket>();
    this.logger = new Logger();
    this.serviceContainer = new Container({
      autobind: true,
    });
    this._requestScopeObjects = new Map();
    this._server = http.createServer(this._app);
    this._bindLogger();
  }

  static createBuilder(fn: (options: AppOptions) => void = () => {}) {
    const options = new AppOptions();
    fn(options);
    return new App(options);
  }

  addSingletonScope(type: symbol, constructor: Newable) {
    this.serviceContainer.bind(type).to(constructor).inSingletonScope();
    return this;
  }

  addRequestScope(type: symbol, constructor: Newable) {
    this._requestScopeObjects.set(type, constructor);
    return this;
  }

  addTransientScope(type: symbol, constructor: Newable) {
    this.serviceContainer.bind(type).to(constructor).inTransientScope();
    return this;
  }

  addConstant(types: symbol, instance: any) {
    this.serviceContainer.bind(types).toConstantValue(instance);
    return this;
  }

  setDotEnv(path: string) {
    this.env = new Env(path);
    this.serviceContainer.bind<IEnv>(IEnvSymbol).toConstantValue(this.env);
    this.logger.info(`Dotenv is loaded from ${path}`);
    return this;
  }

  setLogger(logger: ILogger) {
    this.logger = logger;
    this._bindLogger();
    return this;
  }

  private _createRequestContainer(): Container {
    const child = new Container({
      parent: this.serviceContainer,
      autobind: true,
    });

    for (const [symbol, ctor] of this._requestScopeObjects) {
      child.bind(symbol).to(ctor).inSingletonScope();
    }

    const mediator = new Mediator(
      child,
      this._mediatorMap,
      this._eventMap,
      this._mediatorPipeLine,
    );
    child.bind(ISenderSymbol).toConstantValue(mediator);
    child.bind(IPublisherSymbol).toConstantValue(mediator);

    return child;
  }

  setMediator(
    handlers: Newable[],
    pipeline?: {
      pre?: Newable<MediatorPipe>[];
      post?: Newable<MediatorPipe>[];
    },
  ) {
    loop: for (const handler of handlers) {
      const reqKey = Reflect.getMetadata(MEDIATOR_KEY.handlerFor, handler);
      if (reqKey) {
        this._mediatorMap.set(reqKey, handler);
        continue loop;
      }
      const eventKey = Reflect.getMetadata(MEDIATOR_KEY.subscribe, handler);
      if (eventKey) {
        const events = this._eventMap.get(eventKey) ?? [];
        events.push(handler);
        this._eventMap.set(eventKey, events);
        continue loop;
      }
      throw new Error(
        `Handler ${handler.name} is missing @HandlerFor or @Subscribe`,
      );
    }
    if (pipeline) {
      this._mediatorPipeLine = pipeline;
    }
    return this;
  }

  loadModules(...modules: Module[]) {
    for (const mod of modules) {
      mod.loadModule();

      for (const entry of mod.getBindings()) {
        const { type, constructor, scope } = entry;
        switch (scope) {
          case "singleton":
            this.addSingletonScope(type, constructor);
            break;
          case "request":
            this.addRequestScope(type, constructor);
            break;
          case "transient":
            this.addTransientScope(type, constructor);
            break;
          case "constant":
            this.addConstant(type, constructor);
            break;
        }
      }
    }
    return this;
  }

  mapController(controllers: Newable<any>[]) {
    const createRequestScopeContainer: EmpackMiddlewareFunction = (
      req: any,
      _res,
      next,
    ) => {
      req._container = this._createRequestContainer();
      next();
    };

    controllers.forEach((ControllerClass) => {
      const controllerPath: string = Reflect.getMetadata(
        CONTROLLER_METADATA.PATH,
        ControllerClass,
      );

      if (!controllerPath) {
        throw new Error(
          `Controller ${ControllerClass.name} is missing @Controller decorator`,
        );
      }

      const classMiddleware:
        | Newable<EmpackMiddleware>[]
        | EmpackMiddlewareFunction[] =
        Reflect.getMetadata(CONTROLLER_METADATA.MIDDLEWARE, ControllerClass) ||
        [];

      const routes: RouteDefinition[] =
        Reflect.getMetadata(ROUTE_METADATA_KEY, ControllerClass) || [];

      const router = Router({ mergeParams: true });

      for (const route of routes) {
        let guardMiddleware:
          | EmpackMiddlewareFunction
          | Newable<EmpackMiddleware> = (_req, _res, next) => {
          next();
        };
        if (this._isAuthGuardEnabled) {
          const methodGuard = Reflect.getMetadata(
            GUARD_KEY,
            ControllerClass.prototype,
            route.handlerName,
          );
          const classGuard = Reflect.getMetadata(GUARD_KEY, ControllerClass);
          const guard: GuardDefinition = methodGuard ?? classGuard;
          if (!guard) {
            throw new Error(
              `AuthGuard is enabled, ${ControllerClass.name} or ${ControllerClass.name}.${route.handlerName} must define a @Guard decorator`,
            );
          }
          if (guard !== "none") {
            guardMiddleware = guard;
          }
        }

        const middlewares = [
          guardMiddleware,
          ...classMiddleware,
          ...(route.middleware ?? []),
        ].map((m) => {
          return (req: any, res: any, next: any) => {
            resolveMiddleware(req._container, m)
              .then((fn) => fn(req, res, next))
              .catch(next);
          };
        });

        const handler = async (req: any, res: Response, next: NextFunction) => {
          try {
            const instance = await req._container.getAsync(ControllerClass);
            await instance[route.handlerName](req, res, next);
          } catch (err) {
            next(err);
          }
        };

        router[route.method](
          route.path,
          createRequestScopeContainer,
          ...middlewares,
          handler,
        );
      }

      const fullMountPath = `${this.options.routerPrefix}/${controllerPath}`
        .replace(/\/+/g, "/")
        .toLowerCase();

      this.logger.debug(`${ControllerClass.name} Mounted at ${fullMountPath}`);
      this._app.use(fullMountPath, router);
    });

    return this;
  }

  enableWebSocket(
    controllers: Newable<IWebSocket>[],
    fn?: (opt: WsOptions) => void,
  ) {
    const wsMap = new Map<string, Newable<IWebSocket>>();
    for (const c of controllers) {
      const path = Reflect.getMetadata(WSCONTROLLER_METADATA.PATH, c);
      if (!path)
        throw new Error(`${c.name} is missing @WsController Decorator`);
      wsMap.set(path, c);
    }

    const options = new WsOptions();
    if (fn) fn(options);

    const wss = new WebSocketServer({ server: this._server });

    const errorHandler = async (
      err: any,
      ws: WebSocket,
      req: IncomingMessage,
    ) => {
      this.logger.error(err);
      if (options.onError) await options.onError(err, ws, req);
      if (ws.readyState === WebSocket.OPEN)
        ws.close(1011, "Internal Server Error");
    };

    wss.on("connection", (ws, req) => {
      ws.on("error", (err) => {
        this.logger.error(err);
        ws.close(1011, "Internal Server Error");
      });

      const handleConnection = async () => {
        const { pathname, searchParams } = new URL(req.url!, `ws://localhost`);
        const auth = options.authHandler
          ? await options.authHandler(req)
          : true;
        if (auth !== true) {
          ws.close(auth.code, auth.reason);
          return;
        }

        let ctor: Newable<IWebSocket> | undefined;
        let pathParams: any;
        for (const [pattern, c] of wsMap) {
          const result = match(pattern)(pathname);
          if (result) {
            ctor = c;
            pathParams = result.params;
            break;
          }
        }
        if (!ctor)
          throw new Error(`${pathname} is not a valid websocket route`);

        const instance = await this._createRequestContainer().getAsync(ctor);
        const { onMessage, onClose, onConnected } = instance;
        const ctx: WebSocketContext = {
          req,
          pathParams,
          queryParams: searchParams,
          send: (data) => ws.send(data),
          close: (code, reason) => ws.close(code, reason),
        };
        if (onConnected) {
          withWsErrorHandler(onConnected.bind(instance, ctx), (err) =>
            errorHandler(err, ws, req),
          )();
        }
        if (onMessage) {
          ws.on(
            "message",
            withWsErrorHandler(onMessage.bind(instance, ctx), (err) =>
              errorHandler(err, ws, req),
            ),
          );
        }
        if (onClose) {
          ws.on(
            "close",
            withWsErrorHandler(onClose.bind(instance, ctx), (err) =>
              errorHandler(err, ws, req),
            ),
          );
        }
      };

      withWsErrorHandler(handleConnection, (err) =>
        errorHandler(err, ws, req),
      )();
    });

    return this;
  }

  setExceptionHandler(handler: ExceptionHandler) {
    this._exceptionHandler = handler;
    return this;
  }

  setNotFoundHandler(handler: NotFoundHandler) {
    this._notFoundHandler = handler;
    return this;
  }

  useTimerMiddleware(handler?: TimerHanlder) {
    this.useMiddleware(
      async (req: Request, res: Response, next: NextFunction) => {
        const timer = Timer.create();
        const start = performance.now();

        onFinished(res, () => {
          const end = performance.now();
          const duration = end - start;
          const ts = timer.getAllTimeSpans();
          if (handler) {
            handler(duration, ts, req, res);
            return;
          }
          let msg = `Request: ${res.statusCode} ${req.method} ${req.originalUrl} - Duration: ${duration.toFixed(2)} ms`;
          const tsMsg = ts.map((span) => {
            const prefix = " ".repeat((span.depth ? span.depth * 3 : 0) + 28);
            return `\n${prefix}⎣__TimeSpan: ${span.duration?.toFixed(2) ?? "N/A"} ms - ${span.label}`;
          });
          msg += tsMsg.join("");
          this.logger.debug(msg);
        });

        timerStorage.run(timer, () => {
          next();
        });
      },
    );
    return this;
  }

  private _useExceptionMiddleware: EmpackExceptionMiddlewareFunction = async (
    err,
    req,
    res,
    next,
  ) => {
    if (res.headersSent) return next(err);
    this.logger.error(err);
    let result;
    let statusCode;
    if (this._exceptionHandler) {
      const handlerResult = this._exceptionHandler(err, req);
      if (handlerResult) {
        result = handlerResult.body;
        statusCode = handlerResult.statusCode;
      }
    }
    res.status(statusCode ?? 500).json(result ?? "Internal Server Error");
  };

  private _useNotFoundMiddleware = async (req: Request, res: Response) => {
    this.logger.warn(`Not found: ${req.method} ${req.originalUrl}`);
    let statusCode;
    let result;
    if (this._notFoundHandler) {
      const handlerResult = this._notFoundHandler(req);
      if (handlerResult) {
        result = handlerResult.body;
        statusCode = handlerResult.statusCode;
      }
    }
    res.status(statusCode ?? 404).json(result ?? "Not Found");
  };

  useMiddleware(
    middleware: EmpackMiddlewareFunction | EmpackExceptionMiddlewareFunction,
  ) {
    this._app.use(middleware);
    return this;
  }

  enableAuthGuard() {
    this._isAuthGuardEnabled = true;
    return this;
  }

  useJsonParser(options?: bodyParser.OptionsJson) {
    this._app.use(express.json(options));
    return this;
  }

  useUrlEncodedParser(options?: bodyParser.OptionsUrlencoded) {
    this._app.use(express.urlencoded(options));
    return this;
  }

  useCors(options: cors.CorsOptions) {
    this._app.use(cors(options));
    return this;
  }

  useStatic(path: string) {
    this._app.use(express.static(path));
    return this;
  }

  addHeaders(headers: Record<string, string>) {
    this._app.use((_req, res, next) => {
      for (const [key, value] of Object.entries(headers)) {
        res.setHeader(key, value);
      }
      next();
    });
    return this;
  }

  run(port: number = 3000) {
    this.useMiddleware(this._useExceptionMiddleware);
    this.useMiddleware(this._useNotFoundMiddleware);

    this._server.listen(port, () => {
      this.logger.info(`Listening on port ${port}`);
    });

    this._server.on("connection", (conn) => {
      this._connections.add(conn);
      conn.on("close", () => {
        this._connections.delete(conn);
      });
    });

    this._server.setTimeout(this.options.setTimeout);

    process.on("SIGINT", this._gracefulShutdown.bind(this));
    process.on("SIGTERM", this._gracefulShutdown.bind(this));
  }

  private _bindLogger() {
    this.serviceContainer
      .rebindSync<ILogger>(ILoggerSymbol)
      .toConstantValue(this.logger);
  }

  private _gracefulShutdown() {
    this.logger.info("Starting graceful shutdown...");

    this._server?.close(() => {
      this.logger.info("Closed server, exiting process.");
      setTimeout(() => {
        process.exit(0);
      }, 1000);
    });

    setTimeout(() => {
      this.logger.info("Forcing close of connections...");
      this._connections.forEach((conn) => conn.destroy());
    }, 30_000);
  }
}
