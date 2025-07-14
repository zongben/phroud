export const PARAM_METADATA_KEY = Symbol("empack:param_metadata");
type ParamSource =
  | "body"
  | "query"
  | "param"
  | "locals"
  | "req"
  | "res"
  | "files"
  | "file";

export type ParamMetadata = {
  index: number;
  source: ParamSource;
  name?: string;
};

export function createParamDecorator(source: ParamSource) {
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
