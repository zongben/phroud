import { CookieOptions } from "express";
export * from "./param.decorator";
export * from "./route.decorator";

export const CONTROLLER_METADATA = {
  PATH: Symbol("controller_path"),
  MIDDLEWARE: Symbol("controller_middleware"),
};

export abstract class ResWith {
  private _withData: ResponseWith = {};

  with(data: ResponseWith): this {
    this._withData = {
      headers: {
        ...(this._withData.headers || {}),
        ...(data.headers || {}),
      },
      cookies: [...(this._withData.cookies || []), ...(data.cookies || [])],
    };
    return this;
  }

  getWithData(): ResponseWith {
    return this._withData;
  }
}

export type ResponseWith = {
  cookies?: Cookie[];
  headers?: Record<string, string>;
};

export type Cookie = {
  key: string;
  value: string;
  options: CookieOptions;
};

export class JsonResponse extends ResWith {
  status: number;
  body: any;

  constructor(status: number, body: any) {
    super();
    this.status = status;
    this.body = body;
  }
}

export class FileResponse extends ResWith {
  constructor(
    public readonly fileName: string,
    public readonly filePath: string,
  ) {
    super();
  }
}

export class BufferResponse extends ResWith {
  constructor(
    public readonly data: Buffer,
    public readonly fileName: string,
    public readonly mimeType: string = "application/octet-stream",
  ) {
    super();
    this.with({
      headers: {
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Type": mimeType,
      },
    });
  }
}
