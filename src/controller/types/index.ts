import { CookieOptions } from "express";
import { EmpackMiddleware, EmpackMiddlewareFunction } from "../../app";

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
  middleware?: EmpackMiddleware[] | EmpackMiddlewareFunction[];
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
