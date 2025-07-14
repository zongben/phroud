import { ExpressMiddleware } from "../../../app/public/types";
import {
  ANONYMOUS_KEY,
  CONTROLLER_METADATA,
  createParamDecorator,
  createRouteDecorator,
} from "../../_internal";

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
