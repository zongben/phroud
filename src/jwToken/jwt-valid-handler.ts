import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export type JwtHandlerResult = {
  status: number;
  body: any;
};

export type JwtHandler = {
  onUnauthorized?: (req: Request, res: Response) => JwtHandlerResult;
  onExpired?: (req: Request, res: Response) => JwtHandlerResult;
  onSuccess?: (
    payload: string | jwt.JwtPayload,
    req: Request,
    res: Response,
    next: NextFunction,
  ) => void;
};

export function jwtValidHandler(secret: string, handler: JwtHandler) {
  return (req: Request, res: Response, next: NextFunction) => {
    function handleError(
      fallbackStatus: number,
      fallbackMessage: string,
      handlerFn?: (req: Request, res: Response) => JwtHandlerResult,
    ) {
      if (handlerFn) {
        const result = handlerFn(req, res);
        res.status(result.status).json(result.body);
      } else {
        res.status(fallbackStatus).json(fallbackMessage);
      }
    }

    let token = req.headers.authorization;
    if (!token || !token.startsWith("Bearer ")) {
      handleError(401, "Unauthorized", handler.onUnauthorized);
      return;
    }
    token = token.slice(7, token.length);
    try {
      const payload = jwt.verify(token, secret);
      res.locals.jwt = payload;
      if (handler.onSuccess) {
        handler.onSuccess(payload, req, res, next);
        return;
      } else {
        next();
      }
    } catch (err: any) {
      if (err.name === "TokenExpiredError") {
        handleError(401, "Token Expired", handler.onExpired);
      } else {
        handleError(401, "Unauthorized", handler.onUnauthorized);
      }
      return;
    }
  };
}
