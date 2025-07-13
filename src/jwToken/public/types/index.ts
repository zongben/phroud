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

export type JwTokenSettings = {
  secret: string;
  options?: jwt.SignOptions;
};
