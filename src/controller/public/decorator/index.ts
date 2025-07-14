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

export const Body = createParamDecorator("body");
export const Query = createParamDecorator("query");
export const Param = createParamDecorator("param");
export const Locals = createParamDecorator("locals");
export const Req = createParamDecorator("req");
export const Res = createParamDecorator("res");

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
