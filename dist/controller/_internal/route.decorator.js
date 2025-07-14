"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ROUTE_METADATA_KEY = void 0;
exports.applyWithData = applyWithData;
exports.createRouteDecorator = createRouteDecorator;
const _1 = require(".");
const param_decorator_1 = require("./param.decorator");
function applyWithData(res, withData = {}) {
    if (withData.headers) {
        for (const [key, value] of Object.entries(withData.headers)) {
            res.setHeader(key, value);
        }
    }
    if (withData.cookies) {
        for (const cookie of withData.cookies) {
            res.cookie(cookie.key, cookie.value, cookie.options);
        }
    }
}
exports.ROUTE_METADATA_KEY = Symbol("empack:route_metadata");
function createRouteDecorator(method) {
    return (path, ...middleware) => {
        return (target, propertyKey, descriptor) => {
            const original = descriptor.value;
            descriptor.value = function (req, res, next) {
                return __awaiter(this, void 0, void 0, function* () {
                    try {
                        const paramMeta = Reflect.getMetadata(param_decorator_1.PARAM_METADATA_KEY, target, propertyKey) || [];
                        const args = [];
                        for (let i = 0; i < original.length; i++) {
                            const meta = paramMeta.find((p) => p.index === i);
                            if (!meta) {
                                args[i] = undefined;
                                continue;
                            }
                            let rawValue;
                            switch (meta.source) {
                                case "body":
                                    rawValue = req.body;
                                    break;
                                case "query":
                                    rawValue = req.query;
                                    break;
                                case "param":
                                    rawValue = req.params;
                                    break;
                                case "locals":
                                    rawValue = res.locals;
                                    break;
                                case "req":
                                    rawValue = req;
                                    break;
                                case "res":
                                    rawValue = res;
                                    break;
                                case "files":
                                    rawValue = req.files;
                                    break;
                                case "file":
                                    rawValue = req.file;
                                    break;
                                default:
                                    rawValue = undefined;
                            }
                            args[i] = meta.name ? rawValue[meta.name] : rawValue;
                        }
                        const result = yield original.apply(this, args);
                        if (res.headersSent)
                            return;
                        if (!result) {
                            throw new Error(`No response returned from action ${req.method} ${req.path}`);
                        }
                        if (result instanceof _1.ResWith) {
                            applyWithData(res, result.getWithData());
                        }
                        if (result instanceof _1.JsonResponse) {
                            return res.status(result.status).json(result.body);
                        }
                        if (result instanceof _1.FileResponse) {
                            return res.download(result.filePath, result.fileName);
                        }
                        if (result instanceof _1.BufferResponse) {
                            return res.end(result.data);
                        }
                    }
                    catch (err) {
                        next(err);
                    }
                });
            };
            const routes = Reflect.getMetadata(exports.ROUTE_METADATA_KEY, target.constructor) || [];
            routes.push({
                method,
                path,
                handlerName: propertyKey,
                middleware,
            });
            Reflect.defineMetadata(exports.ROUTE_METADATA_KEY, routes, target.constructor);
        };
    };
}
//# sourceMappingURL=route.decorator.js.map