import { Newable } from "inversify";
import {
  ApiArrayPropertyOptions,
  ApiDocOptions,
  ApiPropertyOptions,
} from "../types";

export const APIDOC_KEY = Symbol("empack:apiDoc");

export function ApiDoc(options: ApiDocOptions): MethodDecorator {
  return (target, propertyKey) => {
    Reflect.defineMetadata(APIDOC_KEY, options, target, propertyKey);
  };
}

export const PROPERTY_METADATA_KEY = Symbol("empack:apiProperty");

export function ApiProperty(
  options: ApiPropertyOptions = {},
): PropertyDecorator {
  return (target, propertyKey) => {
    const existing =
      Reflect.getMetadata(PROPERTY_METADATA_KEY, target.constructor) || [];

    existing.push({
      key: propertyKey,
      type: Reflect.getMetadata("design:type", target, propertyKey),
      options,
      isArray: false,
    });

    Reflect.defineMetadata(PROPERTY_METADATA_KEY, existing, target.constructor);
  };
}

export function ApiArrayProperty(
  options: ApiArrayPropertyOptions & { type: Newable | "string" },
): PropertyDecorator {
  return (target, propertyKey) => {
    const existing =
      Reflect.getMetadata(PROPERTY_METADATA_KEY, target.constructor) || [];

    existing.push({
      key: propertyKey,
      type: options.type,
      options,
      isArray: true,
    });

    Reflect.defineMetadata(PROPERTY_METADATA_KEY, existing, target.constructor);
  };
}
