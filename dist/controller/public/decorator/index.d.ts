import { ExpressMiddleware } from "../../../app/public/types";
export declare function Controller(path: string, ...middleware: ExpressMiddleware[]): ClassDecorator;
export declare const Body: (name?: string) => ParameterDecorator;
export declare const Query: (name?: string) => ParameterDecorator;
export declare const Param: (name?: string) => ParameterDecorator;
export declare const Locals: (name?: string) => ParameterDecorator;
export declare const Req: (name?: string) => ParameterDecorator;
export declare const Res: (name?: string) => ParameterDecorator;
export declare const Get: (path: string, ...middleware: ExpressMiddleware[]) => MethodDecorator;
export declare const Post: (path: string, ...middleware: ExpressMiddleware[]) => MethodDecorator;
export declare const Put: (path: string, ...middleware: ExpressMiddleware[]) => MethodDecorator;
export declare const Delete: (path: string, ...middleware: ExpressMiddleware[]) => MethodDecorator;
export declare function Anonymous(): ClassDecorator & MethodDecorator;
//# sourceMappingURL=index.d.ts.map