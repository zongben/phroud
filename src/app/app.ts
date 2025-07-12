import express, { Router, ErrorRequestHandler } from "express";
import "reflect-metadata";
import { Container } from "inversify";
import { AppOptions } from "./app-options";
import { Env, IEnv } from "./env";
import { Logger } from "./logger";
import {
  APP_TYPES,
  ExceptionHandler,
  NotFoundHandler,
  PhroudMiddleware,
} from "./types";
import http from "http";
import { Socket } from "net";
import cors from "cors";
import bodyParser from "body-parser";
import { CONTROLLER_METADATA } from "../controller/decorator/controller.decorator";
import {
  ROUTE_METADATA_KEY,
  RouteDefinition,
} from "../controller/decorator/route.decorator";
import { ILogger } from "../logger";
import { IReqHandler } from "../mediator/interfaces/req-handler.interface";
import { MediatorModule } from "../mediator/mediator.module";
import { MediatorPipe } from "../mediator/mediator-pipe";
import { Module } from "./module";

export class App {
  private _app: express.Application;
  private _server?: http.Server;
  private _connections: Set<Socket>;
  private _exceptionHandler?: ExceptionHandler;
  private _notFoundHandler?: NotFoundHandler;
  logger: ILogger;
  env!: Env;
  serviceContainer: Container;
  options: AppOptions;

  private constructor(options: AppOptions) {
    this.options = options;
    this._app = express();
    this._connections = new Set<Socket>();
    this.logger = new Logger();
    this.serviceContainer = new Container(this.options.container);
    this.options.allowAnonymousPath = this.options.allowAnonymousPath.map(
      (p) => {
        return {
          path: `${this.options.routerPrefix}${p.path}`.toLowerCase(),
          method: p.method.toUpperCase(),
        };
      },
    );
    this._bindLogger();
  }

  static createBuilder(fn: (options: AppOptions) => void = () => {}) {
    const options = new AppOptions();
    fn(options);
    return new App(options);
  }

  useDotEnv(path: string) {
    this.env = new Env(path);
    this.serviceContainer.bind<IEnv>(APP_TYPES.IEnv).toConstantValue(this.env);
    this.logger.info(`Dotenv is loaded from ${path}`);
  }

  useLogger(logger: ILogger) {
    this.logger = logger;
    this._bindLogger();
  }

  useMediator(
    handlers: Array<new (...args: any[]) => IReqHandler<any, any>>,
    pipeline?: {
      pre?: MediatorPipe[];
      post?: MediatorPipe[];
    },
  ) {
    this.serviceContainer.load(
      new MediatorModule(this.serviceContainer, handlers, pipeline).getModule(),
    );
    return this;
  }

  loadModules(...modules: Module[]) {
    this.serviceContainer.load(
      ...modules.map((m) => {
        return m.getModule();
      }),
    );
    return this;
  }

  mapController(controllers: Array<new (...args: any[]) => any>) {
    controllers.forEach((ControllerClass) => {
      const controllerPath: string = Reflect.getMetadata(
        CONTROLLER_METADATA.PATH,
        ControllerClass,
      );
      const classMiddleware: PhroudMiddleware[] =
        Reflect.getMetadata(CONTROLLER_METADATA.MIDDLEWARE, ControllerClass) ||
        [];

      const instance = this.serviceContainer.resolve(ControllerClass);
      const routes: RouteDefinition[] =
        Reflect.getMetadata(ROUTE_METADATA_KEY, ControllerClass) || [];

      const router = Router();
      for (const route of routes) {
        const handler = instance[route.handlerName].bind(instance);
        const middleware = route.middleware || [];
        (router as any)[route.method](
          route.path,
          ...[...classMiddleware, ...middleware],
          handler,
        );
      }
      const fullMountPath = `${this.options.routerPrefix}/${controllerPath}`
        .replace(/\/+/g, "/")
        .toLowerCase();
      this._app.use(fullMountPath, router);
    });

    return this;
  }

  setExceptionHandler(handler: ExceptionHandler) {
    this._exceptionHandler = handler;
  }

  setNotFoundHandler(handler: NotFoundHandler) {
    this._notFoundHandler = handler;
  }

  private _useExceptionMiddleware(): ErrorRequestHandler {
    return (err, req, res, next) => {
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
  }

  private _useNotFoundMiddleware(): PhroudMiddleware {
    return (req, res) => {
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
  }

  useMiddleware(middleware: PhroudMiddleware) {
    this._app.use(middleware);
    return this;
  }

  useAuthGate(handler: PhroudMiddleware) {
    this._app.use((req, res, next) => {
      const isAnonymous = this.options.allowAnonymousPath.some((x) => {
        const methodMatch = new RegExp(x.method).test(req.method);
        const pathMatch = new RegExp(
          "^" + x.path.replace(/\*/g, ".*").replace(/\//g, "\\/"),
          "i",
        ).test(req.path);
        return methodMatch && pathMatch;
      });

      if (isAnonymous) {
        next();
      } else {
        handler(req, res, next);
      }
    });
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
    this._useNotFoundMiddleware();
    this._useExceptionMiddleware();

    this._server = this._app.listen(port, () => {
      this.logger.info(`Listening on port ${port}`);
    });

    this._server.on("connection", (conn) => {
      this._connections.add(conn);
      conn.on("close", () => {
        this._connections.delete(conn);
      });
    });

    process.on("SIGINT", this._gracefulShutdown.bind(this));
    process.on("SIGTERM", this._gracefulShutdown.bind(this));
  }

  private _bindLogger() {
    this.serviceContainer
      .bind<ILogger>(APP_TYPES.ILogger)
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
