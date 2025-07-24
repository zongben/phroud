import { PROPERTY_METADATA_KEY } from "./decorator";
import { ApiDocMetaData } from "./types";

function normalizePath(path: string): string {
  return path.replace(/:([a-zA-Z0-9_]+)\??/g, (_, name) => `{${name}}`);
}

export function generateOpenApiSpec(
  title: string,
  version: string,
  apiDocs: ApiDocMetaData[],
) {
  const paths: Record<string, any> = {};
  const componentsSchemas: Map<string, any> = new Map();

  apiDocs.forEach(({ methodName, path, apiDoc }) => {
    if (!paths[path]) {
      paths[path] = {};
    }

    const operation: Record<string, any> = {
      summary: apiDoc.summary || "",
      description: apiDoc.description || "",
      tags: apiDoc.tags || [],
    };

    let schemaName: string;
    let schema: any;
    if (apiDoc.params || apiDoc.query) {
      operation.parameters = [];

      apiDoc.params?.forEach((param) => {
        operation.parameters.push({
          in: "path",
          name: param.name,
          required: param.required ?? false,
          description: param.description,
          schema: param.schema,
        });
      });

      apiDoc.query?.forEach((param) => {
        operation.parameters.push({
          in: "query",
          name: param.name,
          required: param.required ?? false,
          description: param.description,
          schema: param.schema,
        });
      });
    }

    if (apiDoc.requestBody) {
      const contentType = apiDoc.contentType ?? "application/json";

      if (Array.isArray(apiDoc.requestBody)) {
        schemaName = apiDoc.requestBody[0].name;
        collectSchemas(apiDoc.requestBody, componentsSchemas);
        schema = {
          type: "array",
          items: { $ref: `#/components/schemas/${schemaName}` },
        };
      } else {
        schemaName = apiDoc.requestBody.name;
        collectSchemas(apiDoc.requestBody, componentsSchemas);
        schema = { $ref: `#/components/schemas/${schemaName}` };
      }

      operation.requestBody = {
        required: true,
        content: {
          [contentType]: { schema },
        },
      };
    }

    if (apiDoc.responses) {
      operation.responses = {};

      let responseContentType = "application/json";
      for (const [statusCodeStr, resType] of Object.entries(apiDoc.responses)) {
        const statusCode = Number(statusCodeStr);
        let responseSchema: any;
        let schemaName: string;

        if (Array.isArray(resType)) {
          const cls = resType[0];
          schemaName = cls.name;
          collectSchemas(cls, componentsSchemas);
          responseSchema = {
            type: "array",
            items: { $ref: `#/components/schemas/${schemaName}` },
          };
        } else if (resType === "binary") {
          responseContentType = "application/octet-stream";
          responseSchema = {
            type: "string",
            format: "binary",
          };
        } else {
          schemaName = resType.name;
          collectSchemas(resType, componentsSchemas);
          responseSchema = { $ref: `#/components/schemas/${schemaName}` };
        }

        operation.responses[statusCode] = {
          description: `Response ${statusCode}`,
          content: {
            [responseContentType]: {
              schema: responseSchema,
            },
          },
        };
      }
    }

    const normalizedPath = normalizePath(path);
    if (!paths[normalizedPath]) {
      paths[normalizedPath] = {};
    }
    paths[normalizedPath][methodName.toLowerCase()] = operation;
  });

  const schemas: Record<string, any> = {};
  for (const [name, schema] of componentsSchemas.entries()) {
    schemas[name] = schema;
  }

  const openApiSpec = {
    openapi: "3.0.0",
    info: {
      title,
      version,
    },
    paths,
    components: {
      schemas,
    },
  };

  return openApiSpec;
}

function isPrimitiveType(type: any): boolean {
  return [String, Number, Boolean].includes(type);
}

function generateSchemaFromClass(cls: any, map: Map<string, any>): any {
  const props = Reflect.getMetadata(PROPERTY_METADATA_KEY, cls) || [];
  const schema: Record<string, any> = {};
  const required: string[] = [];

  for (const { key, type, options, isArray } of props) {
    const name = key.toString();
    let propSchema: any;

    if (isArray) {
      if (options.format === "binary") {
        propSchema = {
          type: "array",
          items: {
            type: "string",
            format: "binary",
            description: options.description,
          },
        };
      } else {
        if (!isPrimitiveType(type) && !map.has(type.name)) {
          const nestedSchema = generateSchemaFromClass(type, map);
          map.set(type.name, nestedSchema);
        }
        propSchema = {
          type: "array",
          items: isPrimitiveType(type)
            ? { type: type.name.toLowerCase() }
            : { $ref: `#/components/schemas/${type.name}` },
        };
      }
    } else if (isPrimitiveType(type)) {
      propSchema = { type: type.name.toLowerCase() };
    } else if (options.format === "binary") {
      propSchema = {
        type: "string",
        format: "binary",
        description: options.description,
      };
    } else {
      if (!map.has(type.name)) {
        const nestedSchema = generateSchemaFromClass(type, map);
        map.set(type.name, nestedSchema);
      }
      propSchema = { $ref: `#/components/schemas/${type.name}` };
    }

    schema[name] = {
      ...propSchema,
      description: options.description,
      example: options.example,
    };

    if (options.required) required.push(name);
  }

  return {
    type: "object",
    properties: schema,
    ...(required.length > 0 ? { required } : {}),
  };
}

function collectSchemas(cls: any, map: Map<string, any>) {
  if (Array.isArray(cls)) {
    cls.forEach((c) => collectSchemas(c, map));
    return;
  }

  if (map.has(cls.name)) return;

  const schema = generateSchemaFromClass(cls, map);
  map.set(cls.name, schema);
}
