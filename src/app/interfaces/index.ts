import { NextFunction, Request, Response } from "express";

export interface ILogger {
  error(message: Error): void;
  warn(message: string): void;
  info(message: string): void;
  debug(message: string): void;
}

export interface IEnv {
  get(key: string): string;
  getOptional(key: string): string | undefined;
}

export interface IEmpackMiddleware {
  use(req: Request, res: Response, next: NextFunction): any;
}

export interface IEmpackExceptionMiddleware {
  use(err: Error, req: Request, res: Response, next: NextFunction): any;
}
