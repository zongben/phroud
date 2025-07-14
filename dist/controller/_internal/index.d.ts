import { CookieOptions } from "express";
export * from "./param.decorator";
export * from "./route.decorator";
export declare const ANONYMOUS_KEY: unique symbol;
export declare function isAnonymous(prototype: any, methodName: string): boolean;
export declare const CONTROLLER_METADATA: {
    PATH: symbol;
    MIDDLEWARE: symbol;
};
export declare abstract class ResWith {
    private _withData;
    with(data: ResponseWith): this;
    getWithData(): ResponseWith;
}
export type ResponseWith = {
    cookies?: Cookie[];
    headers?: Record<string, string>;
};
export type Cookie = {
    key: string;
    value: string;
    options: CookieOptions;
};
export declare class JsonResponse extends ResWith {
    status: number;
    body: any;
    constructor(status: number, body: any);
}
export declare class FileResponse extends ResWith {
    readonly fileName: string;
    readonly filePath: string;
    constructor(fileName: string, filePath: string);
}
export declare class BufferResponse extends ResWith {
    readonly data: Buffer;
    readonly fileName: string;
    readonly mimeType: string;
    constructor(data: Buffer, fileName: string, mimeType?: string);
}
//# sourceMappingURL=index.d.ts.map