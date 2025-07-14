import { Response } from "express";
import { ResponseWith } from ".";
import { ExpressMiddleware } from "../../app";
export declare function applyWithData(res: Response, withData?: ResponseWith): void;
export declare const ROUTE_METADATA_KEY: unique symbol;
export type RouteDefinition = {
    method: "get" | "post" | "put" | "delete" | "patch";
    path: string;
    handlerName: string;
    middleware?: ExpressMiddleware[];
};
export declare function createRouteDecorator(method: RouteDefinition["method"]): (path: string, ...middleware: ExpressMiddleware[]) => MethodDecorator;
//# sourceMappingURL=route.decorator.d.ts.map