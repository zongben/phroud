import {
  ValidationChain,
  ValidationError,
  validationResult,
} from "express-validator";
import { NextFunction, Request, Response } from "express";
import { EmpackMiddlewareFunction } from "../app";

export const createRule = <T>(
  handler: (key: (k: keyof T) => string) => ValidationChain[],
): ValidationChain[] => {
  return handler((k) => k as string);
};

export const validate = <T = any>(
  chains: ValidationChain[],
  options?: {
    status?: number;
    handler?: (errors: ValidationError[]) => T;
  },
): EmpackMiddlewareFunction => {
  return async (req: Request, res: Response, next: NextFunction) => {
    for (const chain of chains) {
      await chain.run(req);
    }
    const errs = validationResult(req);
    if (!errs.isEmpty()) {
      res
        .status(options?.status ?? 400)
        .json(
          options?.handler
            ? options.handler(errs.array())
            : errs.array().map((x) => x.msg),
        );
      return;
    }
    next();
  };
};
