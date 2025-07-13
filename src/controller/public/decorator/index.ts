import { ExpressMiddleware } from "../../../app/public/types";
import {
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
export const Patch = createRouteDecorator("patch");
