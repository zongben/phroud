import { ExpressMiddleware } from "../../../app/public/types";
export declare function Controller(path: string, ...middleware: ExpressMiddleware[]): ClassDecorator;
export declare const FromBody: (name?: string) => ParameterDecorator;
export declare const FromQuery: (name?: string) => ParameterDecorator;
export declare const FromParam: (name?: string) => ParameterDecorator;
export declare const FromLocals: (name?: string) => ParameterDecorator;
export declare const FromReq: (name?: string) => ParameterDecorator;
export declare const FromRes: (name?: string) => ParameterDecorator;
export declare const FromFile: (name?: string) => ParameterDecorator;
export declare const FromFiles: (name?: string) => ParameterDecorator;
export declare const Get: (path: string, ...middleware: ExpressMiddleware[]) => MethodDecorator;
export declare const Post: (path: string, ...middleware: ExpressMiddleware[]) => MethodDecorator;
export declare const Put: (path: string, ...middleware: ExpressMiddleware[]) => MethodDecorator;
export declare const Delete: (path: string, ...middleware: ExpressMiddleware[]) => MethodDecorator;
export declare function Anonymous(): ClassDecorator & MethodDecorator;
//# sourceMappingURL=index.d.ts.map