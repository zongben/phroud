"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.App = void 0;
const express_1 = __importStar(require("express"));
require("reflect-metadata");
const inversify_1 = require("inversify");
const cors_1 = __importDefault(require("cors"));
const on_finished_1 = __importDefault(require("on-finished"));
const _1 = require(".");
const _internal_1 = require("../_internal");
const _internal_2 = require("../../mediator/_internal");
const _internal_3 = require("../../controller/_internal");
const utils_1 = require("../../utils");
const _internal_4 = require("../../utils/_internal");
class App {
    constructor(options) {
        this._useExceptionMiddleware = (err, req, res, next) => {
            if (res.headersSent)
                return next(err);
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
            res.status(statusCode !== null && statusCode !== void 0 ? statusCode : 500).json(result !== null && result !== void 0 ? result : "Internal Server Error");
        };
        this._useNotFoundMiddleware = (req, res) => {
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
            res.status(statusCode !== null && statusCode !== void 0 ? statusCode : 404).json(result !== null && result !== void 0 ? result : "Not Found");
        };
        this.options = options;
        this._app = (0, express_1.default)();
        this._connections = new Set();
        this.logger = new _internal_1.Logger();
        this.serviceContainer = new inversify_1.Container({
            autoBindInjectable: true,
        });
        this._bindLogger();
    }
    static createBuilder(fn = () => { }) {
        const options = new _internal_1.AppOptions();
        fn(options);
        return new App(options);
    }
    setDotEnv(path) {
        this.env = new _internal_1.Env(path);
        this.serviceContainer.bind(_1.APP_TYPES.IEnv).toConstantValue(this.env);
        this.logger.info(`Dotenv is loaded from ${path}`);
        return this;
    }
    setLogger(logger) {
        this.logger = logger;
        this._bindLogger();
        return this;
    }
    setMediator(handlers, pipeline) {
        this.serviceContainer.load(new _internal_2.MediatorModule(this.serviceContainer, handlers, pipeline).getModule());
        return this;
    }
    loadModules(...modules) {
        this.serviceContainer.load(...modules.map((m) => {
            return m.getModule();
        }));
        return this;
    }
    mapController(controllers) {
        controllers.forEach((ControllerClass) => {
            const controllerPath = Reflect.getMetadata(_internal_3.CONTROLLER_METADATA.PATH, ControllerClass);
            const classMiddleware = Reflect.getMetadata(_internal_3.CONTROLLER_METADATA.MIDDLEWARE, ControllerClass) ||
                [];
            const instance = this.serviceContainer.resolve(ControllerClass);
            const routes = Reflect.getMetadata(_internal_3.ROUTE_METADATA_KEY, ControllerClass) || [];
            const router = (0, express_1.Router)({ mergeParams: true });
            for (const route of routes) {
                let guard = (_req, _res, next) => {
                    next();
                };
                if (this._authGuard &&
                    !(0, _internal_3.isAnonymous)(ControllerClass.prototype, route.handlerName)) {
                    guard = this._authGuard;
                }
                const handler = instance[route.handlerName].bind(instance);
                const middleware = route.middleware || [];
                router[route.method](route.path, guard, ...classMiddleware, ...middleware, handler);
            }
            const fullMountPath = `${this.options.routerPrefix}/${controllerPath}`
                .replace(/\/+/g, "/")
                .toLowerCase();
            this.logger.debug(`${ControllerClass.name} Mounted at ${fullMountPath}`);
            this._app.use(fullMountPath, router);
        });
        return this;
    }
    setExceptionHandler(handler) {
        this._exceptionHandler = handler;
        return this;
    }
    setNotFoundHandler(handler) {
        this._notFoundHandler = handler;
        return this;
    }
    useTimerMiddleware(handler) {
        this.useMiddleware((req, res, next) => {
            const timer = utils_1.Timer.create();
            const start = performance.now();
            (0, on_finished_1.default)(res, () => {
                const end = performance.now();
                const duration = end - start;
                handler(duration, timer.getAllTimeSpans(), req, res);
            });
            _internal_4.timerStorage.run(timer, () => {
                next();
            });
        });
        return this;
    }
    useMiddleware(middleware) {
        this._app.use(middleware);
        return this;
    }
    setAuthGuard(guard) {
        this._authGuard = guard;
        return this;
    }
    useJsonParser(options) {
        this._app.use(express_1.default.json(options));
        return this;
    }
    useUrlEncodedParser(options) {
        this._app.use(express_1.default.urlencoded(options));
        return this;
    }
    useCors(options) {
        this._app.use((0, cors_1.default)(options));
        return this;
    }
    addHeaders(headers) {
        this._app.use((_req, res, next) => {
            for (const [key, value] of Object.entries(headers)) {
                res.setHeader(key, value);
            }
            next();
        });
        return this;
    }
    run(port = 3000) {
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
        process.on("SIGINT", this._gracefulShutdown.bind(this));
        process.on("SIGTERM", this._gracefulShutdown.bind(this));
    }
    _bindLogger() {
        this.serviceContainer
            .bind(_1.APP_TYPES.ILogger)
            .toConstantValue(this.logger);
    }
    _gracefulShutdown() {
        var _a;
        this.logger.info("Starting graceful shutdown...");
        (_a = this._server) === null || _a === void 0 ? void 0 : _a.close(() => {
            this.logger.info("Closed server, exiting process.");
            setTimeout(() => {
                process.exit(0);
            }, 1000);
        });
        setTimeout(() => {
            this.logger.info("Forcing close of connections...");
            this._connections.forEach((conn) => conn.destroy());
        }, 30000);
    }
}
exports.App = App;
//# sourceMappingURL=app.js.map