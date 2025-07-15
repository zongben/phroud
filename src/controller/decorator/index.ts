import { BufferResponse, FileResponse, JsonResponse, ResWith } from "..";
import { Request, Response, NextFunction } from "../../app";
import { ExpressMiddleware } from "../../app";
import {
  ParamMetadata,
  ParamSource,
  ResponseWith,
  RouteDefinition,
} from "../types";

export const ANONYMOUS_KEY = Symbol("empack:anonymous");
export const CONTROLLER_METADATA = {
  PATH: Symbol("empack:controller_path"),
  MIDDLEWARE: Symbol("empack:controller_middleware"),
};
export const PARAM_METADATA_KEY = Symbol("empack:param_metadata");
export const ROUTE_METADATA_KEY = Symbol("empack:route_metadata");

export function Controller(
  path: string,
  ...middleware: ExpressMiddleware[]
): ClassDecorator {
  return (target) => {
    Reflect.defineMetadata(CONTROLLER_METADATA.PATH, path, target);
    Reflect.defineMetadata(CONTROLLER_METADATA.MIDDLEWARE, middleware, target);
  };
}

export const FromBody = createParamDecorator("body");
export const FromQuery = createParamDecorator("query");
export const FromParam = createParamDecorator("param");
export const FromLocals = createParamDecorator("locals");
export const FromReq = createParamDecorator("req");
export const FromRes = createParamDecorator("res");
export const FromFile = createParamDecorator("file");
export const FromFiles = createParamDecorator("files");

export const Get = createRouteDecorator("get");
export const Post = createRouteDecorator("post");
export const Put = createRouteDecorator("put");
export const Delete = createRouteDecorator("delete");

export function Anonymous(): ClassDecorator & MethodDecorator {
  return (target: any, propertyKey?: string | symbol) => {
    if (propertyKey) {
      Reflect.defineMetadata(ANONYMOUS_KEY, true, target, propertyKey);
    } else {
      Reflect.defineMetadata(ANONYMOUS_KEY, true, target);
    }
  };
}

function createParamDecorator(source: ParamSource) {
  return function (name?: string): ParameterDecorator {
    return (target, propertyKey, parameterIndex) => {
      const existingParams: ParamMetadata[] =
        Reflect.getMetadata(PARAM_METADATA_KEY, target, propertyKey as any) ||
        [];

      existingParams.push({
        index: parameterIndex,
        source,
        name,
      });

      Reflect.defineMetadata(
        PARAM_METADATA_KEY,
        existingParams,
        target,
        propertyKey as any,
      );
    };
  };
}

function applyWithData(res: Response, withData: ResponseWith = {}) {
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

function createRouteDecorator(method: RouteDefinition["method"]) {
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
