import { PhroudMiddleware } from "../../app/types";

export const CONTROLLER_METADATA = {
  PATH: Symbol("controller_path"),
  MIDDLEWARE: Symbol("controller_middleware"),
};

export function Controller(
  path: string,
  ...middleware: PhroudMiddleware[]
): ClassDecorator {
  return (target) => {
    Reflect.defineMetadata(CONTROLLER_METADATA.PATH, path, target);
    Reflect.defineMetadata(CONTROLLER_METADATA.MIDDLEWARE, middleware, target);
  };
}
