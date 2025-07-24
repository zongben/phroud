import { Newable } from "inversify";

export type ApiDocOptions = {
  summary?: string;
  description?: string;
  tags?: string[];
  contentType?: "application/json" | "multipart/form-data";
  params?: {
    name: string;
    description?: string;
    required?: boolean;
    schema?: {
      type: string;
      format?: string;
    };
  }[];
  query?: {
    name: string;
    description?: string;
    required?: boolean;
    format?: string;
    schema?: {
      type: string;
      format?: string;
    };
  }[];
  requestBody?: Newable | Newable[];
  responses?: Record<number, Newable | Newable[] | "binary">;
};

export type ApiDocMetaData = {
  controllerName: string;
  handlerName: string;
  methodName: string;
  path: string;
  apiDoc: ApiDocOptions;
};

export type ApiPropertyOptions = {
  description?: string;
  format?: string;
  example?: any;
  required?: boolean;
};

export type ApiArrayPropertyOptions = {
  description?: string;
  format?: string;
  example?: any;
  required?: boolean;
  type: Newable | "string";
};
