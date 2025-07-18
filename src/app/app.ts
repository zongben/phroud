import express, { Router, NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import "reflect-metadata";
import { Container, Newable } from "inversify";
import http from "http";
import { Socket } from "net";
import cors from "cors";
import bodyParser from "body-parser";
import onFinished from "on-finished";
import { ILogger } from "../logger";
import {
  EmpackExceptionMiddleware,
  EmpackMiddleware,
  IEnv,
} from "./interfaces";
import {
  IPublisherSymbol,
  ISenderSymbol,
  Mediator,
  MediatorPipe,
  MEDIATOR_KEY,
} from "../mediator";
import {
  EmpackExceptionMiddlewareFunction,
  EmpackMiddlewareFunction,
  ExceptionHandler,
  NotFoundHandler,
  TimerHanlder,
} from "./types";
import {
  ANONYMOUS_KEY,
  CONTROLLER_METADATA,
  ROUTE_METADATA_KEY,
  RouteDefinition,
} from "../controller";
import { Timer, timerStorage } from "../utils";
import { IEnvSymbol, ILoggerSymbol } from "./symbols";
import { Module } from "../di";
import { EventMap, MediatorMap } from "../mediator/types";

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

function isAnonymous(prototype: any, methodName: string) {
  if (Reflect.hasMetadata(ANONYMOUS_KEY, prototype.constructor)) {
    return true;
  }
  if (Reflect.hasMetadata(ANONYMOUS_KEY, prototype, methodName)) {
    return true;
  }
  return false;
}

function asyncMiddlewareWrapper(
  container: Container,
  middleware: Newable<EmpackMiddleware> | EmpackMiddlewareFunction,
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const fn = await resolveMiddleware(container, middleware);
      await fn(req, res, next);
    } catch (err) {
      next(err);
    }
  };
}

function executeMiddleware(
  fn: EmpackMiddlewareFunction,
  req: Request,
  res: Response,
): Promise<void> {
  return new Promise((resolve, reject) => {
    fn(req, res, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

class Env implements IEnv {
  private _env;

  constructor(path: string) {
    dotenv.config({ path });
    this._env = process.env;
  }

  get(key: string): any {
    const value = this._env[key];
    if (!value) {
      throw new Error(`Environment variable ${key} is not defined`);
    }
    return value;
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
  setTimeout?: number;
}

export class App {
  private _app: express.Application;
  private _server?: http.Server;
  private _connections: Set<Socket>;
  private _exceptionHandler?: ExceptionHandler;
  private _notFoundHandler?: NotFoundHandler;
  private _authGuard?: EmpackMiddlewareFunction;
  private _preRequestScope = new Map<symbol, Newable>();
  private _mediatorMap: MediatorMap = new Map();
  private _eventMap: EventMap = new Map();
  private _mediatorPipeLine?: {
    pre?: Newable<MediatorPipe>[];
    post?: Newable<MediatorPipe>[];
  };
  logger: ILogger;
  env!: IEnv;
  serviceContainer: Container;
  options: AppOptions;

  private constructor(options: AppOptions) {
    this.options = options;
    this._app = express();
    this._connections = new Set<Socket>();
    this.logger = new Logger();
    this.serviceContainer = new Container({
      autobind: true,
    });
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
    this._preRequestScope.set(type, constructor);
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

    // TODO: efficiency concern
    for (const [symbol, ctor] of this._preRequestScope) {
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
        const handler = async (
          req: Request,
          res: Response,
          next: NextFunction,
        ) => {
          const childContainer = this._createRequestContainer();
          const instance = await childContainer.getAsync(ControllerClass);

          for (const m of [...classMiddleware, ...(route.middleware ?? [])]) {
            const fn = await resolveMiddleware(childContainer, m);
            await executeMiddleware(fn, req, res);
          }
          await instance[route.handlerName](req, res, next);
        };

        const guard: EmpackMiddlewareFunction = async (req, res, next) => {
          if (
            this._authGuard &&
            !isAnonymous(ControllerClass.prototype, route.handlerName)
          ) {
            return this._authGuard(req, res, next);
          }
          next();
        };

        router[route.method](route.path, guard, handler);
      }

      const fullMountPath = `${this.options.routerPrefix}/${controllerPath}`
        .replace(/\/+/g, "/")
        .toLowerCase();

      this.logger.debug(`${ControllerClass.name} Mounted at ${fullMountPath}`);
      this._app.use(fullMountPath, router);
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

  useTimerMiddleware(handler: TimerHanlder) {
    this.useMiddleware(
      async (req: Request, res: Response, next: NextFunction) => {
        const timer = Timer.create();
        const start = performance.now();

        onFinished(res, () => {
          const end = performance.now();
          const duration = end - start;
          handler(duration, timer.getAllTimeSpans(), req, res);
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
    middleware:
      | EmpackMiddlewareFunction
      | EmpackMiddleware
      | EmpackExceptionMiddlewareFunction
      | EmpackExceptionMiddleware,
  ) {
    if (typeof middleware == "function") {
      this._app.use(middleware);
    } else {
      this._app.use(middleware.use);
    }
    return this;
  }

  setAuthGuard(guard: EmpackMiddlewareFunction | Newable<EmpackMiddleware>) {
    this._authGuard = asyncMiddlewareWrapper(this.serviceContainer, guard);
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

    this._server = this._app.listen(port, () => {
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
