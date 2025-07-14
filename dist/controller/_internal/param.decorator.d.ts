export declare const PARAM_METADATA_KEY: unique symbol;
type ParamSource = "body" | "query" | "param" | "locals" | "req" | "res";
export type ParamMetadata = {
    index: number;
    source: ParamSource;
    name?: string;
};
export declare function createParamDecorator(source: ParamSource): (name?: string) => ParameterDecorator;
export {};
//# sourceMappingURL=param.decorator.d.ts.map