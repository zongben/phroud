import { inject } from "../../../src";
import { EmpackMiddlewareFunction, ILoggerSymbol } from "../../../src";
import { ILogger } from "../../../src";
import { IEmpackMiddleware } from "../../../src/app/interfaces";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class AsyncTestMiddleware implements IEmpackMiddleware {
  constructor(@inject(ILoggerSymbol) private logger: ILogger) {}

  use(): EmpackMiddlewareFunction | Promise<EmpackMiddlewareFunction> {
    return async (_req, _res, next) => {
      this.logger.debug("Middleware start");
      await delay(1000);
      this.logger.debug("Middleware end");
      next();
    };
  }
}

export const rateLimiter: EmpackMiddlewareFunction = (_req, _res, next) => {
  return next(new Error("Too many requests"));
};
