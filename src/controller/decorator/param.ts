import { ParamMetadata, ParamSource } from "../types";

export const PARAM_METADATA_KEY = Symbol("empack:param_metadata");

export const FromBody = createParamDecorator("body");
export const FromQuery = createParamDecorator("query");
export const FromParam = createParamDecorator("param");
export const FromLocals = createParamDecorator("locals");
export const FromReq = createParamDecorator("req");
export const FromRes = createParamDecorator("res");
export const FromFile = createParamDecorator("file");
export const FromFiles = createParamDecorator("files");
export const FromMultiFile = createParamDecorator("multiFile");
export const FromMultiFiles = createParamDecorator("multiFiles");

function createParamDecorator(source: ParamSource) {
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
