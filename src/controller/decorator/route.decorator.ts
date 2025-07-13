import { NextFunction, Response, Request } from "express";
import {
  ResWith,
  FileResponse,
  JsonResponse,
  ResponseWith,
  BufferResponse,
} from "../responses";
import { PARAM_METADATA_KEY, ParamMetadata } from "./param.decorator";
import { PhroudMiddleware } from "../../app/types";

function _applyWithData(res: Response, withData: ResponseWith = {}) {
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

export const ROUTE_METADATA_KEY = Symbol("route_metadata");

export type RouteDefinition = {
  method: "get" | "post" | "put" | "delete" | "patch";
  path: string;
  handlerName: string;
  middleware?: PhroudMiddleware[];
};

function _createRouteDecorator(method: RouteDefinition["method"]) {
  return (path: string, ...middleware: PhroudMiddleware[]): MethodDecorator => {
    return (target, propertyKey, descriptor: PropertyDescriptor) => {
      const original = descriptor.value;

      descriptor.value = async function (
        req: Request,
        res: Response,
        next: NextFunction,
      ) {
        try {
          const paramMeta: ParamMetadata[] =
            Reflect.getMetadata(PARAM_METADATA_KEY, target, propertyKey) || [];

          const args: any[] = [];
          for (let i = 0; i < original.length; i++) {
            const meta = paramMeta.find((p) => p.index === i);

            if (!meta) {
              args[i] = undefined;
              continue;
            }

            let rawValue: any;
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
              default:
                rawValue = undefined;
            }

            args[i] = meta.name ? rawValue[meta.name] : rawValue;
          }

          const result = await original.apply(this, args);
          if (res.headersSent) return;
          if (!result) {
            throw new Error(
              `No response returned from action ${req.method} ${req.path}`,
            );
          }

          if (result instanceof ResWith) {
            _applyWithData(res, result.getWithData());
          }
          if (result instanceof JsonResponse) {
            return res.status(result.status).json(result.body);
          }
          if (result instanceof FileResponse) {
            return res.download(result.filePath, result.fileName);
          }
          if (result instanceof BufferResponse) {
            return res.end(result.data);
          }
        } catch (err) {
          next(err);
        }
      };

      const routes: RouteDefinition[] =
        Reflect.getMetadata(ROUTE_METADATA_KEY, target.constructor) || [];
      routes.push({
        method,
        path,
        handlerName: propertyKey as string,
        middleware,
      });
      Reflect.defineMetadata(ROUTE_METADATA_KEY, routes, target.constructor);
    };
  };
}

export const Get = _createRouteDecorator("get");
export const Post = _createRouteDecorator("post");
export const Put = _createRouteDecorator("put");
export const Delete = _createRouteDecorator("delete");
export const Patch = _createRouteDecorator("patch");
