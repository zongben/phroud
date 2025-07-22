import { EmpackExceptionMiddlewareFunction, EmpackMiddlewareFunction } from "../types/index.js";

export interface IEnv {
  get(key: string): string;
  getOptional(key: string): string | undefined
}

export interface EmpackMiddleware {
  use: EmpackMiddlewareFunction;
}

export interface EmpackExceptionMiddleware {
  use: EmpackExceptionMiddlewareFunction;
}
