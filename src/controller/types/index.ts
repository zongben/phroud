import { CookieOptions } from "express";
import { IncomingMessage } from "http";
import {
  EmpackMiddleware,
  EmpackMiddlewareFunction,
} from "../../app/types/index";
import { Newable } from "inversify";

export type GuardMiddleware =
  | Newable<EmpackMiddleware>
  | EmpackMiddlewareFunction
  | "none";

export type ResponseWith = {
  cookies?: Cookie[];
  headers?: Record<string, string>;
};

export type Cookie = {
  key: string;
  value: string;
  options: CookieOptions;
};

export type RouteDefinition = {
  method: "get" | "post" | "put" | "delete" | "patch";
  path: string;
  handlerName: string;
  middleware?: (Newable<EmpackMiddleware> | EmpackMiddlewareFunction)[];
};

export type ParamMetadata = {
  index: number;
  source: ParamSource;
  name?: string;
  fileNames?: string[];
  paramType?: Newable
};

export type ParamSource =
  | "body"
  | "query"
  | "param"
  | "locals"
  | "req"
  | "res"
  | "file"
  | "files"
  | "multipart"
  | "cookie"
  | "header";

export type WebSocketContext = {
  req: IncomingMessage;
  pathParams: any;
  queryParams: URLSearchParams;
  send(data: string | Buffer): void;
  close(code: number, reason: string | Buffer): void;
};
