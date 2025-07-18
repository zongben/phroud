import { Request, Response, NextFunction } from "express";
import { TimeSpan } from "../../utils";

export type HandlerResult = {
  statusCode?: number;
  body?: any;
};

export type EmpackMiddlewareFunction = (
  req: Request,
  res: Response,
  next: NextFunction,
) => void | Promise<void> | unknown;

export type EmpackExceptionMiddlewareFunction = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => void | Promise<void> | unknown;

export type ExceptionHandler = (
  err: Error,
  req: Request,
) => HandlerResult | void;

export type NotFoundHandler = (req: Request) => HandlerResult | void;

export type TimerHanlder = (
  duration: number,
  timeSpan: TimeSpan[],
  req: Request,
  res: Response,
) => void;
