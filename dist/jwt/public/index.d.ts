import type { NextFunction, Request, Response } from "express";
import { interfaces } from "inversify";
import { JwtPayload } from "jsonwebtoken";
import { IJwTokenHelper } from "./interfaces";
import { JwtHandler, JwTokenSettings } from "./types";
import { Module } from "../../di";
export declare function jwtValidHandler(secret: string, handler?: JwtHandler): (req: Request, res: Response, next: NextFunction) => void;
export declare class JwTokenHelper implements IJwTokenHelper {
    private settings;
    constructor(settings: JwTokenSettings);
    generateToken(payload: any): string;
    verifyToken(token: string): JwtPayload | null;
}
export declare class JwTokenHelperModule extends Module {
    private symbol;
    private jwtHelper;
    constructor(symbol: symbol, jwtHelper: IJwTokenHelper);
    protected bindModule(bind: interfaces.Bind): void;
}
//# sourceMappingURL=index.d.ts.map