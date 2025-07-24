import { inject } from "../../../src";
import {
  EmpackMiddleware,
  EmpackMiddlewareFunction,
  ILoggerSymbol,
} from "../../../src";
import { ILogger } from "../../../src";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class AsyncTestMiddleware implements EmpackMiddleware {
  constructor(@inject(ILoggerSymbol) private logger: ILogger) {}

  use: EmpackMiddlewareFunction = async (_req, _res, next) => {
    this.logger.debug("Middleware start");
    await delay(1000);
    this.logger.debug("Middleware end");
    next();
  };
}

export const rateLimiter: EmpackMiddlewareFunction = (_req, _res, next) => {
  return next(new Error("Too many requests"));
};
