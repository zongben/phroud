import { NextFunction, Request, Response } from "express";
import {
  BufferResponse,
  FileResponse,
  JsonResponse,
  ResponseWith,
  ResWith,
} from ".";
import { ExpressMiddleware } from "../../app";
import { PARAM_METADATA_KEY, ParamMetadata } from "./param.decorator";

export function applyWithData(res: Response, withData: ResponseWith = {}) {
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

export const ROUTE_METADATA_KEY = Symbol("empack:route_metadata");

export type RouteDefinition = {
  method: "get" | "post" | "put" | "delete" | "patch";
  path: string;
  handlerName: string;
  middleware?: ExpressMiddleware[];
};

export function createRouteDecorator(method: RouteDefinition["method"]) {
  return (
    path: string,
    ...middleware: ExpressMiddleware[]
  ): MethodDecorator => {
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
            applyWithData(res, result.getWithData());
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
