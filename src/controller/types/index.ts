import { CookieOptions } from "express";
import { IncomingMessage } from "http";
import { Newable } from "../../di/index.js";
import { EmpackMiddleware } from "../../app/interfaces/index.js";
import { EmpackMiddlewareFunction } from "../../app/types/index.js";

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
};

export type ParamSource =
  | "body"
  | "query"
  | "param"
  | "locals"
  | "req"
  | "res"
  | "files"
  | "file";

export type WebSocketContext = {
  req: IncomingMessage;
  send(data: string | Buffer): void;
  close(code: number, reason: string | Buffer): void;
}
