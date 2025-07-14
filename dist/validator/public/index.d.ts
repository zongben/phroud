import { ValidationChain, ValidationError } from "express-validator";
import { ExpressMiddleware } from "../../app/public/types";
export declare const createRule: <T>(handler: (key: (k: keyof T) => string) => ValidationChain[]) => ValidationChain[];
export declare const validate: <T = any>(chains: ValidationChain[], options?: {
    status?: number;
    handler?: (errors: ValidationError[]) => T;
}) => ExpressMiddleware;
//# sourceMappingURL=index.d.ts.map