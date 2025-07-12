export const PARAM_METADATA_KEY = Symbol("param_metadata");
type ParamSource = "body" | "query" | "param" | "locals" | "req" | "res";

export type ParamMetadata = {
  index: number;
  source: ParamSource;
  name?: string;
};

function _createParamDecorator(source: ParamSource) {
  return function (name?: string): ParameterDecorator {
    return (target, propertyKey, parameterIndex) => {
      const existingParams: ParamMetadata[] =
        Reflect.getMetadata(PARAM_METADATA_KEY, target, propertyKey as any) ||
        [];

      existingParams.push({
        index: parameterIndex,
        source,
        name,
      });

      Reflect.defineMetadata(
        PARAM_METADATA_KEY,
        existingParams,
        target,
        propertyKey as any,
      );
    };
  };
}

export const Body = _createParamDecorator("body");
export const Query = _createParamDecorator("query");
export const Param = _createParamDecorator("param");
export const Locals = _createParamDecorator("locals");
export const Req = _createParamDecorator("req");
export const Res = _createParamDecorator("res");
