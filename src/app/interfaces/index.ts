import {
  EmpackExceptionMiddlewareFunction,
  EmpackMiddlewareFunction,
} from "../types";

export interface IEnv {
  get(key: string): any;
}

export interface EmpackMiddleware {
  use: EmpackMiddlewareFunction;
}

export interface EmpackExceptionMiddleware {
  use: EmpackExceptionMiddlewareFunction;
}
