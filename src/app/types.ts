import { NextFunction, Request, Response } from "express";
import { TimeSpan } from "../utils/timer";

export const APP_TYPES = {
  IEnv: Symbol.for("IEnv"),
  ILogger: Symbol.for("ILogger"),
};

export type PhroudMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => void;

export type ExceptionHandlerResult = {
  statusCode?: number;
  body?: any;
};

export type NotFoundHandlerResult = {
  statusCode?: number;
  body?: any;
};

export type ExceptionHandler = (
  err: Error,
  req: Request,
) => ExceptionHandlerResult | void;

export type NotFoundHandler = (req: Request) => NotFoundHandlerResult | void;

export type TimerHanlder = (
  duration: number,
  req: Request,
  timeSpan: TimeSpan[],
) => void;

export type AllowAnonymousPath = {
  path: string;
  method: string;
};
